# solana-tx-fetcher

[![npm version](https://img.shields.io/npm/v/solana-tx-fetcher.svg)](https://www.npmjs.com/package/solana-tx-fetcher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful, flexible library for fetching, storing, and managing Solana blockchain transactions. Designed to work seamlessly with Helius RPC API and other Solana RPC providers.

## Features

- ✅ Fetch transactions for any Solana address
- ✅ Support for pagination with before/until parameters
- ✅ Save transactions to JSON files with organized structure
- ✅ Generate transaction summary with statistics and metadata
- ✅ TypeScript support with full type definitions
- ✅ Solana address validation
- ✅ Configurable storage paths

## Installation

```bash
npm install solana-tx-fetcher
```

## Usage

### Basic Transaction Fetching

```typescript
import { fetchTransactions } from 'solana-tx-fetcher';

async function getTransactions() {
  const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY';
  const address = 'GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S';
  
  try {
    const transactions = await fetchTransactions({
      rpcUrl,
      address,
      limit: 100 // Optional, defaults to 100
    });
    
    console.log(`Fetched ${transactions.length} transactions`);
    console.log(transactions[0]); // View the first transaction
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
}

getTransactions();
```

### Pagination Support

```typescript
import { fetchTransactions } from 'solana-tx-fetcher';

async function getAllTransactionsBatch() {
  const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY';
  const address = 'GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S';
  
  let allTransactions = [];
  let lastSignature = undefined;
  
  try {
    // Fetch first batch
    const firstBatch = await fetchTransactions({
      rpcUrl,
      address,
      limit: 100
    });
    
    allTransactions = [...firstBatch];
    
    if (firstBatch.length === 100) {
      // Get the last signature to use for pagination
      lastSignature = firstBatch[firstBatch.length - 1].signature;
      
      // Fetch second batch
      const secondBatch = await fetchTransactions({
        rpcUrl,
        address,
        limit: 100,
        before: lastSignature
      });
      
      allTransactions = [...allTransactions, ...secondBatch];
    }
    
    console.log(`Fetched ${allTransactions.length} transactions in total`);
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
}

getAllTransactionsBatch();
```

### Saving Transactions to File

```typescript
import { fetchTransactions, saveTransactions, isValidSolanaAddress } from 'solana-tx-fetcher';

async function fetchAndSaveTransactions() {
  const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY';
  const address = 'GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S';
  
  // Validate address
  if (!isValidSolanaAddress(address)) {
    console.error('Invalid Solana address provided');
    return;
  }
  
  try {
    // Fetch transactions
    const transactions = await fetchTransactions({
      rpcUrl,
      address,
      limit: 100
    });
    
    // Save transactions
    const summary = await saveTransactions({
      basePath: './transactions',
      address,
      pageNumber: 1,
      transactions
    });
    
    console.log('Transactions saved successfully');
    console.log('Summary:', summary);
  } catch (error) {
    console.error('Error in fetch and save process:', error);
  }
}

fetchAndSaveTransactions();
```

### Fetching Transaction Details

```typescript
import { fetchTransactionDetails } from 'solana-tx-fetcher';

async function getTransactionDetail() {
  const rpcUrl = 'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY';
  const signature = 'transaction_signature_here';
  
  try {
    const txDetail = await fetchTransactionDetails({
      rpcUrl,
      signature,
      encoding: 'json', // Optional: 'json', 'jsonParsed', 'base58', 'base64'
      maxSupportedTransactionVersion: 0 // Optional
    });
    
    console.log('Transaction details:', txDetail);
    
    // Extract useful information
    const { blockTime, fee, err, memo, status } = txDetail;
    console.log(`
      Time: ${new Date(blockTime * 1000).toLocaleString()}
      Status: ${status}
      Fee: ${(fee / 1e9).toFixed(9)} SOL
      Has Error: ${!!err}
      Memo: ${memo || 'None'}
    `);
  } catch (error) {
    console.error('Error fetching transaction details:', error);
  }
}

getTransactionDetail();
```

### Working with Transaction Summaries

```typescript
import { 
  fetchTransactions, 
  saveTransactions, 
  getTransactionSummary, 
  updateTransactionSummary 
} from 'solana-tx-fetcher';

async function manageSummaries() {
  const basePath = './transactions';
  const address = 'GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S';
  
  try {
    // Get existing summary if available
    const existingSummary = await getTransactionSummary(basePath, address);
    
    console.log('Existing summary:', existingSummary);
    
    // Update summary with new data
    const updatedSummary = await updateTransactionSummary({
      basePath,
      address,
      additionalTransactions: 50,
      newPage: {
        page: existingSummary ? existingSummary.pages.length + 1 : 1,
        blocktime: Date.now() / 1000,
        lastSignature: 'example_signature',
        nb_transaction: 50
      }
    });
    
    console.log('Updated summary:', updatedSummary);
  } catch (error) {
    console.error('Error managing summaries:', error);
  }
}

manageSummaries();
```

## API Reference

### `fetchTransactions(options)`

Fetches transactions for a Solana address.

**Parameters:**

- `options: FetchTransactionsOptions` - Object with the following properties:
  - `rpcUrl: string` - The RPC URL to use for the request
  - `address: string` - The Solana address to fetch transactions for
  - `limit?: number` - Optional. The maximum number of transactions to fetch (default: 100)
  - `before?: string` - Optional. Fetch transactions before this signature
  - `until?: string` - Optional. Fetch transactions until this signature

**Returns:**

- `Promise<SolanaTransaction[]>` - Array of transaction objects

### `saveTransactions(options)`

Saves transactions to a file.

**Parameters:**

- `options: SaveTransactionsOptions` - Object with the following properties:
  - `basePath: string` - The base path where transaction files will be stored
  - `address: string` - The Solana address associated with the transactions
  - `pageNumber: number` - The page number for pagination
  - `transactions: SolanaTransaction[]` - The transactions to save
  - `summary?: TransactionSummary` - Optional. Existing transaction summary to update

**Returns:**

- `Promise<TransactionSummary>` - Updated transaction summary

### `isValidSolanaAddress(address)`

Validates if the provided string is a valid Solana address.

**Parameters:**

- `address: string` - The Solana address to validate

**Returns:**

- `boolean` - True if the address is valid, false otherwise

## Types

```typescript
interface SolanaTransaction {
  signature: string;
  slot: number;
  err: any | null;
  memo: string | null;
  blockTime: number;
  confirmationStatus: string;
  [key: string]: any;
}

interface TransactionPageInfo {
  page: number;
  blocktime: number;
  lastSignature: string;
  nb_transaction: number;
}

interface TransactionSummary {
  address: string;
  firstTransactionDate: string;
  nb_all_transactions: number;
  pages: TransactionPageInfo[];
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

### Fetch Transactions for an Address

```typescript
import { fetchTransactions, isValidSolanaAddress } from 'solana-tx-fetcher';

const transactions = await fetchTransactions({
  rpcUrl: 'https://api.helius.xyz/v0/api-key-here',
  address: 'your-solana-address',
  limit: 100 // optional, default is 100
});

console.log(transactions);
```

### Save Transactions and Create a Summary

```typescript
import { saveTransactions } from 'solana-tx-fetcher';

const summary = await saveTransactions({
  basePath: '/path/to/storage',
  address: 'your-solana-address',
  pageNumber: 1,
  transactions: transactionsArray
});

console.log(summary);
```

### Fetch All Transactions with Pagination

```typescript
import { fetchAllTransactions } from 'solana-tx-fetcher';

const summary = await fetchAllTransactions(
  'https://api.helius.xyz/v0/api-key-here',
  'your-solana-address',
  '/path/to/storage',
  5 // Max pages (optional, default is 10)
);

console.log(summary);
```

### Get Transaction Summary

```typescript
import { getTransactionSummary } from 'solana-tx-fetcher';

const summary = await getTransactionSummary(
  '/path/to/storage',
  'your-solana-address'
);

console.log(summary);
```

### Get Transaction Page

```typescript
import { getTransactionsPage } from 'solana-tx-fetcher';

const transactions = await getTransactionsPage(
  '/path/to/storage',
  'your-solana-address',
  1 // Page number
);

console.log(transactions);
```

### Clear Transaction Data

Clear all saved transaction data for a specific address:

```typescript
import { clearTransactionData } from 'solana-tx-fetcher';

const success = await clearTransactionData(
  '/path/to/storage',
  'your-solana-address'
);

console.log(success ? 'Data cleared successfully' : 'Failed to clear data');
```

### List Stored Addresses

List all addresses that have saved transaction data:

```typescript
import { listStoredAddresses } from 'solana-tx-fetcher';

const addresses = await listStoredAddresses('/path/to/storage');

console.log('Addresses with stored transactions:', addresses);
```

## License

MIT
