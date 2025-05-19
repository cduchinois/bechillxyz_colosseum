# Solana Transaction Tracker

A Next.js application to fetch, store, and display Solana transactions for any address using the Helius RPC.

## Features

- Fetch Solana transactions using Helius RPC
- Store transactions as JSON files
- Track transaction history with pagination
- Display transaction summary and details
- Built on top of the reusable `solana-tx-fetcher` library

## Setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with your Helius API key:

```
HELIUS_API_KEY=your_helius_api_key_here
NEXT_PUBLIC_HELIUS_API_KEY=your_helius_api_key_here
```

Note: Use only the API key value, not the full URL. The application will construct the proper URL format.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

### GET `/api/transactions`

Fetches transaction summary and data files for a Solana address.

Query parameters:
- `address`: Solana address to fetch transactions for
- `refresh` (optional): Set to "true" to force re-fetch
- `maxPages` (optional): Maximum number of pages to fetch (default: 5)

### POST `/api/transactions/fetch`

Fetches transactions for a Solana address.

Body:
```json
{
  "address": "Solana address",
  "maxPages": 5
}
```

### GET `/api/transactions/page`

Gets a specific page of transactions for an address.

Query parameters:
- `address`: Solana address
- `page`: Page number (starting from 1)

## Library

This project includes a reusable library called `solana-tx-fetcher` located in the `/lib` directory.

You can use this library in other projects by:

1. Building the library:
```bash
npm run build-lib
```

2. Publishing to npm:
```bash
# Make sure you're logged in to npm
npm login

# Then run the publish script
./publish-library.sh
```

3. Using the library in your projects:
```bash
# Install from npm
npm install solana-tx-fetcher

# Or use directly from GitHub
npm install github:yourusername/solana-tx-fetcher
```

4. Example usage:
```typescript
import { fetchTransactions, saveTransactions } from 'solana-tx-fetcher';

// Fetch transactions for an address
const transactions = await fetchTransactions({
  rpcUrl: 'https://mainnet.helius-rpc.com/?api-key=your-api-key-here',
  address: 'solanaAddress',
  limit: 100
});

// Save transactions to disk
const summary = await saveTransactions({
  basePath: './public',
  address: 'solanaAddress',
  pageNumber: 1,
  transactions
});
```

## Technologies Used

- Next.js
- TypeScript
- Solana Web3.js
- Tailwind CSS
- Helius RPC

## License

MIT
