import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

/**
 * @fileoverview Script d'analyse avancée des activités DeFi sur Solana
 * 
 * Ce script prend un fichier JSON généré par acc_defi_activities.js et produit
 * des analyses plus détaillées sur les activités DeFi d'un portefeuille.
 * 
 * Format de données attendu:
 * 1. Format principal (acc_defi_activities.js) : 
 *    {
 *      "success": boolean,
 *      "data": [
 *        {
 *          "activity_type": string,
 *          "platform": string[],
 *          "value": number,
 *          "routers": { token1, token2, ... },
 *          ...
 *        },
 *        ...
 *      ],
 *      "metadata": { tokens: {...} }
 *    }
 * 
 * 2. Format secondaire (analyze_activities_detailed.js) :
 *    {
 *      "activity_types": { unique: [...], ... },
 *      "platforms": { ... },
 *      ...
 *    }
 * 
 * Usage: node analyze_activities_advanced.js [ADDRESS_WALLET]
 * ENV: ADDRESS_WALLET - Adresse du portefeuille Solana à analyser
 */

/**
 * Normalise les données d'activités pour s'assurer qu'elles sont dans un format standard
 * @param {Object} rawData - Données brutes à normaliser
 * @returns {Object} - Données normalisées avec activitiesData et metadata
 * @throws {Error} - Si les données ne peuvent pas être normalisées dans un format compatible
 */
function normalizeActivityData(rawData) {
  // Structure de retour standard
  const normalizedData = {
    activitiesData: [],
    metadata: {
      tokens: {}
    }
  };

  // Format principal: données directes de l'API (acc_defi_activities.js)
  if (rawData.data && Array.isArray(rawData.data)) {
    normalizedData.activitiesData = rawData.data;
    normalizedData.metadata = rawData.metadata || { tokens: {} };
    return normalizedData;
  } 
  
  // Format secondaire: statistiques agrégées
  else if (rawData.activity_types && rawData.activity_types.unique) {
    throw new Error('FORMAT_INCOMPATIBLE', 
      'Le fichier contient uniquement des statistiques agrégées, pas les données brutes des activités ' +
      'nécessaires pour l\'analyse avancée. Veuillez exécuter acc_defi_activities.js pour générer les données brutes.');
  } 
  
  // Format non reconnu
  else {
    throw new Error('FORMAT_INCONNU', 
      'Structure de données incorrecte dans le fichier JSON. ' +
      'Veuillez exécuter acc_defi_activities.js pour générer les données correctes.');
  }
}

/**
 * Fonction principale pour analyser de façon avancée les activités DeFi d'un portefeuille
 */
