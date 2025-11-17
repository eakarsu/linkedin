#!/bin/bash

# LinkedIn Clone Startup Script
# This script starts the LinkedIn clone application

echo "=========================================="
echo "   LinkedIn Clone - Startup Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Function to kill process on a port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)

    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}Port $port is in use. Cleaning up...${NC}"
        echo "Killing processes: $pids"
        kill -9 $pids 2>/dev/null
        sleep 1

        # Verify port is free
        if check_port $port; then
            echo -e "${RED}Failed to free port $port${NC}"
            return 1
        else
            echo -e "${GREEN}✓ Port $port is now free${NC}"
            return 0
        fi
    fi
    return 0
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}Warning: package.json not found in current directory${NC}"
    echo "Please run this script from the linkedin-clone directory"
    exit 1
fi

# Clean up ports that might be used by the application
echo -e "${BLUE}Checking and cleaning ports...${NC}"
PORTS_TO_CHECK=(3000 3001 3002)

for port in "${PORTS_TO_CHECK[@]}"; do
    if check_port $port; then
        kill_port $port
    fi
done

echo -e "${GREEN}✓ Port cleanup complete${NC}"
echo ""

# Clean up Next.js cache
if [ -d ".next" ]; then
    echo -e "${BLUE}Cleaning Next.js cache...${NC}"
    rm -rf .next
    echo -e "${GREEN}✓ Cache cleared${NC}"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}node_modules not found. Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${YELLOW}Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js version: $NODE_VERSION${NC}"
echo ""

# Display application info
echo -e "${BLUE}Application Information:${NC}"
echo "  - Framework: Next.js 16"
echo "  - UI Library: Material-UI"
echo "  - Language: TypeScript"
echo "  - Database: None (using mock data)"
echo ""

# Note about database
echo -e "${YELLOW}Note: This application currently uses mock data.${NC}"
echo -e "${YELLOW}No database setup is required at this time.${NC}"
echo ""

# Start the development server
echo -e "${BLUE}Starting LinkedIn Clone...${NC}"
echo ""
echo -e "${GREEN}Available pages:${NC}"
echo "  - Home Feed:    http://localhost:3000/"
echo "  - Profile:      http://localhost:3000/profile"
echo "  - Network:      http://localhost:3000/network"
echo "  - Messaging:    http://localhost:3000/messaging"
echo "  - Login:        http://localhost:3000/login"
echo "  - Signup:       http://localhost:3000/signup"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo "=========================================="
echo ""

# Start the Next.js development server
npm run dev
