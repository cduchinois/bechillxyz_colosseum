#!/usr/bin/env node
/**
 * @fileoverview Utilitaire pour vérifier le format des données et recommander les scripts à utiliser
 * 
 * Ce script analyse un fichier de données d'activités et conseille l'utilisateur sur
 * les scripts d'analyse qui peuvent être utilisés avec ce format de données.
 * 
 * Usage: node check_data_format.js [ADRESSE_PORTEFEUILLE]
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import fs from 'fs';

async function checkDataFormat() {
  try {
    // Récupérer l'adresse du portefeuille depuis les arguments
    const args = process.argv.slice(2);
    const walletAddress = args[0] || process.env.ADDRESS_WALLET;
    
    if (!walletAddress) {
      console.error('❌ Erreur: Aucune adresse de portefeuille fournie.');
      console.error('Usage: node check_data_format.js ADRESSE_PORTEFEUILLE');
      return;
    }
    
    // Vérifier le répertoire de sortie
    const outputDir = 'output';
    if (!existsSync(outputDir)) {
      console.error(`❌ Erreur: Le répertoire ${outputDir} n'existe pas.`);
      return;
    }
    
    // Chercher les fichiers associés à cette adresse de portefeuille
    const files = fs.readdirSync(outputDir).filter(file => file.includes(walletAddress));
    
    if (files.length === 0) {
      console.error(`❌ Aucun fichier trouvé pour le portefeuille ${walletAddress}.`);
      console.error('Exécutez acc_defi_activities.js pour générer des données.');
      return;
    }
    
    console.log(`🔍 Fichiers trouvés pour ${walletAddress}: ${files.length} fichier(s)`);
    
    // Vérifier le fichier principal des activités détaillées
    const detailedFile = `activities_detailed_summary_${walletAddress}.json`;
    const detailedPath = path.join(outputDir, detailedFile);
    
    if (!existsSync(detailedPath)) {
      console.error(`❌ Fichier principal ${detailedFile} non trouvé.`);
      console.error('Exécutez acc_defi_activities.js pour générer ce fichier.');
      return;
    }
    
    // Analyser le fichier pour déterminer son format
    const data = await readFile(detailedPath, 'utf8');
    const jsonData = JSON.parse(data);
    
    let formatType = 'inconnu';
    let scriptCompatibility = {};
    
    // Format 1: API directe avec tableau data
    if (jsonData.data && Array.isArray(jsonData.data)) {
      formatType = 'API';
      scriptCompatibility = {
        'analyze_activities_advanced.js': true,
        'analyze_platforms.js': true,
        'analyze_token_movements.js': true,
        'analyze_time_patterns.js': true
      };
    }
    // Format 2: données agrégées
    else if (jsonData.activity_types && jsonData.platforms) {
      formatType = 'Agrégé';
      scriptCompatibility = {
        'analyze_activities_advanced.js': false,
        'analyze_platforms.js': true,
        'analyze_token_movements.js': false,
        'analyze_time_patterns.js': false
      };
    }
    
    // Afficher les résultats
    console.log(`\n📊 Analyse du format de données pour ${walletAddress}:`);
    console.log(`- Fichier: ${detailedFile}`);
    console.log(`- Type de format: ${formatType}`);
    console.log(`- Taille: ${(data.length / 1024).toFixed(2)} KB\n`);
    
    console.log('🛠️  Compatibilité avec les scripts:');
    Object.entries(scriptCompatibility).forEach(([script, compatible]) => {
      const status = compatible ? '✅ Compatible' : '❌ Non compatible';
      console.log(`- ${script}: ${status}`);
    });
    
    // Compter les scripts compatibles et non compatibles
    const compatibleCount = Object.values(scriptCompatibility).filter(Boolean).length;
    const totalScripts = Object.keys(scriptCompatibility).length;
    
    console.log('\n💡 Conseils:');
    if (formatType === 'API') {
      console.log('- Ce fichier contient des données brutes d\'activités et peut être utilisé avec tous les scripts d\'analyse.');
      console.log(`- Vous pouvez exécuter les ${totalScripts} scripts d'analyse pour des résultats complets.`);
    } else if (formatType === 'Agrégé') {
      console.log('- Ce fichier contient des données agrégées et ne peut pas être utilisé avec tous les scripts d\'analyse.');
      console.log(`- Actuellement compatible avec ${compatibleCount}/${totalScripts} scripts d'analyse.`);
      console.log('\n🔄 Pour obtenir l\'accès à TOUS les scripts d\'analyse:');
      console.log(`1. Exécutez: node acc_defi_activities.js ${walletAddress}`);
      console.log('2. Cela générera des données brutes complètes directement depuis l\'API Solscan.');
      console.log('3. Ces données permettront d\'utiliser toutes les fonctionnalités d\'analyse disponibles.');
    } else {
      console.log('- Format de données non reconnu. Essayez de régénérer les données avec acc_defi_activities.js');
      console.log(`- Commande recommandée: node acc_defi_activities.js ${walletAddress}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du format des données:', error);
    console.error('Détails:', error.stack || error.message);
  }
}

checkDataFormat();
