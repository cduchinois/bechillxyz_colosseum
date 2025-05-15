// filepath: /Volumes/PortableSSD/beChill/bechillxyz_colosseum_dev/services/solscan/web_api_fix.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';
import { Validation } from './utils/validation.js';

// Obtenir le chemin du répertoire actuel
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(`Répertoire actuel (__dirname): ${__dirname}`);

// Créer une instance d'Express
const app = express();
const port = 5051;

// Middleware pour servir les fichiers statiques du dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint pour l'API
app.get('/validate-address/:address', (req, res) => {
  const address = req.params.address;
  const result = Validation.validateSolanaAddress(address);
  res.json(result);
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`✅ Serveur de validation d'adresses Solana démarré sur http://localhost:${port}`);
});
