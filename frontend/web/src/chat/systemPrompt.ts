import fs from "fs/promises";
import path from "path";

export async function loadSystemPrompt(): Promise<string> {
  const promptPath = path.resolve("public/assets/rag/system_prompt.txt");
  const prompt = await fs.readFile(promptPath, "utf-8");
  return prompt;
}
