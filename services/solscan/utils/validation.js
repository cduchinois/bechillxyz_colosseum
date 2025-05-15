
/**
 * Utilitaires de validation pour le projet
 */
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
}
