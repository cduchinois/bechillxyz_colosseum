"use client";
import { useState, useEffect } from "react";
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import PrivyGate from "@/components/PrivyGate";
import ChatComponent from "@/components/ChatComponent";
import Image from "next/image";

interface PrivyUser {
  wallet?: {
    address: string;
  };
  // Autres propriétés si nécessaire
}

export default function LandingPage() {
  const { login } = useLogin();
  const { logout } = useLogout();
  const { user } = usePrivy();
  const typedUser = user as any as PrivyUser | null;
  
  // État pour suivre si l'analyse a été demandée explicitement
  const [walletReviewed, setWalletReviewed] = useState(false);
  
  // État pour suivre les messages du chat pour sauvegarde entre connexion/déconnexion
  const [savedMessages, setSavedMessages] = useState<any[]>([]);
  
  // Fonction pour gérer les messages du ChatComponent
  const handleChatMessage = (message: string) => {
    console.log("Chat message received:", message);
    
    // Si le message indique que l'utilisateur a vu l'analyse du wallet
    if (message === "wallet story") {
      console.log("Setting wallet as reviewed");
      setWalletReviewed(true);
    }
  };
  
  // Fonction pour sauvegarder les messages du chat
  const saveMessages = (messages: any[]) => {
    setSavedMessages(messages);
  };
  
  // Réinitialiser l'état d'analyse lors de la déconnexion
  useEffect(() => {
    if (!typedUser) {
      setWalletReviewed(false);
    }
  }, [typedUser]);

  return (
    <PrivyGate>
      <main className="min-h-screen overflow-hidden">
        <div className="container mx-auto px-4 py-16 flex flex-col lg:flex-row items-center justify-between relative z-10">
          {/* Left side - Hero content */}
          <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0">
            <div className="flex justify-center lg:justify-start mb-6 items-center">
              <div className="flex items-center">
                <div className="relative w-28 h-28 rounded-full flex items-center justify-center mr-3">
                  <Image
                    src="/img/bechill-head1.png"
                    alt="BeChill Logo"
                    fill
                    className="object-contain p-1"
                    priority
                  />
                </div>
                <span className="text-4xl font-bold text-purple-900">
                  beChill
                </span>
              </div>
            </div>

            <h1 className="text-6xl font-bold mb-8 text-purple-900">
              <span className="block">Chill,</span>
              <span className="block">your personal asset manager</span>
              <span className="block">powered by Solana.</span>
            </h1>

            <p className="text-xl mb-10 text-purple-900 max-w-lg">
              Take control of your digital assets with our AI-powered manager.
              Track, analyze, and optimize your portfolio with just a few
              clicks.
            </p>

            {!typedUser ? (
              <button
                onClick={login}
                className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-full shadow-lg transform transition hover:scale-105"
              >
                CONNECT WALLET
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg inline-block shadow-sm">
                  <p className="text-lg text-purple-900">
                    ✅ Connected: {typedUser.wallet?.address ? `${typedUser.wallet.address.slice(0, 6)}...${typedUser.wallet.address.slice(-4)}` : 'No address found'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-full shadow-lg transform transition hover:scale-105"
                >
                  DISCONNECT
                </button>
              </div>
            )}
          </div>

          {/* Right side - Dashboard preview or Chat widget */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            {/* Important: Ne montrez le dashboard que si l'utilisateur a explicitement demandé/vu l'analyse */}
            {typedUser && walletReviewed ? (
              <div className="bg-white/80 backdrop-blur-md rounded-xl p-6 w-full max-w-md border border-white/20 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-purple-900">
                  Your Portfolio Overview
                </h2>
                <div className="space-y-4">
                  <div className="bg-white/60 rounded-lg p-4 shadow-sm">
                    <h3 className="font-medium text-purple-900">Total Value</h3>
                    <p className="text-2xl font-bold text-purple-900">
                      $12,458.32 USD
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 rounded-lg p-4 shadow-sm">
                      <h3 className="font-medium text-purple-900">Assets</h3>
                      <p className="text-xl font-bold text-purple-900">8</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-4 shadow-sm">
                      <h3 className="font-medium text-purple-900">
                        24h Change
                      </h3>
                      <p className="text-xl font-bold text-green-500">+2.3%</p>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium">
                    View Full Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <ChatComponent
                userWallet={typedUser?.wallet?.address || null}
                className="w-full max-w-md shadow-lg"
                onRequestWalletConnect={login}
                onSendMessage={handleChatMessage}
                initialMessages={savedMessages}
                onMessagesUpdate={saveMessages}
              />
            )}
          </div>
        </div>

        {/* Mobile chat bubble - only shown on small screens when not in dashboard mode */}
        {(!typedUser || !walletReviewed) && (
          <ChatComponent
            userWallet={typedUser?.wallet?.address || null}
            isFloating={true}
            onRequestWalletConnect={login}
            onSendMessage={handleChatMessage}
            initialMessages={savedMessages}
            onMessagesUpdate={saveMessages}
          />
        )}

        {/* Footer */}
        <footer className="py-8 text-center text-purple-900/80 text-sm mt-16">
          <p>© 2025 BeChill. All rights reserved. Powered by Solana.</p>
        </footer>
      </main>
    </PrivyGate>
  );
}