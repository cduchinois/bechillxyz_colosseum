import { useState } from 'react';
import Head from 'next/head';
import AddressInput from '../components/AddressInput';
import TransactionSummaryComponent from '../components/TransactionSummary';
import TransactionsList from '../components/TransactionsList';

// Define the types locally to match library format
interface EarliestTransaction {
  blockTime: number;
  confirmationStatus: string;
  err: any | null;
  memo: string | null;
  signature: string;
  slot: number;
}

interface TransactionPageInfo {
  pageNumber: number;
  filename: string;
  transactionCount: number;
  lastSignature: string;
  lastBlockTime: number;
  lastBlockTimeFormatted: string;
  timestamp: number;
}

interface TransactionSummary {
  address: string;
  lastUpdated: string;
  lastFetched: string;
  totalPages: number;
  totalTransactions: number;
  walletCreationDate: string;
  earliestTransaction: EarliestTransaction;
  pages: TransactionPageInfo[];
}

export default function Home() {
  const [address, setAddress] = useState('');
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleAddressSubmit = async (address: string, maxPages: number) => {
    setAddress(address);
    setLoading(true);
    setError('');
    setSummary(null);
    setCurrentPage(1);

    try {
      const res = await fetch(`/api/transactions?address=${address}&maxPages=${maxPages}&refresh=true`);

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }

      const data = await res.json();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching transactions');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMore = async () => {
    if (!address || !summary || isFetchingMore) return;

    setIsFetchingMore(true);
    setError('');

    try {
      const res = await fetch('/api/transactions/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          address, 
          maxPages: summary.pages.length + 5 // Fetch 5 more pages
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch more transactions');
      }

      const data = await res.json();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching more transactions');
      console.error('Error:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const handleClearData = async () => {
    if (!address || !summary || isClearing) return;
    
    if (!window.confirm('Are you sure you want to clear all transaction data for this address?')) {
      return;
    }
    
    setIsClearing(true);
    setError('');
    
    try {
      const res = await fetch(`/api/transactions/clear?address=${address}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to clear transaction data');
      }
      
      setSummary(null);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || 'An error occurred while clearing transaction data');
      console.error('Error:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <>
      <Head>
        <title>Solana Transaction Tracker</title>
        <meta name="description" content="Track Solana transactions for any address" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">Solana Transaction Tracker</h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <AddressInput onAddressSubmit={handleAddressSubmit} isLoading={loading} />
          
          {!address && !loading && (
            <div className="w-full max-w-3xl mx-auto my-6 p-4 bg-blue-50 text-blue-700 rounded-lg">
              <p className="mb-2">Need an address to test? Try one of these Solana addresses:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button 
                  onClick={() => handleAddressSubmit("vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg", 15)}
                  className="text-blue-600 hover:text-blue-800 text-sm text-left hover:underline truncate"
                >
                  Solana: vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg
                </button>
                <button 
                  onClick={() => handleAddressSubmit("4Zc4kQZhRQeGztihvcGSWezJE1k44kKEgPCAkgmyxwrw", 15)}
                  className="text-blue-600 hover:text-blue-800 text-sm text-left hover:underline truncate"
                >
                  Genopets: 4Zc4kQZhRQeGztihvcGSWezJE1k44kKEgPCAkgmyxwrw
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="w-full max-w-3xl mx-auto my-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {loading && (
            <div className="w-full max-w-3xl mx-auto my-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2">Fetching transactions...</p>
            </div>
          )}
          
          {summary && (
            <>
              <div className="flex justify-between items-center mb-4">
                <TransactionSummaryComponent summary={summary} />
                <button
                  onClick={handleClearData}
                  disabled={isClearing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed h-10 self-start mt-6 mr-6"
                >
                  {isClearing ? 'Clearing...' : 'Clear Data'}
                </button>
              </div>
              
              <TransactionsList 
                address={address}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                totalPages={summary.totalPages}
                pages={summary.pages}
              />
              
              {!loading && !isFetchingMore && (
                <div className="w-full max-w-3xl mx-auto my-8 flex justify-center">
                  <button
                    onClick={handleFetchMore}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Load More Transactions
                  </button>
                </div>
              )}
              
              {isFetchingMore && (
                <div className="w-full max-w-3xl mx-auto my-8 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-2">Loading more transactions...</p>
                </div>
              )}
            </>
          )}
        </main>

        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              Powered by solana-tx-fetcher library
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
