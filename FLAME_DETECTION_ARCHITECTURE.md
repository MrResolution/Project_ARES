# Flame Detection Pipeline in A.R.E.S. Dashboard

## System Architecture Overview

The A.R.E.S. system has a **multi-stage vision processing pipeline** for detecting and displaying hazards (flame & smoke) from the ESP32-CAM feed in the Live Visuals dashboard.

---

## 1. HARDWARE LAYER (ESP32-CAM)

**File**: `/firmware/Arm_Cam_Optimized/Arm_Cam_Optimized.ino`

### Camera Streaming:
- **ESP32-CAM**: Mounted on the rover arm for real-time monitoring
- **Stream URL**: `http://10.202.253.217:81/stream`
- **Format**: MJPEG (Motion JPEG) multipart stream
- **Frame Rate**: ~10 FPS (configurable via `ms_per_frame`)
- **Quality**: Dynamically adjusted (quality level 15) for bandwidth optimization

### Key Functions:
```cpp
void handleStream(WiFiClient client) {
  // Streams MJPEG frames continuously
  // Sends HTTP boundary markers between frames
  // Camera frames at ~10 FPS to prevent overflow
}
```

---

## 2. BACKEND HAZARD DETECTION (Python)

**File**: `/backend/object_identifier.py`

### Flame Detection Algorithm:

```python
def detect_fire(hsv_frame, gray_frame):
    """
    Detects fire/flames using:
    1. HSV color-range thresholding
    2. Contour analysis with area filtering
    3. Temporal validation (HazardTracker)
    """
```

#### Detection Thresholds:
- **Color Range (HSV)**:
  - Lower: `[0, 80, 80]` (red-orange hue)
  - Upper: `[35, 255, 255]` (saturated orange/red)
  
- **Body Requirements**:
  - Minimum area: **350 pixels**
  - Gaussian blur: 15x15 (noise reduction)
  
- **Frame Validation**:
  - Requires **5+ consecutive frames** for confirmation
  - Flicker threshold: `> 0.05` (intensity variance)
  - Growth stability: `> 0.08` (must show movement/change)

#### HazardTracker Class:
- **Purpose**: Validates detections across time to reject false positives
- **Memory**: Tracks last 10 frames per detection region
- **Spatial Mapping**: Grid-based (30px cells) to handle camera movement

### Smoke Detection:
```python
def detect_smoke(hsv_frame):
    """
    Detects smoke/haze using gray/white color range
    Lower: [0, 0, 100]    (low saturation, medium-high brightness)
    Upper: [180, 50, 200] (any hue, very low saturation, high brightness)
    Minimum area: 1000 pixels
    """
```

### Data Flow:
```
ESP32-CAM Stream
    ↓
OpenCV (MJPEG Decoder)
    ↓
HSV Conversion
    ↓
Color Masking (Fire + Smoke)
    ↓
Contour Finding + Area Filter
    ↓
HazardTracker Validation
    ↓
POST to Backend /api/objects
    ↓
Dashboard receives detection boxes
```

---

## 3. BACKEND API (Flask)

**File**: `/backend/app.py`

### API Endpoints:

#### `GET /api/status`
- Returns latest telemetry including flame sensor reading
- Data format:
```json
{
  "flame": 0.0,          // Analog sensor reading
  "objects": [],         // Camera detections
  "timestamp": "2026-02-21T...",
  "active": true
}
```

#### `GET /api/objects`
- Returns newest detected hazards from object_identifier
- Response:
```json
{
  "objects": [
    {
      "label": "FLAME",
      "confidence": 0.75,
      "box": {
        "x": 0.25,        // Normalized (0-1)
        "y": 0.30,
        "w": 0.15,
        "h": 0.20
      }
    }
  ]
}
```

#### `POST /api/objects`
- Called by object_identifier.py every 0.5 seconds
- Receives detection results and stores in memory

### Safety Integration:
```python
@app.route('/api/telemetry', methods=['POST'])
def receive_telemetry():
    # Check for fire risk based on temp + gas sensors
    if ai.detect_fire_risk(data.get('temp', 0), data.get('gas', 0)):
        print("CRITICAL: PRE-FIRE CONDITION DETECTED")
```

---

## 4. FRONTEND DISPLAY (React)

**File**: `/frontend_react/src/components/VideoFeed.jsx`

### Live Video Display:
```jsx
const ESP32_CAM_STREAM_URL = "http://10.202.253.217:81/stream";

<img
  ref={imgRef}
  src={ESP32_CAM_STREAM_URL}
  alt="ESP32-CAM Live Feed"
  onLoad={handleStreamLoad}   // Sets status to 'live'
  onError={handleStreamError} // Sets status to 'error'
/>
```

### Detection Overlay System:
```jsx
{camStatus === 'live' && (
  <svg className="detection-overlay" viewBox="0 0 1 1" preserveAspectRatio="none">
    {objects.map((obj, i) => (
      obj.box && (
        <g key={i}>
          {/* Bounding box rectangle */}
          <rect
            x={obj.box.x}      // Normalized 0-1
            y={obj.box.y}
            width={obj.box.w}
            height={obj.box.h}
            className="detection-box"  // Styled border
          />
          {/* Label with confidence */}
          <text
            x={obj.box.x}
            y={obj.box.y - 0.01}
            className="detection-label"
          >
            {obj.label} ({(obj.confidence * 100).toFixed(0)}%)
          </text>
        </g>
      )
    ))}
  </svg>
)}
```

### Status Indicators:
- **● LIVE**: Camera connected and receiving frames
- **◌ CONNECTING**: Attempting connection
- **✕ OFFLINE**: Camera unreachable

