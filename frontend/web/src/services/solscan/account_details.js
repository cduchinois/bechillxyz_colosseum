
import 'dotenv/config';

const args = process.argv.slice(2);
const walletAddress = args[0] || process.env.ADDRESS_WALLET;

if (!walletAddress) {
  console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node account_details.js ADDRESS_WALLET');
  process.exit(1);
}

const requestOptions = {
  method: "get",
  headers: {"token": process.env.SOLSCAN_API_KEY},
}

fetch(`https://pro-api.solscan.io/v2.0/account/detail?address=${walletAddress}`, requestOptions)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));
    
    
