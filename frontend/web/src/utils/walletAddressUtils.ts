/**
 * Utilitaires pour la gestion des adresses de portefeuille
 */

// Adresse Solana de test pour remplacer les adresses Ethereum
const DEFAULT_SOLANA_ADDRESS = '6QU5GxYgQbCi87FHwJfk8BuSLZM4SxEvpdswrFXx5pSe';

/**
 * Normalise une adresse Ethereum en adresse Solana pour l'API
 */
export const normalizeSolanaAddress = (address: string | null): string => {
  if (!address) return DEFAULT_SOLANA_ADDRESS;
  
  // Si c'est une adresse Ethereum (commence par 0x), retourner l'adresse de test
  if (address.startsWith('0x')) {
    return DEFAULT_SOLANA_ADDRESS;
  }
  
  // Sinon retourner l'adresse telle quelle
  return address;
};

/**
 * Formate une adresse pour l'affichage (pour les composants UI)
 */
export const formatWalletAddress = (address: string | null): string => {
  if (!address) return '';
  
  // Supprimer le préfixe 0x pour les adresses Ethereum
  const cleanAddress = address.startsWith('0x') ? address.substring(2) : address;
  
  // Afficher uniquement le début et la fin
  return `${cleanAddress.substring(0, 4)}...${cleanAddress.substring(cleanAddress.length - 4)}`;
};