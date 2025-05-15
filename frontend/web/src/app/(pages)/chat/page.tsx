"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api"; // ou selon ton alias TS

import dayjs from "dayjs";

// Types
interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  time: string;
  intent?: string;
  confidence?: number;
}

interface UserProfile {
  name: string;
  goals: string;
  riskAppetite: string;
  type: string;
  ref: string;
  goalVibe: string;
  onboarded: boolean;
}

interface OnboardingStep {
  id: string;
  speaker: "chill" | "user";
  text: string;
  type: "info" | "input" | "button" | "llm";
  storeKey?: string;
  options?: { label: string; value: string; nextStep: string }[];
  nextStep?: string;
  callAnalytics?: boolean;
  callOnChainStub?: boolean;
  useRAG?: boolean;
  useLLM?: boolean;
  delayMs?: number;
}

// Données d'onboarding basées sur onboarding_flow.txt
const onboardingFlow: OnboardingStep[] = [
  {
    id: "start",
    speaker: "chill",
    text: "chill helps you get control over your crypto — and stay calm doing it.",
    type: "info",
    nextStep: "getStarted",
  },
  {
    id: "getStarted",
    speaker: "chill",
    text: "[ get started ]",
    type: "button",
    options: [{ label: "get started", value: "start", nextStep: "greetName" }],
  },
  {
    id: "greetName",
    speaker: "chill",
    text: "hey. i'm chill — your crypto peace coach.\nwhat should i call you?",
    type: "input",
    storeKey: "user.name",
    nextStep: "pickGoal",
  },
  {
    id: "pickGoal",
    speaker: "chill",
    text: "nice to meet you, [name].\nwhat's your main goal with crypto?",
    type: "button",
    options: [
      { label: "secure my wealth", value: "secure", nextStep: "getWallet" },
      { label: "grow it steadily", value: "grow", nextStep: "getWallet" },
      { label: "take big risks", value: "risk", nextStep: "getWallet" },
    ],
    storeKey: "user.goal",
  },
  {
    id: "getWallet",
    speaker: "chill",
    text: "got it. to help you stay on track, i need to look at your portfolio.\ni don't track or store anything — just analyze and give insights.\nthis is all local, all yours.",
    type: "button",
    options: [
      { label: "connect wallet", value: "connect", nextStep: "analyzeReal" },
      { label: "paste address", value: "paste", nextStep: "analyzeReal" },
      { label: "skip", value: "skip", nextStep: "skipped" },
    ],
    storeKey: "user.walletSource",
  },
  {
    id: "skipped",
    speaker: "chill",
    text: "ok, no stress. i'll show you an example with a public wallet.\nthis one belongs to a trader who wanted to grow steadily...",
    type: "info",
    delayMs: 1000,
    nextStep: "skipped2",
  },
  {
    id: "skipped2",
    speaker: "chill",
    text: "...but they've got 88% in altcoins. high volatility, no backup.\nnot really what you'd call \"steady growth\", right?",
    type: "info",
    nextStep: "analyzeSample",
  },
  {
    id: "analyzeReal",
    speaker: "chill",
    text: "scanning your assets...\nchecking for concentration, risk, and behavior...",
    type: "llm",
    callAnalytics: true,
    useRAG: true,
    useLLM: true,
    delayMs: 3000,
    nextStep: "analysisResult",
  },
  {
    id: "analyzeSample",
    speaker: "chill",
    text: "scanning sample assets...\nchecking for concentration, risk, and behavior...",
    type: "llm",
    callAnalytics: true,
    useRAG: true,
    useLLM: true,
    delayMs: 3000,
    nextStep: "analysisResult",
  },
  {
    id: "analysisResult",
    speaker: "chill",
    text: "You have 60% in ETH, 30% in stablecoins, 10% in altcoins. Your portfolio is moderately diversified, but could be more balanced for your goal.",
    type: "llm",
    useLLM: true,
    nextStep: "advice",
  },
  {
    id: "advice",
    speaker: "chill",
    text: "Suggestion: move 10% of ETH to a stablecoin — same potential, lower chaos. Want me to remind you later too?",
    type: "button",
    options: [
      { label: "do it", value: "do", nextStep: "onChain" },
      { label: "save suggestion", value: "save", nextStep: "chillScore" },
    ],
  },
  {
    id: "onChain",
    speaker: "chill",
    text: "Executing on-chain action...",
    type: "info",
    callOnChainStub: true,
    delayMs: 2000,
    nextStep: "chillScore",
  },
  {
    id: "chillScore",
    speaker: "chill",
    text: "based on what I saw, your current chill score is 75\na bit chaotic — but now you know.\nlet's work on raising it together.\n\n→ [ enter chill club ]",
    type: "button",
    options: [{ label: "enter chill club", value: "enter", nextStep: "end" }],
  },
  {
    id: "end",
    speaker: "chill",
    text: "Onboarding complete! Welcome to the main chat.",
    type: "info",
  },
];

