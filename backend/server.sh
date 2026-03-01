#!/bin/bash

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please create .env file first"
    exit 1
fi


echo "Installing dependencies..."
npm install

echo ""
echo "Running database migrations..."
npm run migrate

echo ""
echo "Generating Prisma Client..."
npm run generate

echo ""
echo "Building TypeScript..."
npm run build
echo "Complete the build"
echo ""