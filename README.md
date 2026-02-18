# Project A.R.E.S. (Autonomous Robotic Environmental Sentinel)

## Abstract
Industrial disasters and hazardous environments pose severe risks to human life and infrastructure. To address this within the framework of SDG 9 (Industry, Innovation, and Infrastructure), we present Project A.R.E.S. (Autonomous Robotic Environmental Sentinel). A.R.E.S. is an advanced, low-cost autonomous rover designed to replace human inspectors in toxic, radioactive, and high-risk industrial zones.

## System Architecture

### Hardware (Firmware)
- **Core**: Dual-processor architecture (ESP32 and Arduino).
- **Navigation**: LiDAR-guided autonomous simultaneous localization and mapping (SLAM).
- **Sensors**: Toxic gases, temperature, pressure, radiation.
- **Diagnostics**: Onboard OLED display.
- **Vision**: Robotic arm-mounted ESP32-CAM.
- **Actuation**: Fire suppression pump and servo mechanism.

### Backend (Edge-AI)
- **Intelligence**: Local LLM powered by Ollama.
- **Function**: Real-time telemetry processing, predictive maintenance, and thermal anomaly detection.

### Frontend (Dashboard)
- **Interface**: Web-based control panel.
- **Features**: Real-time data visualization, video streaming, and manual override controls.

## Directory Structure
- `firmware/`: ESP32 and Arduino source code.
- `backend/`: Python server and AI logic.
- `frontend/`: Web dashboard for monitoring and control.
