import { describe, it, expect } from 'vitest';
import { classifyIntent } from '../src/classification/classifyIntent';
import { Intent } from '../src/classification/types';

const cases: { input: string; expected: Intent }[] = [
  { input: "Tell me a joke about staking", expected: "chat" },
  { input: "What is the best staking strategy?", expected: "chat" },
  { input: "Swap 50% of my BONK to USDC", expected: "onchain_action" },
  { input: "Can you stake my USDC?", expected: "onchain_action" },
  { input: "How is my portfolio doing?", expected: "portfolio_query" },
  { input: "Compare my portfolio to my target", expected: "portfolio_query" },
];

describe("Integration test: classifyIntent with real LLM", () => {
  for (const { input, expected } of cases) {
    it(`should classify "${input}" as ${expected}`, async () => {
      const result = await classifyIntent(input);
      console.log(`🧪 "${input}" → ${result.intent} (${result.confidence})`);
      expect(result.intent).toBe(expected);
      expect(result.confidence).toBeGreaterThan(0.75);
    });
  }
}); 