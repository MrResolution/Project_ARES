"""
Project A.R.E.S. — OLED Data Sender
Fetches live telemetry from the backend and sends a compact plain-text
data packet to the OLED receiver ESP32 at 10.73.208.199 via /upload.

Usage:
    python3 oled_sender.py
"""

import requests
import time
import sys

# ── Configuration ──
BACKEND_URL = "http://localhost:5000/api/status"   # Source: our Flask backend
OLED_RECEIVER_IP = "10.73.208.199"                 # Target: ESP32 with OLED
OLED_ENDPOINT = f"http://{OLED_RECEIVER_IP}/upload"  # Matches receiver's route
SEND_INTERVAL = 2  # seconds


def fetch_telemetry():
    """Pull latest telemetry from the A.R.E.S. backend."""
    try:
        resp = requests.get(BACKEND_URL, timeout=3)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print(f"[FETCH ERROR] {e}")
        return None


def build_oled_text(data):
    """
    Build a compact plain-text string for the OLED display.
    Format is key:value pairs separated by commas — easy to parse on Arduino
    with simple string splitting.
    """
    temp = data.get("temp", 0)
    gas = data.get("gas", 0)
    pressure = data.get("pressure", 0)
    flame = data.get("flame", 1)    # 1 = no flame (active LOW)
    water = data.get("water", 0)
    lat = data.get("lat", 0)
    lng = data.get("lng", 0)

    # Determine alert status
    if flame == 0 or temp > 70:
        alert = "FIRE"
    elif gas > 500:
        alert = "GAS_HIGH"
    elif temp > 50:
        alert = "TEMP_WARN"
    else:
        alert = "SAFE"

    # Plain text format: "Key: Value, Key: Value, ..."
    # This matches the format your client code already uses
    text = (
        f"Temp: {round(temp, 1)}, "
        f"Gas: {gas}, "
        f"Press: {round(pressure, 1)}, "
        f"Flame: {flame}, "
        f"Water: {water}, "
        f"Lat: {round(lat, 6)}, "
        f"Lng: {round(lng, 6)}, "
        f"Alert: {alert}"
    )
    return text


def send_to_oled(text):
    """Send the plain-text data to the OLED receiver ESP32 via HTTP POST /upload."""
    try:
        resp = requests.post(
            OLED_ENDPOINT,
            data=text,
            headers={"Content-Type": "text/plain"},
            timeout=3
        )
        if resp.status_code == 200:
            print(f"[SENT] {text}")
        else:
            print(f"[OLED WARN] HTTP {resp.status_code}: {resp.text}")
    except requests.exceptions.ConnectionError:
        print(f"[OLED OFFLINE] Cannot reach {OLED_RECEIVER_IP} — is it powered on?")
    except Exception as e:
        print(f"[SEND ERROR] {e}")


def main():
    print("=" * 50)
    print("  A.R.E.S. OLED Data Sender")
    print(f"  Source:  {BACKEND_URL}")
    print(f"  Target:  {OLED_ENDPOINT}")
    print(f"  Interval: {SEND_INTERVAL}s")
    print("=" * 50)

    while True:
        data = fetch_telemetry()
        if data and data.get("timestamp"):
            text = build_oled_text(data)
            send_to_oled(text)
        else:
            print("[WAITING] No telemetry data yet from backend...")

        time.sleep(SEND_INTERVAL)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[STOPPED] OLED sender terminated.")
        sys.exit(0)
