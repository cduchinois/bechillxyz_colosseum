import { classifyIntent } from '../src/classification/classifyIntent';

const questions = [
  "What's the best way to earn passive income in crypto?",
  "How has my portfolio changed in the last 30 days?",
  "Buy $100 of SOL",
  "Can you explain what impermanent loss means?",
  "What are my worst performing tokens this week?",
  "I want to rebalance my portfolio",
  "Tell me a meme about BONK",
  "Send 10 USDC to my cold wallet",
  "What do you think of staking vs lending?",
  "How much is my wallet worth now?",
  "Stake all my SOL",
  "Can I borrow against my stSOL?",
  "Am I overexposed to volatile assets?",
  "Explain the risks of farming on Solana",
  "Swap all my airdropped tokens to USDC",
  "What should I do with my idle assets?",
  "What is a good portfolio allocation strategy for beginners?",
  "Help me optimize my portfolio for low risk",
  "What is the safest yield option right now?",
  "Compare my current allocation to my target",
];

(async () => {
  for (const q of questions) {
    const result = await classifyIntent(q);
    console.log(`Q: ${q}\n→ intent: ${result.intent} (confidence: ${result.confidence})\n`);
  }
})(); 