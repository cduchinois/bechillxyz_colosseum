#!/bin/bash

# Update script to set the allFetched flag on all summary files

# Define colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TRANSACTIONS_DIR="./public/transactions"

echo -e "${BLUE}=== Updating allFetched flag in all summary files ===${NC}"

# Find all summary files
SUMMARY_FILES=$(find $TRANSACTIONS_DIR -name "*-summary.json")

for file in $SUMMARY_FILES; do
  address=$(basename $file | cut -d'-' -f1)
  echo -e "${BLUE}Updating summary for address: ${address}${NC}"
  
  # Call the API to update the summary
  response=$(curl -s -X POST -H "Content-Type: application/json" \
    -d "{\"address\":\"${address}\"}" \
    "http://localhost:3000/api/transactions/update-all-fetched")
  
  # Check if allFetched was set to true
  if echo $response | grep -q '"allFetched":true'; then
    echo -e "${GREEN}Address $address: All transactions fetched${NC}"
  else
    echo -e "${RED}Address $address: Not all transactions fetched${NC}"
  fi
done

echo -e "${BLUE}=== Update completed ===${NC}"
