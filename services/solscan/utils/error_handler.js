import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Gestionnaire d'erreurs pour l'application
 * Enregistre les erreurs dans un fichier JSON et peut arrêter l'exécution si nécessaire
 */
export class ErrorHandler {
  /**
   * Chemin du fichier d'erreurs
   * @type {string}
   * @private
   */
  static #errorFilePath;

  /**
   * Initialise le gestionnaire d'erreurs
   * Crée le répertoire de sortie et le fichier d'erreurs s'ils n'existent pas
   */
  static initialize() {
    // Définir le chemin du fichier d'erreurs
    const outputDir = path.resolve(__dirname, '../output');
    ErrorHandler.#errorFilePath = path.join(outputDir, 'errors.json');

    // Créer le répertoire de sortie s'il n'existe pas
    if (!fs.existsSync(outputDir)) {
      try {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`📁 Répertoire de sortie créé: ${outputDir}`);
      } catch (err) {
        console.error(`❌ Erreur lors de la création du répertoire: ${err.message}`);
      }
    }

    // Initialiser ou vérifier le fichier d'erreurs
    try {
      if (!fs.existsSync(ErrorHandler.#errorFilePath)) {
        fs.writeFileSync(ErrorHandler.#errorFilePath, JSON.stringify({
          errors: []
        }, null, 2));
        console.log(`📄 Fichier d'erreurs créé: ${ErrorHandler.#errorFilePath}`);
      }
    } catch (err) {
      console.error(`❌ Erreur lors de la création du fichier d'erreurs: ${err.message}`);
    }

    return ErrorHandler.#errorFilePath;
  }

  /**
   * Enregistre une erreur de validation dans le fichier d'erreurs
   * @param {string} address - L'adresse qui a causé l'erreur
   * @param {string} message - Le message d'erreur
   * @param {string} source - La source de l'erreur (script ou fichier)
   * @param {boolean} [exitProcess=false] - Si true, arrête le processus après l'enregistrement
   * @returns {object} - L'erreur enregistrée
   */
  static logValidationError(address, message, source, exitProcess = false) {
    // S'assurer que le fichier d'erreurs existe
    if (!ErrorHandler.#errorFilePath) {
      ErrorHandler.initialize();
    }

    // Lire le fichier existant
    let errorData;
    try {
      const fileContent = fs.readFileSync(ErrorHandler.#errorFilePath, 'utf8');
      errorData = JSON.parse(fileContent);
    } catch (err) {
      console.error(`❌ Erreur lors de la lecture du fichier d'erreurs: ${err.message}`);
      errorData = { errors: [] };
    }

    // Créer l'objet d'erreur
    const errorEntry = {
      timestamp: new Date().toISOString(),
      address,
      message,
      source,
      type: 'validation_error'
    };

    // Ajouter l'erreur au tableau
    errorData.errors.push(errorEntry);

    // Écrire le fichier mis à jour
    try {
      fs.writeFileSync(ErrorHandler.#errorFilePath, JSON.stringify(errorData, null, 2));
      console.error(`❌ Erreur de validation enregistrée: ${message} (${source})`);
    } catch (err) {
      console.error(`❌ Erreur lors de l'écriture du fichier d'erreurs: ${err.message}`);
    }

    // Arrêter le processus si demandé
    if (exitProcess) {
      console.error(`⛔ Arrêt du processus: Une erreur de validation a été détectée.`);
      process.exit(1);
    }

    return errorEntry;
  }

  /**
   * Retourne le chemin du fichier d'erreurs
   * @returns {string} - Le chemin du fichier d'erreurs
   */
  static getErrorFilePath() {
    if (!ErrorHandler.#errorFilePath) {
      ErrorHandler.initialize();
    }
    return ErrorHandler.#errorFilePath;
  }
}
