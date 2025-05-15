import 'dotenv/config';
import SolanaDataCollector from './data_collector.js';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import { Validation } from './utils/validation.js';

// Configurer des options de journalisation détaillées
const verbose = true;

// Récupérer l'adresse du portefeuille depuis les arguments ou l'environnement
const args = process.argv.slice(2);
const walletAddress = args[0] || process.env.ADDRESS_WALLET;
const forceRefresh = args.includes('--force') || args.includes('-f');

if (!walletAddress) {
  console.error('❌ Erreur: Aucune adresse de portefeuille fournie.');
  console.error('Usage: node improved_acc_transactions.js <WALLET_ADDRESS> [--force|-f]');
  console.error('Options:');
  console.error('  --force, -f  Force la récupération des données même si un fichier existant est trouvé');
  process.exit(1);
}

// Valider l'adresse Solana avec la nouvelle méthode qui enregistre les erreurs
// Si l'adresse est invalide, le processus sera automatiquement arrêté
Validation.validateAndLogAddress(walletAddress, 'improved_acc_transactions.js', true);

console.log(`🚀 Démarrage de la collecte des transactions pour ${walletAddress}`);
console.log(`📊 Mode: Pagination basée sur les signatures de transactions (plus fiable)`);
console.log(`🔄 Force refresh: ${forceRefresh ? 'Oui' : 'Non'}`);

// Si force refresh est activé, supprimer le fichier existant
if (forceRefresh) {
  const outputFile = `./output/transactions_${walletAddress}.json`;
  if (existsSync(outputFile)) {
    try {
      unlinkSync(outputFile);
      console.log(`🗑️ Fichier existant supprimé: ${outputFile}`);
    } catch (err) {
      console.error(`❌ Erreur lors de la suppression du fichier existant:`, err);
    }
  }
}

// Créer une instance du collecteur de données avec des options avancées
const collector = new SolanaDataCollector(walletAddress, {
  includeTransactions: true,
  includeTokenAccounts: false,
  includePortfolio: false,
  includeBalanceChanges: false,
  maxPages: 5, // Essayer de collecter jusqu'à 5 lots
});

// Afficher les informations de progression
process.stdout.write('⏳ Initialisation de la collecte...\r');

// Collecter uniquement les transactions
const startTime = Date.now();

collector.collectTransactions()
  .then(result => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const count = result.data?.length || 0;
    
    console.log(`\n✅ Collecte terminée en ${duration}s: ${count} transactions collectées`);
    
    // Vérifier si nous avons atteint le maximum
    if (count >= 200) {
      console.log(`🎯 Le nombre maximum de transactions a été atteint (${count}/200)`);
    } else if (count > 0) {
      console.log(`📝 ${count} transactions collectées (objectif: 200)`);
    } else {
      console.log(`⚠️ Aucune transaction trouvée pour ce portefeuille`);
    }
    
    // Afficher la dernière signature pour référence
    if (count > 0 && result.data && result.data[count-1]) {
      const lastSignature = result.data[count-1].signature || result.data[count-1].tx_hash;
      console.log(`🏷️ Signature de la dernière transaction: ${lastSignature || 'non disponible'}`);
    }
    
    // Afficher le chemin du fichier de sortie
    console.log(`📁 Résultats enregistrés dans: output/transactions_${walletAddress}.json`);
    
    if (verbose) {
      console.log('\n📊 Répartition par statut:');
      // Calculer les statistiques de statut
      const statusStats = {};
      if (result.data) {
        result.data.forEach(tx => {
          const status = tx.status || 'Unknown';
          statusStats[status] = (statusStats[status] || 0) + 1;
        });
      }
      
      // Afficher les statistiques
      Object.entries(statusStats).forEach(([status, count]) => {
        console.log(`   - ${status}: ${count} transactions`);
      });
    }
  })
  .catch(error => {
    console.error(`\n❌ Erreur lors de la collecte des transactions:`, error);
  });
