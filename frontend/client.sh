#!/bin/bash

#############################################
# Frontend Setup and Start Script
#############################################

echo "Starting Frontend Setup..."
echo ""

# 5.1 Install Dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "npm install failed!"
    exit 1
fi

echo ""

# 5.2 Create Environment File
echo "Creating environment file..."
if [ -f .env.example ]; then
    sudo cp .env.example .env
    echo ".env file created from .env.example"
else
    echo "Warning: .env.example not found, creating empty .env"
    touch .env
fi

echo ""

# 5.3 Build and Start with PM2
echo "Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo ""

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2 globally..."
    npm install -g pm2
fi

echo "Starting frontend with PM2..."
pm2 start npm --name "frontend" -- start

echo "Saving PM2 process list..."
pm2 save

echo ""
echo "📊 Current PM2 status:"
pm2 status

echo ""
echo "Testing frontend..."
sleep 3
curl -I http://localhost:3000
