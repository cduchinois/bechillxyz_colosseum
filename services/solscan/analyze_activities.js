import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

async function analyzeActivities() {
  try {
    // Récupérer l'adresse du portefeuille depuis les arguments ou variables d'environnement
    const args = process.argv.slice(2);
    const walletAddress = args[0] || process.env.ADDRESS_WALLET;
    
    if (!walletAddress) {
      console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node analyze_activities.js ADDRESS_WALLET');
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
    
    // Initialiser les ensembles pour stocker les valeurs uniques
    const activityTypes = new Set();
    const platformNames = new Set();
    
    // Parcourir les données pour collecter les types d'activités et plateformes
    jsonData.data.forEach(item => {
      // Collecter les types d'activités
      if (item.activity_type) {
        activityTypes.add(item.activity_type);
      }
      
      // Collecter les plateformes
      if (item.platform && Array.isArray(item.platform)) {
        item.platform.forEach(platform => {
          platformNames.add(platform);
        });
      }
    });
    
    // Créer l'objet de résultats
    const result = {
      activity_types: Array.from(activityTypes),
      platforms: Array.from(platformNames)
    };
    
    // Afficher le résultat
    console.log(JSON.stringify(result, null, 2));
    
    // Préparer le chemin du fichier avec l'adresse du portefeuille
    const outputFile = `./output/activities_summary_${walletAddress}.json`;
    
    // Écrire le résultat dans un fichier
    await writeFile(outputFile, JSON.stringify(result, null, 2));
    
    console.log(`✅ Analyse terminée. Résultats écrits dans ${outputFile}`);
    
  } catch (err) {
    console.error('Erreur lors de l\'analyse des activités:', err);
  }
}

// Exécuter la fonction
analyzeActivities();
