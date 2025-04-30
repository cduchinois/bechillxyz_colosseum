'use client';
import { useEffect } from 'react';

import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth';
import PrivyGate from '@/components/PrivyGate';
import LandingPage from '@/components/LandingPage';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export default function HomePage() {
  return <LandingPage />;
}