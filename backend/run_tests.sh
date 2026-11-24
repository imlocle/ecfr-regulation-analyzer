#!/bin/bash

# Run backend unit tests

set -e

echo "🧪 Running backend unit tests..."
echo ""

# Activate virtual environment if it exists
if [ -d "../.venv" ]; then
    source ../.venv/bin/activate
fi

# Install dev dependencies if needed
if ! python -c "import pytest" 2>/dev/null; then
    echo "📦 Installing test dependencies..."
    pip install -r requirements-dev.txt
    echo ""
fi

# Run tests
pytest tests/ -v

echo ""
echo "✅ All tests passed!"
