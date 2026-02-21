"""
Project A.R.E.S. — OLED Data Sender
Fetches live telemetry from the backend and sends a compact plain-text
data packet to the OLED receiver ESP32 for physical monitoring.

Usage:
    python3 oled_sender.py [OLED_IP]
"""

import requests
import time
import sys
import argparse

# ── Configuration Defaults ──
BACKEND_URL = "http://localhost:5000/api/status" 
DEFAULT_OLED_IP = "10.73.208.199" # Default from last session
SEND_INTERVAL = 2  # seconds

def fetch_telemetry():
    """Pull latest telemetry from the A.R.E.S. backend."""
    try:
        resp = requests.get(BACKEND_URL, timeout=3)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"[FETCH ERROR] Backend at {BACKEND_URL} unreachable. {e}")
        return None

def build_oled_text(data):
    """
    Build a compact plain-text string for the ST7735 display.
    Format: Key: Val, Key: Val
    """
    temp = data.get("temp", 0)
    gas = data.get("gas", 0)
    pressure = data.get("pressure", 0)
    water = data.get("water", 0)
    ax = data.get("ax", 0)
    ay = data.get("ay", 0)
    
    # Determine alert status
    if temp > 70:
        alert = "FIRE!"
    elif gas > 500:
        alert = "GAS!"
    elif abs(ax) > 0.5 or abs(ay) > 0.5:
        alert = "TILT"
    else:
        alert = "SAFE"

    # Compact string for the receiver
    text = (
        f"Temp: {round(temp, 1)}, "
        f"Gas: {gas}, "
        f"Ax: {round(ax, 2)}, "
        f"Ay: {round(ay, 2)}, "
        f"Alert: {alert}"
    )
    return text

def send_to_oled(text, oled_ip):
    """Send telemetry text to the ESP32 receiver via HTTP POST."""
    endpoint = f"http://{oled_ip}/upload"
    try:
        resp = requests.post(
            endpoint,
            data=text,
            headers={"Content-Type": "text/plain"},
            timeout=3
        )
        if resp.status_code == 200:
            print(f"[BRIDGE] Sent to {oled_ip}: {text}")
        else:
            print(f"[OLED ERR] HTTP {resp.status_code} at {oled_ip}")
    except Exception as e:
        print(f"[OFFLINE] Cannot reach OLED at {oled_ip}. Check IP on screen.")

def main():
    parser = argparse.ArgumentParser(description="ARES OLED Data Bridge")
    parser.add_argument("ip", nargs="?", default=DEFAULT_OLED_IP, help="IP of the OLED ESP32")
    args = parser.parse_args()

    print("=" * 50)
    print("  A.R.E.S. OLED DASHBOARD BRIDGE")
    print(f"  Backend: {BACKEND_URL}")
    print(f"  OLED IP: {args.ip}")
    print("=" * 50)

    while True:
        data = fetch_telemetry()
        if data and data.get("timestamp"):
            text = build_oled_text(data)
            send_to_oled(text, args.ip)
        
        time.sleep(SEND_INTERVAL)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[STOPPED] Bridge terminated.")
        sys.exit(0)

