#!/bin/bash

# Setup script for the Solana Transaction Tracker

echo "Setting up Solana Transaction Tracker..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Prepare the library
echo "Building the solana-tx-fetcher library..."
cd lib/solana-tx-fetcher
npm install
npm run build
cd ../..

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p public/transactions

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "Please edit .env.local to add your Helius API key"
fi

echo "Setup complete! You can start the app with 'npm run dev'"
echo "Remember to add your Helius API key to .env.local"
