import { runOnboarding } from './onboarding';
import { classifyIntent } from '../classification/classifyIntent';
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

export async function startChatSession() {
  // Get user profile path from command line
  const userProfilePath = process.argv[2];
  if (!userProfilePath) {
    console.error('Please provide a user profile file path as the first argument.');
    process.exit(1);
  }
  let userProfile: UserProfile;
  try {
    const profileRaw = await fs.readFile(userProfilePath, 'utf-8');
    userProfile = JSON.parse(profileRaw);
  } catch (err) {
    console.error('Failed to load user profile:', err);
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
    // Write new user profile file after onboarding
    if (session.user.name && session.user.name.trim() !== '') {
      const safeName = session.user.name.trim().toLowerCase().replace(/\s+/g, '');
      const newProfilePath = path.join(__dirname, '../../user_profiles', `${safeName}.json`);
      try {
        await fs.writeFile(newProfilePath, JSON.stringify(session.user, null, 2), 'utf-8');
        // (No user-facing log)
      } catch (err) {
        console.error('Failed to save user profile:', err);
      }
    }
    // Print a dynamic initial prompt from CHILL
    const greetings = [
      `Welcome back! What's on your mind today?`,
      `Hi ${session.user.name}. feel free to ask chill anything about your portfolio, to do an onchain action, or just chill!`,
      `Ready to explore your portfolio and the space to grow? Ask chill anything!`
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    console.log(`\nCHILL: ${greeting}\n`);
  } else {
    console.log(`Welcome back, ${session.user.name}! How can I help you today?`);
  }

  // Load system prompt
  const systemPrompt = await loadSystemPrompt();

  // CLI setup
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = () => {
    rl.question('You: ', async (input) => {
      if (input.trim().toLowerCase() === 'exit') {
        rl.close();
        // Save chat session to a single file as an array of sessions
        try {
          const filePath = path.join(__dirname, 'chatHistory.json');
          let allSessions = [];
          try {
            const existing = await fs.readFile(filePath, 'utf-8');
            allSessions = JSON.parse(existing);
            if (!Array.isArray(allSessions)) allSessions = [];
          } catch (err) {
            // File does not exist or is invalid, start fresh
            allSessions = [];
          }
          allSessions.push(session);
          await fs.writeFile(filePath, JSON.stringify(allSessions, null, 2), 'utf-8');
          console.log(`Chat session appended to: ${filePath}`);
        } catch (err) {
          console.error('Failed to save chat session:', err);
        }
        return;
      }
      // Classify intent
      const intentResult = await classifyIntent(input);
      // Add user message to history, including intent and confidence
      session.history.push({ role: 'user', text: input, intent: intentResult.intent, confidence: intentResult.confidence });
      // Retrieve context docs
      const contextDocs = await getContextDocs(contextDocsForIntent(intentResult.intent));
      // Generate LLM response
      const response = await generateLLMResponse({
        systemPrompt,
        context: contextDocs,
        history: session.history,
        userInput: input,
        userInfo: session.user,
        intent: intentResult.intent,
      });
      session.history.push({ role: 'assistant', text: response });
      console.log(`CHILL: ${response}`);
      ask();
    });
  };
  ask();
} 