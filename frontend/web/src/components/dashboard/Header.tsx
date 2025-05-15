// src/components/dashboard/Header.tsx
import React from 'react';
import { RefreshCcw } from 'lucide-react';
import { formatWalletAddress } from '@/utils/walletAddressUtils';

interface HeaderProps {
  activeTab: string;
  walletAddress: string | null;
  isLoading: boolean;
  refreshData: () => void;
  isPrivyConnected: boolean;
  manualAddress: string;
  setManualAddress: (val: string) => void;
  onManualSearch: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  walletAddress,
  isLoading,
  refreshData,
  manualAddress,
  setManualAddress,
  onManualSearch
}) => {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[#7036cd]">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h1>
        {walletAddress && (
          <div className="text-sm text-gray-600 flex items-center">
            <span>Connected: </span>
            <span className="truncate ml-1 max-w-xs">{formatWalletAddress(walletAddress)}</span>
            <button 
              className="ml-2 text-purple-600 hover:text-purple-800"
              onClick={refreshData}
            >
              <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Enter wallet address..."
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            className="w-64 bg-white text-gray-800 px-4 py-2 rounded-lg shadow" 
          />
          <button
            onClick={onManualSearch}
            className="ml-2 px-3 py-1 bg-purple-600 text-white text-sm rounded"
          >
            Analyse
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
