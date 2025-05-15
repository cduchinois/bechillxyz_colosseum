export type Intent = 'chat' | 'portfolio_query' | 'onchain_action';

export interface IntentResult {
  intent: Intent;
  confidence: number;
} 