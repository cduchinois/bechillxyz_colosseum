import React, { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function TestAddress() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Create a ref to track if we've already shown the toast for this session
  const allFetchedToastShownRef = useRef(false);
  
  // Fetch transaction data for the test address when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const address = 'GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S';
        const res = await fetch(`/api/transactions?address=${address}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch transactions');
        }
        
        const data = await res.json();
        console.log('Fetched data:', data);
        setSummary(data);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Show toast notification when all transactions are fetched
  useEffect(() => {
    console.log('Summary allFetched status:', summary?.allFetched);
    console.log('Toast already shown:', allFetchedToastShownRef.current);
    
    if (summary?.allFetched && !allFetchedToastShownRef.current) {
      console.log('Showing toast: All transactions fetched');
      toast.success('All transactions fetched');
      allFetchedToastShownRef.current = true;
    } else if (!summary?.allFetched) {
      console.log('Resetting toast shown ref because allFetched is false');
      allFetchedToastShownRef.current = false;
    }
  }, [summary?.allFetched]);
  
  return (
    <div className="p-8">
      <Toaster position="top-right" toastOptions={{ duration: 5000 }} />
      <h1 className="text-2xl font-bold mb-4">Test Address Page</h1>
      <p className="mb-4">Testing with address: GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S</p>
      
      {loading && (
        <div className="my-4 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2">Loading...</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg my-4">
          {error}
        </div>
      )}
      
      {summary && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Summary Data</h2>
          <p><strong>Address:</strong> {summary.address}</p>
          <p><strong>Total Transactions:</strong> {summary.totalTransactions}</p>
          <p><strong>Total Pages:</strong> {summary.totalPages}</p>
          <p><strong>All Fetched:</strong> {summary.allFetched ? 'Yes' : 'No'}</p>
          
          <div className="mt-4">
            <button 
              onClick={() => {
                toast.success('Manual toast test');
                console.log('Manual toast button clicked');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Show Test Toast
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Console Output</h2>
        <p>Check the browser console to see debug logs.</p>
      </div>
    </div>
  );
}
