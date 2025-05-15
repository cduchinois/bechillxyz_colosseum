
import 'dotenv/config';
import { writeFile } from 'fs/promises';
import { Validation } from './utils/validation.js';

const args = process.argv.slice(2);
const walletAddress = args[0] || process.env.ADDRESS_WALLET;

if (!walletAddress) {
  console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node acc_portfolio.js ADDRESS_WALLET');
  process.exit(1);
}

// Valider l'adresse du portefeuille avec notre système d'erreur
Validation.validateAndLogAddress(walletAddress, 'acc_portfolio.js', true);

const requestOptions = {
  method: "get",
  headers: {"token": process.env.SOLSCAN_API_KEY},
}

fetch(`https://pro-api.solscan.io/v2.0/account/portfolio?address=${walletAddress}`, requestOptions)
  .then(response => response.json())
  .then(async response => {
    // Afficher la réponse avec une mise en forme améliorée
    console.log(JSON.stringify(response, null, 2));
    
    // L'adresse du portefeuille est déjà récupérée au début du script
    
    // Préparer le chemin du fichier avec l'adresse du portefeuille
    const outputFile = `output/portfolio_${walletAddress}.json`;
    
    // Écrire les résultats dans un fichier JSON
    await writeFile(outputFile, JSON.stringify(response, null, 2));
    console.log(`Résultats écrits dans ${outputFile}`);
  })
  .catch(err => console.error(err));
    
    
