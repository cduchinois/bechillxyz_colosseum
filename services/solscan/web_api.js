import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

// Obtenir le chemin du répertoire actuel
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(`Répertoire actuel (__dirname): ${__dirname}`);

/**
 * Vérifie si la clé API Solscan est configurée dans le fichier .env
 * @returns {boolean} - true si la clé API est configurée, sinon false
 */
function checkSolscanApiKey() {
  if (!process.env.SOLSCAN_API_KEY) {
    console.error('❌ ERREUR: La clé API Solscan n\'est pas configurée dans le fichier .env');
    console.error('Veuillez créer ou modifier le fichier .env à la racine du projet avec la variable suivante:');
    console.error('SOLSCAN_API_KEY=votre_clé_api_solscan');
    console.error('\nVous pouvez obtenir une clé API en vous inscrivant sur https://public-api.solscan.io/');
    return false;
  }
  return true;
}

// Créer une instance d'Express
const app = express();
const port = 5051;

/**
 * Exécute un script Node.js en tant que processus séparé
 * @param {string} scriptPath - Chemin du script à exécuter
 * @param {Array} args - Arguments à passer au script
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>} - Résultat de l'exécution
 */
function runScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    if (!scriptPath) {
      return reject(new Error("Le chemin du script est indéfini"));
    }
    
    console.log(`Dans runScript, __dirname=${__dirname}, scriptPath=${scriptPath}`);
    const fullPath = path.resolve(__dirname, scriptPath);
    console.log(`Exécution du script: ${scriptPath} (chemin complet: ${fullPath}) avec les arguments: ${args.join(' ')}`);
    
    // Vérifier que le fichier existe avant de l'exécuter
    if (!fs.existsSync(fullPath)) {
      return reject(new Error(`Le script ${scriptPath} n'existe pas au chemin: ${fullPath}`));
    }
    
    const process = spawn('node', [fullPath, ...args]);
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      const chunk = data.toString();
      stdout += chunk;
      console.log(chunk);
    });
    
    process.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderr += chunk;
      console.error(chunk);
    });
    
    process.on('close', (code) => {
      console.log(`Script ${scriptPath} terminé avec le code: ${code}`);
      resolve({
        exitCode: code,
        stdout,
        stderr
      });
    });
    
    process.on('error', (err) => {
      console.error(`Erreur lors de l'exécution du script ${scriptPath}:`, err);
      reject(err);
    });
  });
}

