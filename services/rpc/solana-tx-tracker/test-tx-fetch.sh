#!/bin/bash

# Test script to verify the enhanced transaction fetching functionality

# Define colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set the base URL
BASE_URL="http://localhost:3000"

echo -e "${BLUE}=== Solana Transaction Tracker API Test ===${NC}"
echo -e "${BLUE}This script tests the transaction fetching functionality${NC}"

# Test Address
TEST_ADDRESS="GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S"
MAX_PAGES=3

echo -e "${BLUE}Testing with address: ${TEST_ADDRESS}${NC}"

# Test 1: First fetch - should fetch from beginning
echo -e "${BLUE}Test 1: Initial fetch with ${MAX_PAGES} pages${NC}"
curl -s -X GET "${BASE_URL}/api/transactions?address=${TEST_ADDRESS}&maxPages=${MAX_PAGES}&refresh=true" > /dev/null
echo -e "${GREEN}Initial fetch completed${NC}"

# Test 2: Fetch additional pages - should fetch from earliest known transaction
echo -e "${BLUE}Test 2: Fetching ${MAX_PAGES} more pages${NC}"
curl -s -X POST -H "Content-Type: application/json" \
  -d "{\"address\":\"${TEST_ADDRESS}\",\"maxPages\":${MAX_PAGES}}" \
  "${BASE_URL}/api/transactions/fetch" > /dev/null
echo -e "${GREEN}Additional fetch completed${NC}"

# Test 3: Request summary to see the combined results
echo -e "${BLUE}Test 3: Requesting summary to verify transaction count${NC}"
SUMMARY=$(curl -s -X GET "${BASE_URL}/api/transactions?address=${TEST_ADDRESS}")
TOTAL_PAGES=$(echo $SUMMARY | grep -o '"totalPages":[0-9]*' | cut -d':' -f2)
TOTAL_TRANSACTIONS=$(echo $SUMMARY | grep -o '"totalTransactions":[0-9]*' | cut -d':' -f2)

echo -e "${GREEN}Summary data:${NC}"
echo -e "  Total Pages: ${TOTAL_PAGES}"
echo -e "  Total Transactions: ${TOTAL_TRANSACTIONS}"

echo -e "${BLUE}=== Test Completed ===${NC}"
echo -e "${BLUE}To verify functionality manually, check that:${NC}"
echo -e "1. The transaction pages continue from the earliest known transaction"
echo -e "2. The total pages and transactions have increased after the second fetch"
echo -e "3. Files are created with sequential page numbers in public/transactions/"
