#!/bin/bash
# ============================================
#  Project A.R.E.S. — Full Stack Startup
# ============================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend_react"

echo "============================================"
echo "  🚀 A.R.E.S. System Startup"
echo "============================================"
echo ""

# ── 1. Start Ollama AI ──
echo "[1/4] Starting Ollama AI..."
# Check if camera/sensor is reachable to warn the user early
echo "  Checking hardware connectivity..."
if ! ping -c 1 10.202.253.217 > /dev/null 2>&1; then
    echo "  ⚠️  Warning: Camera (10.202.253.217) is unreachable from this terminal."
fi
if ! ping -c 1 10.202.253.93 > /dev/null 2>&1; then
    echo "  ⚠️  Warning: Sensor Rover (10.202.253.93) is unreachable from this terminal."
fi
if pgrep -f "ollama" > /dev/null 2>&1; then
    echo "  ✓ Ollama already running"
else
    ollama serve > /dev/null 2>&1 &
    sleep 2
    if pgrep -f "ollama" > /dev/null 2>&1; then
        echo "  ✓ Ollama started"
    else
        echo "  ✗ Ollama failed to start (is it installed?)"
    fi
fi

# ── 2. Start Backend ──
echo "[2/4] Starting Backend Server..."
if lsof -i :5000 > /dev/null 2>&1; then
    echo "  ✓ Backend already running on port 5000"
else
    source "$BACKEND_DIR/venv/bin/activate"
    python "$BACKEND_DIR/app.py" > "$BACKEND_DIR/backend_log.txt" 2>&1 &
    BACKEND_PID=$!
    sleep 2
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "  ✓ Backend started (PID: $BACKEND_PID)"
    else
        echo "  ✗ Backend failed to start — check backend/backend_log.txt"
    fi
fi

# ── 3. Start Object Identification ──
echo "[3/4] Starting Object Identification..."
if pgrep -f "object_identifier.py" > /dev/null 2>&1; then
    echo "  ✓ Object Identification already running"
else
    source "$BACKEND_DIR/venv/bin/activate"
    python "$BACKEND_DIR/object_identifier.py" > "$BACKEND_DIR/object_id.log" 2>&1 &
    OBJ_ID_PID=$!
    sleep 2
    if kill -0 $OBJ_ID_PID 2>/dev/null; then
        echo "  ✓ Object Identification started (PID: $OBJ_ID_PID)"
    else
        echo "  ✗ Object Identification failed to start — check $BACKEND_DIR/object_id.log"
    fi
fi

# ── 4. Start Frontend ──
echo "[4/4] Starting Frontend Dev Server..."
if lsof -i :5173 > /dev/null 2>&1; then
    echo "  ✓ Frontend already running on port 5173"
else
    cd "$FRONTEND_DIR"
    npm run dev -- --host > /dev/null 2>&1 &
    FRONTEND_PID=$!
    sleep 3
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "  ✓ Frontend started (PID: $FRONTEND_PID)"
    else
        echo "  ✗ Frontend failed to start"
    fi
fi

echo ""
echo "============================================"
echo "  ✅ A.R.E.S. System Ready"
echo ""
echo "  Dashboard:  http://localhost:5173"
echo "  Backend:    http://localhost:5000"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop all services..."

# Keep script alive and cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down A.R.E.S. services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill $OBJ_ID_PID 2>/dev/null
    echo "Done."
    exit 0
}

trap cleanup SIGINT SIGTERM
wait
