import { useState, useEffect } from 'react';
import axios from 'axios';

interface TransactionDetailProps {
  signature: string | null;
  onClose: () => void;
}

interface TransactionData {
  signature: string;
  blockTime: number;
  slot: number;
  fee: number;
  err: any | null;
  memo: string | null;
  status: string;
  parsedTransaction?: any;
  raw?: any;
}

export default function TransactionDetail({ signature, onClose }: TransactionDetailProps) {
  const [transaction, setTransaction] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'summary' | 'raw'>('summary');

  useEffect(() => {
    if (!signature) return;

    const fetchTransactionDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/transactions/detail?signature=${signature}`);
        console.log('Transaction detail response:', response.data);
        setTransaction(response.data);
      } catch (err) {
        console.error('Error in transaction detail component:', err);
        let errorMsg = 'Failed to fetch transaction details';
        
        if (axios.isAxiosError(err) && err.response) {
          const errorData = err.response.data;
          errorMsg = errorData.error || errorData.details || `Error ${err.response.status}: ${err.message}`;
        } else if (err instanceof Error) {
          errorMsg = err.message;
        }
        
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionDetails();
  }, [signature]);

  if (!signature) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-red-600 mb-4">Error: {error}</div>
          <button 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!transaction) return null;

  const formatDate = (timestamp: number | undefined) => {
    return timestamp ? new Date(timestamp * 1000).toLocaleString() : 'N/A';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-xl font-bold mb-4 pr-8">Transaction Details</h2>
        
        <div className="mb-4">
          <div className="flex space-x-2 border-b pb-2">
            <button 
              className={`px-3 py-1 rounded ${viewMode === 'summary' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setViewMode('summary')}
            >
              Summary
            </button>
            <button 
              className={`px-3 py-1 rounded ${viewMode === 'raw' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setViewMode('raw')}
            >
              Raw Data
            </button>
          </div>
        </div>

        {viewMode === 'summary' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold text-sm text-gray-600">Signature</h3>
                <p className="break-all text-gray-900 font-medium">{transaction.signature}</p>
              </div>
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold text-sm text-gray-600">Block Time</h3>
                <p className="text-gray-900 font-medium">{formatDate(transaction.blockTime)}</p>
              </div>
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold text-sm text-gray-600">Slot</h3>
                <p className="text-gray-900 font-medium">{transaction.slot !== undefined && transaction.slot !== null ? transaction.slot.toLocaleString() : 'N/A'}</p>
              </div>
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold text-sm text-gray-600">Status</h3>
                <p className={transaction.err ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                  {transaction.err ? 'Failed' : 'Success'}
                </p>
              </div>
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold text-sm text-gray-600">Fee</h3>
                <p className="text-gray-900 font-medium">{transaction.fee !== undefined ? `${(transaction.fee / 1e9).toFixed(6)} SOL` : 'Unknown'}</p>
              </div>
            </div>

            {transaction.memo && (
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold text-sm text-gray-600">Memo</h3>
                <p className="break-all text-gray-900 font-medium">{transaction.memo}</p>
              </div>
            )}

            {transaction.err && (
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold text-sm text-gray-600">Error</h3>
                <pre className="bg-red-50 p-2 rounded overflow-auto text-sm text-red-700">
                  {JSON.stringify(transaction.err, null, 2)}
                </pre>
              </div>
            )}

            {transaction.parsedTransaction && (
              <div className="border rounded-lg p-3">
                <h3 className="font-semibold text-sm text-gray-600">Transaction Details</h3>
                <div className="mt-2">
                  {transaction.parsedTransaction.message?.instructions?.map((instruction: any, i: number) => (
                    <div key={i} className="mb-3 border-b pb-3">
                      <h4 className="font-semibold text-gray-800">Instruction {i + 1}</h4>
                      <p className="text-sm text-gray-900">Program: {instruction.programId}</p>
                      {instruction.parsed && (
                        <div className="bg-gray-50 p-2 rounded mt-1 overflow-auto">
                          <pre className="text-xs text-gray-800">{JSON.stringify(instruction.parsed, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded">
            <pre className="overflow-auto text-xs text-gray-800">
              {JSON.stringify(transaction.raw || transaction, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button 
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
