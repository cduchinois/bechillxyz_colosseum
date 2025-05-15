import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

/**
 * @fileoverview Script d'analyse des mouvements de tokens dans les activités DeFi sur Solana
 * 
 * Ce script analyse les mouvements de tokens (entrées/sorties) à partir des données d'activités
 * et produit des statistiques détaillées sur l'utilisation des différents tokens.
 * 
 * Formats de données supportés:
 * 1. Format principal (acc_defi_activities.js) : 
 *    { "success": boolean, "data": [...] }
 * 
 * 2. Format secondaire (analyze_activities_detailed.js) :
 *    { "activity_types": {...}, "platforms": {...}, "tokens_metadata": {...} }
 */

/**
 * Normalise les données d'entrée pour s'adapter à différents formats de fichiers JSON
 * @param {Object} rawData - Données brutes à normaliser
 * @returns {Object} - Données normalisées
 */
function normalizeData(rawData) {
  // Structure pour stocker les données normalisées
  const normalizedData = {
    activities: [],    // Liste des activités individuelles (si disponible)
    metadata: {        // Métadonnées
      tokens: {}
    },
    totalTransactions: 0
  };

  // Format 1: Données brutes de l'API (via acc_defi_activities.js)
  if (rawData.data && Array.isArray(rawData.data)) {
    console.log('📊 Format de données API détecté');
    normalizedData.activities = rawData.data;
    normalizedData.metadata.tokens = rawData.metadata?.tokens || {};
    normalizedData.totalTransactions = rawData.data.length;
    
    return normalizedData;
  } 
  // Format 2: Données agrégées (via analyze_activities_detailed.js)
  else if (rawData.tokens_metadata) {
    console.log('📊 Format de données agrégées détecté');
    
    // Dans ce format, nous n'avons pas d'activités individuelles, donc ne pouvons pas analyser les mouvements
    normalizedData.metadata.tokens = rawData.tokens_metadata || {};
    normalizedData.totalTransactions = rawData.total_transactions || 0;
    
    throw new Error('Ce format de données ne contient pas les informations détaillées nécessaires ' +
      'pour analyser les mouvements des tokens. Veuillez utiliser acc_defi_activities.js pour ' +
      'générer les données brutes nécessaires.');
  } 
  // Format non reconnu
  else {
    throw new Error('Format de données non reconnu. Exécutez acc_defi_activities.js pour générer les données correctes.');
  }
}

