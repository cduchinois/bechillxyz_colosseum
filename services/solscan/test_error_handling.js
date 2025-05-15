/**
 * Script de test pour le système de gestion d'erreurs
 * Ce script teste différentes adresses invalides pour vérifier 
 * que notre système de gestion d'erreurs fonctionne correctement
 */
import { Validation } from './utils/validation.js';
import { ErrorHandler } from './utils/error_handler.js';
import fs from 'fs';

console.log('🧪 Test du système de gestion d\'erreurs de validation');

// Initialiser le gestionnaire d'erreurs
const errorFilePath = ErrorHandler.initialize();
console.log(`📁 Fichier d'erreurs configuré: ${errorFilePath}`);

// Créer un tableau d'adresses invalides à tester
const invalidAddresses = [
  {
    address: 'tooShort',
    description: 'Adresse trop courte'
  },
  {
    address: 'GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S1234567890123456789012345',
    description: 'Adresse trop longue'
  },
  {
    address: 'GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZ0zfZquAY5S',
    description: 'Adresse avec caractère invalide (0)'
  },
  {
    address: 'GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5$',
    description: 'Adresse avec caractère invalide ($)'
  },
  {
    address: null,
    description: 'Adresse null'
  },
  {
    address: '',
    description: 'Adresse vide'
  }
];

// Adresse valide pour comparaison
const validAddress = 'GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S';

// Tester la validation des adresses invalides sans arrêt du processus
console.log('\n✅ Test de validation sans arrêt du processus:');
invalidAddresses.forEach(item => {
  console.log(`\nTest: ${item.description}`);
  console.log(`Adresse testée: "${item.address}"`);
  
  try {
    const isValid = Validation.validateAndLogAddress(item.address, 'test_error_handling.js', false);
    console.log(`Résultat: ${isValid ? '✅ Valide (inattendu)' : '❌ Invalide (attendu)'}`);
  } catch (err) {
    console.error('❗ Une exception s\'est produite:', err.message);
  }
});

// Test sur une adresse valide
console.log('\n✅ Test avec une adresse valide:');
console.log(`Adresse testée: "${validAddress}"`);
try {
  const isValid = Validation.validateAndLogAddress(validAddress, 'test_error_handling.js', false);
  console.log(`Résultat: ${isValid ? '✅ Valide (attendu)' : '❌ Invalide (inattendu)'}`);
} catch (err) {
  console.error('❗ Une exception s\'est produite:', err.message);
}

// Lire le fichier d'erreurs pour vérifier que toutes les erreurs ont été enregistrées
console.log('\n📝 Contenu du fichier d\'erreurs:');
try {
  const errorData = JSON.parse(fs.readFileSync(errorFilePath, 'utf8'));
  console.log(`Nombre total d'erreurs enregistrées: ${errorData.errors.length}`);
  
  // Afficher les 3 dernières erreurs
  console.log('\nDernières erreurs enregistrées:');
  const lastErrors = errorData.errors.slice(-3);
  lastErrors.forEach((error, index) => {
    console.log(`\n[${index + 1}]`);
    console.log(`Timestamp: ${new Date(error.timestamp).toLocaleString()}`);
    console.log(`Adresse: ${error.address}`);
    console.log(`Message: ${error.message}`);
    console.log(`Source: ${error.source}`);
    console.log(`Type: ${error.type}`);
  });
} catch (err) {
  console.error(`❗ Erreur lors de la lecture du fichier d'erreurs: ${err.message}`);
}

console.log('\n🏁 Test terminé!');
