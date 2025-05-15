import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

async function analyzeActivitiesDetailed() {
  try {
    // Récupérer l'adresse du portefeuille depuis les arguments ou variables d'environnement
    const args = process.argv.slice(2);
    const walletAddress = args[0] || process.env.ADDRESS_WALLET;
    
    if (!walletAddress) {
      console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node analyze_activities_detailed.js ADDRESS_WALLET');
      return;
    }
    
    // Préparer le chemin du fichier spécifique au portefeuille
    const specificFile = `./output/activities_detailed_summary_${walletAddress}.json`;
    
    // Vérifier si le fichier existe
    if (!existsSync(specificFile)) {
      console.error(`❌ Erreur: Le fichier ${specificFile} n'existe pas.`);
      console.error('Exécutez d\'abord acc_defi_activities.js avec cette adresse de portefeuille.');
      return;
    }
    
    console.log(`💡 Utilisation du fichier spécifique au portefeuille: ${specificFile}`);
    const data = await readFile(specificFile, 'utf8');
    
    const jsonData = JSON.parse(data);
    
    // Vérifier que les données sont présentes
    if (!jsonData.data || !Array.isArray(jsonData.data)) {
      console.error('Structure de données incorrecte dans le fichier JSON');
      return;
    }
    
    // Initialiser les objets pour stocker les statistiques
    const activityCounts = {};
    const platformCounts = {};
    const activityByPlatform = {};
    
    // Parcourir les données pour collecter les statistiques
    jsonData.data.forEach(item => {
      // Compter les types d'activités
      if (item.activity_type) {
        activityCounts[item.activity_type] = (activityCounts[item.activity_type] || 0) + 1;
      }
      
      // Compter les plateformes
      if (item.platform && Array.isArray(item.platform)) {
        item.platform.forEach(platform => {
          platformCounts[platform] = (platformCounts[platform] || 0) + 1;
          
          // Compter les activités par plateforme
          if (item.activity_type) {
            if (!activityByPlatform[platform]) {
              activityByPlatform[platform] = {};
            }
            
            activityByPlatform[platform][item.activity_type] = 
              (activityByPlatform[platform][item.activity_type] || 0) + 1;
          }
        });
      }
    });
    
    // Créer l'objet de résultats
    const result = {
      activity_types: {
        unique: Object.keys(activityCounts),
        counts: activityCounts
      },
      platforms: {
        unique: Object.keys(platformCounts),
        counts: platformCounts
      },
      activity_by_platform: activityByPlatform,
      total_transactions: jsonData.data.length,
      // Ajouter les métadonnées de tokens s'il y en a
      tokens_metadata: jsonData.metadata && jsonData.metadata.tokens ? jsonData.metadata.tokens : {}
    };
    
    // Afficher le résultat
    console.log(JSON.stringify(result, null, 2));
    
    // Préparer le chemin du fichier avec l'adresse du portefeuille
    const outputFile = `./output/activities_detailed_summary_${walletAddress}.json`;
    
    // Écrire le résultat dans le fichier
    await writeFile(outputFile, JSON.stringify(result, null, 2));
    
    console.log(`✅ Analyse détaillée terminée. Résultats écrits dans ${outputFile}`);
    
  } catch (err) {
    console.error('Erreur lors de l\'analyse détaillée des activités:', err);
  }
}

// Exécuter la fonction
analyzeActivitiesDetailed();