async function analyzeActivitiesAdvanced() {
  try {
    // Récupérer l'adresse du portefeuille depuis les arguments ou variables d'environnement
    const args = process.argv.slice(2);
    const walletAddress = args[0] || process.env.ADDRESS_WALLET;
    
    if (!walletAddress) {
      console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node analyze_activities_advanced.js ADDRESS_WALLET');
      return;
    }
    
    // Préparer le chemin du fichier spécifique au portefeuille
    const specificFile = `./output/defi_activities_${walletAddress}.json`;
    
    // Vérifier si le fichier existe
    if (!existsSync(specificFile)) {
      console.error(`❌ Erreur: Le fichier ${specificFile} n'existe pas.`);
      console.error('Exécutez d\'abord acc_defi_activities.js avec cette adresse de portefeuille.');
      return;
    }
    
    console.log(`💡 Utilisation du fichier spécifique au portefeuille: ${specificFile}`);
    const data = await readFile(specificFile, 'utf8');
    
    // Récupérer et valider les données
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError.message);
      console.error('Le fichier ne contient pas de JSON valide.');
      return;
    }
    
    // Normaliser les données avec gestion d'erreurs
    let normalizedData;
    try {
      normalizedData = normalizeActivityData(jsonData);
    } catch (error) {
      console.error(`❌ ${error.message}`);
      if (error.code === 'FORMAT_INCOMPATIBLE' || error.code === 'FORMAT_INCONNU') {
        console.error(error.details || 'Format de données incompatible.');
      }
      return;
    }
    
    const { activitiesData } = normalizedData;
    
    // Vérifier que nous avons des données à traiter
    if (!activitiesData.length) {
      console.error('❌ Aucune activité trouvée dans les données.');
      return;
    }
    
    console.log(`📊 Analyse en cours de ${activitiesData.length} activités...`);
    
    // Structures pour stocker les analyses
    const activityTypes = new Map();
    const platforms = new Map();
    const tokenAddresses = new Set();
    const tokenPairs = new Map();
    const valueRanges = {
      "0-1": 0,
      "1-5": 0,
      "5-10": 0,
      "10-50": 0,
      "50-100": 0,
      "100+": 0,
      "unknown": 0
    };
    
    // Analyser chaque activité
    activitiesData.forEach(activity => {
      // Vérifier que l'activité a les propriétés requises
      if (!activity.activity_type) {
        console.warn('⚠️ Activité sans type détecté, ignorée');
        return;
      }
      
      // Analyse des types d'activités
      const activityType = activity.activity_type;
      if (!activityTypes.has(activityType)) {
        activityTypes.set(activityType, { 
          count: 1,
          totalValue: activity.value || 0,
          platforms: {},
          tokens: {}
        });
      } else {
        const typeInfo = activityTypes.get(activityType);
        typeInfo.count++;
        if (activity.value) typeInfo.totalValue += activity.value;
        activityTypes.set(activityType, typeInfo);
      }
      
      // Classifier par plage de valeur
      if (typeof activity.value === 'number') {
        let valueRange;
        if (activity.value === 0) valueRange = "0-1";
        else if (activity.value <= 1) valueRange = "0-1";
        else if (activity.value <= 5) valueRange = "1-5";
        else if (activity.value <= 10) valueRange = "5-10";
        else if (activity.value <= 50) valueRange = "10-50";
        else if (activity.value <= 100) valueRange = "50-100";
        else valueRange = "100+";
        
        valueRanges[valueRange]++;
      } else {
        valueRanges["unknown"]++;
      }
      
      // Analyse des plateformes
      if (activity.platform && Array.isArray(activity.platform)) {
        activity.platform.forEach(platform => {
          if (!platform) return; // Ignorer les valeurs nulles/vides
          
          if (!platforms.has(platform)) {
            platforms.set(platform, { 
              count: 1, 
              activities: { [activityType]: 1 },
              tokens: {}
            });
          } else {
            const platformInfo = platforms.get(platform);
            platformInfo.count++;
            
            if (!platformInfo.activities[activityType]) {
              platformInfo.activities[activityType] = 1;
            } else {
              platformInfo.activities[activityType]++;
            }
            
            platforms.set(platform, platformInfo);
          }
          
          // Ajouter la plateforme aux statistiques du type d'activité
          const typeInfo = activityTypes.get(activityType);
          typeInfo.platforms[platform] = (typeInfo.platforms[platform] || 0) + 1;
        });
      }
      
      // Analyse des tokens
      if (activity.routers) {
        const { token1, token2 } = activity.routers;
        
        if (token1) {
          tokenAddresses.add(token1);
          
          // Ajouter aux stats du type d'activité
          const typeInfo = activityTypes.get(activityType);
          typeInfo.tokens[token1] = (typeInfo.tokens[token1] || 0) + 1;
          
          // Ajouter aux stats de la plateforme
          if (activity.platform && Array.isArray(activity.platform)) {
            activity.platform.forEach(platform => {
              if (!platform) return; // Ignorer les valeurs nulles/vides
              
              const platformInfo = platforms.get(platform);
              if (platformInfo) { // Vérification supplémentaire
                platformInfo.tokens[token1] = (platformInfo.tokens[token1] || 0) + 1;
              }
            });
          }
        }
        
        if (token2) {
          tokenAddresses.add(token2);
          
          // Ajouter aux stats du type d'activité
          const typeInfo = activityTypes.get(activityType);
          typeInfo.tokens[token2] = (typeInfo.tokens[token2] || 0) + 1;
          
          // Ajouter aux stats de la plateforme
          if (activity.platform && Array.isArray(activity.platform)) {
            activity.platform.forEach(platform => {
              if (!platform) return; // Ignorer les valeurs nulles/vides
              
              const platformInfo = platforms.get(platform);
              if (platformInfo) { // Vérification supplémentaire
                platformInfo.tokens[token2] = (platformInfo.tokens[token2] || 0) + 1;
              }
            });
          }
        }
        
        // Suivre les paires de tokens
        if (token1 && token2) {
          const pairKey = `${token1}_${token2}`;
          if (!tokenPairs.has(pairKey)) {
            tokenPairs.set(pairKey, {
              count: 1,
              token1,
              token2
            });
          } else {
            const pairInfo = tokenPairs.get(pairKey);
            pairInfo.count++;
            tokenPairs.set(pairKey, pairInfo);
          }
        }
      }
    });
    
    // Création de l'objet résultat
    const result = {
      summary: {
        totalActivities: activitiesData.length,
        uniqueActivityTypes: activityTypes.size,
        uniquePlatforms: platforms.size,
        uniqueTokens: tokenAddresses.size,
        uniqueTokenPairs: tokenPairs.size,
        valueDistribution: valueRanges
      },
      activityTypes: Object.fromEntries(activityTypes),
      platforms: Object.fromEntries(platforms),
      tokenPairs: Object.fromEntries(tokenPairs),
      tokens: {
        addresses: Array.from(tokenAddresses),
        metadata: normalizedData.metadata?.tokens || {}
      }
    };
    
    // Trouver la plateforme la plus utilisée
    let maxPlatformCount = 0;
    let mostUsedPlatform = '';
    platforms.forEach((value, key) => {
      if (value.count > maxPlatformCount) {
        maxPlatformCount = value.count;
        mostUsedPlatform = key;
      }
    });
    
    result.summary.mostUsedPlatform = mostUsedPlatform;
    
    // Trouver le type d'activité le plus courant
    let maxTypeCount = 0;
    let mostCommonType = '';
    activityTypes.forEach((value, key) => {
      if (value.count > maxTypeCount) {
        maxTypeCount = value.count;
        mostCommonType = key;
      }
    });
    
    result.summary.mostCommonActivityType = mostCommonType;
    
    // Préparer le chemin du fichier avec l'adresse du portefeuille
    const outputFile = `./output/activities_advanced_summary_${walletAddress}.json`;
    
    // Écrire les résultats dans un fichier
    try {
      await writeFile(outputFile, JSON.stringify(result, null, 2));
      console.log(`✅ Analyse avancée terminée. Résultats écrits dans ${outputFile}`);
    } catch (writeError) {
      console.error(`❌ Erreur lors de l'écriture des résultats:`, writeError.message);
      console.error(`Vérifiez les permissions du répertoire './output/'`);
      return;
    }
    
    // Afficher un résumé dans la console
    console.log('\n📊 Résumé avancé des activités:');
    console.log(`- Total des activités: ${result.summary.totalActivities}`);
    console.log(`- Types d'activités uniques: ${result.summary.uniqueActivityTypes}`);
    console.log(`- Plateformes uniques: ${result.summary.uniquePlatforms}`);
    console.log(`- Tokens uniques: ${result.summary.uniqueTokens}`);
    console.log(`- Paires de tokens uniques: ${result.summary.uniqueTokenPairs}`);
    console.log(`- Plateforme la plus utilisée: ${result.summary.mostUsedPlatform}`);
    console.log(`- Type d'activité le plus courant: ${result.summary.mostCommonActivityType}`);
    
    // Afficher les principales activités avec leurs valeurs
    console.log('\n🔝 Principaux types d\'activités:');
    [...activityTypes.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .forEach(([type, data]) => {
        console.log(`- ${type}: ${data.count} transactions, valeur totale: ${data.totalValue.toFixed(2)}`);
      });
      
    // Afficher les principales paires de tokens
    console.log('\n💱 Principales paires de tokens:');
    [...tokenPairs.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .forEach(([pairKey, data]) => {
        const tokenMetadata = normalizedData.metadata?.tokens || {};
        const token1Symbol = (tokenMetadata[data.token1]?.token_symbol) || data.token1.substring(0, 8);
        const token2Symbol = (tokenMetadata[data.token2]?.token_symbol) || data.token2.substring(0, 8);
        console.log(`- ${token1Symbol} ↔ ${token2Symbol}: ${data.count} transactions`);
      });
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse avancée:', error);
    console.error('Détails:', error.stack || error.message);
  }
}

// Exécuter la fonction
analyzeActivitiesAdvanced();
