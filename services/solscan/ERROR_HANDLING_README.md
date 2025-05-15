# Système de Gestion des Erreurs de Validation d'Adresses Solana

Ce document explique le système de gestion d'erreurs mis en place pour capturer et enregistrer les erreurs de validation des adresses Solana dans l'application.

## Fonctionnalités implémentées

1. **Validation robuste des adresses Solana**
   - Vérification de la longueur (32-44 caractères)
   - Vérification du format base58
   - Messages d'erreur détaillés

2. **Journalisation des erreurs**
   - Enregistrement automatique dans `output/errors.json`
   - Stockage des détails (timestamp, adresse problématique, message d'erreur, source)
   - Création automatique du répertoire `output` si nécessaire

3. **Arrêt conditionnel du traitement**
   - Option pour arrêter l'exécution en cas d'adresse invalide
   - Configuration flexible selon le contexte (CLI vs Web API)

## Architecture du système

### Classes principales

1. **`ErrorHandler` (`utils/error_handler.js`)**
   - Gère la journalisation des erreurs dans un fichier JSON
   - Initialise les répertoires et fichiers nécessaires
   - Peut arrêter le processus si demandé

2. **`Validation` (`utils/validation.js`)**
   - Contient les méthodes de validation des adresses Solana
   - Intègre `ErrorHandler` pour enregistrer les erreurs

### Méthodes importantes

- **`Validation.validateAndLogAddress(address, source, exitOnError)`**
  - Valide une adresse et enregistre l'erreur si nécessaire
  - Paramètres:
    - `address`: L'adresse à valider
    - `source`: Le nom du fichier/module appelant
    - `exitOnError`: Si `true`, arrête le processus en cas d'erreur

- **`ErrorHandler.logValidationError(address, message, source, exitProcess)`**
  - Enregistre une erreur dans le fichier d'erreurs
  - Paramètres:
    - `address`: L'adresse qui a causé l'erreur
    - `message`: Le message d'erreur
    - `source`: La source de l'erreur
    - `exitProcess`: Si `true`, arrête le processus après l'enregistrement

## Structure du fichier d'erreurs

Le fichier `output/errors.json` a la structure suivante:

```json
{
  "errors": [
    {
      "timestamp": "2023-05-14T15:30:00.000Z",
      "address": "adresse_invalide",
      "message": "L'adresse est trop courte (14 caractères). Une adresse Solana valide a au moins 32 caractères.",
      "source": "analyze_wallet.js",
      "type": "validation_error"
    },
    ...
  ]
}
```

## Comment utiliser le système

### Dans les scripts CLI

```javascript
import { Validation } from './utils/validation.js';

// Valider une adresse (arrête le processus si invalide)
Validation.validateAndLogAddress(walletAddress, 'mon_script.js', true);

// Valider une adresse (continue le processus même si invalide)
const isValid = Validation.validateAndLogAddress(walletAddress, 'mon_script.js', false);
if (isValid) {
  // Continuer le traitement
}
```

### Dans l'API Web

```javascript
// Valider et enregistrer l'erreur, mais ne pas arrêter le serveur
const validationResult = Validation.validateSolanaAddress(walletAddress);
if (!validationResult.isValid) {
  ErrorHandler.logValidationError(walletAddress, validationResult.message, 'web_api.js', false);
  // Renvoyer une réponse d'erreur à l'utilisateur
}
```

## Tester le système

Exécutez le script de test pour vérifier que le système fonctionne correctement:

```bash
node test_error_handling.js
```

Cela testera différentes adresses invalides et vérifiera que les erreurs sont correctement enregistrées dans le fichier `output/errors.json`.
