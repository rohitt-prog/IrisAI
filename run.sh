#!/bin/bash
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
echo "Starting IrisAI Platform..."

# Setup & Run Backend
echo "Starting Backend on port 5001..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py &
BACKEND_PID=$!
cd ..

# Setup & Run Frontend
echo "Starting Frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Press CTRL+C to stop both."

trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

wait
