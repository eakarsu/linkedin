#!/bin/bash

# LinkedIn Clone Stop Script
# This script stops the LinkedIn clone application

echo "=========================================="
echo "   LinkedIn Clone - Stop Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Find and kill Next.js dev server
echo "Stopping LinkedIn Clone..."
echo ""

# Find processes running npm run dev or next dev
PIDS=$(ps aux | grep -E 'next dev|npm run dev' | grep -v grep | awk '{print $2}')

if [ -z "$PIDS" ]; then
    echo -e "${YELLOW}No running LinkedIn Clone processes found${NC}"
else
    for PID in $PIDS; do
        echo -e "${GREEN}Stopping process: $PID${NC}"
        kill $PID 2>/dev/null
    done
    echo ""
    echo -e "${GREEN}✓ LinkedIn Clone stopped successfully${NC}"
fi

echo ""
echo "=========================================="
