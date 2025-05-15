
import 'dotenv/config';
import { writeFile } from 'fs/promises';

const requestOptions = {
  method: "get",
  headers: {"token": process.env.SOLSCAN_API_KEY},
}

fetch("https://pro-api.solscan.io/v2.0/market/list?page=1&page_size=100&sort_by=volumes_24h&sort_order=desc", requestOptions)
  .then(response => response.json())
  .then(async response => {
    // Afficher la réponse avec une mise en forme améliorée
    console.log(JSON.stringify(response, null, 2));
    
    // Écrire les résultats dans un fichier JSON
    await writeFile('output/market_listing_pool_by_volumes1.json', JSON.stringify(response, null, 2));
    console.log('Résultats écrits dans market_listing_pool_by_volumes3.json');
  })
  .catch(err => console.error(err));
    
    
