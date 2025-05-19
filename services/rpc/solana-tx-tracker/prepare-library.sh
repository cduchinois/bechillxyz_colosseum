#!/bin/bash

# Script to prepare the solana-tx-fetcher library for testing and publication

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Solana TX Fetcher Library Preparation =====${NC}"

# Navigate to the library directory
cd "$(dirname "$0")/lib/solana-tx-fetcher"

# Install dependencies
echo -e "${YELLOW}\nInstalling dependencies...${NC}"
npm install

# Run tests
echo -e "${YELLOW}\nRunning tests...${NC}"
npm test

# Check if tests succeeded
if [ $? -ne 0 ]; then
  echo -e "${RED}\nTests failed! Please fix the issues before publishing.${NC}"
  exit 1
fi

# Build the library
echo -e "${YELLOW}\nBuilding the library...${NC}"
npm run build

# Check if build succeeded
if [ $? -ne 0 ]; then
  echo -e "${RED}\nBuild failed! Please fix the issues and try again.${NC}"
  exit 1
fi

# Success message
echo -e "${GREEN}\nLibrary is ready for publication! Run the following commands to publish:${NC}"
echo -e "cd lib/solana-tx-fetcher"
echo -e "npm login  # If not already logged in to npm"
echo -e "npm publish"

echo -e "${YELLOW}\nAlternatively, you can run the publish-library.sh script directly:${NC}"
echo -e "./publish-library.sh"
