
/**
 * Valide une adresse Solana
 * @param {string} address - L'adresse à valider
 * @returns {boolean} - true si l'adresse est valide, sinon false
 */
function isSolanaAddress(address) {
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
 * Valide une adresse Solana et retourne un message d'erreur si nécessaire
 * @param {string} address - L'adresse à valider
 * @returns {object} - { isValid: boolean, message: string }
 */
function validateSolanaAddress(address) {
  if (!address || typeof address !== 'string') {
    return { 
      isValid: false, 
      message: "L'adresse ne peut pas être vide" 
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
      message: "L'adresse contient des caractères invalides. Une adresse Solana est encodée en base58." 
    };
  }

  return { 
    isValid: true, 
    message: "L'adresse est valide" 
  };
}

// Ajouter une fonction qui s'exécute au chargement de la page pour mettre en place les validations
document.addEventListener('DOMContentLoaded', function() {
  // Chercher un formulaire qui pourrait contenir un champ d'adresse de portefeuille
  const addressInput = document.getElementById('address');
  const walletForm = document.getElementById('walletForm');
  
  if (addressInput && walletForm) {
    // Créer un élément pour les messages d'erreur s'il n'existe pas déjà
    let errorElement = document.getElementById('address-error');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = 'address-error';
      errorElement.style.color = '#ff5252';
      errorElement.style.marginBottom = '10px';
      errorElement.style.display = 'none';
      addressInput.parentNode.insertBefore(errorElement, addressInput.nextSibling);
    }
    
    // Valider l'adresse à chaque modification
    addressInput.addEventListener('input', function() {
      const result = validateSolanaAddress(this.value);
      if (!result.isValid && this.value.length > 0) {
        errorElement.textContent = result.message;
        errorElement.style.display = 'block';
      } else {
        errorElement.style.display = 'none';
      }
    });
    
    // Valider le formulaire à la soumission
    walletForm.addEventListener('submit', function(e) {
      const addressValue = addressInput.value;
      const result = validateSolanaAddress(addressValue);
      
      if (!result.isValid) {
        e.preventDefault();
        errorElement.textContent = result.message;
        errorElement.style.display = 'block';
        return false;
      }
      
      return true;
    });
  }
});
