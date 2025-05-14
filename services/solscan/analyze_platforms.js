import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

/**
 * @fileoverview Script d'analyse des plateformes DeFi utilisées sur Solana
 * 
 * Ce script analyse les données d'activités pour extraire des informations sur les plateformes
 * et les types d'activités associés.
 * 
 * Formats de données supportés:
 * 1. Format principal (acc_defi_activities.js) : 
 *    { "success": boolean, "data": [...] }
 * 
 * 2. Format secondaire (analyze_activities_detailed.js) :
 *    { "activity_types": { "unique": [...], "counts": {...} }, "platforms": {...} }
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
    activityTypes: [], // Types d'activités uniques
    platforms: [],     // Plateformes uniques
    metadata: {}       // Métadonnées (tokens, etc.)
  };

  // Format 1: Données brutes de l'API (via acc_defi_activities.js)
  if (rawData.data && Array.isArray(rawData.data)) {
    console.log('📊 Format de données API détecté');
    normalizedData.activities = rawData.data;
    normalizedData.metadata = rawData.metadata || {};
    
    // Extraire les types d'activités et plateformes uniques
    const activityTypeSet = new Set();
    const platformSet = new Set();
    
    rawData.data.forEach(activity => {
      if (activity.activity_type) {
        activityTypeSet.add(activity.activity_type);
      }
      
      if (activity.platform && Array.isArray(activity.platform)) {
        activity.platform.forEach(platform => {
          platformSet.add(platform);
        });
      }
    });
    
    normalizedData.activityTypes = Array.from(activityTypeSet);
    normalizedData.platforms = Array.from(platformSet);
    
    return normalizedData;
  }
  // Format 2: Données agrégées (via analyze_activities_detailed.js)
  else if (rawData.activity_types && rawData.platforms) {
    console.log('📊 Format de données agrégées détecté');
    
    // Nous n'avons pas d'activités individuelles, mais nous avons des statistiques
    normalizedData.activityTypes = rawData.activity_types.unique || [];
    normalizedData.platforms = rawData.platforms.unique || [];
    normalizedData.metadata = rawData.tokens_metadata || {};
    
    // Créer des objets factices pour simuler les activités si nécessaire
    if (rawData.activity_by_platform) {
      // Pour chaque plateforme, créer des activités synthétiques basées sur les comptages
      Object.entries(rawData.activity_by_platform).forEach(([platform, activityCounts]) => {
        Object.entries(activityCounts).forEach(([activityType, count]) => {
          // Ajouter une activité synthétique pour chaque comptage
          for (let i = 0; i < count; i++) {
            normalizedData.activities.push({
              activity_type: activityType,
              platform: [platform],
              synthetic: true  // Marqueur indiquant que c'est une activité synthétique
            });
          }
        });
      });
    }
    
    return normalizedData;
  }
  // Format non reconnu
  else {
    throw new Error('Format de données non reconnu. Exécutez acc_defi_activities.js pour générer les données correctes.');
  }
}

async function analyzePlatforms() {
  try {
    // Récupérer l'adresse du portefeuille depuis les arguments de ligne de commande
    const args = process.argv.slice(2);
    const walletAddress = args[0] || process.env.ADDRESS_WALLET;
    
    if (!walletAddress) {
      console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node analyze_platforms.js ADDRESS_WALLET');
      return;
    }
    
    // Vérifier si un fichier spécifique à ce portefeuille existe
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
    
    // Extraire les plateformes uniques
    const platforms = new Map();
    const activityTypes = new Map();
    const sources = new Map();
    const tokens = new Set();
    
    // Analyser les données pour collecter les informations
    if (normalizedData.activities.length > 0) {
      // Si nous avons des activités individuelles (réelles ou synthétiques)
      normalizedData.activities.forEach(activity => {
        // Collecter les plateformes
        if (activity.platform && Array.isArray(activity.platform)) {
          activity.platform.forEach(platform => {
            const count = platforms.get(platform) || 0;
            platforms.set(platform, count + 1);
          });
        }
        
        // Collecter les types d'activités
        if (activity.activity_type) {
          const count = activityTypes.get(activity.activity_type) || 0;
          activityTypes.set(activity.activity_type, count + 1);
        }
        
        // Collecter les sources (si disponibles)
        if (activity.sources && Array.isArray(activity.sources)) {
          activity.sources.forEach(source => {
            const count = sources.get(source) || 0;
            sources.set(source, count + 1);
          });
        }
        
        // Collecter les tokens utilisés (si disponibles)
        if (activity.routers) {
          if (activity.routers.token1) tokens.add(activity.routers.token1);
          if (activity.routers.token2) tokens.add(activity.routers.token2);
        }
      });
    } else {
      // Si nous n'avons pas d'activités individuelles, utiliser les données agrégées
      // Plateformes
      if (normalizedData.platforms.length > 0) {
        normalizedData.platforms.forEach(platform => {
          const count = jsonData.platforms.counts[platform] || 0;
          platforms.set(platform, count);
        });
      }
      
      // Types d'activités
      if (normalizedData.activityTypes.length > 0) {
        normalizedData.activityTypes.forEach(type => {
          const count = jsonData.activity_types.counts[type] || 0;
          activityTypes.set(type, count);
        });
      }
      
      // Si nous avons des informations sur les tokens, les ajouter
      if (jsonData.tokens_metadata) {
        Object.keys(jsonData.tokens_metadata).forEach(tokenAddress => {
          if (tokenAddress !== "undefined") {
            tokens.add(tokenAddress);
          }
        });
      }
    }
    
    // Convertir les Maps en objets pour la sortie JSON
    const platformsObj = Object.fromEntries(platforms);
    const activityTypesObj = Object.fromEntries(activityTypes);
    const sourcesObj = Object.fromEntries(sources);
    
    // Déterminer le nombre total de transactions
    const totalTransactions = normalizedData.activities.length > 0 
      ? normalizedData.activities.length 
      : jsonData.total_transactions || 0;
    
    // Construire l'objet de synthèse
    const summary = {
      totalTransactions: totalTransactions,
      platforms: platformsObj,
      activityTypes: activityTypesObj,
      sources: sourcesObj,
      uniqueTokens: Array.from(tokens),
      tokenMetadata: normalizedData.metadata?.tokens || jsonData.tokens_metadata || {}
    };
    
    // Préparer le chemin du fichier avec l'adresse du portefeuille
    const outputFile = `output/platforms_summary_${walletAddress}.json`;
    
    // Écrire le résultat dans le fichier
    await writeFile(outputFile, JSON.stringify(summary, null, 2));
    console.log(`✅ Analyse des plateformes terminée. Résultats écrits dans ${outputFile}`);
    
    // Afficher un résumé concis dans la console
    console.log(`\n📊 Résumé des activités:`);
    console.log(`- Nombre total de transactions: ${summary.totalTransactions}`);
    console.log(`- Plateformes distinctes: ${Object.keys(platformsObj).length}`);
    console.log(`- Types d'activités distincts: ${Object.keys(activityTypesObj).length}`);
    console.log(`- Sources distinctes: ${Object.keys(sourcesObj).length}`);
    console.log(`- Tokens uniques utilisés: ${tokens.size}`);
    
    // Afficher les types d'activités avec leur nombre
    console.log('\n🔄 Types d\'activités:');
    Object.entries(activityTypesObj)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`- ${type}: ${count} transactions`);
      });
      
    // Afficher les plateformes principales avec leur nombre
    console.log('\n🏢 Plateformes principales:');
    Object.entries(platformsObj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([platform, count]) => {
        console.log(`- ${platform}: ${count} transactions`);
      });
      
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse des plateformes:', error);
    console.error('Détails:', error.stack || error.message);
  }
}

// Exécuter la fonction d'analyse
analyzePlatforms();
