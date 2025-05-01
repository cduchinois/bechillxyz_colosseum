"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import WalletStoryWeb from "./WalletStoryWeb";

type MessageType = "text" | "wallet-connect" | "wallet-review";

type Message = {
  text: string;
  sender: "bot" | "user";
  timestamp?: string;
  type?: MessageType;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasUserInteracted = useRef(false);

  // MODIFICATION: Désactiver l'auto-scroll initial pour empêcher le focus sur le chat
  const [blockAutoScroll, setBlockAutoScroll] = useState(true);
  
  // Activer l'auto-scroll uniquement après une interaction utilisateur
  const enableAutoScroll = () => {
    if (blockAutoScroll) {
      setBlockAutoScroll(false);
    }
  };

  useEffect(() => {
    // Délai plus long pour permettre à la page de se charger complètement
    const timer = setTimeout(() => {
      // Ne pas activer automatiquement l'auto-scroll au chargement
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
      addMessage({ text: "To give you insights, I'd need to connect your wallet. Connect now?", sender: "bot" });
      setTimeout(() => {
        addMessage({ text: "CONNECT_WALLET_BUTTON", sender: "bot", type: "wallet-connect" });
      }, 500);
      setHasAskedForWallet(true);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Activer l'auto-scroll après interaction utilisateur
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

    if (onSendMessage) onSendMessage(userText);

    if (hasAskedForWallet && !userWallet) {
      if (/yes|connect|sure|okay/i.test(userText)) {
        addMessage({ text: "Redirecting to connect your wallet...", sender: "bot" });
        setTimeout(() => onRequestWalletConnect?.(), 1000);
        return;
      } else if (/no|later|not now/i.test(userText)) {
        addMessage({ text: "No worries! Ask me anything crypto.", sender: "bot" });
        return;
      }
    }

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

  return (
    <div 
      className={`font-serif ${isFloating ? "fixed bottom-4 right-4 z-20" : ""} ${className}`}
      // Activer l'auto-scroll au focus sur le composant
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

          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-white/30 backdrop-blur-sm">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}>
                {msg.type === "wallet-review"
                  ? renderWalletReviewWidget()
                  : msg.type === "wallet-connect"
                  ? renderWalletConnectButton()
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