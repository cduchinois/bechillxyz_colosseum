"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import WalletStoryWeb from "../wallet/WalletStoryWeb";
import TransactionInfo from "../analytics/TransactionInfo";

// Types
type MessageType =
  | "text"
  | "wallet-connect"
  | "wallet-review"
  | "wallet-transaction"
  | "suggestion-buttons"
  | "wallet-nfts"
  | "portfolio-analysis";

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

// Suggestion buttons collections
const DEFAULT_WALLET_SUGGESTIONS = [
  "Show my transactions",
  "What NFTs do I own?",
  "Check my DeFi activity",
  "Is my portfolio well diversified?"
];

const POST_TRANSACTION_SUGGESTIONS = {
  "Swap": [
    "Show my token balances",
    "What was my best swap?",
    "Show my SOL transactions",
    "Is my portfolio well diversified?"
  ],
  "NFT Trade": [
    "What NFTs do I own now?",
    "Show my NFT trading history",
    "What's my most valuable NFT?",
    "Is my portfolio well diversified?"
  ],
  "NFT Mint": [
    "What NFTs do I own now?",
    "Show my NFT trading history",
    "What's my most valuable NFT?",
    "Is my portfolio well diversified?"
  ],
  "Analysis": [
    "Show my transactions",
    "What NFTs do I own?", 
    "Check my DeFi activity",
    "Show my token balances"
  ],
  "Default": [
    "How is my portfolio performing?",
    "Show my DeFi activity",
    "What tokens do I hold?",
    "Is my portfolio well diversified?"
  ]
};

// Wallet-related regex patterns
const WALLET_REQUEST_PATTERNS = {
  YES_CONNECT: /yes|connect|sure|okay/i,
  NO_CONNECT: /no|later|not now/i,
  WALLET_ADDRESS: /my wallet is|my address is|here's my wallet|here is my wallet|here is my address/i
};

// Wallet query patterns
const WALLET_QUERY_PATTERNS = [
  "last transaction",
  "recent transaction",
  "balance",
  "holdings",
  "analysis",
  "performance",
  "show my transactions",
  "nft",
  "collectible",
  /what.*own/  // Captures "What NFTs do I own?"
];