// Configurations des profils
const profiles = [
  { label: "Anna", value: "anna.json", onboarded: true },
  { label: "Jack", value: "jack.json", onboarded: true },
  { label: "Jade", value: "jade.json", onboarded: true },
  { label: "Melody", value: "melody.json", onboarded: true },
  {
    label: "New User",
    value: "notonboarded_example_file.json",
    onboarded: false,
  },
];

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState("jack.json");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("start");
  const [userData, setUserData] = useState<Record<string, any>>({});
  const [walletConnectInput, setWalletConnectInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const sendMessage = useMutation(api.messages.sendMessage);
  const upsertProfile = useMutation(api.profile.upsertProfile);
  const messagesFromConvex = useQuery(api.messages.getMessages, { profile });

  // Utilisation de l'API réelle /api/chat (route.ts)
  const send = async () => {
  if (!input.trim()) return;
  const now = dayjs().format("HH:mm");

  // Ajoute le message côté client
  const userMessage = { role: 'user', text: input, time: now } as ChatMessage;
  setMessages((prev) => [...prev, userMessage]);
  await sendMessage({ ...userMessage, profile });

  setInput("");
  setIsTyping(true);

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userInput: input, profileName: profile }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    const replyTime = dayjs().format("HH:mm");
    const replyMessage = { role: 'assistant', text: data.reply || "Something went wrong.", time: replyTime } as ChatMessage;

    setMessages((prev) => [...prev, replyMessage]);
    await sendMessage({ ...replyMessage, profile });
  } catch (error) {
    const fallbackTime = dayjs().format("HH:mm");
    const fallback = {
      role: 'assistant',
      text: "I seem to be having connectivity issues. Let me help you once we're reconnected.",
      time: fallbackTime
    } as ChatMessage;

    setMessages((prev) => [...prev, fallback]);
    await sendMessage({ ...fallback, profile });
  } finally {
    setIsTyping(false);
  }
};


  // Vérifier si l'utilisateur a besoin d'onboarding au chargement
  useEffect(() => {
    // Réinitialiser les messages à chaque changement de profil
    setMessages([]);

    const checkOnboarding = async () => {
      // Vérifier dans la liste des profils
      const selectedProfile = profiles.find((p) => p.value === profile);
      if (
        selectedProfile &&
        !selectedProfile.onboarded &&
        profile === "notonboarded_example_file.json"
      ) {
        setIsOnboarding(true);
        processOnboardingStep("start");
      } else if (selectedProfile && selectedProfile.onboarded) {
        // Ajouter un message de bienvenue pour les utilisateurs déjà onboardés
        setTimeout(() => {
          const welcomeTime = dayjs().format("HH:mm");
          let welcomeMessage = `Hey there! I'm CHILL, your crypto coach. I'm here to help you keep it chill while navigating the crypto world. How can I assist you today?`;

          // Personnaliser le message si on connaît le nom
          if (selectedProfile.label !== "New User") {
            welcomeMessage = `Hey ${selectedProfile.label}! I'm CHILL, your crypto coach. How can I help you today?`;
          }

          setMessages([
            {
              role: "assistant",
              text: welcomeMessage,
              time: welcomeTime,
            },
          ]);
          if (messagesFromConvex && messagesFromConvex.length > 0) {
  setMessages(messagesFromConvex);
}

        }, 500);
      }
    };

    checkOnboarding();
  }, [profile]);

  // Fonction pour traiter une étape d'onboarding
  const processOnboardingStep = (stepId: string) => {
    const step = onboardingFlow.find((s) => s.id === stepId);
    if (!step) return;

    const now = dayjs().format("HH:mm");

    // Remplacer les variables dans le texte (ex: [name])
    let text = step.text;
    if (text.includes("[name]") && userData.name) {
      text = text.replace("[name]", userData.name);
    }

    // Ajouter le message de CHILL
    if (step.speaker === "chill") {
      setMessages((prev) => [...prev, { role: "assistant", text, time: now }]);

      // Si délai configuré, attendre avant de passer à l'étape suivante automatique
      if (step.delayMs && step.nextStep && !step.options) {
        setTimeout(() => {
          processOnboardingStep(step.nextStep as string);
        }, step.delayMs);
      }
    }

    // Mettre à jour l'étape courante
    setCurrentStep(stepId);
  };

  // Gestion des actions d'onboarding
  const handleOnboardingAction = (action: string, value?: string) => {
    const step = onboardingFlow.find((s) => s.id === currentStep);
    if (!step) return;

    // Si c'est une entrée de l'utilisateur
    if (step.type === "input" && value) {
      const now = dayjs().format("HH:mm");
      setMessages((prev) => [
        ...prev,
        { role: "user", text: value, time: now },
      ]);

      // Stocker la valeur si nécessaire
      if (step.storeKey) {
        const newUserData = { ...userData };
        if (step.storeKey === "user.name") newUserData.name = value;
        if (step.storeKey === "user.goal") newUserData.goal = value;
        if (step.storeKey === "user.walletSource")
          newUserData.walletSource = value;
        setUserData(newUserData);
      }

      // Passer à l'étape suivante
      if (step.nextStep) {
        setCurrentStep(step.nextStep);
        setTimeout(() => {
          processOnboardingStep(step.nextStep as string);
        }, 500);
      }
    }

    // Si c'est un bouton
    if (step.type === "button" && step.options) {
      const option = step.options.find((o) => o.value === action);
      if (!option) return;

      const now = dayjs().format("HH:mm");
      setMessages((prev) => [
        ...prev,
        { role: "user", text: option.label, time: now },
      ]);

      // Stocker la valeur si nécessaire
      if (step.storeKey) {
        const newUserData = { ...userData };
        if (step.storeKey === "user.goal") newUserData.goal = action;
        if (step.storeKey === "user.walletSource")
          newUserData.walletSource = action;
        setUserData(newUserData);
      }

      // Passer à l'étape suivante
      if (option.nextStep) {
        setCurrentStep(option.nextStep);
        setTimeout(() => {
          processOnboardingStep(option.nextStep);
        }, 500);
      }

      // Si c'est la fin de l'onboarding
      if (option.nextStep === "end") {
        setTimeout(() => {
          setIsOnboarding(false);
          // Sauvegarder les données d'onboarding
          saveOnboardingData();
        }, 2000);
      }
    }

    // Si c'est une saisie d'adresse de wallet
    if (action === "paste-wallet" && value) {
      const now = dayjs().format("HH:mm");
      setMessages((prev) => [
        ...prev,
        { role: "user", text: "Wallet: " + value, time: now },
      ]);
      setWalletConnectInput("");

      // Passer à l'étape suivante (analyzeReal)
      setCurrentStep("analyzeReal");
      setTimeout(() => {
        processOnboardingStep("analyzeReal");
      }, 500);
    }
  };

  // Sauvegarder les données d'onboarding
  const saveOnboardingData = async () => {
  try {
    await upsertProfile({
      profileName: profile,
      userData: {
        ...userData,
        onboarded: true,
      },
    });
  } catch (err) {
    console.error("Error saving onboarding to Convex:", err);
  }
};


  // Scroll automatique
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Rendu des options pour les étapes de type bouton
  const renderStepOptions = () => {
    const step = onboardingFlow.find((s) => s.id === currentStep);
    if (!step || step.type !== "button" || !step.options) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {step.options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleOnboardingAction(option.value)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm transition-colors"
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  };

  // Rendu de l'entrée pour le type 'input'
  const renderInputStep = () => {
    const step = onboardingFlow.find((s) => s.id === currentStep);
    if (!step || step.type !== "input") return null;

    return (
      <div className="flex gap-2 mt-2">
        <input
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleOnboardingAction("input", input);
          }}
        />
        <button
          onClick={() => handleOnboardingAction("input", input)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    );
  };

  // Rendu de l'entrée pour l'adresse de wallet (type spécifique)
  const renderWalletInput = () => {
    const step = onboardingFlow.find((s) => s.id === currentStep);
    if (!step || step.id !== "getWallet") return null;

    if (userData.walletSource === "paste") {
      return (
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste wallet address..."
            value={walletConnectInput}
            onChange={(e) => setWalletConnectInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                handleOnboardingAction("paste-wallet", walletConnectInput);
            }}
          />
          <button
            onClick={() =>
              handleOnboardingAction("paste-wallet", walletConnectInput)
            }
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">💬</span> BeChill AI Chat
          </h1>
          <div className="relative">
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-full px-4 py-1 pr-8 appearance-none cursor-pointer hover:bg-white/30 transition"
              disabled={isOnboarding}
            >
              {profiles.map((p) => (
                <option key={p.value} value={p.value} className="text-gray-800">
                  {p.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.length === 0 && !isOnboarding && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="text-5xl mb-2">👋</div>
              <p>Say hello to CHILL!</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl shadow-md ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                } p-3`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                      m.role === "user" ? "bg-blue-400" : "bg-blue-100"
                    }`}
                  >
                    {m.role === "user" ? "👤" : "🤖"}
                  </span>
                  <span
                    className={`text-xs ${m.role === "user" ? "text-blue-100" : "text-gray-500"}`}
                  >
                    {m.time}
                  </span>
                </div>
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl shadow-md bg-white text-gray-800 rounded-bl-none border border-gray-200 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100">
                    🤖
                  </span>
                  <span className="text-xs text-gray-500">typing...</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={scrollRef}></div>
        </div>

        {/* Onboarding options */}
        {isOnboarding && (
          <div className="p-4 border-t border-gray-200 bg-white">
            {renderStepOptions()}
            {renderInputStep()}
            {renderWalletInput()}
          </div>
        )}

        {/* Input area - hidden during onboarding */}
        {!isOnboarding && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask CHILL something..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
              />
              <button
                onClick={send}
                disabled={!input.trim()}
                className={`rounded-full w-10 h-10 flex items-center justify-center ${
                  input.trim()
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                } transition-colors`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 text-xs text-gray-500">
        Powered by BeChill AI • {dayjs().format("YYYY")}
      </div>
    </div>
  );
}
