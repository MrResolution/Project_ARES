from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_engine import AIEngine
import datetime

app = Flask(__name__)
CORS(app)

ai = AIEngine(model="llama3")

# In-memory storage for latest telemetry
latest_data = {
    "temp": 0,
    "pressure": 0,
    "gas": 0,
    "radiation": 0,
    "timestamp": None
}

@app.route('/api/telemetry', methods=['POST'])
def receive_telemetry():
    global latest_data
    data = request.json
    data['timestamp'] = datetime.datetime.now().isoformat()
    latest_data = data
    
    # Check for immediate risks
    if ai.detect_fire_risk(data.get('temp', 0), data.get('gas', 0)):
        print("CRITICAL: PRE-FIRE CONDITION DETECTED")
        # In real scenario, trigger active response back to rover
        
    return jsonify({"status": "received"}), 200

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(latest_data)

@app.route('/api/analyze', methods=['GET'])
def analyze_status():
    """
    On-demand AI analysis of the current state
    """
    analysis = ai.analyze_telemetry(latest_data)
    try:
        # Try to parse as JSON if the LLM followed instructions
        import json
        return jsonify(json.loads(analysis))
    except:
        return jsonify({"raw_output": analysis})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
