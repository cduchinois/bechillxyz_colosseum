// src/chat/solanaCommands.ts

import solanaService from '@/services/solanaService';

// Define types
interface SolanaCommandResult {
  type: 'tokens' | 'info' | 'error';
  content: string;
  metadata?: { address: string };
}

// Temporary memory for detected addresses
let lastDetectedAddress: string | null = null;

/**
 * Retrieves tokens for a given address
 */
async function getTokensForAddress(address: string): Promise<SolanaCommandResult> {
  try {
    // Analyze the address via the Solana service
    const result = await solanaService.analyzeAddress(address);
    
    // Format the results for the LLM
    const formattedContent = solanaService.formatTokensForLLM(result);
    
    return {
      type: 'tokens',
      content: formattedContent,
      metadata: { address }
    };
  } catch (error) {
    console.error("Error while fetching tokens:", error);
    return {
      type: 'error',
      content: `Failed to retrieve tokens for address ${address}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: { address }
    };
  }
}

/**
 * Detects Solana-related commands and responds accordingly
 */
async function handleSolanaCommand(message: string): Promise<SolanaCommandResult | null> {
  // Regex to detect Solana addresses
  const solanaAddressRegex = /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/;
  
  // Regex for explicit token commands
  const tokenCommandRegex = /\/tokens\s+([1-9A-HJ-NP-Za-km-z]{32,44})/i;
  
  // Clean up the message
  const cleanMessage = message.trim().toLowerCase();
  
  // Check if it's an explicit token command
  const tokenMatch = message.match(tokenCommandRegex);
  if (tokenMatch) {
    const address = tokenMatch[1];
    console.log(`Token command detected for address: ${address}`);
    return await getTokensForAddress(address);
  }
  
  // Check if the message contains a Solana address
  const addressMatch = message.match(solanaAddressRegex);
  const mentionsSolana = 
    cleanMessage.includes('solana') || 
    cleanMessage.includes('token') || 
    cleanMessage.includes('wallet') || 
    cleanMessage.includes('portfolio');
  
  // If the message contains an address and mentions Solana-related terms
  if (addressMatch && mentionsSolana) {
    const address = addressMatch[1];
    lastDetectedAddress = address;
    
    // If the message specifically mentions tokens
    if (cleanMessage.includes('token')) {
      return await getTokensForAddress(address);
    }
    
    // Otherwise, ask for confirmation
    return {
      type: 'info',
      content: `I detected a Solana address (${address}). Would you like to view this wallet's tokens? Reply "yes" or use the command "/tokens ${address}".`,
      metadata: { address }
    };
  }
  
  // Check if it's a confirmation for the previously detected address
  const isConfirmation = ['yes', 'oui', 'tokens', 'token'].includes(cleanMessage);
  if (lastDetectedAddress && isConfirmation) {
    const address = lastDetectedAddress;
    lastDetectedAddress = null; // Reset after use
    return await getTokensForAddress(address);
  }
  
  // No Solana command detected
  return null;
}

// Export only what we need
export { handleSolanaCommand };
