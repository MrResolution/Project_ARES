import cv2
import requests
import numpy as np
import time
import os
import urllib.request
from collections import deque

# ── Configuration ──
CAM_URL = "http://10.202.253.217:81/stream"
BACKEND_URL = "http://127.0.0.1:5000/api/objects"

# Selective Validation thresholds
FLICKER_THRESHOLD = 0.05  # Increased for selectivity
GROWTH_STABILITY = 0.08   # Required boundary movement
MIN_FRAMES_VALIDATION = 5 # More evidence required

class HazardTracker:
    """Tracks detected regions over time to validate flicker and growth."""
    def __init__(self, max_history=10):
        self.history = deque(maxlen=max_history)
        self.max_history = max_history

    def update(self, area, intensity):
        self.history.append({"area": area, "intensity": intensity})

    def is_valid_hazard(self, label):
        if len(self.history) < MIN_FRAMES_VALIDATION:
            return False
            
        # 1. Flicker Analysis (Variance of Intensity)
        intensities = [h["intensity"] for h in self.history]
        avg_int = np.mean(intensities) + 1e-6
        variance = np.var(intensities) / avg_int
        
        # 2. Shape Dynamics (Changes in Area)
        areas = [h["area"] for h in self.history]
        avg_area = np.mean(areas) + 1e-6
        area_variation = np.std(areas) / avg_area
        
        # Fire must flicker AND move
        if label == "FLAME":
            return variance > FLICKER_THRESHOLD and area_variation > GROWTH_STABILITY
        
        # Smoke is purely color/area based
        return True

# Global tracker pool
trackers = {} # (x_key, y_key) -> HazardTracker

def get_tracker_key(x, y, w, h):
    """Grid-based keying to match regions across frames."""
    gx, gy = x // 30, y // 30  # Approx 30px grid to account for slight camera movement
    return (gx, gy)

def detect_fire(hsv_frame, gray_frame):
    """Detects fire with selective color and strict variance."""
    # Reverting to tighter fire color bounds
    lower_fire = np.array([0, 80, 80], dtype="uint8")
    upper_fire = np.array([35, 255, 255], dtype="uint8")
    
    mask = cv2.inRange(hsv_frame, lower_fire, upper_fire)
    mask = cv2.GaussianBlur(mask, (15, 15), 0)
    
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detections = []
    
    active_keys = set()
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 350:
            x, y, w, h = cv2.boundingRect(cnt)
            key = get_tracker_key(x, y, w, h)
            active_keys.add(key)
            
            if key not in trackers:
                trackers[key] = HazardTracker()
            
            # Mean brightness of the region in gray frame
            region_gray = gray_frame[y:y+h, x:x+w]
            avg_intensity = np.mean(region_gray)
            
            trackers[key].update(area, avg_intensity)
            
            if trackers[key].is_valid_hazard("FLAME"):
                detections.append({
                    "label": "FLAME",
                    "confidence": min(0.99, 0.6 + (area / 10000.0)),
                    "box": [x, y, x + w, y + h]
                })
    
    # Cleanup stale trackers
    stale = [k for k in trackers if k not in active_keys]
    for k in stale:
        del trackers[k]
        
    return detections

def detect_smoke(hsv_frame):
    """Detects smoke (grey/white)."""
    lower_smoke = np.array([0, 0, 100], dtype="uint8")
    upper_smoke = np.array([180, 50, 200], dtype="uint8")
    
    mask = cv2.inRange(hsv_frame, lower_smoke, upper_smoke)
    mask = cv2.GaussianBlur(mask, (21, 21), 0)
    
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    detections = []
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > 1000:
            x, y, w, h = cv2.boundingRect(cnt)
            detections.append({
                "label": "SMOKE",
                "confidence": min(0.90, 0.4 + (area / 15000.0)),
                "box": [x, y, x + w, y + h]
            })
    return detections

def process_stream():
    """Reads MJPEG stream and detects Hazards."""
    print(f"Connecting to stream: {CAM_URL}")
    try:
        stream = urllib.request.urlopen(CAM_URL, timeout=5)
    except Exception as e:
        print(f"Failed to open stream: {e}")
        return

    bytes_data = b''
    last_post_time = 0
    post_interval = 0.5
    
    while True:
        try:
            bytes_data += stream.read(4096)
            a = bytes_data.find(b'\xff\xd8')
            b = bytes_data.find(b'\xff\xd9')
            
            if a != -1 and b != -1:
                jpg = bytes_data[a:b+2]
                bytes_data = bytes_data[b+2:]
                
                frame = cv2.imdecode(np.frombuffer(jpg, dtype=np.uint8), cv2.IMREAD_COLOR)
                if frame is None:
                    continue
                    
                h, w = frame.shape[:2]
                hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                
                hazards = []
                hazards.extend(detect_fire(hsv, gray))
                hazards.extend(detect_smoke(hsv))
                
                found_objects = []
                for hazard in hazards:
                    startX, startY, endX, endY = hazard["box"]
                    found_objects.append({
                        "label": hazard["label"],
                        "confidence": float(hazard["confidence"]),
                        "box": {
                            "x": float(startX / w),
                            "y": float(startY / h),
                            "w": float((endX - startX) / w),
                            "h": float((endY - startY) / h)
                        }
                    })
                    print(f"HAZARD DETECTED: {hazard['label']} at {hazard['box']}")
                
                if time.time() - last_post_time > post_interval:
                    try:
                        requests.post(BACKEND_URL, json={"objects": found_objects}, timeout=1)
                        last_post_time = time.time()
                    except:
                        pass
        except Exception as e:
            print(f"Error: {e}")
            break

if __name__ == "__main__":
    print("Project A.R.E.S. Hazard Detector v2.2 (Selective Rollback)")
    while True:
        process_stream()
        print("Reconnecting in 5s...")
        time.sleep(5)
