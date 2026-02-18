#!/bin/bash
echo "Starting Project A.R.E.S. Backend..."
cd backend
# Check if venv exists, else create
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
echo "Launching Server..."
python app.py
