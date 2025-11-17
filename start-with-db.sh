#!/bin/bash

# LinkedIn Clone Startup Script with Database
# This script starts the LinkedIn clone application with database support
# Currently configured for MongoDB, but can be adapted for PostgreSQL

echo "=========================================="
echo " LinkedIn Clone - Full Stack Startup"
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
    echo -e "${RED}Error: package.json not found in current directory${NC}"
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
        echo -e "${RED}Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

# Database selection
echo -e "${BLUE}Database Configuration:${NC}"
echo ""
echo "This application currently uses mock data."
echo "To enable database support, choose an option:"
echo ""
echo "1) MongoDB (recommended for this project)"
echo "2) PostgreSQL"
echo "3) Skip database (use mock data only)"
echo ""
read -p "Enter your choice (1-3): " DB_CHOICE
echo ""

case $DB_CHOICE in
    1)
        echo -e "${BLUE}Checking MongoDB...${NC}"

        # Check if MongoDB is installed
        if command -v mongod &> /dev/null; then
            echo -e "${GREEN}✓ MongoDB is installed${NC}"

            # Check if MongoDB is running
            if check_port 27017; then
                echo -e "${GREEN}✓ MongoDB is already running${NC}"
            else
                echo -e "${YELLOW}Starting MongoDB...${NC}"
                # Start MongoDB based on installation method
                if [ -f "/usr/local/bin/mongod" ] || [ -f "/opt/homebrew/bin/mongod" ]; then
                    mongod --config /usr/local/etc/mongod.conf --fork 2>/dev/null || mongod --config /opt/homebrew/etc/mongod.conf --fork 2>/dev/null
                    if [ $? -eq 0 ]; then
                        echo -e "${GREEN}✓ MongoDB started${NC}"
                    else
                        echo -e "${YELLOW}Note: Could not start MongoDB automatically${NC}"
                        echo "Please start MongoDB manually with: mongod"
                    fi
                else
                    echo -e "${YELLOW}Please start MongoDB manually with: mongod${NC}"
                fi
            fi

            echo ""
            echo -e "${BLUE}MongoDB Connection String:${NC}"
            echo "mongodb://localhost:27017/linkedin-clone"
        else
            echo -e "${YELLOW}MongoDB is not installed${NC}"
            echo "Install MongoDB with:"
            echo "  - macOS: brew install mongodb-community"
            echo "  - Ubuntu: sudo apt-get install mongodb"
            echo ""
            echo "Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas"
        fi
        ;;
    2)
        echo -e "${BLUE}Checking PostgreSQL...${NC}"

        # Check if PostgreSQL is installed
        if command -v psql &> /dev/null; then
            echo -e "${GREEN}✓ PostgreSQL is installed${NC}"

            # Check if PostgreSQL is running
            if check_port 5432; then
                echo -e "${GREEN}✓ PostgreSQL is already running${NC}"
            else
                echo -e "${YELLOW}Starting PostgreSQL...${NC}"
                # Try to start PostgreSQL based on installation method
                if command -v brew &> /dev/null; then
                    brew services start postgresql 2>/dev/null
                else
                    sudo service postgresql start 2>/dev/null
                fi

                if check_port 5432; then
                    echo -e "${GREEN}✓ PostgreSQL started${NC}"
                else
                    echo -e "${YELLOW}Please start PostgreSQL manually${NC}"
                fi
            fi

            echo ""
            echo -e "${BLUE}PostgreSQL Connection String:${NC}"
            echo "postgresql://localhost:5432/linkedin_clone"
        else
            echo -e "${YELLOW}PostgreSQL is not installed${NC}"
            echo "Install PostgreSQL with:"
            echo "  - macOS: brew install postgresql"
            echo "  - Ubuntu: sudo apt-get install postgresql"
        fi
        ;;
    3)
        echo -e "${YELLOW}Skipping database setup - using mock data${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice. Using mock data.${NC}"
        ;;
esac

echo ""
echo "=========================================="
echo ""

# Check Node.js version
echo -e "${BLUE}Node.js version:${NC} $(node -v)"
echo ""

# Display application info
echo -e "${BLUE}Application Information:${NC}"
echo "  - Framework: Next.js 16"
echo "  - UI Library: Material-UI"
echo "  - Language: TypeScript"
echo "  - Data: Mock data (database integration pending)"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cat > .env.local << EOL
# Database Configuration
# Uncomment and configure based on your database choice

# MongoDB
# MONGODB_URI=mongodb://localhost:27017/linkedin-clone

# PostgreSQL
# DATABASE_URL=postgresql://localhost:5432/linkedin_clone

# NextAuth (for authentication)
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your-secret-key-here

# OAuth Providers (optional)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=
EOL
    echo -e "${GREEN}✓ .env.local created${NC}"
    echo ""
fi

# Start the development server
echo -e "${GREEN}Starting LinkedIn Clone...${NC}"
echo ""
echo -e "${BLUE}Available pages:${NC}"
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
