'use client';import { useState } from 'react';
import { 
  Wallet, RefreshCcw, Clock, Target, User, 
  BarChart2, PlusCircle, ArrowUp, ArrowDown, Info,
  Home, ChevronRight, TrendingUp, Users, Plus
} from 'lucide-react';
import ChatComponent from '@/components/ChatComponent';
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";


const BeChillDashboard = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [cryptoAssets, setCryptoAssets] = useState([
    { name: 'Solana (SOL)', balance: '0.9 SOL', value: '€256.23', change: '+1.6%', trending: 'up' },
    { name: 'Jupiter (JUP)', balance: '15.2 JUP', value: '€45.60', change: '+2.3%', trending: 'up' },
    { name: 'Bonk (BONK)', balance: '25000 BONK', value: '€12.50', change: '-0.8%', trending: 'down' },
  ]);
  
  const [transactions, setTransactions] = useState([
    { date: 'April 29 2025', type: 'Transfer', direction: 'out', amount: '0.0203 SOL', to: 'Ox9983b...31146FA' },
    { date: 'April 29 2025', type: 'Transfer', direction: 'in', amount: '0.0203 SOL', to: 'Ox9983b...31146FA' },
    { date: 'April 29 2025', type: 'Transfer', direction: 'out', amount: '0.203 USDC', to: 'Ox9983b...31146FA' },
    { date: 'April 29 2025', type: 'Transfer', direction: 'in', amount: '0.203 USDC', to: 'Ox9983b...31146FA' },
    { date: 'April 29 2025', type: 'Transfer', direction: 'out', amount: '0.203 USDC', to: 'Ox9983b...31146FA' },
    { date: 'April 29 2025', type: 'Transfer', direction: 'out', amount: '0.0203 JUP', to: 'Ox9983b...31146FA' },
    { date: 'April 29 2025', type: 'Transfer', direction: 'in', amount: '0.0203 JUP', to: 'Ox9983b...31146FA' },
  ]);
  
  const [objectives, setObjectives] = useState([
    { goal: 'DCA 100 $SOL', description: 'through weekly investments', progress: 65, color: 'bg-purple-600' },
    { goal: 'DCA 100 $SOL', description: 'through weekly investments', progress: 65, color: 'bg-yellow-300' },
    { goal: 'DCA 100 $SOL', description: 'through weekly investments', progress: 65, color: 'bg-green-400' },
  ]);
  
  const [profile, setProfile] = useState({
    type: 'Moderate investor',
    description: 'You are a stable and goal-oriented investor who strives for a harmonized investment strategy that balances risk and reward.',
    chillScore: 78,
    riskScore: 25,
    bucketSplit: { speculative: 30, steady: 70 }
  });
  
  // Progress bar component
  interface ProgressBarProps {
    progress: number;
    color: string;
    height?: string;
  }
  
  const ProgressBar = ({ progress, color, height = 'h-4' }: ProgressBarProps) => (
    <div className={`w-full bg-gray-100 rounded-full ${height}`}>
      <div 
        className={`${color} rounded-full ${height}`} 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );

  // Asset icon component
  const AssetIcon = ({ symbol }: { symbol: string }) => {
    const getColor = () => {
      if (symbol === 'Solana') return 'bg-[#7036cd]';
      if (symbol === 'Jupiter' || symbol === 'JUP') return 'bg-[#FFFF4F]';
      if (symbol === 'BONK') return 'bg-white';
      return 'bg-gray-300';
    };
    
    return (
      <div className={`w-8 h-8 rounded-full ${getColor()} flex items-center justify-center text-black font-bold border border-gray-100 shadow-sm`}>
        {symbol.charAt(0)}
      </div>
    );
  };

  // Distribution chart component
  const DistributionChart = () => (
    <div className="relative h-40 w-40 mx-auto">
      <div className="absolute inset-0 rounded-full border-[20px] border-t-[#7036cd] border-l-[#7036cd] border-r-[#FFFF4F] border-b-gray-100"></div>
      <div className="absolute inset-6 rounded-full bg-white flex items-center justify-center flex-col">
        <div className="text-sm text-gray-500 mb-0">Total</div>
        <div className="text-xl font-bold text-[#7036cd]">$12,450</div>
      </div>
    </div>
  );

  // Tab content components
  const AssetsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Valeur totale */}
        <div className="bg-white rounded-xl p-6 shadow-md col-span-1">
          <h2 className="text-lg font-bold text-gray-500 mb-2">Total Net Worth</h2>
          <div className="text-4xl font-bold text-[#7036cd] mb-2">
            $12,450
          </div>
          <div className="flex items-center space-x-2 text-green-500">
            <ArrowUp size={16} />
            <span>+942.00€</span>
            <span className="text-sm">+8.2%</span>
          </div>
          <div className="text-gray-400 text-sm mt-1">
            13 - 28 Fév, 2025
          </div>
          
          <div className="mt-6">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600">≈ 18.400 SOL</span>
              <span className="text-xs text-gray-400">Dernière mise à jour: 2 min</span>
            </div>
            <div className="flex space-x-2">
              <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded">
                1J
              </button>
              <button className="text-xs bg-[#7036cd] text-white px-2 py-1 rounded">
                7J
              </button>
              <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded">
                1M
              </button>
              <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded">
                1A
              </button>
              <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded">
                YTD
              </button>
              <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded">
                ALL
              </button>
            </div>
          </div>
        </div>
        
        {/* Graphique */}
        <div className="bg-white rounded-xl p-6 shadow-md col-span-1">
          <div className="h-64 w-full bg-gray-50 rounded relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-gray-400">Asset Growth Graph</span>
            </div>
          </div>
        </div>
        
        {/* Allocation */}
        <div className="bg-white rounded-xl p-6 shadow-md col-span-1">
          <h2 className="text-lg font-bold text-gray-500 mb-4">Allocation</h2>
          
          <div className="flex-1 relative">
            <DistributionChart />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold text-[#7036cd]">$12,450</div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#7036cd] mr-2"></div>
                <span className="text-sm">SOL</span>
              </div>
              <span className="text-sm">62%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#FFFF4F] mr-2"></div>
                <span className="text-sm">JUP</span>
              </div>
              <span className="text-sm">25%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-white border border-gray-300 mr-2"></div>
                <span className="text-sm">BONK</span>
              </div>
              <span className="text-sm">12%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Liste des actifs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#7036cd]">Mes actifs</h2>
          <div className="flex space-x-3">
            <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-lg">
              Voir plus
            </button>
            <button className="text-xs bg-[#FFFF4F] hover:bg-yellow-300 text-[#7036cd] px-3 py-1 rounded-lg">
              Actualiser
            </button>
          </div>
        </div>
            
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
              <th className="text-left py-3 px-4">Asset</th>
              <th className="text-right py-3 px-4">Balance</th>
              <th className="text-right py-3 px-4">Prix</th>
              <th className="text-right py-3 px-4">Valeur</th>
              <th className="text-right py-3 px-4">24h</th>
            </tr>
          </thead>
          <tbody>
            {cryptoAssets.map((asset, index) => (
              <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <AssetIcon symbol={asset.name.split(' ')[0]} />
                    <span className="ml-3 font-medium">{asset.name}</span>
                  </div>
                </td>
                <td className="text-right py-4 px-4 text-gray-800">{asset.balance}</td>
                <td className="text-right py-4 px-4 text-gray-800">{asset.value}</td>
                <td className="text-right py-4 px-4 font-medium">{asset.value}</td>
                <td className="text-right py-4 px-4">
                  <div className="flex items-center justify-end">
                    <span className={asset.trending === 'up' ? 'text-green-500 mr-1' : 'text-red-500 mr-1'}>
                      {asset.change}
                    </span>
                    {asset.trending === 'up' ? (
                      <ArrowUp size={16} className="text-green-500" />
                    ) : (
                      <ArrowDown size={16} className="text-red-500" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const HistoryTab = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-purple-100 p-4 border-b">
        <h2 className="text-xl font-bold text-purple-800">Transaction History</h2>
      </div>
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
    </div>
  );

  const ObjectivesTab = () => (
    <div>
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <h2 className="text-xl font-bold text-[#7036cd] mb-4">Vue d'ensemble</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-gray-500 text-sm mb-1">Objectifs actifs</div>
            <div className="text-2xl font-bold text-[#7036cd]">3</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-gray-500 text-sm mb-1">Progression moyenne</div>
            <div className="text-2xl font-bold text-[#7036cd]">65%</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-gray-500 text-sm mb-1">Complétés</div>
            <div className="text-2xl font-bold text-[#7036cd]">2</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#7036cd]">Mes objectifs</h2>
          <div>
            <button className="text-sm bg-[#FFFF4F] hover:bg-yellow-300 text-[#7036cd] px-4 py-2 rounded-lg flex items-center">
              <PlusCircle size={18} className="mr-2" />
              Ajouter un objectif
            </button>
          </div>
        </div>
        
        <div className="divide-y">
          {objectives.map((objective, index) => (
            <div key={index} className="p-5 hover:bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-[#7036cd]">{objective.goal}</div>
                <div className="text-gray-500">Progress {objective.progress}%</div>
              </div>
              <div className="text-gray-600 mb-3">{objective.description}</div>
              <ProgressBar progress={objective.progress} color={objective.color} height="h-2" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-[#7036cd] mb-4">Objectifs complétés</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🎉</div>
          <p>Vous avez complété 2 objectifs cette année.</p>
          <button className="mt-4 text-sm text-[#7036cd] underline">Voir l'historique</button>
        </div>
      </div>
    </div>
  );



  const renderTabContent = () => {
    switch(activeTab) {
      case 'assets': return <AssetsTab />;
      case 'objectives': return <ObjectivesTab />;
      case 'history': return <HistoryTab />;
      case 'profile': return <ProfileTab />;
      default: return <AssetsTab />;
    }
  };

  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'assets', label: 'Assets', icon: <BarChart2 size={20} /> },
    { id: 'objectives', label: 'Objectives', icon: <Target size={20} /> },
    { id: 'history', label: 'History', icon: <Clock size={20} /> },
    { id: 'chillbot', label: 'Chillbot', icon: <span className="text-lg">😎</span> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  const ProfileTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-[#7036cd]">
          {profile.type}
        </h2>
        <p className="text-gray-700 mt-2 mb-6">
          {profile.description}
        </p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <span className="mr-1">😎</span>
                <span className="font-medium">Chill score</span>
              </div>
              <div className="flex items-center">
                <span>{profile.chillScore}%</span>
                <Info size={16} className="ml-1 text-gray-400" />
              </div>
            </div>
            <ProgressBar progress={profile.chillScore} color="bg-[#FFFF4F]" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <span className="mr-1">⚠️</span>
                <span className="font-medium">Risk score</span>
              </div>
              <div className="flex items-center">
                <span>{profile.riskScore}%</span>
                <Info size={16} className="ml-1 text-gray-400" />
              </div>
            </div>
            <ProgressBar progress={profile.riskScore} color="bg-[#7036cd]" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <span className="mr-1">✌️</span>
                <span className="font-medium">Bucket split</span>
              </div>
              <div className="flex items-center">
                <Info size={16} className="ml-1 text-gray-400" />
              </div>
            </div>
            <div className="flex">
              <div style={{width: `${profile.bucketSplit.speculative}%`}}>
                <div className="bg-[#FFFF4F] h-4 rounded-l-full w-full"></div>
              </div>
              <div style={{width: `${profile.bucketSplit.steady}%`}}>
                <div className="bg-green-400 h-4 rounded-r-full w-full"></div>
              </div>
            </div>
            <div className="flex justify-between mt-1 text-sm">
              <div>{profile.bucketSplit.speculative}% speculative</div>
              <div>{profile.bucketSplit.steady}% steady</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  interface PrivyUser {
    wallet?: {
      address: string;
    };
    // Autres propriétés si nécessaire
  }
  const [walletReviewed, setWalletReviewed] = useState(false);
  const { user } = usePrivy();
  const typedUser = user as any as PrivyUser | null;
  const { login } = useLogin();
  const { logout } = useLogout();
  const [savedMessages, setSavedMessages] = useState<any[]>([]);


  const handleChatMessage = (message: string) => {
    console.log("Chat message received:", message);
    
    // Si le message indique que l'utilisateur a vu l'analyse du wallet
    if (message === "wallet story") {
      console.log("Setting wallet as reviewed");
      setWalletReviewed(true);
    }
  };

  const saveMessages = (messages: any[]) => {
    setSavedMessages(messages);
  };
    
  return (
    <div className="min-h-screen flex bg-gradient-to-r from-[#DDDAF6] to-[#C6D9FF]">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-screen overflow-auto">
        <div className="p-4 border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-[#FFFF4F] rounded-full flex items-center justify-center mr-2">
              <span className="text-[#7036cd] font-bold">😎</span>
            </div>
            <span className="text-2xl font-bold text-[#7036cd]">beChill</span>
          </div>
        </div>
        
        <nav className="py-4">
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`w-full flex items-center py-3 px-4 ${
                activeTab === link.id 
                  ? 'bg-purple-50 text-[#7036cd] font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="w-8">{link.icon}</div>
              <span>{link.label}</span>
              {activeTab === link.id && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t">
          <button className="w-full bg-[#7036cd] hover:bg-purple-800 text-white flex items-center justify-center py-2 px-4 rounded-lg">
            <Wallet size={18} className="mr-2" />
            <span>Connect Wallet</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="ml-64 flex-1 py-4 px-6">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#7036cd]">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..."
                className="w-64 bg-white text-gray-800 px-4 py-2 rounded-lg shadow" 
              />
              <div className="absolute right-3 top-2.5 text-gray-400">⌘K</div>
            </div>
            <button className="bg-[#FFFF4F] hover:bg-yellow-300 text-[#7036cd] px-6 py-2 rounded-lg shadow-md flex items-center">
              <Plus size={18} className="mr-2" />
              Ajouter des actifs
            </button>
          </div>
        </header>
        
        {renderTabContent()}
        {/* Composant de chat flottant */}
         <ChatComponent
                  isFloating={true}
                  userWallet={typedUser?.wallet?.address || null}
                  className="w-full max-w-md mx-auto fixed bottom-6 left-0 right-0 z-20"
                  onRequestWalletConnect={login}
                  onSendMessage={handleChatMessage}
                  initialMessages={savedMessages}
                  onMessagesUpdate={saveMessages}
                />
      </main>
    </div>
  );
};

export default BeChillDashboard;