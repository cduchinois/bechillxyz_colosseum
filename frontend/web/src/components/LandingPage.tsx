"use client";
import { useState, useEffect, useRef } from "react";
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import PrivyGate from "@/components/PrivyGate";
import HeroSection from "./sections/HeroSection";
import { CardCarouselSection } from "./sections/CardCarouselSection";
import ChatComponent from "@/components/ChatComponent";
import { Footer } from "./Footer";
import AnimatedClouds from "./AnimatedClouds"; // Import the new component

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
  const isInitialMount = useRef(true);
  
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

  // Gestion du scroll initial - version plus équilibrée
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Scroll immédiat au chargement
      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
      }
      
      // Un seul scroll supplémentaire avec un délai
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Réinitialiser l'état d'analyse lors de la déconnexion
  useEffect(() => {
    if (!typedUser) {
      setWalletReviewed(false);
    }
  }, [typedUser]);

  return (
    <PrivyGate>
    <main className="min-h-screen relative overflow-hidden">
      {/* Add the AnimatedClouds component here */}
      <AnimatedClouds />
      
      <div className="relative z-10">
      <HeroSection
        userWallet={typedUser?.wallet?.address || null}
        onLogin={login}
        onLogout={logout}
        walletReviewed={walletReviewed}
      />
    <CardCarouselSection />
        
      <section className="container mx-auto px-4 py-12 flex justify-center">
      <ChatComponent
          userWallet={typedUser?.wallet?.address || null}
          className="w-full max-w-md shadow-lg"
          onRequestWalletConnect={login}
          onSendMessage={handleChatMessage}
          initialMessages={savedMessages}
          onMessagesUpdate={saveMessages}
        />
      </section>
      
      </div>
    </main>
    <Footer />
  </PrivyGate>
  );
}