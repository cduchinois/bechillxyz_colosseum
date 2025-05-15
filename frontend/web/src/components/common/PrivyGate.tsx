'use client';

import {usePrivy} from '@privy-io/react-auth';
import LoadingSpinner from '../ui/LoadingSpinner';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function PrivyGate({ children }: Props){
  const {ready} = usePrivy();

  if (!ready) {
    return <div><LoadingSpinner fullscreen />
</div>;
  }

  // Now it's safe to use other Privy hooks and state
  return <>{children}</>;
}