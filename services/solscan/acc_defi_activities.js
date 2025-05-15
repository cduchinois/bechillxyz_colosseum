/**
 * @fileoverview Script de récupération des activités DeFi sur Solana
 * 
 * Ce script interroge l'API Solscan pour récupérer les activités DeFi d'un portefeuille Solana
 * et les enregistre dans un fichier JSON pour une analyse ultérieure.
 * 
 * Format de sortie:
 * {
 *   "success": boolean,
 *   "data": [
 *     {
 *       "activity_type": string,
 *       "platform": string[],
 *       "value": number,
 *       "routers": { token1, token2, ... },
 *       ...
 *     },
 *     ...
 *   ],
 *   "metadata": { tokens: {...} }
 * }
 * 
 * Usage: node acc_defi_activities.js [ADDRESS_WALLET]
 * ENV: ADDRESS_WALLET - Adresse du portefeuille Solana à analyser
 *      SOLSCAN_API_KEY - Clé API pour Solscan
 */

import 'dotenv/config';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Récupérer l'adresse du portefeuille depuis les arguments ou variables d'environnement
const args = process.argv.slice(2);
const walletAddress = args[0] || process.env.ADDRESS_WALLET;

// Vérifier que l'adresse du portefeuille est fournie
if (!walletAddress) {
  console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node acc_defi_activities.js ADDRESS_WALLET');
  process.exit(1);
}

// Vérifier que la clé API est disponible
if (!process.env.SOLSCAN_API_KEY) {
  console.error('❌ Erreur: Clé API Solscan manquante. Ajoutez SOLSCAN_API_KEY dans votre fichier .env');
  process.exit(1);
}

// Options de la requête API
const requestOptions = {
  method: "get",
  headers: {"token": process.env.SOLSCAN_API_KEY},
}

/**
 * Récupère et enregistre les activités DeFi d'un portefeuille
 */
async function getDefiActivities() {
  try {
    console.log(`🔍 Récupération des activités DeFi pour ${walletAddress}...`);
    
    // Créer le dossier de sortie s'il n'existe pas
    const outputDir = path.join(process.cwd(), 'output');
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true });
      console.log(`📁 Dossier output créé`);
    }
    
    // Appel à l'API Solscan
    const response = await fetch(
      `https://pro-api.solscan.io/v2.0/account/defi/activities?address=${walletAddress}&page=1&page_size=100&sort_by=block_time&sort_order=desc`, 
      requestOptions
    );
    
    // Vérifier si la requête a réussi
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Vérifier que la réponse est au format attendu
    if (!data.success) {
      throw new Error(`L'API a répondu avec une erreur: ${data.message || 'Erreur inconnue'}`);
    }
    
    // Afficher un aperçu des données
    console.log(`✅ Données récupérées: ${data.data?.length || 0} activités trouvées`);
    
    // Préparation des métadonnées de tokens (si disponible)
    if (!data.metadata) {
      data.metadata = { tokens: {} };
    }
    
    // Préparer le chemin du fichier avec l'adresse du portefeuille
    const outputFile = `output/defi_activities_${walletAddress}.json`;
    
    // Écrire les résultats dans un fichier JSON
    await writeFile(outputFile, JSON.stringify(data, null, 2));
    console.log(`💾 Résultats écrits dans ${outputFile}`);
    console.log('\n💡 Pour une analyse avancée, exécutez: node analyze_activities_advanced.js', walletAddress);
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des activités:', error);
    console.error('Détails:', error.stack || error.message);
    process.exit(1);
  }
}

// Exécuter la fonction principale
getDefiActivities();
