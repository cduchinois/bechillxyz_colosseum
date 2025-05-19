#!/bin/bash

# Script to prepare and publish the solana-tx-fetcher library to npm

# Navigate to the library directory
cd "$(dirname "$0")/lib/solana-tx-fetcher"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the library
echo "Building the library..."
npm run build

# Check if build succeeded
if [ $? -ne 0 ]; then
  echo "Build failed! Please fix the issues and try again."
  exit 1
fi

# Ask for confirmation before publishing
read -p "Do you want to publish this package to npm? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Publishing to npm..."
  npm publish
  
  if [ $? -eq 0 ]; then
    echo "Package published successfully!"
  else
    echo "Publication failed. Please check the error messages above."
  fi
else
  echo "Publication canceled."
fi
