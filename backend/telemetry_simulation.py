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
        "radiation": int(random.uniform(10, 50)),
        "gasProfile": {
            "ammonia": round(random.uniform(5, 20), 1),
            "nox": round(random.uniform(10, 40), 1),
            "methane": round(random.uniform(20, 60), 1),
            "benzene": round(random.uniform(2, 10), 1),
            "smoke": round(random.uniform(15, 40), 1),
            "co2": round(random.uniform(400, 500), 1),
            "co": round(random.uniform(5, 20), 1),
            "alcohol": round(random.uniform(10, 30), 1),
            "sulfur": round(random.uniform(1, 6), 1),
            "hydrogen": round(random.uniform(2, 12), 1)
        },
        "ax": int(random.uniform(-2000, 2000)), # Raw MPU6050 simulation
        "ay": int(random.uniform(-2000, 2000)),
        "az": int(random.uniform(14000, 18000)),
        "gx": int(random.uniform(-500, 500)),
        "gy": int(random.uniform(-500, 500)),
        "gz": int(random.uniform(-500, 500)),
        "active": True,
        "source": "simulation"
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
