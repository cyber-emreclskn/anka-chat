#!/bin/bash

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Running on macOS"
else
    echo "This script is optimized for macOS. Some commands might not work on other operating systems."
fi

# Function to start the backend
start_backend() {
    echo "Starting AnkaChat Backend..."
    cd backend
    
    # Check if Python virtual environment exists
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install dependencies
    echo "Installing backend dependencies..."
    pip install -r requirements.txt
    
    # Ensure uvicorn is installed (sometimes pip install may skip some dependencies)
    pip install uvicorn fastapi
    
    # Run the application
    echo "Running FastAPI backend on http://localhost:8000"
    python main.py &
    
    # Store backend PID
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    cd ..
}

# Function to start the frontend
start_frontend() {
    echo "Starting AnkaChat Frontend..."
    cd frontend
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install --legacy-peer-deps
    fi
    
    # Run the application
    echo "Running React frontend on http://localhost:3000"
    npm start &
    
    # Store frontend PID
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
    cd ..
}

# Function to stop all processes
cleanup() {
    echo "Stopping all processes..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID
    fi
    exit 0
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Start both applications
start_backend
start_frontend

echo "AnkaChat is running!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop all services"

# Keep the script running
while true; do
    sleep 1
done
