"use client";
import { useState, useEffect, useRef } from "react";
import { useLogin, useLogout, usePrivy } from "@privy-io/react-auth";
import PrivyGate from "@/components/common/PrivyGate";
import HeroSection from "./sections/HeroSection";
import { CardCarouselSection } from "./sections/CardCarouselSection";
import { Footer } from "./Footer";
import AnimatedClouds from "../common/AnimatedClouds";
import MobileAppPromo from "./sections/MobileAppPromo";
import ContactForm from "../common/ContactForm";
import FollowUsOnTwitter from "../common/TwitterSection";

interface PrivyUser {
  wallet?: {
    address: string;
  };
}

export default function LandingPage() {
  const { login } = useLogin();
  const { logout } = useLogout();
  const { user } = usePrivy();
  const typedUser = user as PrivyUser | null;
  const isInitialMount = useRef(true);

  const [walletReviewed, setWalletReviewed] = useState(false);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      if (typeof window !== "undefined") {
        window.scrollTo(0, 0);
      }

      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!typedUser) {
      setWalletReviewed(false);
    }
  }, [typedUser]);

  return (
    <PrivyGate>
      <main className="min-h-screen relative overflow-hidden">
        <AnimatedClouds />
        <div className="relative z-10">
          <HeroSection
            userWallet={typedUser?.wallet?.address || null}
            onLogin={login}
            onLogout={logout}
            walletReviewed={walletReviewed}
          />
          <CardCarouselSection />
          <MobileAppPromo />
          <ContactForm />
          <FollowUsOnTwitter />
        </div>
      </main>
      <Footer />
    </PrivyGate>
  );
}
