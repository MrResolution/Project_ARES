import requests
import time
import random
import json

# Configuration
BACKEND_URL = "http://localhost:5000/api/telemetry"

def generate_telemetry():
    return {
        "temp": round(random.uniform(20.0, 85.0), 1),
        "pressure": round(random.uniform(1000, 1020), 1),
        "gas": int(random.uniform(100, 600)),
        "radiation": int(random.uniform(10, 50))
    }

print(f"Simulating ESP32 Rover... Sending data to {BACKEND_URL}")

while True:
    data = generate_telemetry()
    try:
        response = requests.post(BACKEND_URL, json=data)
        if response.status_code == 200:
            print(f"Sent: {data}")
        else:
            print(f"Failed: {response.status_code}")
    except Exception as e:
        print(f"Connection Error: {e}")
        print("Ensure the backend server is running!")
    
    time.sleep(2)
