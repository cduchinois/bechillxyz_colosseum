// components/common/WalletStatus.tsx
import React from "react";
import ConnectWalletButton from "./ConnectWalletButton";

interface WalletStatusProps {
  userWallet: string | null;
  onLogin: () => void;
  onLogout: () => void;
}

const WalletStatus: React.FC<WalletStatusProps> = ({ userWallet, onLogin, onLogout }) => {
  if (!userWallet) {
    return <ConnectWalletButton onClick={onLogin} />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg inline-block shadow-sm">
        <p className="text-lg text-purple-900">
          ✅ Connected: {userWallet.slice(0, 6)}...{userWallet.slice(-4)}
        </p>
      </div>
      <button
        onClick={onLogout}
        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-full shadow-lg transform transition hover:scale-105"
      >
        DISCONNECT
      </button>
    </div>
  );
};

export default WalletStatus;
