/**
 * @fileoverview Ce script démontre le format de données attendu par les scripts d'analyse
 * 
 * Il s'agit d'un exemple éducatif pour comprendre la structure des données
 * à utiliser avec analyze_activities_advanced.js
 */

// Format de données généré par acc_defi_activities.js
const apiDataFormat = {
  "success": true,
  "data": [
    {
      "block_id": 123456789,
      "trans_id": "abc123xyz",
      "block_time": 1624275428,
      "activity_type": "ACTIVITY_TOKEN_SWAP",
      "from_address": "SolanaWalletAddress123",
      "sources": ["PlatformContractAddress"],
      "platform": ["JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4"],
      "value": 10.5,
      "routers": {
        "token1": "So11111111111111111111111111111111111111112", // SOL
        "token1_decimals": 9,
        "amount1": 1000000000,
        "token2": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        "token2_decimals": 6,
        "amount2": 10500000,
        "child_routers": []
      },
      "time": "2021-06-21T12:30:28.000Z"
    }
  ],
  "metadata": {
    "tokens": {
      "So11111111111111111111111111111111111111112": {
        "token_symbol": "WSOL",
        "token_name": "Wrapped SOL",
        "token_decimals": 9
      },
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": {
        "token_symbol": "USDC",
        "token_name": "USD Coin",
        "token_decimals": 6
      }
    }
  }
};

/**
 * Comment utiliser les données:
 * 
 * 1. acc_defi_activities.js récupère les données de l'API Solscan et les enregistre au format ci-dessus.
 * 2. analyze_activities_advanced.js lit ce fichier et traite les données pour en extraire des statistiques.
 * 
 * Le format normalisé interne utilisé par analyze_activities_advanced.js ressemble à:
 * {
 *   activitiesData: [...], // Tableau contenant les activités
 *   metadata: { tokens: {...} } // Métadonnées sur les tokens
 * }
 * 
 * Pour assurer la compatibilité, utilisez toujours acc_defi_activities.js pour générer les données
 * ou suivez strictement le format de données ci-dessus.
 */

// Exemple d'utilisation de la fonction normalizeActivityData
function normalizeActivityData(rawData) {
  // Structure de retour standard
  const normalizedData = {
    activitiesData: [],
    metadata: { tokens: {} }
  };

  // Format principal: données directes de l'API
  if (rawData.data && Array.isArray(rawData.data)) {
    normalizedData.activitiesData = rawData.data;
    normalizedData.metadata = rawData.metadata || { tokens: {} };
    return normalizedData;
  } 
  
  // Gérer d'autres formats potentiels ici...
  
  // Format non reconnu
  throw new Error('FORMAT_INCONNU', 'Structure de données incorrecte');
}

// Ce fichier est fourni uniquement à des fins éducatives.
console.log("Ce script est un exemple de format de données, il n'est pas destiné à être exécuté directement.");
