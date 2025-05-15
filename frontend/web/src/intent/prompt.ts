import {
  ChatPromptTemplate,
} from "@langchain/core/prompts";

export const classificationPrompt = ChatPromptTemplate.fromMessages([
  ["system", `You are CHILL's intent classification assistant.

Classify user messages into one of:

- chat: general crypto knowledge, opinions, educational questions, or jokes — not about the user's wallet or any action
- portfolio_query: specific to the user's wallet, holdings, performance, asset insights. portfolio_query includes any question that refers to your portfolio, even indirectly, such as optimization, risk exposure, or idle assets.
- onchain_action: user wants to perform a blockchain action like swap, stake, send, claim, etc.

Only reply with one of: chat, portfolio_query, onchain_action
`],
  // Few-shot examples
  ["user", "What is the best staking strategy?"],
  ["assistant", "chat"],
  ["user", "How is my staking performance doing?"],
  ["assistant", "portfolio_query"],
  ["user", "Can you stake my USDC?"],
  ["assistant", "onchain_action"],
  ["user", "Am I overexposed to volatile assets?"],
  ["assistant", "portfolio_query"],
  ["user", "What should I do with my idle assets?"],
  ["assistant", "portfolio_query"],
  ["user", "Help me optimize my portfolio for low risk"],
  ["assistant", "portfolio_query"],
  // Actual input
  ["user", "Classify this message: {input}"],
]); 