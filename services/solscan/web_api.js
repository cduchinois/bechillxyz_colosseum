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
          <input type="text" id="address" name="address" value="GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S" placeholder="Entrez l'adresse du portefeuille Solana" required>
          
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
        /* Style pour le spinner */
        .loader-container {
          text-align: center;
          margin: 20px 0;
        }
        .loader {
          display: inline-block;
          width: 60px;
          height: 60px;
          border: 4px solid rgba(156, 136, 255, 0.3);
          border-radius: 50%;
          border-top: 4px solid #9c88ff;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .progress-text {
          margin-top: 15px;
          font-size: 14px;
          color: #9c88ff;
        }
        .notification {
          padding: 15px;
          background-color: #1b5e20;
          color: white;
          border-radius: 8px;
          margin-top: 20px;
          display: none;
          animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .notification a {
          color: white;
          text-decoration: underline;
          font-weight: bold;
        }
        .notification-error {
          background-color: #b71c1c;
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
          <p>L'analyse peut prendre plusieurs minutes. Veuillez patienter...</p>
        </div>
        
        <!-- Spinner de chargement -->
        <div class="loader-container">
          <div class="loader"></div>
          <p class="progress-text">Traitement des données en cours...</p>
        </div>
        
        <!-- Notification quand l'analyse est terminée -->
        <div id="notification" class="notification">
          <p>🎉 L'analyse est terminée ! <a href="/output/${walletAddress}" id="results-link">Voir les résultats</a></p>
        </div>
        
        <!-- Notification en cas d'erreur -->
        <div id="notification-error" class="notification notification-error">
          <p>❌ Une erreur s'est produite lors de l'analyse.</p>
          <p id="error-details"></p>
        </div>
      </div>
      
      <div class="links">
        <a href="/">Retour à l'accueil</a>
        <a href="/output/${walletAddress}" id="view-results" style="opacity: 0.5;" target="_blank">Voir les résultats (chargement en cours)</a>
      </div>
      
      <script>
        // Fonction pour vérifier périodiquement le statut de l'analyse
        const walletAddress = "${walletAddress}";
        let checkInterval;
        let completionTimeout;
        
        // Démarrer la vérification du statut
        function checkAnalysisStatus() {
          fetch("/check_analysis_status/${walletAddress}")
            .then(response => response.json())
            .then(data => {
              const progressText = document.querySelector('.progress-text');
              
              // Log pour déboguer le statut reçu
              console.log(\`Statut reçu: \${data.status}, fichiers prêts: \${data.filesReady}\`, data);
              
              if (data.status === 'completed' || data.filesReady === true) {
                // L'analyse est terminée avec succès ou les fichiers sont prêts
                clearInterval(checkInterval);
                
                // Mettre à jour le texte de progression
                progressText.textContent = 'Analyse complète terminée avec succès !';
                
                // Afficher la notification
                document.getElementById('notification').style.display = 'block';
                
                // Activer le lien vers les résultats
                document.getElementById('view-results').style.opacity = '1';
                
                // Masquer le spinner
                document.querySelector('.loader').style.display = 'none';
                
                // Jouer un son de notification
                try {
                  const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAKRAAAAAAAAAbCGGDKwAAAAAAAAAAAAAAAAAAAAAP/jOMAAAAIAAABEAyAAAP/PJUDiXf7sGAAAZJidTGGJ5OJ9/g7I/0A30339g2Ocl37NC6yX8c5YevqQAIACf/zApf1x1hL0b/Md/Lu/9dP/KP8i/5d/9GMx/uDf1DFn/935x37oPJhf/7jFBPy8f+sP+yv////8f//0uv//yIX/8h5//5XEAUQBP/1hS/rjrCXo3+Y//rcXy38o/yL/l3/0YzH+4N/UOCIX/+4xQT8vH/rD/sr////x///S6///Ihf/yGQyGQzCSJQlf/+MYxAUMKyZ8AZmQAPSqmS+czO6maIi7MzREdmQyi+YyGMjrMzBmdLMhCBMZDIZmZjTMYQgTGRhi+dPO655sgoRERHMzM6IiI/MzMzMzRERMZdEREREQiIiOZmZmZmYRAACGYiIZoCGiIhERE//4xjEEwvjFmQBmSADc55i8Ew0TIQZERERMzOiZmZoinMRMzMzM6IuiIiIiJEdDKIiO+ZmZkMoiHEREREwII6GREQwMH1///Mzoz8zMzMzMzOiPzMzM/MzMzMzM6ZmZmZmZmaZmaYiIAEMAAAH//jGMQZC9sd6AMSQAc9qYg2JOT6J76d/btOu/qpa0nZ7d+2//Xfn++jSQbVs78AAAAAAAQGEP8+78+JE/yIiP/iQiIiIiESePEid//xIeJERmR4iIiIiJCJDxMjIzMkPERERERESMzMzJAAAEIAg//jGMQlDsABoAMGMAYOvWEho+N//afO///1+5RQXebIcCwD//59qHFQQQAH/////kOR///5CHcGRDkIEQpm7//////9ynV2UU6n/////oUCtLiAAAcIBQ0RM/2WJRMnEzPmZkaZmZmaIiPmiImaJIZo//MzR//jGMQUC7ADIgHhOAMzNJSJ9iO7f/cIh+2RaAFQ///buRFMBiCH////4fh+H/h+IBCRTeIfnjf/4E8cPwgQBBN/BP///0P//o3egIglEOj//////Q58QTwxGFQAAgCANNEoocA00aSNNFGkkUaaRtGmmkU0U//jGMQ8D0gCBQMrPiEaaKSRFJJG0Ya0jtGkkjTRTr1GmlkdpJJG2kjTWNNGSHf////JJJJ/5gICB3//5JJEAQCAIDyCAAIJP////9naREkk7v//9SJJIogAAUAoIxdyshfcLbe1L1BLV67Pb2+3e3Rtb/0N7//jGMQ2DkAB6BcpNie3e1W3W+3Nvty17q1urd7e/bXb7d7d7W17a9va2vbOqqqqqqAAIB6kUVVVV9b0NTU1NTX9vt7e3t7a2tra3/t7e3t7a2t0NTNvb29va2pqampqa363v0NTU1NTU0NTU1NQDAIAH//jGMQ9CsAASAHhGAPm5ubm5vb380NDQ0NNTU1M3/TU1NTU1NQYAAgAAAAAAAABrEDTIyO7u7oi7oiEXdzMzMzmbuoiIu7uyf/mYzO7u7oiIiIiM7ui7u6Ii6K7oiN3RGZmZmbohXd3MzMRHd0Yq//jGMR4EHMeNAHAGAGZkR3REREQrMzO7ou7rd3RDMzNERERERCszM7ui7uoiIiL/+ZmZ/+iIiIiMzM7u//mZmZvmZmZmZjMzMzMzMzM3//M3zMzMzMzMzO7u7u7IiIiI///u7oiIzMzMzu7u7u4A//jGMREDXgqVAMGGAIiIiIiIiImZmYj//MzMmZmZiIjM//zMzpmZjLpmZEREf////MzMzO7u7u7u7kREREREQkIhESESIiIiIiIiIi7u7u7u7iIiIiIiIiLu7u7u7i7u7u7u7u7u7u7u7u4AAAEg//jGMRADpAKRCGDGAOCCoqEJ8CioBBUKhoODgoKii4KCi4OdnZ2QkJCXl5eUlJSSkoODg4KF0NDQzpCSklJ3d3dikpKSnZ2SkpKSkpeXl5KDg4OCgoOF25CQk52Sg4KDhc6QkJKSkpKSAAABIAAA//jGMQ0C/AKAAGIGAEAgEAQ2EBQYGCAgKAgQEBAQEBAQEBAQEBAQEBAQECAQCAgICAoSEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAA//jGMRGCfg6EAGHEABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQUAABAgQKEDBwoULFixYoWLGDhw4cOHDixYsWLFixQsYOGDBQoUKGDBgoUKFCxIsQIABAAAA//jGMRfDkAB6AHHGAAAAAAAAlL9ahUSEpEhIlJCQlpkJCWmQkJCQlJSUlJSUoSEhKSkiRIVqFSRISkSEiUkJCWmQkJaZCQkJCUlJSUlJShISEpKSJEhWoVJEhKRISJSQkJaZCQlpkJCQkJAAAQAA//jGMRLDIAiEgMGMAEpKUlJShISE1KSkpKSkhISEtMhISEhLS0tLS0uQkJCampKSJEmpiQkJiYmJqalJSUmpqUlJqYmJiYmJiampSUlJSQmJidnZ2ZCQkJeXl5eXlpaXl5eXlpaWl5eWAAHIAQA=');
                  audio.play();
                } catch (e) {
                  console.log('Son de notification non supporté');
                }
                
                // Redirection automatique vers la visualisation HTML après 2 secondes
                const visualizationUrl = "/output/visualizations/wallet_report_${walletAddress}.html";
                
                // Afficher un message de redirection
                progressText.textContent = 'Redirection vers le rapport dans 2 secondes...';
                
                // Rediriger après un délai pour laisser le temps de voir la notification
                completionTimeout = setTimeout(() => {
                  window.location.href = visualizationUrl;
                }, 2000);
                
              } else if (data.status === 'failed') {
                // L'analyse a échoué
                clearInterval(checkInterval);
                progressText.textContent = 'L'analyse a échoué.';
                
                // Afficher la notification d'erreur
                document.getElementById('error-details').textContent = data.error || 'Veuillez réessayer ou contacter l'administrateur.';
                document.getElementById('notification-error').style.display = 'block';
                
                // Masquer le spinner
                document.querySelector('.loader').style.display = 'none';
                
              } else if (data.status === 'running') {
                // L'analyse est toujours en cours
                progressText.textContent = 'Traitement des données en cours... Veuillez patienter.';
              } else {
                // Statut inconnu
                progressText.textContent = 'Vérification du statut...';
                console.log('Statut inconnu reçu:', data.status);
              }
            })
            .catch(error => {
              console.error('Erreur lors de la vérification du statut:', error);
            });
        }
        
        // Vérifier le statut toutes les 5 secondes
        checkInterval = setInterval(checkAnalysisStatus, 5000);
        
        // Vérifier le statut immédiatement
        checkAnalysisStatus();
      </script>
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
        
        // Mettre à jour le statut de l'analyse
        if (app.locals.analysisJobs && app.locals.analysisJobs[walletAddress]) {
          app.locals.analysisJobs[walletAddress].status = 'completed';
          app.locals.analysisJobs[walletAddress].completedAt = new Date();
        }
        
        return result;
      })
      .catch(err => {
        console.error('Erreur lors de l\'analyse:', err);
        
        // Mettre à jour le statut en cas d'erreur
        if (app.locals.analysisJobs && app.locals.analysisJobs[walletAddress]) {
          app.locals.analysisJobs[walletAddress].status = 'failed';
          app.locals.analysisJobs[walletAddress].error = err.message;
        }
        
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

// Endpoint pour vérifier le statut de l'analyse d'un portefeuille
app.get('/check_analysis_status/:address', (req, res) => {
  const walletAddress = req.params.address;
  
  // Vérifier d'abord si les fichiers de résultat existent
  const vizFilePath = path.resolve(__dirname, 'output', 'visualizations', `wallet_report_${walletAddress}.html`);
  const reportFilePath = path.resolve(__dirname, 'output', `wallet_report_${walletAddress}.json`);
  
  const vizExists = fs.existsSync(vizFilePath);
  const reportExists = fs.existsSync(reportFilePath);
  const filesExist = vizExists || reportExists;
  
  // Vérifier si l'analyse est en cours d'exécution
  const job = app.locals.analysisJobs && app.locals.analysisJobs[walletAddress];
  
  // Si les fichiers existent, considérer l'analyse comme terminée quel que soit le statut
  if (filesExist) {
    if (job && job.status === 'running') {
      // Mettre à jour le statut dans l'objet global
      job.status = 'completed';
      job.completedAt = new Date();
      console.log(`Analyse considérée comme terminée pour ${walletAddress} car les fichiers existent`);
    }
    
    res.json({
      status: 'completed',
      filesReady: true,
      resultUrl: `/output/${walletAddress}`
    });
    return;
  }
  
  // Si l'analyse est en cours mais les fichiers n'existent pas encore
  if (job) {
    res.json({ 
      status: job.status,
      filesReady: false
    });
    return;
  }
  
  // Aucune analyse en cours et aucun fichier trouvé
  res.json({ status: 'not_found', filesReady: false });
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
