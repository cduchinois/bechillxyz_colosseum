"use client";
import { useState } from 'react';

type TransactionInfoProps = {
  data: any;
  onClose: () => void;
};

// Define types for better type safety
type TokenTransfer = {
  amount: string;
  symbol: string;
  type?: "fungible" | "non-fungible";
  direction?: "in" | "out";
  tokenMint?: string;
  usdValue?: string;
  tokenType?: string;
};

type Transaction = {
  signature: string;
  timestamp: number;
  type: string;
  protocol?: string;
  tokenTransfers: TokenTransfer[];
};

export default function TransactionInfo({ data, onClose }: TransactionInfoProps) {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  if (!data || !data.transactions || data.transactions.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl w-full my-2">
        <h3 className="text-purple-900 text-xl font-bold">No Transactions Found</h3>
        <p className="text-gray-700 mt-2">No transactions found for this wallet address.</p>
        <button
          onClick={onClose}
          className="mt-4 bg-purple-600 text-white px-4 py-1 rounded-full"
        >
          Close
        </button>
      </div>
    );
  }

  // Calculate pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = data.transactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(data.transactions.length / transactionsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Toggle transaction expanded view
  const toggleExpand = (signature: string) => {
    if (expandedTx === signature) {
      setExpandedTx(null);
    } else {
      setExpandedTx(signature);
    }
  };
  
  // Function to get badge color based on transaction type
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Swap": return "bg-blue-100 text-blue-800";
      case "Stake": return "bg-green-100 text-green-800";
      case "NFT Trade": return "bg-purple-100 text-purple-800";
      case "NFT Mint": return "bg-purple-100 text-purple-800";
      case "Deposit": return "bg-teal-100 text-teal-800";
      case "Withdraw": return "bg-amber-100 text-amber-800";
      case "Liquidity": return "bg-indigo-100 text-indigo-800";
      case "Borrow": return "bg-red-100 text-red-800";
      case "Repay": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Function to get badge color based on token transfer direction
  const getDirectionBadgeColor = (direction: string) => {
    return direction === "in" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };
  
  // Function to render token transfer details
  const renderTokenTransfers = (transfers: TokenTransfer[]) => {
    if (!transfers || transfers.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-2">
        {transfers.map((transfer, idx) => (
          <div key={idx} className="flex items-center justify-between px-2 py-1 bg-gray-50 rounded">
            <div className="flex items-center">
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${getDirectionBadgeColor(transfer.direction || 'out')}`}>
                {transfer.direction === "in" ? "IN" : "OUT"}
              </span>
              <span className="ml-2 font-medium">{transfer.amount}</span>
              <span className="ml-1">{transfer.symbol}</span>
              {(transfer.type === "non-fungible" || transfer.tokenType === "NFT") && (
                <span className="ml-1 px-1.5 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">NFT</span>
              )}
            </div>
            {transfer.usdValue && (
              <span className="text-sm text-gray-600">${transfer.usdValue}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-xl w-full my-2 border border-purple-200">
      <h3 className="text-purple-900 text-xl font-bold">Recent Transactions</h3>
      
      <div className="mt-3 text-left max-h-80 overflow-y-auto">
        {currentTransactions.map((transaction: Transaction, index: number) => (
          <div 
            key={index} 
            className={`border-b py-3 last:border-0 ${expandedTx === transaction.signature ? 'bg-gray-50' : ''}`}
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(transaction.signature)}>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadgeColor(transaction.type)}`}>
                  {transaction.type}
                </span>
                {transaction.protocol && (
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                    {transaction.protocol}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">
                {new Date(transaction.timestamp * 1000).toLocaleString()}
              </span>
            </div>
            
            <div className={`mt-2 overflow-hidden transition-all duration-300 ${expandedTx === transaction.signature ? 'max-h-96' : 'max-h-0'}`}>
              <div className="overflow-hidden">
                <span className="text-gray-600 text-sm">Signature:</span>
                <span className="text-gray-800 ml-2 font-medium text-xs break-all">
                  {transaction.signature}
                </span>
              </div>
              
              <div className="mt-2">
                <span className="text-gray-600 text-sm">Token Transfers:</span>
                {renderTokenTransfers(transaction.tokenTransfers)}
              </div>
            </div>
            
            {/* Summary section always visible */}
            <div className="mt-2 flex flex-wrap items-center">
              {transaction.tokenTransfers && transaction.tokenTransfers.length > 0 && (
                <>
                  {transaction.tokenTransfers.map((transfer: TokenTransfer, i: number) => (
                    <div key={i} className="flex items-center mr-3">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${transfer.direction === "in" ? "bg-green-500" : "bg-red-500"}`}></span>
                      <span className="text-sm">
                        {transfer.amount} {transfer.symbol}
                      </span>
                    </div>
                  ))}
                </>
              )}
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(transaction.signature);
                }}
                className="ml-auto text-xs text-purple-600 underline"
              >
                {expandedTx === transaction.signature ? 'Show less' : 'Details'}
              </button>
            </div>
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