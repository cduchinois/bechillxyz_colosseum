
// Ce script utilise la pagination basée sur les signatures pour récupérer les transactions
import 'dotenv/config';
import SolanaDataCollector from './data_collector.js';
import { existsSync, unlinkSync } from 'fs';
import { parseArgs } from 'node:util';

// Fonction pour afficher l'aide
function showHelp() {
  console.log('Usage: node acc_transactions.js <WALLET_ADDRESS> [options]');
  console.log('');
  console.log('Options:');
  console.log('  --help, -h              Affiche ce message d\'aide');
  console.log('  --force, -f             Force la récupération des données même si un fichier existant est trouvé');
  console.log('  --verbose, -v           Affiche des informations de débogage détaillées');
  console.log('  --debug                 Affiche des informations très détaillées pour le debugging');
  console.log('  --csv                   Exporte les résultats au format CSV');
  console.log('  --output=<path>         Spécifie le dossier de sortie (par défaut: ./output)');
  console.log('  --api=<url>             Utilise une URL d\'API personnalisée');
  console.log('  --api-key=<key>         Utilise une clé API personnalisée');
  console.log('  --max-pages=<number>    Nombre maximal de lots de requêtes (par défaut: 5)');
  console.log('  --max-retries=<number>  Nombre maximal de tentatives en cas d\'erreur (par défaut: 5)');
  console.log('  --start-date=<date>     Filtre les transactions après cette date (YYYY-MM-DD)');
  console.log('  --end-date=<date>       Filtre les transactions avant cette date (YYYY-MM-DD)');
  console.log('  --type=<type>           Filtre par type de transaction');
  console.log('  --status=<status>       Filtre par statut (success ou fail)');
  console.log('');
  console.log('Exemples:');
  console.log('  node acc_transactions.js ABC123... --force --csv');
  console.log('  node acc_transactions.js ABC123... --start-date=2023-01-01 --end-date=2023-12-31 --csv');
  console.log('  node acc_transactions.js ABC123... --type=transfer --status=success');
  process.exit(0);
}

// Analyser les arguments avec parseArgs
const options = {
  force: { type: 'boolean', short: 'f' },
  verbose: { type: 'boolean', short: 'v' },
  help: { type: 'boolean', short: 'h' },
  debug: { type: 'boolean' },
  csv: { type: 'boolean' },
  output: { type: 'string' },
  api: { type: 'string' },
  'api-key': { type: 'string' },
  'max-pages': { type: 'string' },
  'max-retries': { type: 'string' },
  'start-date': { type: 'string' },
  'end-date': { type: 'string' },
  type: { type: 'string' },
  status: { type: 'string' }
};

// Gérer les erreurs de parsing
let args;
try {
  args = parseArgs({ options, allowPositionals: true, strict: false });
} catch (err) {
  console.error(`❌ Erreur de parsing des arguments: ${err.message}`);
  showHelp();
}

// Afficher l'aide si demandé
if (args.values.help) {
  showHelp();
}

// Récupérer l'adresse du portefeuille (premier argument positif ou variable d'environnement)
const walletAddress = args.positionals[0] || process.env.ADDRESS_WALLET;
if (!walletAddress) {
  console.error('❌ Erreur: Aucune adresse de portefeuille fournie.');
  showHelp();
}

// Extraire les options
const forceRefresh = args.values.force;
const verbose = args.values.verbose;
const debug = args.values.debug;
const exportCsv = args.values.csv;
const outputPath = args.values.output;
const apiEndpoint = args.values.api;
const apiKey = args.values['api-key'];
const maxPages = args.values['max-pages'] ? parseInt(args.values['max-pages'], 10) : 5;
const maxRetries = args.values['max-retries'] ? parseInt(args.values['max-retries'], 10) : 5;
const startDate = args.values['start-date'];
const endDate = args.values['end-date'];
const transactionType = args.values.type;
const transactionStatus = args.values.status;

// Afficher les paramètres 
console.log(`🚀 Récupération des transactions pour l'adresse ${walletAddress}`);
console.log(`📊 Mode: Pagination basée sur les signatures (plus fiable)`);

