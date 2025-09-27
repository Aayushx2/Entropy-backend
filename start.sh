#!/bin/bash

# Entropy Productions - Full Stack Startup Script

echo "🚀 Starting Entropy Productions Full Stack Application..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing backend dependencies..."
npm install

echo ""
echo "🔧 Starting backend server on port 3000..."
node server.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo ""
echo "🌐 Starting frontend server on port 8000..."
python3 -m http.server 8000 &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo ""
echo "🔗 Frontend: http://localhost:8000"
echo "🔗 Backend API: http://localhost:3000"
echo "🔗 API Health: http://localhost:3000/health"
echo ""
echo "📚 API Endpoints:"
echo "   GET  /api/entropy - Get all modules"
echo "   POST /signup - User registration"
echo "   POST /login - User login"
echo "   GET  /modules - Get user modules (protected)"
echo "   POST /modules/enroll - Enroll in module (protected)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
