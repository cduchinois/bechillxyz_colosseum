import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOllama } from "@langchain/ollama";
import { classificationPrompt } from "./prompt";
import { IntentResult, Intent } from "./types";

const DEBUG = false; // Set to true to enable intent logs

// LangChain LLM setup
const ollama = new ChatOllama({
  model: "llama3",
  baseUrl: "http://localhost:11434",
  temperature: 0,
});

// Chain: prompt -> LLM -> output
const classifyChain = RunnableSequence.from([
  classificationPrompt,
  ollama,
  new StringOutputParser(),
]);

export async function classifyIntent(message: string): Promise<IntentResult> {
  try {
    if (DEBUG) console.log("[classifyIntent] Invoking with input:", message);
    if (DEBUG) console.log("[classifyIntent] Chain prompt structure:", await classificationPrompt.format({ input: message }));
    const result = await classifyChain.invoke({ input: message });
    if (DEBUG) console.log("[classifyIntent] Raw LLM output:", result);
    const label = result.trim().toLowerCase();

    if (["chat", "portfolio_query", "onchain_action"].includes(label)) {
      return { intent: label as Intent, confidence: 0.9 };
    }
  } catch (err) {
    if (DEBUG) console.error("Intent classification failed:", err);
  }

  // Fallback
  return { intent: "chat", confidence: 0.6 };
}

export type { IntentResult }; 