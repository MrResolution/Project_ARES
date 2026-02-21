from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from ai_engine import AIEngine
import datetime
import json
import re
import ollama
import requests
import threading
import time
import os

app = Flask(__name__)
CORS(app)

ai = AIEngine(model="deepseek-r1:1.5b")

# ── ESP32 Rover Config ──
ESP32_DATA_URL = "http://10.202.253.93/data"
ESP32_POLL_INTERVAL = 2  # seconds
obj_process = None

# ── Calibration Constants (MPU6050) ──
# Scale: 16384 LSB per g (for +/- 2g range)
ACCEL_SCALE = 16384.0
AX_OFFSET = -1916
AY_OFFSET = 976
AZ_OFFSET = -252  # Offsets AZ to ~-16384 for -1.0g on flat ground

# In-memory storage for latest telemetry
latest_data = {
    "temp": 0,
    "pressure": 0,
    "gas": 0,
    "radiation": 0,
    "flame": 0,
    "water": 0,
    "ax": 0, "ay": 0, "az": 0,
    "gx": 0, "gy": 0, "gz": 0,
    "lat": 0, "lng": 0,
    "gasProfile": None,
    "objects": [],
    "timestamp": None,
    "active": False,
    "source": "none"
}

latest_objects = []

LOG_FILE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "telemetry_history.jsonl")

