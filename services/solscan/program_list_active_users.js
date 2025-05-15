
import 'dotenv/config';
import { writeFile } from 'fs/promises';

const requestOptions = {
  method: "get",
  headers: {"token": process.env.SOLSCAN_API_KEY},
}


fetch("https://pro-api.solscan.io/v2.0/program/list?sort_by=active_users_24h&sort_order=desc&page=5&page_size=40", requestOptions)


  .then(response => response.json())
  .then(async response => {
    // Afficher la réponse avec une mise en forme améliorée
    console.log(JSON.stringify(response, null, 2));
    
    // Écrire les résultats dans un fichier JSON
    await writeFile('output/program_list_active_users5.json', JSON.stringify(response, null, 2));
    console.log('Résultats écrits dans program_list_active_users5.json');
  })
  .catch(err => console.error(err));
    
    
