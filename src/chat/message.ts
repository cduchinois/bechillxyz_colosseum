export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  text: string;
  /**
   * Optional: Only present for user messages. The detected intent for this message.
   */
  intent?: string;
  /**
   * Optional: Only present for user messages. The confidence score for the detected intent.
   */
  confidence?: number;
}

export function formatMessage(msg: ChatMessage): string {
  return `${msg.role === 'user' ? 'You' : 'CHILL'}: ${msg.text}`;
} 