#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "🚀 Starting Warrantify local development environment..."

# 1. Load Node environment via nvm if available
if [ -s "$HOME/.var/app/com.visualstudio.code/config/nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.var/app/com.visualstudio.code/config/nvm"
    source "$NVM_DIR/nvm.sh"
elif [ -s "$HOME/.nvm/nvm.sh" ]; then
    export NVM_DIR="$HOME/.nvm"
    source "$NVM_DIR/nvm.sh"
fi

# 2. Activate Python virtual environment
source "$REPO_ROOT/.warrantify_venv/bin/activate"

# 3. Cleanup handler on exit (Ctrl+C)
cleanup() {
    echo ""
    echo "🛑 Shutting down Warrantify dev servers..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 4. Start FastAPI backend (port 8000)
echo "⚡ Starting FastAPI backend on http://127.0.0.1:8000 ..."
(
    cd "$REPO_ROOT/backend"
    python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) &
BACKEND_PID=$!

# Wait 2 seconds for backend to start up
sleep 2

# 5. Start Next.js frontend (port 3000)
echo "✨ Starting Next.js frontend on http://localhost:3000 ..."
(
    cd "$REPO_ROOT/frontend"
    npm run dev
) &
FRONTEND_PID=$!

# Wait for background processes
wait $FRONTEND_PID $BACKEND_PID

