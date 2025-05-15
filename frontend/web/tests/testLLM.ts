// Uses native fetch API (Node.js 18+ required)
import { ChatMessage } from '../src/chat/message';

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3';
const DEBUG = false; // Set to false to disable prompt logging

export async function generateLLMResponse({
  systemPrompt,
  context = [],
  history = [],
  userInput,
  userInfo,
  intent,
}: {
  systemPrompt: string;
  context?: string[];
  history?: ChatMessage[];
  userInput: string;
  userInfo: { name: string; goals: string; riskAppetite: string };
  intent: string;
}): Promise<string> {
  let prompt = `${systemPrompt}\n`;

  // Add user info
  prompt += `\nUser Info:\nName: ${userInfo.name}\nGoals: ${userInfo.goals}\nRisk Appetite: ${userInfo.riskAppetite}\n`;

  // Add intent-specific instruction
  if (intent === 'portfolio_query') {
    prompt += `\nInstruction:\n- Respond as CHILL, your calm crypto-native guide.\n- Be brief and emotionally smart. 1–2 clear insights only.\n- No name repetition. No motivational speeches.\n- Use light emoji only if emotionally helpful, and never at the start of a sentence.\n`;
  } else if (intent === 'chat') {
    prompt += `\nInstruction:\n- Respond in a short, emotionally aware tone.\n- If the user shares a loss, acknowledge it gently and shift toward action.\n- Don't over-coach or ask vague reflection questions.\n- Focus on helping the user regain clarity or control.\n`;
  } else if (intent === 'onchain_action') {
    prompt += `\nInstruction:\n- Only ask for confirmation if the action involves a transaction (e.g., swap, stake).\n- Do not ask for confirmation before read-only actions like viewing balances.\n- Use clear, non-custodial phrasing.\n`;
  }

  if (context.length) {
    prompt += `\nContext:\n${context.join('\n---\n')}\n`;
  }
  if (history.length) {
    prompt += '\nChat history:\n';
    for (const msg of history) {
      prompt += `${msg.role === 'user' ? 'User' : 'CHILL'}: ${msg.text}\n`;
    }
  }
  prompt += `\nUser: ${userInput}\nCHILL:`;

  // Debug: log the full prompt only if DEBUG is true
  if (DEBUG) {
    console.log("[LLM PROMPT]", prompt);
  }

  const res = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, prompt, stream: false, max_tokens: 150, temperature: 0.2, top_p: 0.9 }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.response?.trim() || '';
} 