// Page d'accueil avec formulaire
app.get('/', (req, res) => {
  // Lire les visualisations disponibles dans le dossier output/visualizations
  const visualizationsDir = path.resolve(__dirname, 'output', 'visualizations');
  let visualizationFiles = [];
  
  // Vérifier si le dossier existe
  if (fs.existsSync(visualizationsDir)) {
    try {
      // Lire le contenu du dossier
      visualizationFiles = fs.readdirSync(visualizationsDir)
        .filter(file => file.endsWith('.html'))
        .map(file => {
          // Extraire l'adresse du portefeuille du nom du fichier
          // Format attendu: wallet_report_ADRESSE.html
          const match = file.match(/wallet_report_(.+)\.html/);
          const address = match ? match[1] : 'inconnu';
          
          return {
            filename: file,
            address: address,
            url: `/output/visualizations/${file}`,
            date: fs.statSync(path.join(visualizationsDir, file)).mtime
          };
        })
        // Trier par date de modification (la plus récente en premier)
        .sort((a, b) => b.date - a.date);
    } catch (error) {
      console.error('Erreur lors de la lecture du dossier des visualisations:', error);
    }
  }
  
  // Générer le HTML pour les visualisations
  const visualizationsHtml = visualizationFiles.length > 0
    ? `<div class="visualizations-container">
        <h2>Visualisations disponibles</h2>
        ${visualizationFiles.map(viz => `
          <a class="visualization-link" href="${viz.url}" target="_blank">
            📊 Portefeuille: ${viz.address.substring(0, 8)}...${viz.address.substring(viz.address.length - 4)}
            <span class="date">${viz.date.toLocaleDateString()} ${viz.date.toLocaleTimeString()}</span>
          </a>
        `).join('')}
      </div>`
    : '';
  
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Analyse de Portefeuille Solana</title>
      <style>
        :root {
          color-scheme: dark;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #121212;
          color: #e0e0e0;
        }
        h1, h2 {
          color: #9c88ff;
          text-align: center;
        }
        .form-container, .visualizations-container {
          background-color: #1e1e1e;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
          border: 1px solid #333;
          margin-bottom: 30px;
        }
        input[type="text"] {
          width: 100%;
          padding: 8px;
          margin: 10px 0;
          font-size: 16px;
          border: 1px solid #444;
          border-radius: 4px;
          background-color: #252525;
          color: #e0e0e0;
        }
        button {
          background-color: #9c88ff;
          color: white;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          font-size: 16px;
          border-radius: 4px;
        }
        button:hover {
          background-color: #8070d5;
        }
        .options-container {
          margin-top: 10px;
        }
        .checkbox-item {
          margin-bottom: 5px;
        }
        .visualization-link {
          display: block;
          padding: 15px;
          margin: 10px 0;
          background-color: #1a237e;
          border-left: 3px solid #536dfe;
          text-decoration: none;
          color: #e0e0e0;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        .visualization-link:hover {
          background-color: #283593;
        }
        .date {
          font-size: 0.8em;
          opacity: 0.8;
          float: right;
        }
      </style>
    </head>
    <body>
      <h1>Analyse de Portefeuille Solana</h1>
      <div class="form-container">
        <form action="/analyse_wallet" method="get" id="walletForm">
          <label for="address">Adresse du portefeuille:</label>
          <input type="text" id="address" name="address" placeholder="Entrez l'adresse du portefeuille Solana" required>
          
          <div class="options-container">
            <h3>Options:</h3>
            <div class="checkbox-item">
              <input type="checkbox" id="large" name="large">
              <label for="large">Grand ensemble de données (--large)</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="skip-time" name="skip-time">
              <label for="skip-time">Sauter l'analyse temporelle (--skip-time)</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="skip-viz" name="skip-viz">
              <label for="skip-viz">Sauter la visualisation (--skip-viz)</label>
            </div>
            <div class="checkbox-item">
              <input type="checkbox" id="skip-usd" name="skip-usd">
              <label for="skip-usd">Sauter l'estimation USD (--skip-usd)</label>
            </div>
          </div>
          
          <button type="submit">Lancer l'analyse</button>
        </form>
      </div>

      ${visualizationsHtml}

      <script>
        document.getElementById('walletForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const address = document.getElementById('address').value;
          if (!address) return;
          
          let url = '/analyse_wallet/' + encodeURIComponent(address);
          
          // Ajouter les options si sélectionnées
          const params = [];
          if (document.getElementById('large').checked) params.push('large=true');
          if (document.getElementById('skip-time').checked) params.push('skipTime=true');
          if (document.getElementById('skip-viz').checked) params.push('skipViz=true');
          if (document.getElementById('skip-usd').checked) params.push('skipUsd=true');
          
          if (params.length > 0) {
            url += '?' + params.join('&');
          }
          
          window.location.href = url;
        });
      </script>
    </body>
    </html>
  `);
});

// Endpoint pour lancer l'analyse de wallet avec l'adresse en paramètre
app.get('/analyse_wallet/:address', async (req, res) => {
  // Vérifier à nouveau si la clé API est présente
  if (!checkSolscanApiKey()) {
    return res.status(500).send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erreur - Clé API manquante</title>
        <style>
          :root {
            color-scheme: dark;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: a1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #121212;
            color: #e0e0e0;
          }
          h1 {
            color: #f44336;
            text-align: center;
          }
          .error-container {
            background-color: #1e1e1e;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            border: 1px solid #333;
            border-left: 5px solid #f44336;
          }
          .back-link {
            display: block;
            margin-top: 20px;
            text-align: center;
            color: #64b5f6;
            text-decoration: none;
          }
          .back-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <h1>Erreur - Configuration incomplète</h1>
        <div class="error-container">
          <h2>La clé API Solscan n'est pas configurée</h2>
          <p>Veuillez créer ou modifier le fichier <strong>.env</strong> à la racine du projet avec la variable suivante:</p>
          <pre>SOLSCAN_API_KEY=votre_clé_api_solscan</pre>
          <p>Vous pouvez obtenir une clé API en vous inscrivant sur <a href="https://public-api.solscan.io/" target="_blank">https://public-api.solscan.io/</a></p>
          <p>Une fois la clé configurée, veuillez redémarrer le serveur.</p>
        </div>
        <a href="/" class="back-link">Retour à l'accueil</a>
      </body>
      </html>
    `);
  }

  const walletAddress = req.params.address;
  
  if (!walletAddress) {
    return res.status(400).send('Adresse de portefeuille manquante');
  }
  
  // Construction des arguments en fonction des paramètres de requête
  const args = [walletAddress];
  
  if (req.query.large === 'true') {
    args.push('--large');
  }
  
  if (req.query.skipTime === 'true') {
    args.push('--skip-time');
  }
  
  if (req.query.skipViz === 'true') {
    args.push('--skip-viz');
  }
  
  if (req.query.skipUsd === 'true') {
    args.push('--skip-usd');
  }
  
  // Préparer le chemin du script à exécuter
  const scriptPath = 'analyze_wallet.js';
  const fullPath = path.resolve(__dirname, scriptPath);
  console.log(`__dirname: ${__dirname}`);
  console.log(`scriptPath: ${scriptPath}`);
  console.log(`fullPath résolu: ${fullPath}`);
  
  // Vérifier si le fichier existe
  let scriptExists = true;
  let errorMessage = '';
  
  if (!fs.existsSync(fullPath)) {
    scriptExists = false;
    errorMessage = `Le script ${scriptPath} n'existe pas au chemin: ${fullPath}`;
    console.error(errorMessage);
  }

  // Envoyer une réponse immédiate
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Analyse en cours</title>
      <style>
        :root {
          color-scheme: dark;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #121212;
          color: #e0e0e0;
        }
        h1, h2 {
          color: #9c88ff;
          text-align: center;
        }
        .info-container {
          background-color: #1e1e1e;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
          margin-bottom: 20px;
          border: 1px solid #333;
        }
        .status {
          padding: 10px;
          background-color: #1a2327;
          border-left: 5px solid #64ffda;
          margin-bottom: 10px;
        }
        .links {
          margin-top: 30px;
          text-align: center;
        }
        .links a {
          display: inline-block;
          margin: 5px 10px;
          color: #64b5f6;
          text-decoration: none;
        }
        .links a:hover {
          text-decoration: underline;
          color: #90caf9;
        }
      </style>
    </head>
    <body>
      <h1>Analyse de Portefeuille Solana</h1>
      
      <div class="info-container">
        <h2>Analyse en cours</h2>
        <div class="status">
          <p>✅ L'analyse du portefeuille <strong>${walletAddress}</strong> a été lancée en arrière-plan.</p>
          <p>Options: ${args.slice(1).join(', ') || 'Aucune'}</p>
          <p>L'analyse peut prendre plusieurs minutes. Les résultats seront enregistrés dans le dossier "output".</p>
        </div>
      </div>
      
      <div class="links">
        <a href="/">Retour à l'accueil</a>
        <a href="/output/${walletAddress}" target="_blank">Voir les résultats (quand disponibles)</a>
      </div>
    </body>
    </html>
  `);
  
  // Lancer l'analyse en arrière-plan
  try {
    console.log(`Lancement de l'analyse pour le portefeuille: ${walletAddress}`);
    
    // On utilise les variables scriptPath et fullPath déjà définies plus haut
    // Pas besoin de les redéfinir ici
    
    // Vérifier à nouveau si le fichier existe
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Le script ${scriptPath} n'existe pas au chemin: ${fullPath}`);
    }
    
    // Une promesse qui sera résolue quand l'analyse sera terminée
    const analysisPromise = runScript(scriptPath, args)
      .then(result => {
        console.log(`Analyse terminée avec le code: ${result.exitCode}`);
        return result;
      })
      .catch(err => {
        console.error('Erreur lors de l\'analyse:', err);
        throw err;
      });
    
    // Stocker la promesse dans un objet global pour pouvoir vérifier l'état plus tard
    if (!app.locals.analysisJobs) {
      app.locals.analysisJobs = {};
    }
    
    app.locals.analysisJobs[walletAddress] = {
      startTime: new Date(),
      promise: analysisPromise,
      status: 'running',
      args: args
    };
    
    console.log('Réponse envoyée, analyse lancée en arrière-plan');
  } catch (error) {
    console.error('Erreur lors du lancement de l\'analyse:', error);
  }
});

