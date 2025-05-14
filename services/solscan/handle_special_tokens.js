import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { DataUtils } from './utils/api_client.js';

/**
 * Module pour traiter les tokens et transactions non-standard
 * Améliore la gestion des tokens inconnus, des NFTs et des transactions complexes
 */
async function handleSpecialTokens() {
  try {
    console.log('🔍 Analyse des tokens et transactions spéciaux...');
    
    // Récupérer l'adresse du portefeuille depuis les arguments de ligne de commande
    const args = process.argv.slice(2);
    const walletAddress = args[0] || process.env.ADDRESS_WALLET;
    
    if (!walletAddress) {
      console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node handle_special_tokens.js ADDRESS_WALLET');
      return;
    }
    
    // Préparer le chemin du fichier spécifique au portefeuille
    const specificOutputFile = `output/defi_activities_${walletAddress}.json`;
    
    // Vérifier si le fichier existe
    if (!existsSync(specificOutputFile)) {
      console.error(`❌ Erreur: Le fichier ${specificOutputFile} n'existe pas.`);
      console.error(`Exécutez d'abord acc_defi_activities.js avec cette adresse de portefeuille.`);
      return;
    }
    
    console.log(`💡 Utilisation du fichier spécifique au portefeuille: ${specificOutputFile}`);
    const activitiesData = await DataUtils.loadFromJson(specificOutputFile, { data: [] });
    
    if (!activitiesData.data || activitiesData.data.length === 0) {
      console.warn('⚠️ Aucune donnée d\'activité disponible pour l\'analyse des tokens spéciaux');
      return { specialTokens: {}, nfts: [], complexTransactions: [] };
    }
    
    // Charger les données de tokens existantes
    const platformsFile = `./output/platforms_summary_${walletAddress}.json`;
    
    if (!existsSync(platformsFile)) {
      console.warn(`⚠️ Le fichier ${platformsFile} n'existe pas. Exécutez d'abord analyze_platforms.js avec cette adresse.`);
    }
    
    const platformsData = existsSync(platformsFile)
      ? await DataUtils.loadFromJson(platformsFile, { tokenMetadata: {}, uniqueTokens: [] })
      : { tokenMetadata: {}, uniqueTokens: [] };
    
    // Structures pour l'analyse
    const result = {
      specialTokens: {},
      nfts: [],
      complexTransactions: [],
      unknownTokensStats: {
        count: 0,
        transactionCount: 0
      }
    };
    
    // Fonctions pour détecter les types de tokens spéciaux
    const isNFT = (mint) => {
      // NFT typiques ont 0 décimales et des collections connues 
      const nftCollections = [
        'metaplex', 'solana monkey', 'solarians', 'aurory', 'degenerate ape', 
        'frakt', 'shadowy', 'famous fox', 'thugbirdz'
      ];
      
      const tokenMeta = platformsData.tokenMetadata[mint] || {};
      
      return (
        tokenMeta.decimals === 0 || 
        (tokenMeta.token_name && nftCollections.some(name => 
          tokenMeta.token_name.toLowerCase().includes(name)
        ))
      );
    };
    
    const isComplexTransaction = (tx) => {
      // Détecter les transactions impliquant plusieurs plateformes ou plus de 2 tokens
      const multiPlatform = Array.isArray(tx.platform) && tx.platform.length > 1;
      const multiToken = tx.token1 && tx.token2 && tx.token3;
      return multiPlatform || multiToken;
    };
    
    // Analyser les activités à la recherche de tokens spéciaux
    for (const activity of activitiesData.data) {
      // Collecter tous les tokens impliqués dans l'activité
      const tokens = [];
      ['token1', 'token2', 'token3', 'token4'].forEach(tokenKey => {
        if (activity[tokenKey]) {
          tokens.push(activity[tokenKey]);
        }
      });
      
      // Vérifier chaque token
      for (const token of tokens) {
        // Si pas déjà indexé et pas de métadonnées
        if (!result.specialTokens[token] && !platformsData.tokenMetadata[token]) {
          result.specialTokens[token] = {
            mint: token,
            firstSeen: new Date(activity.block_time * 1000).toISOString(),
            occurrences: 1,
            activityTypes: [activity.activity_type],
            platforms: Array.isArray(activity.platform) ? [...activity.platform] : [activity.platform]
          };
          
          result.unknownTokensStats.count++;
          result.unknownTokensStats.transactionCount++;
        } else if (result.specialTokens[token]) {
          // Mettre à jour les compteurs pour les tokens déjà détectés
          result.specialTokens[token].occurrences++;
          
          if (!result.specialTokens[token].activityTypes.includes(activity.activity_type)) {
            result.specialTokens[token].activityTypes.push(activity.activity_type);
          }
          
          if (Array.isArray(activity.platform)) {
            activity.platform.forEach(platform => {
              if (!result.specialTokens[token].platforms.includes(platform)) {
                result.specialTokens[token].platforms.push(platform);
              }
            });
          } else if (!result.specialTokens[token].platforms.includes(activity.platform)) {
            result.specialTokens[token].platforms.push(activity.platform);
          }
        }
      }
      
      // Vérifier les NFTs
      tokens.forEach(token => {
        if (isNFT(token) && !result.nfts.some(nft => nft.mint === token)) {
          result.nfts.push({
            mint: token,
            name: platformsData.tokenMetadata[token]?.token_name || 'NFT Inconnu',
            transaction: activity.tx_id,
            platform: Array.isArray(activity.platform) ? activity.platform[0] : activity.platform,
            timestamp: new Date(activity.block_time * 1000).toISOString()
          });
        }
      });
      
      // Vérifier les transactions complexes
      if (isComplexTransaction(activity)) {
        result.complexTransactions.push({
          tx_id: activity.tx_id,
          timestamp: new Date(activity.block_time * 1000).toISOString(),
          platform: activity.platform,
          activity_type: activity.activity_type,
          tokens: tokens.map(token => ({
            mint: token,
            symbol: platformsData.tokenMetadata[token]?.token_symbol || token.substring(0, 8)
          }))
        });
      }
    }
    
    // Trier les tokens spéciaux par nombre d'occurrences
    result.topSpecialTokens = Object.values(result.specialTokens)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 20);
    
    // Pourcentage de transactions avec tokens inconnus
    result.unknownTokensStats.percentage = 
      (result.unknownTokensStats.transactionCount / activitiesData.data.length * 100).toFixed(2) + '%';
    
    // Enrichir les données des plateformes avec les tokens détectés
    // pour améliorer les analyses futures
    const enrichedTokenMetadata = { ...platformsData.tokenMetadata };
    
    for (const [mint, data] of Object.entries(result.specialTokens)) {
      if (data.occurrences >= 3) {  // Seulement les tokens avec au moins 3 occurrences
        enrichedTokenMetadata[mint] = enrichedTokenMetadata[mint] || {
          token_address: mint,
          token_symbol: `UNK-${mint.substring(0, 5)}`,
          decimals: 6,  // Valeur par défaut pour les tokens inconnus
          special: true,
          occurrences: data.occurrences,
          platforms: data.platforms,
          activityTypes: data.activityTypes
        };
      }
    }
    
    // Préparer les chemins de fichiers pour la sortie
    const walletSpecificFile = `./output/special_tokens_analysis_${walletAddress}.json` 
    
    // Sauvegarder les résultats
    await DataUtils.saveToJson(walletSpecificFile, result);
    
    // Mettre à jour les métadonnées de tokens
    const updatedPlatformsData = {
      ...platformsData,
      tokenMetadata: enrichedTokenMetadata
    };
    
    // Sauvegarder les métadonnées enrichies
    const enrichedOutputFile = `./output/platforms_summary_enriched_${walletAddress}.json`;
    
    await DataUtils.saveToJson(enrichedOutputFile, updatedPlatformsData);
    
    // Afficher un résumé des résultats
    console.log(`✅ Analyse des tokens spéciaux terminée. Résultats écrits dans ${walletSpecificFile}`);
    console.log(`✅ Métadonnées de tokens enrichies écrites dans ${enrichedOutputFile}`);
    
    console.log(`📊 Détecté: ${result.unknownTokensStats.count} tokens inconnus, ${result.nfts.length} NFTs potentiels, ${result.complexTransactions.length} transactions complexes`);
    console.log(`💡 Les tokens inconnus représentent ${result.unknownTokensStats.percentage} des transactions.`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse des tokens spéciaux:', error);
    console.error('Détails de l\'erreur:', error.stack);
    return null;
  }
}

// Exécuter l'analyse
handleSpecialTokens();

export default handleSpecialTokens;
