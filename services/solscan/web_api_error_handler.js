/**
 * Script qui met à jour la validation dans le web_api.js
 * Ce script est à exécuter pour modifier le fichier web_api.js
 * et ajouter la fonctionnalité de gestion des erreurs
 */
import fs from 'fs';
import path from 'path';

// Chemin du fichier web_api.js
const apiFilePath = path.resolve('./web_api.js');

// Vérifier si le fichier existe
if (!fs.existsSync(apiFilePath)) {
  console.error(`❌ Le fichier web_api.js n'a pas été trouvé au chemin: ${apiFilePath}`);
  process.exit(1);
}

console.log(`📝 Modification du fichier web_api.js pour ajouter la gestion des erreurs`);

// Lire le contenu du fichier
let fileContent = fs.readFileSync(apiFilePath, 'utf8');

// Chercher l'import existant de Validation
const importValidationPattern = /import { Validation } from ['"]\.\/utils\/validation\.js['"];/;

// Importer aussi ErrorHandler s'il n'est pas déjà importé
if (fileContent.match(importValidationPattern)) {
  // Ne pas ajouter l'import s'il est déjà présent
  if (!fileContent.includes('ErrorHandler')) {
    fileContent = fileContent.replace(
      importValidationPattern,
      `import { Validation } from './utils/validation.js';\nimport { ErrorHandler } from './utils/error_handler.js';`
    );
    console.log('✅ Import de ErrorHandler ajouté');
  } else {
    console.log('ℹ️ ErrorHandler est déjà importé');
  }
}

// Chercher la partie de validation d'adresse
const validationPattern = /const validationResult = Validation\.validateSolanaAddress\(walletAddress\);[\s\n]+if \(!validationResult\.isValid\) {/;

// Ajouter la journalisation des erreurs
if (validationPattern.test(fileContent)) {
  fileContent = fileContent.replace(
    validationPattern,
    `const validationResult = Validation.validateSolanaAddress(walletAddress);\n\n  // Enregistrer l'erreur si l'adresse est invalide\n  if (!validationResult.isValid) {\n    // Initialiser ErrorHandler\n    ErrorHandler.initialize();\n    \n    // Enregistrer l'erreur sans arrêter le processus\n    ErrorHandler.logValidationError(walletAddress, validationResult.message, 'web_api.js', false);\n  }\n\n  if (!validationResult.isValid) {`
  );
  console.log('✅ Journalisation des erreurs ajoutée à la validation d\'adresse');
} else {
  console.log('⚠️ Le motif de validation n\'a pas été trouvé');
}

// Écrire les modifications dans le fichier
fs.writeFileSync(apiFilePath, fileContent);
console.log('✅ Modifications enregistrées dans web_api.js');

// Afficher les instructions pour finaliser l'intégration
console.log('\n📋 Instructions pour finaliser l\'intégration:');
console.log('1. Vérifiez les modifications apportées au fichier web_api.js');
console.log('2. Exécutez test_error_handling.js pour tester le système de gestion d\'erreurs');
console.log('3. Essayez d\'utiliser l\'application web avec des adresses valides et invalides pour vérifier que tout fonctionne correctement');
