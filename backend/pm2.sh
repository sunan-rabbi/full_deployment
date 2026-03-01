#!/bin/bash

#############################################
# Start Backend with PM2
#############################################

echo "Starting Backend with PM2..."
echo ""

# Check if dist/src/server.js exists
if [ ! -f dist/src/server.js ]; then
    echo "Error: dist/src/server.js not found!"
    echo "Please run ./backend.sh first to build the project"
    exit 1
fi

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    npm install -g pm2
fi

echo "Starting backend with PM2..."
pm2 start dist/src/server.js --name backend

echo "Saving PM2 process list..."
pm2 save

echo "Setting up PM2 startup script..."
pm2 startup
echo ""