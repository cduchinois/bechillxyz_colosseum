
import 'dotenv/config';
import { writeFile } from 'fs/promises';
import { Validation } from './utils/validation.js';

const args = process.argv.slice(2);
const walletAddress = args[0] || process.env.ADDRESS_WALLET;

if (!walletAddress) {
  console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node acc_tok_accounts.js ADDRESS_WALLET');
  process.exit(1);
}

// Valider l'adresse du portefeuille avec la nouvelle méthode qui enregistre les erreurs
// Si l'adresse est invalide, le processus sera automatiquement arrêté
Validation.validateAndLogAddress(walletAddress, 'acc_tok_accounts.js', true);

const requestOptions = {
  method: "get",
  headers: {"token": process.env.SOLSCAN_API_KEY},
}

fetch(`https://pro-api.solscan.io/v2.0/account/token-accounts?address=${walletAddress}&type=token&page=1&page_size=40`, requestOptions)
  .then(response => response.json())
  .then(async response => {
    // Afficher la réponse avec une mise en forme améliorée
    console.log(JSON.stringify(response, null, 2));
    
    // L'adresse du portefeuille est déjà récupérée au début du script
    
    // Préparer le chemin du fichier avec l'adresse du portefeuille
    const outputFile = `output/token_accounts_${walletAddress}.json`;
    
    // Écrire les résultats dans un fichier JSON
    await writeFile(outputFile, JSON.stringify(response, null, 2));
    console.log(`Résultats écrits dans ${outputFile}`);
  })
  .catch(err => console.error(err));
    
    
