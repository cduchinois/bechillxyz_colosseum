import React from 'react';
import ChatComponent from '@/components/common/ChatComponent';

// Types from ChatComponent
type Message = {
  text: string;
  sender: 'bot' | 'user';
  timestamp?: string;
  type?: string;
  data?: any;
};

// Interface that our dashboard uses
interface DashboardMessage {
  text: string;
  sender: 'bot' | 'user';
  timestamp?: string;
  type?: string;
  data?: any;
}

interface ChatAdapterProps {
  isFloating?: boolean;
  userWallet: string | null;
  className?: string;
  onRequestWalletConnect: () => void;
  onSendMessage: (message: string) => void;
  initialMessages: DashboardMessage[];
  onMessagesUpdate: (messages: DashboardMessage[]) => void;
}

/**
 * Adaptateur pour résoudre les incompatibilités entre les interfaces de messages
 * dans le dashboard et dans le ChatComponent
 */
const ChatAdapter: React.FC<ChatAdapterProps> = ({
  isFloating,
  userWallet,
  className,
  onRequestWalletConnect,
  onSendMessage,
  initialMessages,
  onMessagesUpdate
}) => {
  // Pas besoin de transformation car on a aligné les interfaces
  
  return (
    <ChatComponent
      isFloating={isFloating}
      userWallet={userWallet}
      className={className}
      onRequestWalletConnect={onRequestWalletConnect}
      onSendMessage={onSendMessage}
      initialMessages={initialMessages as any}
      onMessagesUpdate={onMessagesUpdate as any}
    />
  );
};

export default ChatAdapter;