if (verbose) {
  console.log(`\nOptions configurées:`);
  console.log(`- Force refresh: ${forceRefresh ? 'Oui' : 'Non'}`);
  console.log(`- Mode verbeux: ${verbose ? 'Oui' : 'Non'}`);
  console.log(`- Export CSV: ${exportCsv ? 'Oui' : 'Non'}`);
  console.log(`- Dossier de sortie: ${outputPath || './output'}`);
  console.log(`- API endpoint: ${apiEndpoint || 'Par défaut'}`);
  console.log(`- Max pages: ${maxPages}`);
  console.log(`- Max retries: ${maxRetries}`);
  
  // Afficher les filtres configurés
  const filters = [];
  if (startDate) filters.push(`Après ${startDate}`);
  if (endDate) filters.push(`Avant ${endDate}`);
  if (transactionType) filters.push(`Type: ${transactionType}`);
  if (transactionStatus) filters.push(`Statut: ${transactionStatus}`);
  
  if (filters.length > 0) {
    console.log(`- Filtres: ${filters.join(', ')}`);
  }
}

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

// Créer une instance du collecteur avec les options
const collector = new SolanaDataCollector(walletAddress, {
  includeTransactions: true,
  includeTokenAccounts: false,
  includePortfolio: false,
  includeBalanceChanges: false,
  maxPages: maxPages,
  maxRetries: maxRetries,
  forceRefresh: forceRefresh,
  verbose: verbose,
  debug: debug,
  apiEndpoint: apiEndpoint,
  apiKey: apiKey,
  exportFormat: exportCsv ? 'csv' : null,
  exportPath: outputPath || './output',
  startDate: startDate,
  endDate: endDate,
  transactionType: transactionType,
  transactionStatus: transactionStatus
});

// Afficher le message d'initialisation
process.stdout.write('⏳ Récupération des transactions en cours...\r');

// Horodatage de début
const startTime = Date.now();

// Collecter les transactions
collector.collectTransactions()
  .then(result => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const count = result.data?.length || 0;
    
    console.log(`\n✅ Collecte terminée en ${duration}s: ${count} transactions récupérées`);
    
    if (count > 0) {
      // Afficher la dernière signature pour référence
      const lastTransaction = result.data[count-1];
      const lastSignature = lastTransaction?.signature || lastTransaction?.tx_hash;
      
      if (verbose) {
        console.log(`\n📊 Statistiques des transactions:`);
        // Calculer la répartition des statuts
        const statusStats = {};
        result.data.forEach(tx => {
          const status = tx.status || 'Inconnu';
          statusStats[status] = (statusStats[status] || 0) + 1;
        });
        
        // Calculer la répartition des types
        const typeStats = {};
        result.data.forEach(tx => {
          // Le type peut être dans différents champs
          let type = 'Inconnu';
          if (tx.type) {
            type = tx.type;
          } else if (tx.parsed_instructions && tx.parsed_instructions.length > 0) {
            type = tx.parsed_instructions[0].type || 'Inconnu';
          }
          typeStats[type] = (typeStats[type] || 0) + 1;
        });
        
        // Afficher les statistiques
        console.log(`\n   Statuts:`);
        Object.entries(statusStats).forEach(([status, count]) => {
          console.log(`   - ${status}: ${count} transactions`);
        });
        
        console.log(`\n   Types:`);
        Object.entries(typeStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .forEach(([type, count]) => {
            console.log(`   - ${type}: ${count} transactions`);
          });
        
        // Afficher la dernière signature 
        if (lastSignature) {
          console.log(`\n🏷️ Dernière signature: ${lastSignature}`);
        }
        
        // Afficher les filtres appliqués
        if (result.metadata?.filters) {
          const filters = Object.entries(result.metadata.filters)
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          
          if (filters) {
            console.log(`\n🔍 Filtres appliqués: ${filters}`);
          }
        }
      }
      
      console.log(`\n📁 Données sauvegardées dans output/transactions_${walletAddress}.json`);
    } else {
      console.log(`⚠️ Aucune transaction trouvée pour ce portefeuille`);
    }
  })
  .catch(error => {
    console.error(`\n❌ Erreur lors de la collecte des transactions:`, error);
    if (debug) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  });
    
    
