/**
 * Formate les transactions pour l'affichage dans le tableau d'historique
 */
import { getTokenNameFromMint } from "@/lib/tokenMap";

export const formatTransactionsForDashboard = (txHistory: any[]) => {
  if (!txHistory || !Array.isArray(txHistory)) return [];
  
  return txHistory.map(tx => {
    try {
      const date = new Date(tx.blockTime * 1000);
      const formattedDate = date.toLocaleDateString('fr-FR', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      let direction = 'out';
      let amount = '0.00';
      let tokenSymbol = 'SOL';
      let to = '';
      
      // Vérifier si les propriétés nécessaires existent
      if (tx.transaction && tx.transaction.message && tx.transaction.message.accountKeys) {
        to = tx.transaction.message.accountKeys[0].pubkey || 'Adresse inconnue';
      }
      
      return {
        date: formattedDate,
        type: 'Transfer',
        direction,
        amount: `${amount} ${tokenSymbol}`,
        to,
        timestamp: date.getTime()
      };
    } catch (error) {
      console.error('Erreur lors du formatage de la transaction:', error);
      return {
        date: new Date().toLocaleDateString('fr-FR'),
        type: 'Unknown',
        direction: 'out',
        amount: '? SOL',
        to: 'Unknown',
        timestamp: Date.now()
      };
    }
  }).sort((a, b) => b.timestamp - a.timestamp);
};

export const getAssetColor = (symbol: string) => {
  const name = getTokenNameFromMint(symbol) || symbol;
  switch (name.toLowerCase()) {
    case "solana":
      return "bg-[#7036cd]";
    case "jupiter":
      return "bg-[#FFFF4F]";
    case "bonk":
      return "bg-white border border-gray-300";
    default:
      return "bg-gray-300";
  }
};

export const getAssetColorValue = (symbol: string) => {
  const name = getTokenNameFromMint(symbol) || symbol;
  switch (name.toLowerCase()) {
    case "solana":
      return "#7036cd";
    case "jupiter":
      return "#FFFF4F";
    case "bonk":
      return "white";
    default:
      return "gray";
  }
};
