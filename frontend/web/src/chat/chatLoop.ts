import { runOnboarding } from './onboarding';
import { classifyIntent } from '../intent/classifyIntent';
import { loadSystemPrompt } from './systemPrompt';
import { ChatMessage } from './message';
import { generateLLMResponse } from './llm';
import { getContextDocs } from './context';
import readline from 'readline';
import fs from 'fs/promises';
import path from 'path';

export interface UserProfile {
  name: string;
  goals: string;
  riskAppetite: string;
  type: string;
  ref: string;
  goalVibe: string;
  onboarded: boolean;
}

export interface ChatSession {
  user: UserProfile;
  history: ChatMessage[];
  onboarded: boolean;
}

function contextDocsForIntent(intent: string): string[] {
  if (intent === 'portfolio_query') return ['faq'];
  if (intent === 'onchain_action') return ['compliance'];
  if (intent === 'chat') return ['behavior'];
  return [];
}

// 🟩 La fonction exportée que tu veux utiliser
export async function startChatSession() {
  const userProfilePath = process.argv[2];
  if (!userProfilePath) {
    console.error("Please provide a user profile path, e.g.: user_profiles/jack.json");
    process.exit(1);
  }

  let userProfile: UserProfile;
  try {
    const raw = await fs.readFile(userProfilePath, 'utf-8');
    userProfile = JSON.parse(raw);
  } catch (err) {
    console.error("❌ Failed to load user profile:", err);
    process.exit(1);
  }

  const session: ChatSession = {
    user: userProfile,
    history: [],
    onboarded: userProfile.onboarded,
  };

  if (!session.onboarded) {
    await runOnboarding(session);
    session.onboarded = true;
    session.user.onboarded = true;
  }

  const systemPrompt = await loadSystemPrompt();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = () => {
    rl.question('🧑 You: ', async (input) => {
      if (input.trim().toLowerCase() === 'exit') {
        rl.close();
        await saveChatHistory(session);
        console.log("💾 Chat saved. Goodbye!");
        return;
      }

      const intentResult = await classifyIntent(input);
      session.history.push({
        role: 'user',
        text: input,
        intent: intentResult.intent,
        confidence: intentResult.confidence,
      });

      const contextDocs = await getContextDocs(contextDocsForIntent(intentResult.intent));
      const response = await generateLLMResponse({
        systemPrompt,
        context: contextDocs,
        history: session.history,
        userInput: input,
        userInfo: session.user,
        intent: intentResult.intent,
      });

      session.history.push({ role: 'assistant', text: response });
      console.log(`🤖 CHILL: ${response}`);
      ask();
    });
  };

  ask();
}

// 🔁 Fonction pour sauvegarder l’historique
async function saveChatHistory(session: ChatSession) {
  const filePath = path.join(__dirname, 'chatHistory.json');
  let allSessions: ChatSession[] = [];

  try {
    const existing = await fs.readFile(filePath, 'utf-8');
    allSessions = JSON.parse(existing);
    if (!Array.isArray(allSessions)) allSessions = [];
  } catch {
    // ignore errors, start fresh
  }

  allSessions.push(session);
  await fs.writeFile(filePath, JSON.stringify(allSessions, null, 2), 'utf-8');
}

// 🧠 Fonction modulaire pour API / usage React
export async function chatLoop(userInput: string, userProfile: UserProfile): Promise<string> {
  const session: ChatSession = {
    user: userProfile,
    history: [],
    onboarded: userProfile.onboarded,
  };

  if (!session.onboarded) {
    await runOnboarding(session);
    session.onboarded = true;
    session.user.onboarded = true;
  }

  const systemPrompt = await loadSystemPrompt();

  const intentResult = await classifyIntent(userInput);

  session.history.push({
    role: 'user',
    text: userInput,
    intent: intentResult.intent,
    confidence: intentResult.confidence,
  });

  const contextDocs = await getContextDocs(contextDocsForIntent(intentResult.intent));

  const response = await generateLLMResponse({
    systemPrompt,
    context: contextDocs,
    history: session.history,
    userInput,
    userInfo: session.user,
    intent: intentResult.intent,
  });

  session.history.push({ role: 'assistant', text: response });

  return response;
}
