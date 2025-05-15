import fs from 'fs/promises';
import path from 'path';

export async function getContextDocs(docNames: string[]): Promise<string[]> {
  const base = path.join(__dirname, '../../assets/rag');
  const docs: string[] = [];
  for (const name of docNames) {
    try {
      const content = await fs.readFile(path.join(base, `${name}.md`), 'utf-8');
      docs.push(content);
    } catch (e) {
      // Ignore missing docs
    }
  }
  return docs;
} 