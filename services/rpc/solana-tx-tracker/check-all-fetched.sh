#!/bin/bash

# Script to check if allFetched flag exists in summary files

# Define colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

TRANSACTIONS_DIR="./public/transactions"

if [ -n "$1" ]; then
  # Use provided address
  address="$1"
  file="$TRANSACTIONS_DIR/${address}-summary.json"
  
  if [ ! -f "$file" ]; then
    echo -e "${RED}Summary file not found for address: ${address}${NC}"
    exit 1
  fi
  
  echo -e "${BLUE}Checking summary for address: ${address}${NC}"
  
  # Check if allFetched exists in the file
  if grep -q "\"allFetched\":" "$file"; then
    all_fetched=$(grep "\"allFetched\":" "$file" | head -1 | awk -F':' '{print $2}' | tr -d ' ,')
    echo -e "${GREEN}allFetched flag found: ${all_fetched}${NC}"
    
    # Check if the last page has fewer than 100 transactions
    last_page_count=$(grep "\"transactionCount\":" "$file" | tail -1 | awk -F':' '{print $2}' | tr -d ' ,')
    echo -e "${BLUE}Last page transaction count: ${last_page_count}${NC}"
    
    if [ "$last_page_count" -lt 100 ]; then
      echo -e "${GREEN}This address should have allFetched=true${NC}"
    else
      echo -e "${RED}This address should have allFetched=false${NC}"
    fi
  else
    echo -e "${RED}allFetched flag not found in file${NC}"
    
    # Check if the last page has fewer than 100 transactions
    last_page_count=$(grep "\"transactionCount\":" "$file" | tail -1 | awk -F':' '{print $2}' | tr -d ' ,')
    echo -e "${BLUE}Last page transaction count: ${last_page_count}${NC}"
    
    if [ "$last_page_count" -lt 100 ]; then
      echo -e "${GREEN}This address should have allFetched=true${NC}"
    else
      echo -e "${RED}This address should have allFetched=false${NC}"
    fi
  fi
else
  echo -e "${BLUE}=== Checking allFetched flag in all summary files ===${NC}"
  
  # Find all summary files
  SUMMARY_FILES=$(find $TRANSACTIONS_DIR -name "*-summary.json")
  
  for file in $SUMMARY_FILES; do
    address=$(basename $file | cut -d'-' -f1)
    echo -e "${BLUE}Checking summary for address: ${address}${NC}"
    
    # Check if allFetched exists in the file
    if grep -q "\"allFetched\":" "$file"; then
      all_fetched=$(grep "\"allFetched\":" "$file" | head -1 | awk -F':' '{print $2}' | tr -d ' ,')
      echo -e "${GREEN}  allFetched flag found: ${all_fetched}${NC}"
    else
      echo -e "${RED}  allFetched flag not found in file${NC}"
    fi
  done
  
  echo -e "${BLUE}=== Check completed ===${NC}"
fi