async function analyzeTokenMovements() {
  try {
    // Récupérer l'adresse du portefeuille depuis les arguments de ligne de commande
    const args = process.argv.slice(2);
    const walletAddress = args[0] || process.env.ADDRESS_WALLET;
    
    if (!walletAddress) {
      console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node analyze_token_movements.js ADDRESS_WALLET');
      return;
    }
    
    // Vérifier si un fichier spécifique à ce portefeuille existe déjà
    const specificOutputFile = `output/activities_detailed_summary_${walletAddress}.json`;
    
    if (!existsSync(specificOutputFile)) {
      console.error(`❌ Erreur: Le fichier ${specificOutputFile} n'existe pas.`);
      console.error('Exécutez d\'abord acc_defi_activities.js avec cette adresse de portefeuille.');
      return;
    }
    
    console.log(`💡 Utilisation du fichier spécifique au portefeuille: ${specificOutputFile}`);
    const data = await readFile(specificOutputFile, 'utf8');
    
    // Récupérer et valider les données
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError.message);
      console.error('Le fichier ne contient pas de JSON valide.');
      return;
    }
    
    // Normaliser les données pour s'adapter à différents formats
    let normalizedData;
    try {
      normalizedData = normalizeData(jsonData);
    } catch (error) {
      console.error(`❌ ${error.message}`);
      return;
    }
    
    // Obtenir les métadonnées des tokens
    const tokenMetadata = normalizedData.metadata.tokens || {};
    
    // Structure pour suivre les mouvements par token
    const tokenMovements = {};
    
    // Analyser chaque transaction
    normalizedData.activities.forEach(activity => {
      if (!activity.routers) return;
      
      const { token1, token1_decimals, amount1, token2, token2_decimals, amount2 } = activity.routers;
      
      // Traiter le token1 (généralement le token vendu/envoyé)
      if (token1) {
        if (!tokenMovements[token1]) {
          tokenMovements[token1] = {
            symbol: tokenMetadata[token1]?.token_symbol || token1.substring(0, 8) + '...',
            name: tokenMetadata[token1]?.token_name || 'Unknown Token',
            decimals: token1_decimals,
            totalAmount: 0,
            transactions: 0,
            swapIn: 0,
            swapOut: 0,
            activities: {}
          };
        }
        
        // Considérer cela comme un "swap out" (nous avons vendu ce token)
        tokenMovements[token1].totalAmount += parseFloat(amount1) / Math.pow(10, token1_decimals);
        tokenMovements[token1].transactions++;
        tokenMovements[token1].swapOut++;
        
        // Compter le type d'activité
        const actType = activity.activity_type;
        tokenMovements[token1].activities[actType] = (tokenMovements[token1].activities[actType] || 0) + 1;
      }
      
      // Traiter le token2 (généralement le token acheté/reçu) s'il existe
      if (token2) {
        if (!tokenMovements[token2]) {
          tokenMovements[token2] = {
            symbol: tokenMetadata[token2]?.token_symbol || token2.substring(0, 8) + '...',
            name: tokenMetadata[token2]?.token_name || 'Unknown Token',
            decimals: token2_decimals,
            totalAmount: 0,
            transactions: 0,
            swapIn: 0,
            swapOut: 0,
            activities: {}
          };
        }
        
        // Considérer cela comme un "swap in" (nous avons acheté ce token)
        tokenMovements[token2].totalAmount += parseFloat(amount2) / Math.pow(10, token2_decimals);
        tokenMovements[token2].transactions++;
        tokenMovements[token2].swapIn++;
        
        // Compter le type d'activité
        const actType = activity.activity_type;
        tokenMovements[token2].activities[actType] = (tokenMovements[token2].activities[actType] || 0) + 1;
      }
    });
    
    // Construire l'objet de sortie
    const summary = {
      totalTransactions: normalizedData.totalTransactions,
      tokenMovements,
      byVolume: Object.entries(tokenMovements)
        .map(([address, data]) => ({
          address,
          symbol: data.symbol,
          name: data.name,
          totalVolume: data.totalAmount,
          transactions: data.transactions,
          swapsIn: data.swapIn,
          swapsOut: data.swapOut,
          // Ajouter des informations plus précises
          decimals: data.decimals,
          transactionCount: data.transactions, // Pour la compatibilité
          percentage: 0 // Sera calculé ci-dessous
        }))
        .sort((a, b) => b.totalVolume - a.totalVolume)
    };
    
    // Calculer le pourcentage pour chaque token
    const totalVolume = summary.byVolume.reduce((sum, token) => sum + token.totalVolume, 0);
    summary.byVolume = summary.byVolume.map(token => ({
      ...token,
      percentage: ((token.totalVolume / totalVolume) * 100).toFixed(1) + '%'
    }));
    
    // Ajouter byTransactionCount pour le tri par nombre de transactions
    summary.byTransactionCount = [...summary.byVolume].sort((a, b) => b.transactions - a.transactions);
    
    // Préparer le chemin du fichier avec l'adresse du portefeuille
    const outputFile = `output/token_movements_${walletAddress}.json`;
    
    // Écrire les résultats dans le fichier
    await writeFile(outputFile, JSON.stringify(summary, null, 2));
    console.log(`✅ Analyse des mouvements de tokens terminée. Résultats écrits dans ${outputFile}`);
    
    // Afficher un résumé concis dans la console
    console.log(`\n📊 Résumé des mouvements de tokens:`);
    console.log(`- Nombre total de transactions: ${summary.totalTransactions}`);
    console.log(`- Tokens différents utilisés: ${Object.keys(tokenMovements).length}`);
    
    // Afficher les tokens par volume
    console.log('\n💱 Tokens par volume total:');
    summary.byVolume.slice(0, 10).forEach((token, index) => {
      console.log(`${index + 1}. ${token.symbol} (${token.name}): ${token.totalVolume.toLocaleString()} unités natives, ${token.transactions} transactions (${token.percentage} du volume total)`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse des mouvements de tokens:', error);
    console.error('Détails:', error.stack || error.message);
  }
}

// Exécuter la fonction d'analyse
analyzeTokenMovements();
