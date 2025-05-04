"use client";
import { useState } from 'react';

type TransactionInfoProps = {
  data: any;
  onClose: () => void;
  isDemo?: boolean;
};

export default function TransactionInfo({ data, onClose, isDemo = false }: TransactionInfoProps) {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  if (!data || !data.transactions || data.transactions.length === 0) {
    // Mock data for demo mode when no transactions are found
    if (isDemo) {
      // Generate mock transactions for the last 30 days
      const mockTransactions = Array.from({ length: 8 }, (_, i) => ({
        signature: `5xAt3ve1XcFxDGtCMDpLPRgXMvKvp6MWHWrwVK3mHpHjYx9timZsNFNrLdVCvyr1Kft${i}`,
        timestamp: Math.floor(Date.now() / 1000) - (i * 86400 * 3), // Every 3 days
        type: i % 2 === 0 ? "Transfer" : "Swap",
        tokenTransfers: [
          {
            amount: (Math.random() * 2).toFixed(2),
            symbol: i % 3 === 0 ? "SOL" : (i % 3 === 1 ? "USDC" : "JUP")
          }
        ]
      }));
      
      data = { transactions: mockTransactions };
    } else {
      return (
        <div className="bg-white p-4 rounded-xl w-full my-2">
          <h3 className="text-purple-900 text-xl font-bold">No Transactions Found</h3>
          <p className="text-gray-700 mt-2">No transactions found in the last 30 days for this wallet.</p>
          <button
            onClick={onClose}
            className="mt-4 bg-purple-600 text-white px-4 py-1 rounded-full"
          >
            Close
          </button>
        </div>
      );
    }
  }

  // Calculate pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = data.transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(data.transactions.length / transactionsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white p-4 rounded-xl w-full my-2 border border-purple-200">
      <h3 className="text-purple-900 text-xl font-bold">
        Transactions (Last 30 Days)
        {isDemo && <span className="text-xs font-normal text-purple-600 ml-2">(Demo Mode)</span>}
      </h3>
      
      <div className="mt-3 text-left max-h-60 overflow-y-auto">
        {currentTransactions.map((transaction: any, index: number) => (
          <div key={index} className="border-b py-2 last:border-0">
            <div className="mb-2">
              <span className="text-gray-600 text-sm">Date:</span>
              <span className="text-gray-800 ml-2 font-medium">
                {new Date(transaction.timestamp * 1000).toLocaleString()}
              </span>
            </div>
            
            <div className="mb-2">
              <span className="text-gray-600 text-sm">Type:</span>
              <span className="text-gray-800 ml-2 font-medium">{transaction.type || "Transfer"}</span>
            </div>
            
            <div className="mb-2 overflow-hidden">
              <span className="text-gray-600 text-sm">Signature:</span>
              <span className="text-gray-800 ml-2 font-medium text-xs">
                {transaction.signature?.substring(0, 8)}...{transaction.signature?.substring(transaction.signature.length - 8)}
              </span>
            </div>
            
            {transaction.tokenTransfers && transaction.tokenTransfers.length > 0 && (
              <div className="mb-2">
                <span className="text-gray-600 text-sm">Amount:</span>
                <span className="text-gray-800 ml-2 font-medium">
                  {transaction.tokenTransfers[0].amount} {transaction.tokenTransfers[0].symbol || "SOL"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      
      <div className="mt-4 flex justify-end">
        <button
          onClick={onClose}
          className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}