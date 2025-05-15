import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { SolscanApiClient, DataUtils } from './utils/api_client.js';

/**
 * Estime la valeur en USD des activités DeFi enregistrées
 * 
 * Note: Ce module est optionnel et tente d'estimer la valeur USD 
 * mais n'affectera pas les fonctionnalités principales
 */
async function estimateUsdValues() {
  try {
    console.log('💲 Estimation des valeurs USD pour les activités...');
    
    // Récupérer l'adresse du portefeuille depuis les arguments de ligne de commande
    const args = process.argv.slice(2);
    const walletAddress = args[0] || process.env.ADDRESS_WALLET;
    
    if (!walletAddress) {
      console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node estimate_usd_value.js ADDRESS_WALLET');
      return;
    }
    
    // Créer une instance de l'API client
    const api = new SolscanApiClient();
    
    // Préparer le chemin du fichier spécifique au portefeuille
    const walletSpecificInputFile = `./output/token_movements_${walletAddress}.json`;
    
    // Vérifier si le fichier existe
    if (!existsSync(walletSpecificInputFile)) {
      console.error(`❌ Erreur: Le fichier ${walletSpecificInputFile} n'existe pas.`);
      console.error('Exécutez d\'abord analyze_token_movements.js avec cette adresse de portefeuille.');
      return;
    }
    
    console.log(`💡 Utilisation du fichier spécifique au portefeuille: ${walletSpecificInputFile}`);
    const tokenMovementsData = await DataUtils.loadFromJson(walletSpecificInputFile, { 
      tokenMovements: {},
      byVolume: []
    });
    
    // Charger les métadonnées des tokens spécifiques au portefeuille
    const platformsSummaryFile = `./output/platforms_summary_${walletAddress}.json`;
    
    if (!existsSync(platformsSummaryFile)) {
      console.warn(`⚠️ Le fichier ${platformsSummaryFile} n'existe pas. Exécutez d'abord analyze_platforms.js avec cette adresse.`);
    }
    
    const platformsData = existsSync(platformsSummaryFile) 
      ? await DataUtils.loadFromJson(platformsSummaryFile, { tokenMetadata: {} })
      : { tokenMetadata: {} };
    
    // Extraire les adresses de tokens pour les principales activités
    const topTokenAddresses = tokenMovementsData.byVolume
      .slice(0, 20)  // limiter aux 20 tokens les plus utilisés
      .map(token => token.address);
      
    console.log(`⏳ Récupération des prix pour ${topTokenAddresses.length} tokens les plus utilisés...`);
    
    // Obtenir les prix des tokens
    const tokenPrices = await api.getMultipleTokenPrices(topTokenAddresses);
    
    // Afficher les données complètes avec une indentation de 2 espaces
    console.log('Token prices full data:');
    console.log(JSON.stringify(tokenPrices, null, 2));
    
    // Parcourir et afficher les prix individuels correctement
    console.log('\nPrix des tokens individuels:');
    for (const [address, priceData] of Object.entries(tokenPrices)) {
        // Vérifier la structure des données avant d'accéder aux propriétés
        if (priceData && priceData.data && priceData.success) {
            console.log(`Token: ${address}, Données: ${JSON.stringify(priceData.data, null, 2)}`);
        } else {
            console.log(`Token: ${address}, Donnéess: ${JSON.stringify(priceData, null, 2)}`);
        }
    }
    
    // Ajouter les informations de prix estimées
    const enhancedTokenData = tokenMovementsData.byVolume.map(token => {
      const tokenPrice = tokenPrices[token.address];
      const tokenMeta = platformsData.tokenMetadata[token.address] || {};
      const decimals = tokenMeta.decimals || token.decimals || 6;
      
      // Extraire le prix du token selon le format disponible
      let currentPrice = null;
      if (tokenPrice) {
        if (tokenPrice.priceUsdt) {
          currentPrice = tokenPrice.priceUsdt;
        } else if (tokenPrice.success && tokenPrice.data && Array.isArray(tokenPrice.data) && tokenPrice.data.length > 0) {
          currentPrice = tokenPrice.data[0].price;
        }
      }
      
      // Calculer la valeur USD estimée
      const usdValue = DataUtils.estimateUsdValue(
        token.totalVolume, 
        tokenPrice,
        decimals
      );
      
      console.log(`Token: ${token.symbol}, Prix: ${currentPrice}, Volume: ${token.totalVolume}, Valeur USD: ${usdValue}`);
      
      return {
        ...token,
        usdValue: usdValue !== null ? usdValue : null,
        hasUsdEstimate: usdValue !== null,
        decimals,
        priceUsdt: currentPrice || null
      };
    });
    
    // Calculer les totaux
    const totalEstimatedUsd = enhancedTokenData
      .filter(t => t.hasUsdEstimate)
      .reduce((sum, token) => sum + token.usdValue, 0);
      
    const tokensWithEstimates = enhancedTokenData.filter(t => t.hasUsdEstimate).length;
    
    // Créer le résultat
    const result = {
      estimatedAt: new Date().toISOString(),
      totalEstimatedUsd,
      tokensWithEstimates,
      totalTokensAnalyzed: enhancedTokenData.length,
      tokenDetails: enhancedTokenData,
      tokenPricesUsdt: Object.fromEntries(
        Object.entries(tokenPrices)
          .filter(([_, price]) => {
            return price && (
              price.priceUsdt || 
              (price.success && price.data && Array.isArray(price.data) && price.data.length > 0)
            );
          })
          .map(([address, price]) => {
            let priceValue = null;
            let timestamp = new Date().toISOString();
            
            if (price.priceUsdt) {
              priceValue = price.priceUsdt;
              timestamp = price.price_timestamp || timestamp;
            } else if (price.success && price.data && Array.isArray(price.data) && price.data.length > 0) {
              priceValue = price.data[0].price;
              timestamp = price.data[0].date ? new Date(price.data[0].date).toISOString() : timestamp;
            }
            
            return [
              address, 
              { 
                priceUsdt: priceValue,
                timestamp: timestamp
              }
            ];
          })
      )
    };
    
    // Préparer le chemin du fichier avec l'adresse du portefeuille
    const outputFile = `./output/usd_value_estimates_${walletAddress}.json`;
    
    // Écrire le résultat dans le fichier
    await DataUtils.saveToJson(outputFile, result);
    console.log(`✅ Estimation des valeurs USD terminée. Résultats écrits dans ${outputFile}`);
    
    // Afficher un résumé
    console.log('\n💰 ESTIMATION DE VALEUR USD');
    console.log('----------------------------');
    console.log(`Total estimé: $${totalEstimatedUsd.toLocaleString(undefined, {maximumFractionDigits: 2})}`);
    console.log(`Tokens avec estimation de prix: ${tokensWithEstimates} / ${enhancedTokenData.length}`);
    
    // Afficher les principaux tokens avec estimation USD
    console.log('\nPrincipaux tokens par valeur USD estimée:');
    enhancedTokenData
      .filter(t => t.hasUsdEstimate)
      .sort((a, b) => b.usdValue - a.usdValue)
      .slice(0, 5)
      .forEach((token, i) => {
        console.log(`${i+1}. ${token.symbol}: ${token.totalVolume.toLocaleString()} unités ≈ $${token.usdValue.toLocaleString(undefined, {maximumFractionDigits: 2})}`);
      });
    
    console.log('----------------------------');
    
    return result;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'estimation des valeurs USD:', error);
    console.log('⚠️ L\'estimation USD a échoué mais cela n\'affectera pas les autres analyses');
    return null;
  }
}

// Exécuter l'estimation
estimateUsdValues();

export default estimateUsdValues;
