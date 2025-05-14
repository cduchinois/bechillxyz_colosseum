import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import SolanaDataCollector from './data_collector.js';
import { DataUtils } from './utils/api_client.js';
import { spawn } from 'child_process';
import 'dotenv/config';
import path from 'path';

/**
 * Vérifie si la clé API Solscan est configurée dans le fichier .env
 * @returns {boolean} - true si la clé API est configurée, sinon false
 */
function checkSolscanApiKey() {
  if (!process.env.SOLSCAN_API_KEY) {
    console.error('❌ ERREUR: La clé API Solscan n\'est pas configurée dans le fichier .env');
    console.error('Veuillez créer ou modifier le fichier .env à la racine du projet avec la variable suivante:');
    console.error('SOLSCAN_API_KEY=votre_clé_api_solscan');
    console.error('\nVous pouvez obtenir une clé API en vous inscrivant sur https://public-api.solscan.io/');
    return false;
  }
  return true;
}

/**
 * Exécute un script Node.js en tant que processus séparé
 * @param {string} scriptPath - Chemin du script à exécuter
 * @param {Array} args - Arguments à passer au script
 * @returns {Promise<number>} - Code de sortie du processus
 */
function runScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const process = spawn('node', [scriptPath, ...args], { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Le script ${scriptPath} a échoué avec le code ${code}`));
      }
    });
    
    process.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Analyse un portefeuille Solana en utilisant l'API Solscan
 * @param {string} walletAddress - L'adresse du portefeuille à analyser
 * @param {object} options - Options d'analyse
 */
async function analyzeWallet(walletAddress, options = {}) {
  try {
    if (!walletAddress) {
      console.error('Veuillez fournir une adresse de portefeuille en argument');
      console.error('Usage: node analyze_wallet.js <adresse_wallet>');
      process.exit(1);
    }
    
    // Options par défaut
    const analysisOptions = {
      pageSize: options.pageSize || 100,
      maxPages: options.maxPages || 5,
      includeTokenAccounts: options.includeTokenAccounts !== false,
      includePortfolio: options.includePortfolio !== false,
      includeTransactions: options.includeTransactions !== false,
      includeBalanceChanges: options.includeBalanceChanges !== false,
      skipTimeAnalysis: options.skipTimeAnalysis || false,
      skipVisualization: options.skipVisualization || false,
      skipUsdEstimation: options.skipUsdEstimation || false,
    };
    
    console.log(`🔍 Démarrage de l'analyse pour le portefeuille: ${walletAddress}`);
    console.log('Options:', JSON.stringify(analysisOptions, null, 2));
    
    // Vérifier si la clé API Solscan est configurée avant d'exécuter les scripts
    if (!checkSolscanApiKey()) {
      console.error('⛔ Arrêt du processus: La clé API Solscan n\'est pas configurée.');
      process.exit(1);
    }

    // Exécuter tous les scripts commençant par "acc_" au début
    console.log('\n📋 Exécution des scripts de collecte de données (acc_*)...');
    
    // Liste des scripts acc_
    const accScripts = [
      'acc_transactions.js',
      'acc_tok_accounts.js',
      'acc_defi_activities.js',
      'acc_bal_change.js',
      'acc_portfolio.js',
      'acc_transfer.js'
    ];
    
    for (const script of accScripts) {
      console.log(`\n▶️ Exécution de ${script}...`);
      try {
        await runScript(script, [walletAddress]);
        // Attendre 1 seconde avant de continuer
        console.log(`⏱️ Pause d'une seconde avant le prochain script...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`⚠️ Erreur lors de l'exécution de ${script}:`, error.message);
      }
    }
    
    // 1. Collecte des données avec le nouveau collector
    console.log('\n📊 Collecte des données du portefeuille...');
    const dataCollector = new SolanaDataCollector(walletAddress, analysisOptions);
    const collectedData = await dataCollector.collectAllData();
    
    // 2. Analyser les plateformes
    console.log('\n🏢 Analyse des plateformes utilisées...');
    try {
      await runScript('analyze_platforms.js', [walletAddress]);
    } catch (error) {
      console.error('⚠️ Erreur lors de l\'analyse des plateformes:', error.message);
    }
    
    // 3. Analyser les mouvements de tokens
    console.log('\n💱 Analyse des mouvements de tokens...');
    try {
      await runScript('analyze_token_movements.js', [walletAddress]);
    } catch (error) {
      console.error('⚠️ Erreur lors de l\'analyse des mouvements de tokens:', error.message);
    }
    
    // 4. Analyse détaillée des activités
    console.log('\n🔬 Analyse détaillée des activités...');
    try {
      await runScript('analyze_activities_detailed.js', [walletAddress]);
    } catch (error) {
      console.error('⚠️ Erreur lors de l\'analyse détaillée des activités:', error.message);
    }
    
    // Ajouter un délai de 1 secondes avant l'analyse avancée
    // console.log('\n⏳ Attente de 1 secondes avant l\'analyse avancée...');
    // await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 5. Analyse avancée des activités
    console.log('\n📈 Analyse avancée des activités...');
    try {
      await runScript('analyze_activities_advanced.js', [walletAddress]);
    } catch (error) {
      console.error('⚠️ Erreur lors de l\'analyse avancée des activités:', error.message);
    }
    
    // 6. Analyse des modèles temporels (nouveau)
    if (!analysisOptions.skipTimeAnalysis) {
      console.log('\n📅 Analyse des modèles temporels...');
      try {
        await runScript('analyze_time_patterns.js', [walletAddress]);
      } catch (error) {
        console.error('⚠️ Erreur lors de l\'analyse des modèles temporels:', error.message);
      }
    }
    
    // 7. Analyse et gestion des tokens spéciaux et NFTs
    console.log('\n🧩 Analyse des tokens et transactions spéciaux...');
    try {
      await runScript('handle_special_tokens.js', [walletAddress]);
    } catch (error) {
      console.error('⚠️ Erreur lors de l\'analyse des tokens spéciaux:', error.message);
    }
    
    // 8. Estimer les valeurs USD (optionnel)
    if (!analysisOptions.skipUsdEstimation) {
      console.log('\n💲 Estimation des valeurs USD des tokens...');
      try {
        await runScript('estimate_usd_value.js', [walletAddress]);
      } catch (error) {
        console.error('⚠️ Erreur lors de l\'estimation des valeurs USD:', error.message);
        console.log('⚠️ L\'estimation USD a échoué mais l\'analyse continue');
      }
    }
    
    // 9. Générer un rapport consolidé
    console.log('\n📝 Génération du rapport consolidé...');
    await generateConsolidatedReport(walletAddress);
    
    // 8. Générer la visualisation HTML
    if (!analysisOptions.skipVisualization) {
      console.log('\n📊 Génération de la visualisation HTML...');
      try {
        await runScript('generate_visualization.js', [walletAddress]);
      } catch (error) {
        console.error('⚠️ Erreur lors de la génération de la visualisation:', error.message);
      }
    }
    
    console.log('\n✅ Analyse complète terminée avec succès!');
    console.log('📂 Consultez le dossier "output" pour voir les résultats détaillés');
    console.log('📄 Un rapport consolidé a été généré dans:');
    console.log(`  - "output/wallet_report_${walletAddress}.json" (spécifique au portefeuille)`);
    if (!analysisOptions.skipVisualization) {
      console.log('📈 Une visualisation HTML a été générée dans:');
      console.log(`  - "output/visualizations/wallet_report_${walletAddress}.html"`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse du portefeuille:', error);
    process.exit(1);
  }
}

/**
 * Génère un rapport consolidé à partir des différentes analyses
 * @param {string} walletAddress - L'adresse du portefeuille analysé
 */
async function generateConsolidatedReport(walletAddress) {
  try {
    // Charger les différents fichiers d'analyse avec gestion des erreurs améliorée
    // Essayer d'abord les fichiers spécifiques au portefeuille, sinon fallback aux fichiers standard
    const platformsFile = `./output/platforms_summary_${walletAddress}.json`;
    let platformsData = { 
      platforms: {}, 
      activityTypes: {}, 
      totalTransactions: 0,
      tokenMetadata: {},
      uniqueTokens: [] 
    };
    
    if (existsSync(platformsFile)) {
      platformsData = await DataUtils.loadFromJson(platformsFile, platformsData);
      console.log(`✓ Données des plateformes chargées depuis ${platformsFile}`);
    } else {
      console.warn(`⚠️ Le fichier ${platformsFile} n'existe pas. Les données des plateformes seront absentes du rapport.`);
    }
    console.log(`✓ Données des plateformes chargées depuis ${platformsFile}`);
    
    const tokenMovementsFile = `./output/token_movements_${walletAddress}.json`;
    let tokenMovementsData = { 
      tokenMovements: {}, 
      byVolume: [],
      byTransactionCount: []
    };
    
    if (existsSync(tokenMovementsFile)) {
      tokenMovementsData = await DataUtils.loadFromJson(tokenMovementsFile, tokenMovementsData);
      console.log(`✓ Données des mouvements de tokens chargées depuis ${tokenMovementsFile}`);
    } else {
      console.warn(`⚠️ Le fichier ${tokenMovementsFile} n'existe pas. Les données de mouvements de tokens seront absentes du rapport.`);
    }
    console.log(`✓ Données des mouvements de tokens chargées depuis ${tokenMovementsFile}`);
    
    const activitiesDetailedFile = `./output/activities_detailed_summary_${walletAddress}.json`;
    let activitiesDetailedData = {};
    
    if (existsSync(activitiesDetailedFile)) {
      activitiesDetailedData = await DataUtils.loadFromJson(activitiesDetailedFile, {});
      console.log(`✓ Données détaillées des activités chargées depuis ${activitiesDetailedFile}`);
    } else {
      console.warn(`⚠️ Le fichier ${activitiesDetailedFile} n'existe pas. Les données détaillées des activités seront absentes du rapport.`);
    }
    console.log(`✓ Données détaillées des activités chargées depuis ${activitiesDetailedFile}`);
    
    const activitiesAdvancedFile = `./output/activities_advanced_summary_${walletAddress}.json`;
    let activitiesAdvancedData = { 
      summary: {}, 
      tokenPairs: {} 
    };
    
    if (existsSync(activitiesAdvancedFile)) {
      activitiesAdvancedData = await DataUtils.loadFromJson(activitiesAdvancedFile, activitiesAdvancedData);
      console.log(`✓ Données avancées des activités chargées depuis ${activitiesAdvancedFile}`);
    } else {
      console.warn(`⚠️ Le fichier ${activitiesAdvancedFile} n'existe pas. Les données avancées des activités seront absentes du rapport.`);
    }
    console.log(`✓ Données avancées des activités chargées depuis ${activitiesAdvancedFile}`);
    
    // Charger les données temporelles
    const timeAnalysisFile = `./output/time_analysis_${walletAddress}.json`;
    
    let timeAnalysisData = null;
    let hasTimeAnalysis = false;
    
    if (existsSync(timeAnalysisFile)) {
      timeAnalysisData = await DataUtils.loadFromJson(timeAnalysisFile, null);
      hasTimeAnalysis = timeAnalysisData !== null;
      console.log(`✓ Données d'analyse temporelle chargées depuis ${timeAnalysisFile}`);
    } else {
      console.warn(`⚠️ Le fichier ${timeAnalysisFile} n'existe pas. Exécutez d'abord analyze_time_patterns.js avec cette adresse.`);
      // On continue quand même car ce n'est pas bloquant
    }
    if (!hasTimeAnalysis) {
      console.log('⚠️ Données d\'analyse temporelle non disponibles');
    }
    
    // Charger les données de tokens spéciaux si disponibles
    const specialTokensFile = `./output/special_tokens_analysis_${walletAddress}.json`;
    
    let specialTokensData = null;
    if (existsSync(specialTokensFile)) {
      specialTokensData = await DataUtils.loadFromJson(specialTokensFile, null);
      console.log(`✓ Données des tokens spéciaux chargées depuis ${specialTokensFile}`);
    } else {
      console.warn(`⚠️ Le fichier ${specialTokensFile} n'existe pas. Exécutez d'abord handle_special_tokens.js avec cette adresse.`);
      // On continue car ce n'est pas bloquant
    }
    
    const hasSpecialTokensData = specialTokensData !== null;
    if (!hasSpecialTokensData) {
      console.log('⚠️ Données des tokens spéciaux non disponibles');
    }
    
    // Charger les estimations USD si disponibles
    const usdEstimationsFile = `./output/usd_value_estimates_${walletAddress}.json`;
    
    let usdEstimationsData = null;
    if (existsSync(usdEstimationsFile)) {
      usdEstimationsData = await DataUtils.loadFromJson(usdEstimationsFile, null);
      console.log(`✓ Estimations USD chargées depuis ${usdEstimationsFile}`);
    } else {
      console.warn(`⚠️ Le fichier ${usdEstimationsFile} n'existe pas. Exécutez d'abord estimate_usd_value.js avec cette adresse.`);
      // On continue car ce n'est pas bloquant
    }
    
    const hasUsdEstimations = usdEstimationsData !== null;
    if (!hasUsdEstimations) {
      console.log('⚠️ Estimations USD non disponibles');
    }
    
    // Créer le rapport consolidé avec intégration des données temporelles
    const consolidatedReport = {
      walletAddress,
      generatedAt: new Date().toISOString(),
      summary: {
        totalTransactions: platformsData.totalTransactions || 0,
        uniquePlatforms: Object.keys(platformsData.platforms || {}).length,
        uniqueActivityTypes: Object.keys(platformsData.activityTypes || {}).length,
        uniqueTokens: platformsData.uniqueTokens?.length || Object.keys(tokenMovementsData.tokenMovements || {}).length,
        volumeTraded: tokenMovementsData.byVolume ? 
          tokenMovementsData.byVolume.reduce((sum, token) => sum + (parseFloat(token.totalVolume) || 0), 0).toFixed(2) : '0',
        topVolumes: tokenMovementsData.byVolume?.slice(0, 3).map(token => ({
          symbol: token.symbol,
          volume: parseFloat(token.totalVolume).toFixed(2)
        })) || [],
        transactionPeriod: {
          firstTransaction: timeAnalysisData?.firstActivity || activitiesDetailedData?.firstTransaction || 'N/A',
          lastTransaction: timeAnalysisData?.lastActivity || activitiesDetailedData?.lastTransaction || 'N/A',
        },
        averageGapBetweenActivities: timeAnalysisData ? 
          `${(timeAnalysisData.averageGap / 3600).toFixed(2)} heures` : 'N/A',
        weekdayVsWeekend: timeAnalysisData?.weekdayVsWeekend || { 
          weekday: 0, 
          weekend: 0, 
          weekdayPercentage: "N/A", 
          weekendPercentage: "N/A" 
        }
      },
      platforms: {
        topPlatforms: Object.entries(platformsData.platforms || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([platform, count]) => ({ 
            platform, 
            count,
            percentage: ((count / (platformsData.totalTransactions || 1)) * 100).toFixed(1) + '%'
          })),
        mainPlatform: activitiesAdvancedData?.summary?.mostUsedPlatform || 
          Object.entries(platformsData.platforms || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
        allPlatforms: Object.entries(platformsData.platforms || {})
          .sort((a, b) => b[1] - a[1])
          .map(([platform, count]) => ({ platform, count }))
      },
      activities: {
        mainActivityType: activitiesAdvancedData?.summary?.mostCommonActivityType ||
          Object.entries(platformsData.activityTypes || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
        activityBreakdown: Object.entries(platformsData.activityTypes || {})
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => ({ 
            type, 
            count,
            percentage: ((count / (platformsData.totalTransactions || 1)) * 100).toFixed(1) + '%'
          }))
      },
      tokens: {
        topTokensByVolume: tokenMovementsData.byVolume ? tokenMovementsData.byVolume.slice(0, 10) : [],
        topTokensByTransactions: tokenMovementsData.byTransactionCount ? 
          tokenMovementsData.byTransactionCount.slice(0, 10) : [],
        mostUsedToken: tokenMovementsData.byTransactionCount?.[0]?.symbol || 'N/A'
      },
      tokenPairs: activitiesAdvancedData?.tokenPairs ? 
        Object.entries(activitiesAdvancedData.tokenPairs)
          .map(([key, value]) => ({
            token1: value.token1,
            token1Symbol: platformsData.tokenMetadata?.[value.token1]?.token_symbol || value.token1.substring(0, 8),
            token2: value.token2,
            token2Symbol: platformsData.tokenMetadata?.[value.token2]?.token_symbol || value.token2.substring(0, 8),
            count: value.count,
            percentage: ((value.count / (platformsData.totalTransactions || 1)) * 100).toFixed(1) + '%'
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10) : [],
      advanced: {
        valueRanges: activitiesAdvancedData?.valueRanges || {},
        totalValue: activitiesAdvancedData?.summary?.totalValue || 0,
        averageTransactionValue: activitiesAdvancedData?.summary?.averageTransactionValue || 0,
        activityValueByType: activitiesAdvancedData?.activityValueByType || {}
      }
    };
    
    // Ajouter la section d'analyse temporelle si disponible
    if (hasTimeAnalysis) {
      consolidatedReport.timeAnalysis = {
        activityDistribution: {
          byHour: timeAnalysisData.byHour,
          byDayOfWeek: timeAnalysisData.byDayOfWeek,
          byMonth: timeAnalysisData.byMonth,
          byYear: timeAnalysisData.byYear,
        },
        activityGaps: timeAnalysisData.activityGaps,
        busyPeriods: timeAnalysisData.busyPeriods,
        weekdayVsWeekend: timeAnalysisData.weekdayVsWeekend,
        monthlyAnalysis: timeAnalysisData.monthlyAnalysis,
      };
    }
    
    // Ajouter l'analyse des tokens spéciaux si disponible
    if (hasSpecialTokensData) {
      consolidatedReport.specialTokens = {
        unknownTokensStats: specialTokensData.unknownTokensStats,
        topSpecialTokens: specialTokensData.topSpecialTokens.slice(0, 10),
        nfts: specialTokensData.nfts.slice(0, 10),
        complexTransactionCount: specialTokensData.complexTransactions.length
      };
    }
    
    // Ajouter les estimations USD si disponibles
    if (hasUsdEstimations) {
      consolidatedReport.usdEstimates = {
        totalEstimatedUsd: usdEstimationsData.totalEstimatedUsd,
        tokensWithEstimates: usdEstimationsData.tokensWithEstimates,
        topTokensByUsdValue: usdEstimationsData.tokenDetails
          .filter(t => t.hasUsdEstimate)
          .sort((a, b) => b.usdValue - a.usdValue)
          .slice(0, 5)
          .map(t => ({
            symbol: t.symbol,
            address: t.address,
            usdValue: t.usdValue,
            totalVolume: t.totalVolume,
            priceUsdt: t.priceUsdt
          }))
      };
    }
    
    // Écrire le rapport dans les fichiers
    const walletSpecificReportFile = `./output/wallet_report_${walletAddress}.json`;
    
    // Sauvegarder dans le fichier standard et dans le fichier spécifique au portefeuille
    await writeFile(walletSpecificReportFile, JSON.stringify(consolidatedReport, null, 2));
    console.log(`✓ Rapport sauvegardé dans ${walletSpecificReportFile}`);
    
    // Afficher un résumé du rapport dans la console
    console.log('\n📑 RÉSUMÉ DU PORTEFEUILLE');
    console.log('----------------------------');
    console.log(`Adresse: ${walletAddress}`);
    console.log(`Généré le: ${new Date().toLocaleString()}`);
    console.log(`Transactions totales: ${consolidatedReport.summary.totalTransactions}`);
    console.log(`Volume total échangé: ${consolidatedReport.summary.volumeTraded} unités combinées`);
    
    // Afficher les volumes des tokens principaux séparément
    const topVolumes = consolidatedReport.summary.topVolumes || [];
    if (topVolumes.length > 0) {
      console.log(`Principaux volumes par token:`);
      topVolumes.forEach(item => {
        console.log(`  - ${item.symbol}: ${item.volume} unités`);
      });
    }
    
    console.log(`Plateforme principale: ${consolidatedReport.platforms.mainPlatform}`);
    console.log(`Type d'activité principal: ${consolidatedReport.activities.mainActivityType}`);
    
    if (consolidatedReport.tokens.topTokensByVolume.length > 0) {
      console.log(`Token le plus échangé: ${consolidatedReport.tokens.topTokensByVolume[0].symbol} - ${parseFloat(consolidatedReport.tokens.topTokensByVolume[0].totalVolume).toFixed(2)} unités`);
    }
    
    if (consolidatedReport.tokenPairs.length > 0) {
      console.log(`Paire de tokens la plus utilisée: ${consolidatedReport.tokenPairs[0].token1Symbol} ↔ ${consolidatedReport.tokenPairs[0].token2Symbol} (${consolidatedReport.tokenPairs[0].count} transactions)`);
    }
    
    if (hasTimeAnalysis) {
      console.log(`Première transaction: ${DataUtils.formatDate(consolidatedReport.summary.transactionPeriod.firstTransaction)}`);
      console.log(`Dernière transaction: ${DataUtils.formatDate(consolidatedReport.summary.transactionPeriod.lastTransaction)}`);
      console.log(`Activités en semaine: ${consolidatedReport.summary.weekdayVsWeekend.weekdayPercentage}%`);
      console.log(`Activités en weekend: ${consolidatedReport.summary.weekdayVsWeekend.weekendPercentage}%`);
    }
    
    if (hasSpecialTokensData) {
      console.log(`Tokens inconnus: ${specialTokensData.unknownTokensStats.count} (${specialTokensData.unknownTokensStats.percentage} des transactions)`);
      console.log(`NFTs détectés: ${specialTokensData.nfts.length}`);
      console.log(`Transactions complexes: ${specialTokensData.complexTransactions.length}`);
    }
    
    if (hasUsdEstimations) {
      console.log(`\n💰 Valeur totale estimée: $${usdEstimationsData.totalEstimatedUsd.toLocaleString(undefined, {maximumFractionDigits: 2})} USD`);
      console.log(`Tokens avec prix disponibles: ${usdEstimationsData.tokensWithEstimates}/${usdEstimationsData.totalTokensAnalyzed}`);
      
      if (usdEstimationsData.tokenDetails && usdEstimationsData.tokenDetails.length > 0) {
        const topUsdToken = usdEstimationsData.tokenDetails
          .filter(t => t.hasUsdEstimate)
          .sort((a, b) => b.usdValue - a.usdValue)[0];
          
        if (topUsdToken) {
          console.log(`Token de plus grande valeur: ${topUsdToken.symbol} ≈ $${topUsdToken.usdValue.toLocaleString(undefined, {maximumFractionDigits: 2})}`);
        }
      }
    }
    
    console.log('----------------------------');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du rapport consolidé:', error);
    console.error('Détails de l\'erreur:', error.stack);
  }
}

// Récupérer l'adresse du portefeuille et les options depuis les arguments
const args = process.argv.slice(2);
const walletAddress = args[0];

// Options d'analyse (pour les grands ensembles de données)
const options = {
  pageSize: 100,       // Nombre d'éléments par page
  maxPages: 5,         // Maximum de pages à récupérer
  skipTimeAnalysis: false,  // Désactiver l'analyse temporelle pour de grandes quantités de données?
  skipVisualization: false, // Désactiver la génération de visualisations pour de grandes quantités de données?
  skipUsdEstimation: false, // Désactiver l'estimation des valeurs USD?
};

// Si l'ensemble de données est important (paramètre --large)
if (args.includes('--large')) {
  console.log('⚠️ Mode grands ensembles de données activé: optimisation des performances');
  options.pageSize = 200;
  options.maxPages = 10;
}

// Si l'utilisateur veut sauter l'analyse temporelle
if (args.includes('--skip-time')) {
  options.skipTimeAnalysis = true;
}

// Si l'utilisateur veut sauter la génération de visualisations
if (args.includes('--skip-viz')) {
  options.skipVisualization = true;
}

// Si l'utilisateur veut sauter l'estimation des valeurs USD
if (args.includes('--skip-usd')) {
  options.skipUsdEstimation = true;
}

// Lancer l'analyse
analyzeWallet(walletAddress, options);
