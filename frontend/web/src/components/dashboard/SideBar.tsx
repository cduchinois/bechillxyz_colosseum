import React from 'react';
import { Home, BarChart2, Target, Clock, User, Wallet, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  walletAddress: string | null;
  connectWallet: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, walletAddress, connectWallet }) => {
  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { id: 'assets', label: 'Assets', icon: <BarChart2 size={20} /> },
    { id: 'objectives', label: 'Objectives', icon: <Target size={20} /> },
    { id: 'history', label: 'History', icon: <Clock size={20} /> },
    { id: 'chillbot', label: 'Chillbot', icon: <span className="text-lg">😎</span> },
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
  ];

  return (
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
        <button 
          className="w-full bg-[#7036cd] hover:bg-purple-800 text-white flex items-center justify-center py-2 px-4 rounded-lg"
          onClick={connectWallet}
        >
          <Wallet size={18} className="mr-2" />
          <span>{walletAddress ? 'Switch Wallet' : 'Connect Wallet'}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;