// Endpoint pour accéder aux fichiers de sortie
app.get('/output/:address', (req, res) => {
  const walletAddress = req.params.address;
  
  res.send(`
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Résultats d'analyse - ${walletAddress}</title>
      <style>
        :root {
          color-scheme: dark;
        }
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #121212;
          color: #e0e0e0;
        }
        h1, h2 {
          color: #9c88ff;
          text-align: center;
        }
        .results-container {
          background-color: #1e1e1e;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
          border: 1px solid #333;
        }
        .file-link {
          display: block;
          padding: 10px;
          margin: 5px 0;
          background-color: #263238;
          border-left: 3px solid #64ffda;
          text-decoration: none;
          color: #e0e0e0;
        }
        .file-link:hover {
          background-color: #37474f;
        }
        .back-link {
          display: block;
          margin-top: 20px;
          text-align: center;
          color: #64b5f6;
        }
        .visualization-link {
          display: block;
          padding: 15px;
          margin: 20px 0;
          background-color: #1a237e;
          border-left: 3px solid #536dfe;
          text-decoration: none;
          color: #e0e0e0;
          font-weight: bold;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>Résultats d'analyse</h1>
      <h2>Portefeuille: ${walletAddress}</h2>
      
      <div class="results-container">
        <h3>Fichiers de résultats:</h3>
        
        <a class="visualization-link" href="/output/visualizations/wallet_report_${walletAddress}.html" target="_blank">
          📊 Visualisation HTML
        </a>
        
        <a class="file-link" href="/output/file/wallet_report_${walletAddress}.json" target="_blank">
          📄 Rapport consolidé (wallet_report_${walletAddress}.json)
        </a>
        
        <a class="file-link" href="/output/file/platforms_summary_${walletAddress}.json" target="_blank">
          🏢 Résumé des plateformes (platforms_summary_${walletAddress}.json)
        </a>
        
        <a class="file-link" href="/output/file/token_movements_${walletAddress}.json" target="_blank">
          💱 Mouvements de tokens (token_movements_${walletAddress}.json)
        </a>
        
        <a class="file-link" href="/output/file/activities_detailed_summary_${walletAddress}.json" target="_blank">
          🔬 Résumé détaillé des activités (activities_detailed_summary_${walletAddress}.json)
        </a>
        
        <a class="file-link" href="/output/file/activities_advanced_summary_${walletAddress}.json" target="_blank">
          📈 Résumé avancé des activités (activities_advanced_summary_${walletAddress}.json)
        </a>
        
        <a class="file-link" href="/output/file/time_analysis_${walletAddress}.json" target="_blank">
          📅 Analyse temporelle (time_analysis_${walletAddress}.json)
        </a>
        
        <p>Note: Les fichiers peuvent ne pas être disponibles immédiatement. Actualisez la page si l'analyse est toujours en cours.</p>
        
        <a class="back-link" href="/">Retour à l'accueil</a>
      </div>
    </body>
    </html>
  `);
});

// Endpoint pour accéder à un fichier spécifique dans le dossier output
app.get('/output/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.resolve(__dirname, 'output', filename);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Erreur lors de l\'envoi du fichier:', err);
      res.status(404).send(`Fichier '${filename}' non trouvé ou analyse toujours en cours`);
    }
  });
});

// Endpoint pour accéder à la visualisation HTML
app.get('/output/visualizations/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.resolve(__dirname, 'output', 'visualizations', filename);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Erreur lors de l\'envoi de la visualisation:', err);
      res.status(404).send(`Visualisation '${filename}' non trouvée ou analyse toujours en cours`);
    }
  });
});

// Vérifier si la clé API Solscan est présente avant de démarrer le serveur
if (!checkSolscanApiKey()) {
  console.error('⛔ Impossible de démarrer le serveur: La clé API Solscan n\'est pas configurée.');
  process.exit(1);
}

// Démarrer le serveur
app.listen(port, () => {
  console.log(`✅ Serveur API web démarré sur http://localhost:${port}`);
  console.log(`🌐 Accédez à http://localhost:${port} dans votre navigateur pour lancer une analyse`);
});