export default function ChatComponent({
  initialMessages = [],
  userWallet = null,
  className = "",
  onSendMessage,
  isFloating = false,
  onRequestWalletConnect,
  onMessagesUpdate,
}: ChatProps) {
  // State management
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
  const [blockAutoScroll, setBlockAutoScroll] = useState(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasUserInteracted = useRef(false);
  const initialMessageCount = useRef(initialMessages.length);

  // Helper functions
  const enableAutoScroll = () => {
    if (blockAutoScroll) {
      setBlockAutoScroll(false);
    }
  };

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
  
  const removeBotTyping = () =>
    setMessages((prev) => prev.filter((msg) => msg.text !== "..."));

  const addSuggestionButtons = (suggestions: string[]) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        text: "SUGGESTION_BUTTONS",
        sender: "bot",
        timestamp: getCurrentTime(),
        data: { suggestions },
      },
    ]);
  };

  // Core wallet functionalities
  const handleWalletDetected = () => {
    addMessage({
      text: `Detected wallet: ${userWallet?.slice(0, 6)}...${userWallet?.slice(-4)}. Analyzing...`,
      sender: "bot",
    });

    setTimeout(() => {
      addMessage({
        text: "Analysis complete! Here's what I can show you about your wallet:",
        sender: "bot",
      });

      // Add suggestion buttons
      setTimeout(() => {
        addSuggestionButtons(DEFAULT_WALLET_SUGGESTIONS);
      }, 1000);
    }, 2000);
  };

  const suggestWalletConnection = () => {
    if (!userWallet && !hasAskedForWallet) {
      addMessage({
        text: "To give you personalized information, I need access to your wallet. You have two options:",
        sender: "bot",
      });
      setTimeout(() => {
        addMessage({
          text: "1. Connect your wallet directly (recommended for better security)",
          sender: "bot",
        });
        setTimeout(() => {
          addMessage({
            text: "CONNECT_WALLET_BUTTON",
            sender: "bot",
            type: "wallet-connect",
          });
          setTimeout(() => {
            addMessage({
              text: "2. Or simply provide your wallet address (e.g. start with 'My wallet is...')",
              sender: "bot",
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
      sender: "bot",
    });
    setIsWaitingForWalletInput(true);
    setPendingWalletQuery(query);
  };

  // API communication
  const processWalletQuery = async (query: string, walletAddress: string) => {
    console.log(`[Chat] Processing query: ${query} for wallet: ${walletAddress.slice(0, 6)}...`);
    addBotTyping();

    try {
      console.log("[Chat] Sending request to API");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, walletAddress }),
      });

      if (!response.ok) {
        console.error(`[Chat] HTTP Error: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error(`[Chat] Error response: ${errorText}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }

      console.log("[Chat] Response received, analyzing JSON");
      const result = await response.json();
      console.log("[Chat] Data received:", result);

      removeBotTyping();

      // Check if wallet is required
      if (result.requireWallet) {
        console.log("[Chat] Wallet required");
        askForWalletAddress(query);
        return;
      }

      // Add response message
      console.log("[Chat] Adding response message");
      addMessage({
        text: result.response,
        sender: "bot",
        type: result.type,
        data: result.data,
      });
    } catch (error) {
      console.error("[Chat] Error processing request:", error);
      removeBotTyping();

      // Simple error message
      addMessage({
        text: "Sorry, an error occurred while analyzing your wallet. Please check the address and try again.",
        sender: "bot",
      });
    }
  };

  // Bot response generation
  const generateBotResponse = (text: string) => {
    const lowerText = text.toLowerCase();

    // Handle basic conversational responses
    if (/thank|thanks|ty/i.test(lowerText)) {
      return addMessage({
        text: `You're welcome${userName ? ", " + userName : ""}!`,
        sender: "bot",
      });
    }

    if (/hi|hello/i.test(lowerText)) {
      return addMessage({
        text: `Hello${userName ? ", " + userName : ""}!`,
        sender: "bot",
      });
    }

    // For all portfolio/wallet-related queries, route to API if wallet is available
    if (/asset|breakdown|portfolio|transaction|nft|collectible|defi|balance|holdings|performance|swap|stake/i.test(lowerText)) {
      if (userWallet) {
        return processWalletQuery(text, userWallet);
      } else if (tempWalletAddress) {
        return processWalletQuery(text, tempWalletAddress);
      } else {
        return askForWalletAddress(text);
      }
    }

    // For wallet performance/analytics
    if (/wallet.*(performance|month|analyze)/i.test(lowerText)) {
      if (userWallet || tempWalletAddress) {
        addMessage({ text: "Analyzing your wallet...", sender: "bot" });
        return processWalletQuery(text, userWallet || tempWalletAddress as string);
      } else {
        return addMessage({
          text: "I need your wallet connected first to analyze its performance.",
          sender: "bot",
        });
      }
    }

    // For investment recommendations
    if (/recommend|invest/i.test(lowerText)) {
      if (userWallet || tempWalletAddress) {
        const addressToUse = userWallet || tempWalletAddress;
        return processWalletQuery(text, addressToUse as string);
      } else {
        return addMessage({
          text: "Connect your wallet for personalized investment recommendations.",
          sender: "bot",
        });
      }
    }

    // Default response for anything else
    addMessage({
      text: `I'm still learning about that${userName ? ", " + userName : ""}. If you'd like to check your wallet, just provide your wallet address or connect directly.`,
      sender: "bot",
    });
  };

  // Message sending handler
  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Enable auto-scroll after user interaction
    enableAutoScroll();
    hasUserInteracted.current = true;

    const userText = input.trim();
    setInput("");
    addMessage({ text: userText, sender: "user" });

    // Handle onboarding flow
    if (onboardingStep === 0) {
      setUserName(userText);
      setOnboardingStep(1);
      setTimeout(() => {
        addMessage({
          text: `Hi ${userText}, great to meet you!`,
          sender: "bot",
        });
        userWallet
          ? addMessage({ text: "What can I help you with?", sender: "bot" })
          : suggestWalletConnection();
      }, 1000);
      return;
    }

    // Handle wallet address input flow
    if (isWaitingForWalletInput) {
      // Check if text looks like a Solana address (simplistic)
      if (userText.length >= 32 && userText.length <= 44) {
        setTempWalletAddress(userText);
        setIsWaitingForWalletInput(false);
        addMessage({
          text: `Thanks! I'll analyze wallet ${userText.slice(0, 6)}...${userText.slice(-4)}.`,
          sender: "bot",
        });
        
        // Process any pending query
        if (pendingWalletQuery) {
          setTimeout(() => {
            processWalletQuery(pendingWalletQuery, userText);
            setPendingWalletQuery(null);
          }, 1000);
        }
        return;
      } else {
        addMessage({
          text: "That doesn't look like a valid Solana address. Please provide a complete wallet address.",
          sender: "bot",
        });
        return;
      }
    }

    // Notify parent component
    if (onSendMessage) onSendMessage(userText);

    // Handle wallet connection dialog
    if (hasAskedForWallet && !userWallet) {
      if (WALLET_REQUEST_PATTERNS.YES_CONNECT.test(userText)) {
        addMessage({
          text: "Redirecting to connect your wallet...",
          sender: "bot",
        });
        setTimeout(() => onRequestWalletConnect?.(), 1000);
        return;
      } else if (WALLET_REQUEST_PATTERNS.NO_CONNECT.test(userText)) {
        addMessage({
          text: "No problem! Ask me anything about crypto or simply provide your wallet address.",
          sender: "bot",
        });
        return;
      } else if (WALLET_REQUEST_PATTERNS.WALLET_ADDRESS.test(userText)) {
        // Extract potential address - look for a 32-44 character string
        const addressMatch = userText.match(/[A-Za-z0-9]{32,44}/);
        if (addressMatch) {
          const walletAddress = addressMatch[0];
          setTempWalletAddress(walletAddress);
          addMessage({
            text: `Thanks! I've registered your wallet address: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}. You can now ask me for information about this wallet.`,
            sender: "bot",
          });

          // Add suggestion buttons
          setTimeout(() => {
            addSuggestionButtons(DEFAULT_WALLET_SUGGESTIONS);
          }, 1000);
          return;
        }
      }
    }

    // Check for wallet-related queries
    const lowerText = userText.toLowerCase();
    const isWalletQuery = WALLET_QUERY_PATTERNS.some(pattern => 
      typeof pattern === 'string' 
        ? lowerText.includes(pattern) 
        : pattern.test(lowerText)
    );

    if (isWalletQuery) {
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

    // Process other messages
    setTimeout(() => {
      addBotTyping();
      setTimeout(() => {
        removeBotTyping();
        generateBotResponse(userText);
      }, 1500);
    }, 500);
  };

  // UI Rendering components
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
        // Emit custom event for suggestions after viewing transactions
        if (typeof window !== "undefined" && data.transactions?.length > 0) {
          const txType = data.transactions[0]?.type || "Transfer";
          const event = new CustomEvent("suggestAfterTransactions", {
            detail: { transactionType: txType },
          });
          window.dispatchEvent(event);
        }
      }}
    />
  );

  const renderPortfolioAnalysis = (data: any) => (
    <div className="bg-white p-4 rounded-xl w-full my-2 border border-purple-200">
      <h3 className="text-purple-900 text-xl font-bold">
        Portfolio Diversification Analysis
      </h3>

      <div className="mt-3 space-y-3">
        <div className="flex flex-col">
          <div className="flex items-center mb-2">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                data.isDiversified ? "bg-green-500" : "bg-yellow-500"
              }`}
            ></div>
            <span className="font-medium">
              Diversification Status:{" "}
              {data.isDiversified ? "Good" : "Needs Improvement"}
            </span>
          </div>

          {data.tokenCount > 0 && (
            <>
              <p>
                You have{" "}
                <span className="font-medium">
                  {data.tokenCount} different tokens
                </span>{" "}
                in your wallet.
              </p>
              <p className="mt-1">
                Your largest holding represents{" "}
                <span className="font-medium">
                  {data.mainTokenPercentage}%
                </span>{" "}
                of your portfolio.
              </p>
              {data.totalValue > 0 && (
                <p className="mt-1">
                  Total portfolio value:{" "}
                  <span className="font-medium">
                    ${data.totalValue.toFixed(2)}
                  </span>
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-2">Recommendations:</h4>
          <ul className="space-y-1 list-disc pl-5">
            {data.recommendations?.map((rec: string, i: number) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            enableAutoScroll();
            // Suggest new actions after viewing analysis
            if (typeof window !== "undefined") {
              const event = new CustomEvent("suggestAfterTransactions", {
                detail: { transactionType: "Analysis" },
              });
              window.dispatchEvent(event);
            }
          }}
          className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );

  const renderNFTInfo = (data: any) => (
    <div className="bg-white p-4 rounded-xl w-full my-2 border border-purple-200">
      <h3 className="text-purple-900 text-xl font-bold">Your NFTs</h3>

      {!data.nfts || data.nfts.length === 0 ? (
        <p className="text-gray-700 mt-2">No NFTs found</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {data.nfts.map((nft: any, index: number) => (
            <div
              key={index}
              className="border rounded-lg p-2 flex flex-col items-center"
            >
              {/* NFT rendering code would go here */}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            enableAutoScroll();
            // Suggest new actions after viewing NFTs
            if (typeof window !== "undefined") {
              const event = new CustomEvent("suggestAfterTransactions", {
                detail: { transactionType: "NFT" },
              });
              window.dispatchEvent(event);
            }
          }}
          className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );

  const renderSuggestionButtons = (suggestions: string[]) => (
    <div className="flex flex-wrap gap-2 my-3 justify-center">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => {
            setInput(suggestion);
            // Enable auto-scroll when clicking a suggestion
            enableAutoScroll();
            handleSendMessage();
          }}
          className="bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-sm hover:bg-purple-200 transition"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );

  // useEffect hooks - organized by purpose

  // 1. Initial setup
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

  // 2. Wallet detection
  useEffect(() => {
    if (userWallet && !hasDetectedWallet && onboardingStep >= 1) {
      setHasDetectedWallet(true);
      handleWalletDetected();
    }
  }, [userWallet, onboardingStep, hasDetectedWallet]);

  // 3. Process pending wallet queries
  useEffect(() => {
    if (tempWalletAddress && pendingWalletQuery) {
      processWalletQuery(pendingWalletQuery, tempWalletAddress);
      setPendingWalletQuery(null);
    }
  }, [tempWalletAddress, pendingWalletQuery]);

  // 4. Scrolling behavior
  useEffect(() => {
    if (blockAutoScroll) return;

    const isNewMessage = messages.length > initialMessageCount.current;
    if (isNewMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      initialMessageCount.current = messages.length;
    }
  }, [messages, blockAutoScroll]);

  // 5. Suggestions after transactions
  useEffect(() => {
    const handleSuggestAfterTransactions = (event: Event) => {
      const customEvent = event as CustomEvent<{transactionType: string}>;
      const txType = customEvent.detail.transactionType;
      const suggestions = POST_TRANSACTION_SUGGESTIONS[txType as keyof typeof POST_TRANSACTION_SUGGESTIONS] || POST_TRANSACTION_SUGGESTIONS["Default"];
      addSuggestionButtons(suggestions);
    };

    window.addEventListener(
      "suggestAfterTransactions",
      handleSuggestAfterTransactions
    );

    return () => {
      window.removeEventListener(
        "suggestAfterTransactions",
        handleSuggestAfterTransactions
      );
    };
  }, []);

  // 6. Callback for parent components
  useEffect(() => {
    if (onMessagesUpdate) onMessagesUpdate(messages);
  }, [messages, onMessagesUpdate]);

  // Main rendering
  return (
    <div
      className={`font-serif ${
        isFloating ? "fixed bottom-4 right-4 z-20" : ""
      } ${className}`}
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
            <Image
              src="/img/bechill-head1.png"
              alt="BeChill"
              width={48}
              height={48}
              className="mr-3"
            />
            <h2 className="font-bold text-purple-900">beChill</h2>
          </div>

          <div className="h-150 overflow-y-auto p-4 space-y-4 bg-white/30 backdrop-blur-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === "bot" ? "justify-start" : "justify-end"
                } ${msg.text === "SUGGESTION_BUTTONS" ? "w-full" : ""}`}
              >
                {msg.text === "SUGGESTION_BUTTONS" && msg.data?.suggestions ? (
                  renderSuggestionButtons(msg.data.suggestions)
                ) : msg.type === "wallet-review" ? (
                  renderWalletReviewWidget()
                ) : msg.type === "wallet-connect" ? (
                  renderWalletConnectButton()
                ) : msg.type === "wallet-transaction" ? (
                  renderWalletTransactionInfo(msg.data)
                ) : msg.type === "wallet-nfts" ? (
                  renderNFTInfo(msg.data)
                ) : msg.type === "portfolio-analysis" ? (
                  renderPortfolioAnalysis(msg.data)
                ) : (
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.sender === "bot" ? "bg-white" : "bg-yellow-300"
                    } text-gray-800 shadow-sm`}
                  >
                    {msg.text}
                    <div className="text-xs mt-1 text-gray-500">
                      {msg.timestamp}
                    </div>
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