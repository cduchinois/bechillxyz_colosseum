import fs from 'fs/promises';
import path from 'path';

export async function loadSystemPrompt(): Promise<string> {
  const promptPath = path.join(__dirname, '../../assets/system_prompt.txt');
  return fs.readFile(promptPath, 'utf-8');
} 