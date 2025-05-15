import React from 'react';
import { RefreshCcw, ArrowUp, ArrowDown } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface Transaction {
  date: string;
  type: string;
  direction: string;
  amount: string;
  to: string;
  timestamp: number;
}

interface HistoryTabProps {
  transactions: Transaction[];
  isLoading: boolean;
  refreshData: () => void;
}

const HistoryTab: React.FC<HistoryTabProps> = ({ transactions, isLoading, refreshData }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-purple-100 p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold text-purple-800">Transaction History</h2>
        <button 
          className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg flex items-center"
          onClick={refreshData}
        >
          <RefreshCcw size={14} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : transactions.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          Aucune transaction à afficher.
        </div>
      ) : (
        <div className="divide-y">
          {transactions.map((tx, index) => {
            const isFirst = index === 0 || transactions[index - 1].date !== tx.date;
            
            return (
              <div key={index}>
                {isFirst && (
                  <div className="bg-purple-50 px-4 py-2 text-purple-800 font-medium">
                    {tx.date}
                  </div>
                )}
                <div className="p-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-800">
                    {tx.direction === 'out' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="font-medium">{tx.type}</div>
                    <div className="text-gray-500 text-sm">To: {tx.to}</div>
                  </div>
                  <div className={`font-medium ${tx.direction === 'out' ? 'text-red-500' : 'text-green-500'}`}>
                    {tx.direction === 'out' ? '-' : ''}{tx.amount}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryTab;