'use client';

import {usePrivy} from '@privy-io/react-auth';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function PrivyGate({ children }: Props){
  const {ready} = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  // Now it's safe to use other Privy hooks and state
  return <>{children}</>;
}