def log_telemetry(data):
    try:
        # Create a compact version for the log
        log_entry = {k: v for k, v in data.items() if k not in ["gasProfile", "objects"]}
        with open(LOG_FILE_PATH, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    except Exception as e:
        print(f"[LOG ERROR] {e}")

def generate_gas_profile(raw_adc):
    """
    Derives estimated gas concentrations from a single MQ135 ADC reading (0-4095).
    
    The MQ135 responds to multiple gases with different sensitivities.
    These ratios are based on the MQ135 datasheet sensitivity curves:
      - CO₂:     Primary target, highest sensitivity
      - NH₃:     High sensitivity
      - Benzene: Medium sensitivity
      - Smoke:   Medium sensitivity (particulates)
      - Alcohol: Medium sensitivity
      - NOₓ:     Low sensitivity
      - CO:      Low sensitivity
    
    ⚠️ These are ESTIMATES — true separation requires dedicated sensors.
    """
    import random
    # Convert raw ADC (0-4095) to approximate PPM using MQ135 curve
    # Rs/Ro ratio approximation for clean air calibration
    ppm_base = max(0, (raw_adc / 4095.0) * 1000)  # rough 0-1000 PPM scale
    
    # MQ135 relative sensitivity ratios (from datasheet curves)
    return {
        "co2":      round(ppm_base * 1.00, 1),   # Primary target
        "ammonia":  round(ppm_base * 0.70, 1),   # High sensitivity
        "benzene":  round(ppm_base * 0.35, 1),   # Medium
        "smoke":    round(ppm_base * 0.30, 1),   # Medium
        "alcohol":  round(ppm_base * 0.28, 1),   # Medium
        "nox":      round(ppm_base * 0.15, 1),   # Low
        "co":       round(ppm_base * 0.12, 1),   # Low
        "methane":  round(ppm_base * 0.10, 1),   # Very low
        "sulfur":   round(ppm_base * 0.08, 1),   # Trace
        "hydrogen": round(ppm_base * 0.06, 1),   # Trace
    }

# ── Background Polling Thread ──
def poll_esp32():
    """Continuously fetch sensor data from the ESP32 rover and update latest_data."""
    global latest_data
    while True:
        try:
            resp = requests.get(ESP32_DATA_URL, timeout=3)
            resp.raise_for_status()
            raw = resp.json()

            # Map ESP32 fields → dashboard fields
            def safe_float(val, default=0):
                try:
                    return float(val)
                except (ValueError, TypeError):
                    return default

            air_val = safe_float(raw.get("air", 0))
            latest_data.update({
                "temp": safe_float(raw.get("temp", 0)),
                "pressure": safe_float(raw.get("pressure", 0)),
                "gas": air_val,                     # MQ135/MQ139 → gas
                "radiation": safe_float(raw.get("flame", 0)),   # flame sensor → radiation slot (legacy)
                "flame": safe_float(raw.get("flame", 0)),       # flame sensor → flame card
                "water": safe_float(raw.get("water", 0)),
                "ax": round((safe_float(raw.get("ax", 0)) - AX_OFFSET) / ACCEL_SCALE, 4),
                "ay": round((safe_float(raw.get("ay", 0)) - AY_OFFSET) / ACCEL_SCALE, 4),
                "az": round((safe_float(raw.get("az", 0)) - AZ_OFFSET) / ACCEL_SCALE, 4),
                "gx": safe_float(raw.get("gx", 0)),
                "gy": safe_float(raw.get("gy", 0)),
                "gz": safe_float(raw.get("gz", 0)),
                "lat": safe_float(raw.get("lat", 0)),
                "lng": safe_float(raw.get("lng", 0)),
                "gasProfile": generate_gas_profile(air_val),
                "timestamp": datetime.datetime.now().isoformat(),
                "active": True,
                "source": "esp32"
            })
            log_telemetry(latest_data)
        except Exception as e:
            # Only set active to False if the current source IS the ESP32
            # or if we haven't received ANY data yet.
            latest_data["active"] = False
            print(f"[ESP32 Poll] Offline: {e}")
        time.sleep(ESP32_POLL_INTERVAL)

SYSTEM_PROMPT = """You are A.R.E.S., an AI assistant for an industrial rover mission-control system.

STRICT RULES:
- Keep ALL responses to 1-3 sentences maximum. Never exceed this.
- Only answer what was asked. No extra commentary, no filler, no speculation.
- When telemetry data is provided, reference the actual numbers.
- Use plain language. No bullet points, no lists, no headers unless explicitly asked.
- If you don't know something, say so in one sentence.
- Never repeat the question back. Never add disclaimers."""

@app.route('/api/telemetry', methods=['POST'])
def receive_telemetry():
    global latest_data
    data = request.json
    data['timestamp'] = datetime.datetime.now().isoformat()
    latest_data = data
    log_telemetry(latest_data)
    
    # Check for immediate risks
    if ai.detect_fire_risk(data.get('temp', 0), data.get('gas', 0)):
        print("CRITICAL: PRE-FIRE CONDITION DETECTED")
        
    return jsonify({"status": "received"}), 200

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(latest_data)

@app.route('/api/logs', methods=['GET'])
def get_logs():
    try:
        limit = int(request.args.get('limit', 50))
        if not os.path.exists(LOG_FILE_PATH):
            return jsonify({"logs": []})
        with open(LOG_FILE_PATH, 'r') as f:
            lines = f.readlines()
            logs = [json.loads(line) for line in lines[-limit:]]
            return jsonify({"logs": logs})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/analyze', methods=['GET'])
def analyze_status():
    analysis = ai.analyze_telemetry(latest_data)
    try:
        return jsonify(json.loads(analysis))
    except:
        return jsonify({"raw_output": analysis})

@app.route('/api/sensor', methods=['GET'])
def get_remote_sensor_data():
    """
    Fetches sensor data from the remote device at 10.202.253.93.
    Expects the remote device to return JSON.
    """
    remote_url = "http://10.202.253.93/data" # Assuming /data endpoint, adjust if known
    try:
        response = requests.get(remote_url, timeout=5)
        response.raise_for_status()
        return jsonify(response.json()), 200
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to fetch remote sensor data: {str(e)}"}), 502

@app.route('/api/ping', methods=['POST'])
def ping_device():
    """Ping a device to check connectivity and measure latency."""
    data = request.json or {}
    target = data.get("target", "sensor")
    
    urls = {
        "sensor": "http://10.202.253.93/data",
        "camera": "http://10.202.2s53.217:81/stream",
    }
    
    url = urls.get(target)
    if not url:
        return jsonify({"error": f"Unknown target: {target}"}), 400
    
    try:
        import time as t
        start = t.time()
        resp = requests.get(url, timeout=5, stream=(target == "camera"))
        latency = round((t.time() - start) * 1000)
        
        if target == "camera":
            # For stream, just check if we get headers back
            resp.close()
        
        return jsonify({
            "target": target,
            "url": url,
            "status": "online",
            "latency_ms": latency,
            "http_code": resp.status_code
        }), 200
    except requests.exceptions.Timeout:
        return jsonify({
            "target": target,
            "url": url,
            "status": "timeout",
            "latency_ms": 5000,
            "error": "Connection timed out (5s)"
        }), 200
    except requests.exceptions.ConnectionError:
        return jsonify({
            "target": target,
            "url": url,
            "status": "offline",
            "latency_ms": None,
            "error": "Connection refused"
        }), 200
    except Exception as e:
        return jsonify({
            "target": target,
            "url": url,
            "status": "error",
            "latency_ms": None,
            "error": str(e)
        }), 200

@app.route('/api/services/status', methods=['GET'])
def services_status():
    """Check the status of all required services."""
    import subprocess
    
    # Check Ollama
    ollama_running = False
    try:
        result = subprocess.run(['pgrep', '-f', 'ollama'], capture_output=True, timeout=3)
        ollama_running = result.returncode == 0
    except:
        pass
    
    # Check ESP32 poller (always running if backend is up)
    esp32_connected = latest_data.get("active", False)
    
    # Check Object Identifier
    obj_running = False
    if obj_process and obj_process.poll() is None:
        obj_running = True
    else:
        # Fallback check via pgrep
        try:
            check = subprocess.run(['pgrep', '-f', 'object_identifier.py'], capture_output=True, timeout=1)
            obj_running = check.returncode == 0
        except: pass

    return jsonify({
        "backend": True,  # If we got here, backend is running
        "ollama": ollama_running,
        "esp32": esp32_connected,
        "object_id": obj_running,
        "esp32_source": latest_data.get("source", "none"),
        "last_timestamp": latest_data.get("timestamp")
    }), 200

@app.route('/api/services/start', methods=['POST'])
def services_start():
    """Start required services."""
    import subprocess
    
    body = request.json or {}
    results = {}
    
    # Start Ollama
    if body.get("ollama", True):
        try:
            # Check if already running
            check = subprocess.run(['pgrep', '-f', 'ollama'], capture_output=True, timeout=3)
            if check.returncode == 0:
                results["ollama"] = {"status": "already_running"}
            else:
                subprocess.Popen(
                    ['ollama', 'serve'],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True
                )
                results["ollama"] = {"status": "started"}
        except FileNotFoundError:
            results["ollama"] = {"status": "error", "error": "Ollama not installed"}
        except Exception as e:
            results["ollama"] = {"status": "error", "error": str(e)}
    
    # Start Object Identification
    if body.get("object_id", True):
        global obj_process
        try:
            # Check if already running
            check = subprocess.run(['pgrep', '-f', 'object_identifier.py'], capture_output=True, timeout=1)
            if check.returncode == 0:
                results["object_id"] = {"status": "already_running"}
            else:
                import os
                base_dir = os.path.dirname(os.path.abspath(__file__))
                venv_python = os.path.join(base_dir, "venv", "bin", "python3")
                script_path = os.path.join(base_dir, "object_identifier.py")
                
                obj_process = subprocess.Popen(
                    [venv_python, script_path],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    start_new_session=True
                )
                results["object_id"] = {"status": "started"}
        except Exception as e:
            results["object_id"] = {"status": "error", "error": str(e)}

    return jsonify(results), 200

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Streaming chat endpoint that proxies to local Ollama deepseek-r1:1.5b.
    Expects: { "message": "...", "history": [{"role": "...", "content": "..."}] }
    Returns: Server-Sent Events stream of response tokens.
    """
    body = request.json
    user_message = body.get('message', '')
    history = body.get('history', [])

    # Build the messages array with system prompt + telemetry context
    history_context = ""
    try:
        if os.path.exists(LOG_FILE_PATH):
            with open(LOG_FILE_PATH, 'r') as f:
                lines = f.readlines()
                recent_logs = lines[-5:] # Last 5 entries
                history_context = "\n\nRecent telemetry history (oldest to newest):\n" + "".join(recent_logs)
    except:
        pass

    telemetry_context = f"\n\nCurrent telemetry readings: {json.dumps(latest_data)}" if latest_data.get('timestamp') else ""
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + telemetry_context + history_context}
    ]
    
    # Add conversation history
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    
    # Add current user message
    messages.append({"role": "user", "content": user_message})

    def generate():
        yield f"data: {json.dumps({'status': 'connected'})}\n\n"
        try:
            stream = ollama.chat(
                model='deepseek-r1:1.5b',
                messages=messages,
                stream=True
            )
            
            full_response = ""
            inside_think = False
            
            for chunk in stream:
                token = chunk['message']['content']
                if not token: continue
                full_response += token
                
                # Check for start of thinking
                if '<think>' in token:
                    inside_think = True
                    parts = token.split('<think>')
                    if parts[0].strip():
                        yield f"data: {json.dumps({'token': parts[0]})}\n\n"
                    continue
                
                # Check for end of thinking
                if '</think>' in token:
                    inside_think = False
                    parts = token.split('</think>')
                    if len(parts) > 1 and parts[1].strip():
                        yield f"data: {json.dumps({'token': parts[1]})}\n\n"
                    continue
                
                # Yield tokens if not inside <think> tags
                if not inside_think:
                    yield f"data: {json.dumps({'token': token})}\n\n"
            
            yield f"data: {json.dumps({'done': True})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return Response(generate(), mimetype='text/event-stream')

@app.route('/api/objects', methods=['GET', 'POST'])
def manage_objects():
    """
    GET: Returns the latest detected objects.
    POST: Updates the latest detected objects from the identification script.
    """
    global latest_objects, latest_data
    if request.method == 'POST':
        latest_objects = request.json.get('objects', [])
        latest_data['objects'] = latest_objects
        return jsonify({"status": "updated"}), 200
    else:
        return jsonify({"objects": latest_objects})

if __name__ == '__main__':
    # Start ESP32 polling in background
    poller = threading.Thread(target=poll_esp32, daemon=True)
    poller.start()
    print(f"[ESP32 Poll] Polling {ESP32_DATA_URL} every {ESP32_POLL_INTERVAL}s")
    app.run(host='0.0.0.0', port=5000, debug=True)
