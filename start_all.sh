#!/bin/bash

# ===================================
# A.R.E.S. System Startup Script
# ===================================
# Starts all services: Backend, Demo Detector, and Frontend

PROJECT_DIR="/home/sabo/Documents/project_ARES"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend_react"

echo "🚀 Starting A.R.E.S. System..."
echo ""

# ── Kill any existing processes ──
echo "[1/4] Cleaning up old processes..."
pkill -f "python3 app.py" 2>/dev/null
pkill -f "python3 object_identifier.py" 2>/dev/null
pkill -f "node server.js" 2>/dev/null
sleep 2

# ── Start Flask Backend ──
echo "[2/4] Starting Flask Backend (http://localhost:5000)..."
cd "$BACKEND_DIR"
python3 app.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend started (PID: $BACKEND_PID)"
sleep 2

# ── Start Object Identifier (Demo Mode) ──
echo "[3/4] Starting Flame Detector (DEMO MODE)..."
cd "$BACKEND_DIR"
python3 object_identifier.py --demo > detector.log 2>&1 &
DETECTOR_PID=$!
echo "✓ Flame Detector started (PID: $DETECTOR_PID)"
sleep 2

# ── Start Node.js Frontend ──
echo "[4/4] Starting Frontend Server (http://localhost:5173)..."
cd "$FRONTEND_DIR"
export PATH="/tmp/node/node-v20.11.0-linux-x64/bin:$PATH"
node server.js > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✓ Frontend started (PID: $FRONTEND_PID)"
sleep 2

# ── Summary ──
echo ""
echo "======================================"
echo "✅ A.R.E.S. System is RUNNING"
echo "======================================"
echo ""
echo "📊 Services:"
echo "  • Backend API  → http://localhost:5000"
echo "  • Dashboard    → http://localhost:5173"
echo "  • Detector     → DEMO MODE (FLAME only)"
echo ""
echo "📋 PIDs:"
echo "  • Backend:     $BACKEND_PID"
echo "  • Detector:    $DETECTOR_PID"
echo "  • Frontend:    $FRONTEND_PID"
echo ""
echo "📁 Logs:"
echo "  • Backend:     $BACKEND_DIR/backend.log"
echo "  • Detector:    $BACKEND_DIR/detector.log"
echo "  • Frontend:    $FRONTEND_DIR/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill $BACKEND_PID $DETECTOR_PID $FRONTEND_PID"
echo ""
echo "🔗 Open dashboard: http://localhost:5173"
echo ""
