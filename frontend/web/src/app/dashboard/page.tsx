'use client';
import React, { useState } from 'react';
import { Wallet, Copy, RefreshCcw, Search, Settings, Book, ArrowRight } from 'lucide-react';

const CryptoPortfolio = () => {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [netWorth, setNetWorth] = useState('$2,775.34');
  const [solValue, setSolValue] = useState('≈ 18.400 SOL');
  const [holdings, setHoldings] = useState([
    { name: 'SOL', balance: '2.52', price: '$150.80', value: '$379.27', icon: '◎' },
    { name: 'USDC', balance: '170.10', price: '$1.00', value: '$170.10', icon: '$' },
    { name: 'JupSOL', balance: '1.41', price: '$167.02', value: '$234.85', icon: '◎' },
    { name: 'wBTC', balance: '0.0001426', price: '$95,419', value: '$13.60', icon: '₿' },
    { name: 'ETH', balance: '0.003396', price: '$1,820', value: '$6.18', icon: 'Ξ' }
  ]);
  
  const [liquidity, setLiquidity] = useState([
    { 
      name: 'JUP-USDC', 
      balance: '101.18 JUP\n41.73 USDC', 
      value: '$90.46',
      icons: ['◎', '$']
    },
    { 
      name: 'JUP-wSOL', 
      balance: '87.20 JUP\n0.2551 wSOL', 
      value: '$80.41',
      icons: ['◎', '◎']
    },
    { 
      name: 'USDC-USDT-UXD', 
      balance: '27.29 USDC\n27.15 USDT\n25.73 UXD', 
      value: '$80.20',
      icons: ['$', '₮']
    }
  ]);
  
  const [assetCategories, setAssetCategories] = useState([
    { name: 'Holdings', percentage: '47.00%', color: 'bg-lime-300', value: '$1,304.29' },
    { name: 'Jupiter DAO', percentage: '12.36%', color: 'bg-cyan-300', value: '$342.99' },
    { name: 'Meteora', percentage: '9.41%', color: 'bg-green-600', value: '$261.12' },
    { name: 'Lulo', percentage: '5.93%', color: 'bg-indigo-400', value: '$164.54' },
    { name: 'Rain', percentage: '3.64%', color: 'bg-purple-400', value: '$101.00' },
    { name: 'Other', percentage: '21.67%', color: 'bg-red-200', value: '$601.40' }
  ]);

  const [activeSection, setActiveSection] = useState('Holdings');
  const [activeSectionValue, setActiveSectionValue] = useState('$1,304.29');

  const AssetIcon = ({ icon, secondIcon = null, size = 'md' }) => {
    const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
    return (
      <div className="flex -space-x-1">
        <div className={`${sizeClass} rounded-full bg-gradient-to-r from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold`}>
          {icon}
        </div>
        {secondIcon && (
          <div className={`${sizeClass} rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold`}>
            {secondIcon}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 mr-2"></div>
          <span className="font-bold text-xl">
            BeChill<span className="text-green-400">Portfolio</span>
          </span>
        </div>
        
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search address, domain or bundle"
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-md pl-10" 
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <div className="absolute right-3 top-2.5 text-gray-400">⌘K</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-md flex items-center">
            <Book size={16} className="mr-2" />
            Address Book
          </button>
          <button className="p-2 rounded-md bg-gray-800 hover:bg-gray-700">
            <Settings size={16} />
          </button>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-4 py-2 rounded-md flex items-center">
            <Wallet size={16} className="mr-2" />
            Connect Wallet
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 p-4">
          <nav className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 p-2 rounded bg-gray-800 bg-opacity-50">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                  <RefreshCcw size={12} />
                </div>
                <div>
                  <div className="text-white font-medium">Portfolio</div>
                  <div className="text-gray-500 text-xs">Track all your Solana investments</div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-800 hover:bg-opacity-50 rounded cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                  <Wallet size={12} />
                </div>
                <div>
                  <div className="text-white font-medium">Deposit</div>
                  <div className="text-gray-500 text-xs">Onramp into Solana</div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-800 hover:bg-opacity-50 rounded cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                  <ArrowRight size={12} />
                </div>
                <div>
                  <div className="text-white font-medium">Bridge</div>
                  <div className="text-gray-500 text-xs">Bridges assets into Solana</div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 p-2 hover:bg-gray-800 hover:bg-opacity-50 rounded cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                  <Wallet size={12} />
                </div>
                <div>
                  <div className="text-white font-medium">Invite</div>
                  <div className="text-gray-500 text-xs">Invite friends and earn rewards</div>
                </div>
              </div>
            </div>
          </nav>
          
          <div className="mt-auto pt-8">
            <div className="bg-gray-800 bg-opacity-30 rounded-lg p-4 relative overflow-hidden">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-300">
                ×
              </button>
              <h3 className="font-bold mb-2">Onboard your friends</h3>
              <p className="text-gray-400 text-sm mb-3">Get them into Solana dApps, trading, rewards, and more.</p>
              <button className="bg-green-300 text-green-900 px-4 py-2 rounded-full text-sm font-bold">
                Invite a friend
              </button>
              <div className="absolute -bottom-4 -right-4">
                <div className="w-16 h-16 opacity-70">
                  {/* Anime mascot placeholder */}
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500"></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mt-6 text-gray-500 text-sm">
              <button className="flex items-center hover:text-gray-300">
                <span>Send feedback</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Portfolio Header */}
          <div className="flex items-center space-x-2 mb-4">
            <h1 className="text-2xl font-bold">Portfolio</h1>
            <ArrowRight size={20} />
            <h1 className="text-2xl font-bold">Jupiter demo</h1>
            <button className="ml-2 p-1 rounded hover:bg-gray-800">
              <RefreshCcw size={16} />
            </button>
            <div className="text-gray-500 text-sm">Last refresh 2 minutes ago</div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-6">
            {/* Net Worth Card */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center mr-2">
                  <Wallet size={14} />
                </div>
                <div className="text-gray-400">Net worth</div>
                <button className="ml-auto p-1 rounded hover:bg-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              <div className="text-4xl font-bold mb-2">{netWorth}</div>
              <div className="text-gray-400">{solValue}</div>
            </div>

            {/* Asset Distribution Chart */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex h-full">
                <div className="relative w-40 h-40">
                  {/* Donut chart placeholder */}
                  <div className="absolute inset-0 rounded-full border-8 border-l-lime-300 border-t-cyan-300 border-r-green-600 border-b-indigo-400 transform rotate-45"></div>
                  <div className="absolute inset-4 bg-gray-800 rounded-full"></div>
                </div>
                <div className="flex-1 ml-6 space-y-2">
                  {assetCategories.map((category, index) => (
                    <div 
                      key={index} 
                      className="flex items-center cursor-pointer hover:bg-gray-700 hover:bg-opacity-30 p-1 rounded"
                      onClick={() => {
                        setActiveSection(category.name);
                        setActiveSectionValue(category.value);
                      }}
                    >
                      <div className={`w-3 h-3 rounded-full ${category.color} mr-2`}></div>
                      <div className="flex-1">{category.name}</div>
                      <div className="text-gray-400">({category.percentage})</div>
                      <div className="ml-2">{category.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Holdings Section */}
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center mr-2">
                  <Wallet size={14} />
                </div>
                <h2 className="text-xl font-bold">{activeSection}</h2>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <div className="text-xl font-bold">{activeSectionValue}</div>
            </div>
            
            <div className="bg-gray-900 p-2 border-b border-gray-700">
              <button className="bg-gray-800 text-white px-4 py-1 rounded-md text-sm">Wallet</button>
            </div>
            
            <table className="w-full">
              <thead className="bg-gray-900 text-gray-400 text-sm">
                <tr>
                  <th className="text-left py-3 px-4">Asset</th>
                  <th className="text-right py-3 px-4">Balance</th>
                  <th className="text-right py-3 px-4">Price</th>
                  <th className="text-right py-3 px-4">Value</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((asset, index) => (
                  <tr key={index} className="border-t border-gray-800 hover:bg-gray-800">
                    <td className="py-3 px-4 flex items-center">
                      <AssetIcon icon={asset.icon} />
                      <span className="ml-3">{asset.name}</span>
                    </td>
                    <td className="text-right py-3 px-4">{asset.balance}</td>
                    <td className="text-right py-3 px-4">{asset.price}</td>
                    <td className="text-right py-3 px-4">{asset.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Liquidity Pools Section */}
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center mr-2">
                  <RefreshCcw size={14} />
                </div>
                <h2 className="text-xl font-bold">Meteora</h2>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
              <div className="text-xl font-bold">$261.12</div>
            </div>
            
            <div className="bg-gray-900 p-2 border-b border-gray-700 flex space-x-2">
              <button className="bg-gray-800 text-white px-4 py-1 rounded-md text-sm">LiquidityPool</button>
              <button className="text-gray-400 hover:bg-gray-800 px-4 py-1 rounded-md text-sm">Demo...3tKG</button>
            </div>
            
            <table className="w-full">
              <thead className="bg-gray-900 text-gray-400 text-sm">
                <tr>
                  <th className="text-left py-3 px-4">Asset</th>
                  <th className="text-right py-3 px-4">Balance</th>
                  <th className="text-right py-3 px-4">Value</th>
                </tr>
              </thead>
              <tbody>
                {liquidity.map((asset, index) => (
                  <tr key={index} className="border-t border-gray-800 hover:bg-gray-800">
                    <td className="py-3 px-4 flex items-center">
                      <AssetIcon icon={asset.icons[0]} secondIcon={asset.icons[1]} />
                      <span className="ml-3">{asset.name}</span>
                    </td>
                    <td className="text-right py-3 px-4 whitespace-pre-line">{asset.balance}</td>
                    <td className="text-right py-3 px-4">{asset.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoPortfolio;