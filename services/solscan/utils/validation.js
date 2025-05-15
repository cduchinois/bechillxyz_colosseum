/**
 * Utilitaires de validation pour le projet
 */
import { ErrorHandler } from './error_handler.js';

export class Validation {
  /**
   * Vérifie si une chaîne est une adresse Solana valide
   * Une adresse Solana valide est encodée en base58 et a généralement entre 32 et 44 caractères
   * @param {string} address - L'adresse à valider
   * @returns {boolean} - true si l'adresse est valide, sinon false
   */
  static isSolanaAddress(address) {
    if (!address || typeof address !== 'string') {
      return false;
    }

    // Vérifier la longueur de l'adresse
    if (address.length < 32 || address.length > 44) {
      return false;
    }

    // Vérifier le format base58: caractères alphanumériques sans 0 (zéro), O (o majuscule), 
    // I (i majuscule) et l (L minuscule)
    const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    return base58Regex.test(address);
  }

  /**
   * Vérifie si une adresse Solana est valide et fournit un message d'erreur si ce n'est pas le cas
   * @param {string} address - L'adresse à valider
   * @returns {object} - { isValid: boolean, message: string }
   */
  static validateSolanaAddress(address) {
    if (!address || typeof address !== 'string') {
      return { 
        isValid: false, 
        message: 'L\'adresse ne peut pas être vide' 
      };
    }

    // Vérifier la longueur de l'adresse
    if (address.length < 32) {
      return { 
        isValid: false, 
        message: `L'adresse est trop courte (${address.length} caractères). Une adresse Solana valide a au moins 32 caractères.` 
      };
    }

    if (address.length > 44) {
      return { 
        isValid: false, 
        message: `L'adresse est trop longue (${address.length} caractères). Une adresse Solana valide a au plus 44 caractères.` 
      };
    }

    // Vérifier le format base58
    const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    if (!base58Regex.test(address)) {
      return { 
        isValid: false, 
        message: 'L\'adresse contient des caractères invalides. Une adresse Solana est encodée en base58.' 
      };
    }

    return { 
      isValid: true, 
      message: 'L\'adresse est valide' 
    };
  }

  /**
   * Vérifie si une adresse Solana est valide et enregistre une erreur si ce n'est pas le cas
   * Arrête également le processus si exitOnError est à true
   * @param {string} address - L'adresse à valider
   * @param {string} source - La source de la validation (nom du script ou module)
   * @param {boolean} exitOnError - Si true, arrête le processus en cas d'erreur
   * @returns {boolean} - true si l'adresse est valide, sinon false (et enregistre une erreur)
   */
  static validateAndLogAddress(address, source = 'unknown', exitOnError = true) {
    // Initialiser le gestionnaire d'erreurs
    ErrorHandler.initialize();
    
    // Valider l'adresse
    const validationResult = this.validateSolanaAddress(address);
    
    // Si l'adresse n'est pas valide, enregistrer l'erreur
    if (!validationResult.isValid) {
      ErrorHandler.logValidationError(
        address, 
        validationResult.message,
        source,
        exitOnError
      );
      return false;
    }
    
    return true;
  }
}
