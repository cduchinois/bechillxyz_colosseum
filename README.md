# CHILL: Crypto-Native Happiness Coach

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Install Ollama (Local LLM)
- Download and install Ollama from https://ollama.com/download
- Start the Ollama server:
```bash
ollama serve
```
- (Optional) Pull the required model, e.g.:
```bash
ollama pull llama3
```

### 3. Launch the Chat

#### With Onboarding Flow (new user)
```bash
npx tsx src/chat/index.ts user_profiles/notonboarded_example_file.json
```

#### Without Onboarding (returning user)
```bash
npx tsx src/chat/index.ts user_profiles/<username>.json
```

## Intent Classification
- The system classifies each user message as one of: `portfolio_query`, `onchain_action`, or `chat`.
- To test intent classification in batch:
```bash
npx tsx tests/batchIntentTest.ts
```
- The intent and confidence are logged for each test question.

## Chat History
- All chat sessions are appended to:
```
src/chat/chatHistory.json
```
- Each session includes user info and the full message history.

## Debug Mode
- To enable debug logs (e.g., LLM prompt logging), set `DEBUG = true` in `src/chat/llm.ts` and/or the intent classifier module.
- Save and rerun the chat to see detailed logs in the console.

---

# Task Advancement Report

[x] systemprompt + rag setted
[x] Intent classification module implemented and tested
[x] chat module live with Onboarding flow and chat
[ ]  Portfolio analytics and on-chain action modules
[ ] cloud deployment for ollama