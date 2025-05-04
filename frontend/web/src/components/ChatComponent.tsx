"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import WalletStoryWeb from "./WalletStoryWeb";
import TransactionInfo from "./TransactionInfo";

type MessageType = "text" | "wallet-connect" | "wallet-review" | "wallet-transaction";

type Message = {
  text: string;
  sender: "bot" | "user";
  timestamp?: string;
  type?: MessageType;
  data?: any;
};

type ChatProps = {
  initialMessages?: Message[];
  userWallet?: string | null;
  className?: string;
  onSendMessage?: (message: string) => void;
  isFloating?: boolean;
  onRequestWalletConnect?: () => void;
  onMessagesUpdate?: (messages: Message[]) => void;
};

export default function ChatComponent({
  initialMessages = [],
  userWallet = null,
  className = "",
  onSendMessage,
  isFloating = false,
  onRequestWalletConnect,
  onMessagesUpdate,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(!isFloating);
  const [userName, setUserName] = useState<string | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [hasAskedForWallet, setHasAskedForWallet] = useState(false);
  const [hasDetectedWallet, setHasDetectedWallet] = useState(false);
  const [showWalletStory, setShowWalletStory] = useState(false);
  const [isWaitingForWalletInput, setIsWaitingForWalletInput] = useState(false);
  const [tempWalletAddress, setTempWalletAddress] = useState<string | null>(null);
  const [pendingWalletQuery, setPendingWalletQuery] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasUserInteracted = useRef(false);

  // Disable initial auto-scroll to prevent focusing on the chat
  const [blockAutoScroll, setBlockAutoScroll] = useState(true);
  
  // Enable auto-scroll only after user interaction
  const enableAutoScroll = () => {
    if (blockAutoScroll) {
      setBlockAutoScroll(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // Do not automatically enable auto-scroll on load
      // setBlockAutoScroll(false); 
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const initialMessageCount = useRef(initialMessages.length);

  useEffect(() => {
    if (blockAutoScroll) return;
  
    const isNewMessage = messages.length > initialMessageCount.current;
    if (isNewMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      initialMessageCount.current = messages.length;
    }
  }, [messages, blockAutoScroll]);

  useEffect(() => {
    if (messages.length === 0) {
      const timer = setTimeout(() => {
        addMessage({
          text: "Hey! I'm Chill, your crypto guide. What's your name?",
          sender: "bot",
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  useEffect(() => {
    if (userWallet && !hasDetectedWallet && onboardingStep >= 1) {
      setHasDetectedWallet(true);
      handleWalletDetected();
    }
  }, [userWallet, onboardingStep, hasDetectedWallet]);

  useEffect(() => {
    if (onMessagesUpdate) onMessagesUpdate(messages);
  }, [messages, onMessagesUpdate]);

  // Process pending query when wallet address is provided
  useEffect(() => {
    if (tempWalletAddress && pendingWalletQuery) {
      processWalletQuery(pendingWalletQuery, tempWalletAddress);
      setPendingWalletQuery(null);
    }
  }, [tempWalletAddress, pendingWalletQuery]);

  const getCurrentTime = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const addMessage = (message: Partial<Message>) => {
    const newMsg: Message = {
      text: message.text || "",
      sender: message.sender || "bot",
      timestamp: getCurrentTime(),
      type: message.type,
      data: message.data,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const addBotTyping = () => addMessage({ text: "...", sender: "bot" });
  const removeBotTyping = () => setMessages((prev) => prev.filter((msg) => msg.text !== "..."));

  const handleWalletDetected = () => {
    addMessage({
      text: `Detected wallet: ${userWallet?.slice(0, 6)}...${userWallet?.slice(-4)}. Analyzing...`,
      sender: "bot",
    });

    setTimeout(() => {
      addMessage({ text: "Done! Ask about asset breakdown, recent transactions, or investment ideas.", sender: "bot" });
      setTimeout(() => {
        addMessage({ text: "Example: 'What's my wallet performance last month?'", sender: "bot" });
      }, 1500);
    }, 2000);
  };

  const suggestWalletConnection = () => {
    if (!userWallet && !hasAskedForWallet) {
      addMessage({ 
        text: "To give you personalized information, I need access to your wallet. You have two options:", 
        sender: "bot" 
      });
      setTimeout(() => {
        addMessage({ 
          text: "1. Connect your wallet directly (recommended for better security)", 
          sender: "bot" 
        });
        setTimeout(() => {
          addMessage({ text: "CONNECT_WALLET_BUTTON", sender: "bot", type: "wallet-connect" });
          setTimeout(() => {
            addMessage({ 
              text: "2. Or simply provide your wallet address (e.g. start with 'My wallet is...')", 
              sender: "bot" 
            });
          }, 500);
        }, 500);
      }, 500);
      setHasAskedForWallet(true);
    }
  };

  const askForWalletAddress = (query: string) => {
    addMessage({ 
      text: "To help you with this request, I need your Solana wallet address. Can you provide it?", 
      sender: "bot" 
    });
    setIsWaitingForWalletInput(true);
    setPendingWalletQuery(query);
  };

  const processWalletQuery = async (query: string, walletAddress: string) => {
    addBotTyping();
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, walletAddress })
      });
      
      const result = await response.json();
      removeBotTyping();
      
      // If API indicates a wallet is required
      if (result.requireWallet) {
        askForWalletAddress(query);
        return;
      }
      
      // Add response message
      addMessage({ 
        text: result.response, 
        sender: "bot", 
        type: result.type,
        data: result.data
      });
      
      if (result.type === "wallet-transaction") {
        // In TransactionInfo component, pass isDemo flag
        const lastMessageIndex = messages.length;
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          if (newMessages[lastMessageIndex]) {
            newMessages[lastMessageIndex].data = {
              ...newMessages[lastMessageIndex].data,
              isDemo: result.demo
            };
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Error processing wallet query:", error);
      removeBotTyping();
      
      // Simulate a response during development/testing
      if (query.toLowerCase().includes('last transaction') || query.toLowerCase().includes('recent transaction') || query.toLowerCase().includes('transactions')) {
        const mockData = {
          transactions: Array.from({ length: 8 }, (_, i) => ({
            signature: `5xAt3ve1XcFxDGtCMDpLPRgXMvKvp6MWHWrwVK3mHpHjYx9timZsNFNrLdVCvyr1Kft${i}`,
            timestamp: Math.floor(Date.now() / 1000) - (i * 86400 * 3), // Every 3 days
            type: i % 2 === 0 ? "Transfer" : "Swap",
            tokenTransfers: [
              {
                amount: (Math.random() * 2).toFixed(2),
                symbol: i % 3 === 0 ? "SOL" : (i % 3 === 1 ? "USDC" : "JUP")
              }
            ]
          }))
        };
        
        addMessage({ 
          text: "Here are your transactions from the last 30 days (demo mode in case of API error):", 
          sender: "bot", 
          type: "wallet-transaction",
          data: mockData
        });
      } else {
        addMessage({ 
          text: "Sorry, an error occurred while analyzing your wallet. Please verify the address and try again.", 
          sender: "bot" 
        });
      }
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Enable auto-scroll after user interaction
    enableAutoScroll();
    hasUserInteracted.current = true;

    const userText = input.trim();
    setInput("");
    addMessage({ text: userText, sender: "user" });

    if (onboardingStep === 0) {
      setUserName(userText);
      setOnboardingStep(1);
      setTimeout(() => {
        addMessage({ text: `Hi ${userText}, great to meet you!`, sender: "bot" });
        userWallet
          ? addMessage({ text: "What can I help you with?", sender: "bot" })
          : suggestWalletConnection();
      }, 1000);
      return;
    }

    if (isWaitingForWalletInput) {
      // Check if text looks like a Solana address (simplistic)
      if (userText.length >= 32 && userText.length <= 44) {
        setTempWalletAddress(userText);
        setIsWaitingForWalletInput(false);
        addMessage({ 
          text: `Thanks! I'll analyze wallet ${userText.slice(0, 6)}...${userText.slice(-4)}.`, 
          sender: "bot" 
        });
        return;
      } else {
        addMessage({ 
          text: "That doesn't look like a valid Solana address. Please provide a complete wallet address.", 
          sender: "bot" 
        });
        return;
      }
    }

    if (onSendMessage) onSendMessage(userText);

    if (hasAskedForWallet && !userWallet) {
      if (/yes|connect|sure|okay/i.test(userText)) {
        addMessage({ text: "Redirecting to connect your wallet...", sender: "bot" });
        setTimeout(() => onRequestWalletConnect?.(), 1000);
        return;
      } else if (/no|later|not now/i.test(userText)) {
        addMessage({ text: "No problem! Ask me anything about crypto or simply provide your wallet address.", sender: "bot" });
        return;
      } else if (/my wallet is|my address is|here's my wallet|here is my wallet|here is my address/i.test(userText)) {
        // Extract potential address - look for a 32-44 character string
        const addressMatch = userText.match(/[A-Za-z0-9]{32,44}/);
        if (addressMatch) {
          const walletAddress = addressMatch[0];
          setTempWalletAddress(walletAddress);
          addMessage({ 
            text: `Thanks! I've registered your wallet address: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}. You can now ask me for information about this wallet.`, 
            sender: "bot" 
          });
          
          // Add suggestion for checking last transaction
          setTimeout(() => {
            addMessage({ 
              text: "Would you like to see your transactions from the last 30 days? Just type 'Show my transactions'", 
              sender: "bot" 
            });
          }, 1000);
          return;
        }
      }
    }

    // Detect wallet-related queries
    const lowerText = userText.toLowerCase();
    if (
      lowerText.includes('last transaction') || 
      lowerText.includes('recent transaction') ||
      lowerText.includes('balance') || 
      lowerText.includes('holdings') ||
      lowerText.includes('analysis') || 
      lowerText.includes('performance') ||
      lowerText.includes('show my transactions')
    ) {
      if (userWallet) {
        // If wallet connected, use this address
        processWalletQuery(userText, userWallet);
      } else if (tempWalletAddress) {
        // If user already provided an address manually
        processWalletQuery(userText, tempWalletAddress);
      } else {
        // Ask for wallet address
        askForWalletAddress(userText);
      }
      return;
    }

    // Process other messages as before
    setTimeout(() => {
      addBotTyping();
      setTimeout(() => {
        removeBotTyping();
        generateBotResponse(userText);
      }, 1500);
    }, 500);
  };

  const generateBotResponse = (text: string) => {
    let response = `I'm still learning about that${userName ? ", " + userName : ""}.`;

    if (/asset|breakdown/i.test(text)) {
      response = userWallet
        ? "Your portfolio: 45% SOL, 30% USDC, 25% NFTs. +12% growth!"
        : "I need to connect to your wallet to check your assets. Want to connect?";
    } else if (/transaction/i.test(text)) {
      response = userWallet
        ? "5 transactions this week (+2.5 SOL)."
        : "Connect your wallet to analyze transactions.";
    } else if (/recommend|invest/i.test(text)) {
      response = userWallet
        ? "Try Solana DeFi protocols for good returns!"
        : "Connect your wallet for investment tips.";
    } else if (/thank|thanks|ty/i.test(text)) {
      response = `You're welcome${userName ? ", " + userName : ""}!`;
    } else if (/hi|hello/i.test(text)) {
      response = `Hello${userName ? ", " + userName : ""}!`;
    } else if (/wallet.*(performance|month|analyze)/i.test(text)) {
      if (userWallet) {
        addMessage({ text: "Analyzing your wallet...", sender: "bot" });
        setTimeout(() => {
          addBotTyping();
          setTimeout(() => {
            removeBotTyping();
            setMessages((prev) => [
              ...prev,
              {
                text: "WALLET_REVIEW_WIDGET",
                sender: "bot",
                type: "wallet-review",
                timestamp: getCurrentTime(),
              },
            ]);
          }, 1500);
        }, 1000);
        return;
      } else {
        response = "I need your wallet connected first.";
      }
    }

    addMessage({ text: response, sender: "bot" });
  };

  const renderWalletConnectButton = () => (
    <div className="flex justify-center w-full my-2">
      <button
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full"
        onClick={() => {
          enableAutoScroll();
          onRequestWalletConnect?.();
        }}
      >
        CONNECT WALLET
      </button>
    </div>
  );

  const renderWalletReviewWidget = () => (
    <div className="bg-purple-600 p-4 rounded-xl w-60 my-2 text-center">
      <h3 className="text-white text-xl font-bold">Wallet Review!</h3>
      <button
        className="mt-2 bg-purple-500 text-yellow-300 px-4 py-1 rounded-full"
        onClick={() => {
          enableAutoScroll();
          setShowWalletStory(true);
        }}
      >
        VIEW STORY
      </button>
    </div>
  );

  const renderWalletTransactionInfo = (data: any) => (
    <TransactionInfo 
      data={data} 
      onClose={() => {
        enableAutoScroll();
        // Additional actions after closing if needed
      }} 
      isDemo={data.isDemo || false}
    />
  );

  return (
    <div 
      className={`font-serif ${isFloating ? "fixed bottom-4 right-4 z-20" : ""} ${className}`}
      // Enable auto-scroll on component focus
      onClick={enableAutoScroll}
    >
      {isFloating && (
        <button
          onClick={() => {
            enableAutoScroll();
            setIsOpen(!isOpen);
          }}
          className="w-14 h-14 rounded-full bg-yellow-300 flex items-center justify-center shadow-lg"
        >
          {isOpen ? "✕" : "💬"}
        </button>
      )}

      {(isOpen || !isFloating) && (
        <div className="bg-gradient-to-b from-[#DDDAF6] to-[#C6D9FF] rounded-xl overflow-hidden shadow-lg border border-white/30">
          <div className="p-4 bg-white/90 border-b flex items-center">
            <Image src="/img/bechill-head1.png" alt="BeChill" width={48} height={48} className="mr-3" />
            <h2 className="font-bold text-purple-900">beChill</h2>
          </div>

          <div className="h-150 overflow-y-auto p-4 space-y-4 bg-white/30 backdrop-blur-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}>
                {msg.type === "wallet-review"
                  ? renderWalletReviewWidget()
                  : msg.type === "wallet-connect"
                  ? renderWalletConnectButton()
                  : msg.type === "wallet-transaction"
                  ? renderWalletTransactionInfo(msg.data)
                  : (
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === "bot" ? "bg-white" : "bg-yellow-300"} text-gray-800 shadow-sm`}>
                      {msg.text}
                      <div className="text-xs mt-1 text-gray-500">{msg.timestamp}</div>
                    </div>
                  )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-white/90">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Message Chill ..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                onFocus={enableAutoScroll}
                className="flex-1 py-3 px-4 rounded-full outline-none text-gray-800 shadow-sm"
              />
              <button
                onClick={handleSendMessage}
                className="bg-yellow-300 text-purple-900 p-3 rounded-full"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {showWalletStory && (
        <WalletStoryWeb
          onClose={() => setShowWalletStory(false)}
          onComplete={() => {
            setShowWalletStory(false);
            addMessage({
              text: "Great! Now you can see your full dashboard.",
              sender: "bot",
            });
          }}
        />
      )}
    </div>
  );
}