### CSS Styling:
```css
.detection-box {
  fill: none;
  stroke: #ff6b6b;      /* Red for FLAME */
  stroke-width: 0.005;
  stroke-dasharray: 0.01;
}

.detection-label {
  fill: #ff6b6b;
  font-family: monospace;
  font-size: 0.04px;
}
```

---

## 5. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                        ESP32-CAM (10.202.253.217:81)            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Camera Stream (MJPEG @10FPS)                               │ │
│  │ └─/stream endpoint                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTP Stream
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (localhost:5000)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ object_identifier.py                                       │ │
│  │ ├─ OpenCV: Reads MJPEG frames                             │ │
│  │ ├─ detect_fire(): HSV threshold + flicker check           │ │
│  │ ├─ detect_smoke(): Gray/white detection                   │ │
│  │ ├─ HazardTracker: 5-frame validation                      │ │
│  │ └─ POST /api/objects every 0.5s                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ app.py (Flask)                                             │ │
│  │ ├─ GET /api/objects → returns latest_objects             │ │
│  │ ├─ GET /api/status → includes flame sensor + objects      │ │
│  │ └─ POST /api/telemetry → safety checks                    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTP/JSON
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Frontend Dashboard (localhost:5173)             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ VideoFeed.jsx (Live Visuals Page)                          │ │
│  │ ├─ <img src="http://10.202.253.217:81/stream" />          │ │
│  │ ├─ Polls App.jsx for objects state                        │ │
│  │ ├─ SVG overlay renders detection boxes                    │ │
│  │ └─ Labels: FLAME (red) | SMOKE (gray)                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ App.jsx (Main)                                             │ │
│  │ ├─ fetchTelemetry() → GET /api/status every 2s           │ │
│  │ ├─ Updates objects state                                  │ │
│  │ └─ Passes to VisualsPage component                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. DETECTION QUALITY & RELIABILITY

### Strengths:
✅ Real-time MJPEG stream (10 FPS)  
✅ Multi-stage validation (temporal + spatial)  
✅ Automatic false-positive rejection (flicker test)  
✅ Live bounding box overlay on video  
✅ Confidence scores displayed  

### Current Limitations:
⚠️ HSV color ranges are environment-specific (may need tuning)  
⚠️ Requires 5 frames validation = ~500ms latency  
⚠️ No deep learning (uses traditional CV)  
⚠️ Fixed area thresholds (not scale-invariant)  

### Future Enhancements:
🔮 Replace HSV with TensorFlow/YOLO model for FLAME class  
🔮 Adaptive thresholding based on ambient lighting  
🔮 Thermal camera integration for IR-based detection  
🔮 GPU acceleration (CUDA) for faster processing  

---

## 7. CONFIGURATION PARAMETERS

**File**: `/backend/object_identifier.py`

```python
CAM_URL = "http://10.202.253.217:81/stream"
BACKEND_URL = "http://127.0.0.1:5000/api/objects"

# Fire detection thresholds
FLICKER_THRESHOLD = 0.05      # Intensity variance required
GROWTH_STABILITY = 0.08        # Area movement required
MIN_FRAMES_VALIDATION = 5      # Confirmation frames

# Minimum detection sizes
FLAME_MIN_AREA = 350           # Pixels
SMOKE_MIN_AREA = 1000          # Pixels

# Post interval
post_interval = 0.5            # Send detections every 0.5s
```

---

## 8. HOW TO TEST

### View Live Feed:
```bash
# Open browser to dashboard at:
http://localhost:5173

# Navigate to: Live Visuals tab
# Watch for red bounding boxes = FLAME detected
# Watch for gray bounding boxes = SMOKE detected
```

### Monitor Detection in Logs:
```bash
# Terminal 1: Watch object_identifier output
tail -f /home/sabo/Documents/project_ARES/backend_log.txt

# Look for:
# [object_identifier] HAZARD DETECTED: FLAME at [x, y, w, h]
```

### Test with Debug Image:
```python
# Add to object_identifier.py for visual debugging:
cv2.imwrite(f"frame_{i}.jpg", frame)  # Save each frame
cv2.imshow("Fire Mask", mask)         # Display mask window
```

---

## 9. RELATED FILES

| Component | File | Purpose |
|-----------|------|---------|
| Hardware | `firmware/Arm_Cam_Optimized/Arm_Cam_Optimized.ino` | MJPEG streaming @ 10 FPS |
| Detection | `backend/object_identifier.py` | Real-time flame/smoke detection |
| API | `backend/app.py` | Serves detection boxes via JSON |
| UI | `frontend_react/src/components/VideoFeed.jsx` | Displays live feed + overlay |
| Root State | `frontend_react/src/App.jsx` | Fetches objects every 2s |

---

## 10. KNOWN ISSUES & NOTES

- **IP Mismatch**: Camera is at `10.202.253.217` while rover data is from `10.202.253.93`
- **Port 81**: ESP32 camera server runs on port 81 (not default 80)
- **CORS**: Camera stream includes `Access-Control-Allow-Origin: *` for browser access
- **Flame vs Radiation**: The "flame" sensor (analog) is separate from camera flame detection
  - Sensor flame reading ≠ Camera flame detection
  - Both use different methods (analog vs. vision)

---

## Summary

The A.R.E.S. Dashboard successfully detects and displays **flame and smoke** in real-time by:
1. **Streaming** MJPEG video from ESP32-CAM @ 10 FPS
2. **Processing** frames with OpenCV HSV color detection + temporal validation
3. **Sending** validated detections (JSON) from Python backend to React frontend
4. **Rendering** detection boxes as SVG overlay on the live video feed

The system achieves a good balance between **accuracy** (5-frame validation) and **responsiveness** (~500ms latency).

