# Solana DeFi Activity Analyzer

Ce projet permet d'analyser les activités DeFi d'un portefeuille Solana en utilisant l'API Solscan.

## 🛠️ Installation

1. Clonez ce dépôt:
   ```bash
   git clone <repository_url>
   ```

2. Créez un fichier `.env` à la racine du projet avec les variables suivantes:
   ```
   SOLSCAN_API_KEY=votre_clé_api_solscan
   ADDRESS_WALLET=adresse_portefeuille_solana_par_défaut (optionnelle)
   ```
   
   **IMPORTANT:** La clé `SOLSCAN_API_KEY` est obligatoire pour que l'application fonctionne. Vous pouvez obtenir une clé API en vous inscrivant sur [https://public-api.solscan.io/](https://public-api.solscan.io/). Sans cette clé, les scripts ne pourront pas s'exécuter.

3. Installez les dépendances:
   ```bash
   npm install
   ```

4. Run
```
node web_api.js
ou
npm run start
```

5. Manage on port 5051
http://localhost:5051/

## 📊 Scripts disponibles

### 1. Récupération des activités DeFi (`acc_defi_activities.js`)

Ce script interroge l'API Solscan pour récupérer les activités DeFi d'un portefeuille Solana.

**Usage:**
```bash
node acc_defi_activities.js [ADRESSE_PORTEFEUILLE]
```

**Output:**
- Crée un fichier JSON dans le dossier `output/` avec les activités récupérées

**Format de données:**
```javascript
{
  "success": boolean,
  "data": [
    {
      "activity_type": string,       // Type d'activité (ex: "ACTIVITY_TOKEN_SWAP")
      "platform": string[],          // Plateformes utilisées
      "value": number,               // Valeur de la transaction en USD
      "routers": {                   // Informations sur les tokens échangés
        "token1": string,            // Adresse du premier token
        "token1_decimals": number,   // Décimales du premier token
        "amount1": number,           // Montant du premier token
        "token2": string,            // Adresse du deuxième token
        "token2_decimals": number,   // Décimales du deuxième token
        "amount2": number,           // Montant du deuxième token
        "child_routers": []          // Routes enfant (si applicable)
      },
      "time": string,                // Timestamp de la transaction
      // ... autres propriétés
    },
    // ... autres activités
  ],
  "metadata": {                      // Métadonnées (optionnel)
    "tokens": {                      // Informations sur les tokens
      "adresse_token": {             // Clé = adresse du token
        "token_symbol": string,      // Symbole du token
        // ... autres propriétés
      },
      // ... autres tokens
    }
  }
}
```

### 2. Analyse avancée des activités (`analyze_activities_advanced.js`)

Ce script analyse les activités DeFi récupérées et produit des statistiques détaillées.

**Usage:**
```bash
node analyze_activities_advanced.js [ADRESSE_PORTEFEUILLE]
```

**Input:**
- Utilise le fichier JSON généré par `acc_defi_activities.js`

**Output:**
- Crée un fichier JSON dans le dossier `output/` avec les analyses
- Affiche un résumé dans la console

**Format de sortie:**
```javascript
{
  "summary": {
    "totalActivities": number,         // Nombre total d'activités
    "uniqueActivityTypes": number,     // Nombre de types d'activités uniques
    "uniquePlatforms": number,         // Nombre de plateformes uniques
    "uniqueTokens": number,            // Nombre de tokens uniques
    "uniqueTokenPairs": number,        // Nombre de paires de tokens uniques
    "mostUsedPlatform": string,        // Plateforme la plus utilisée
    "mostCommonActivityType": string,  // Type d'activité le plus courant
    "valueDistribution": {            // Distribution des transactions par valeur
      "0-1": number,
      "1-5": number,
      "5-10": number,
      "10-50": number,
      "50-100": number,
      "100+": number,
      "unknown": number
    }
  },
  "activityTypes": {},                 // Détails par type d'activité
  "platforms": {},                     // Détails par plateforme
  "tokenPairs": {},                    // Détails par paire de tokens
  "tokens": {
    "addresses": string[],             // Liste des adresses de tokens
    "metadata": {}                     // Métadonnées des tokens
  }
}
```

## 💡 Compatibilité entre scripts

Les scripts ont été conçus pour fonctionner ensemble, avec `analyze_activities_advanced.js` capable de traiter les fichiers JSON générés par `acc_defi_activities.js`. 

**Important:** Pour l'analyse avancée, les données brutes des activités sont requises. Par conséquent, le script d'analyse avancée ne fonctionnera qu'avec les fichiers générés par `acc_defi_activities.js`.

## 🔄 Flux de travail recommandé

1. Récupérer les activités DeFi:
   ```bash
   node acc_defi_activities.js ADRESSE_PORTEFEUILLE
   ```

2. Analyser les activités récupérées:
   ```bash
   node analyze_activities_advanced.js ADRESSE_PORTEFEUILLE
   ```

## 📝 Notes techniques

- Le script d'analyse avancée (`analyze_activities_advanced.js`) contient une fonction de normalisation des données qui permet d'adapter différents formats de données d'entrée.
- En cas d'erreur, vérifiez les messages d'erreur qui donneront des indications sur la cause du problème et les actions correctives possibles.
- Tous les résultats sont stockés dans le dossier `output/` avec des noms de fichiers incluant l'adresse du portefeuille analysé.

### Prérequis techniques

- **Clé API Solscan**: L'application vérifie au démarrage si la clé API est correctement configurée dans le fichier `.env`. Si la clé est absente, l'exécution s'arrête avec un message d'erreur explicatif.
- **Structure des fichiers**: Assurez-vous que la structure des dossiers du projet reste intacte pour garantir le bon fonctionnement des scripts.
- **Permissions**: Les scripts nécessitent des droits d'écriture dans le dossier `output/` pour stocker les résultats d'analyse.
