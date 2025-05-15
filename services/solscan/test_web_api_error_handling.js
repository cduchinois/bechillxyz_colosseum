/**
 * Script de test pour vérifier que l'API web utilise correctement le système de gestion d'erreurs
 */
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Adresses de portefeuille valides et invalides à tester
const addresses = [
  {
    address: 'GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S',
    description: 'Adresse valide',
    shouldBeValid: true
  },
  {
    address: 'tooShort',
    description: 'Adresse trop courte',
    shouldBeValid: false
  },
  {
    address: 'GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZ0zfZquAY5S',
    description: 'Adresse avec caractère invalide (0)',
    shouldBeValid: false
  }
];

console.log('🧪 Test du système de gestion d\'erreurs de l\'API web');
console.log('🔍 Vérification que les erreurs sont enregistrées dans output/errors.json');

// Fonction pour lire le nombre d'erreurs dans le fichier errors.json
async function countErrors() {
  const errorFilePath = path.join(__dirname, 'output', 'errors.json');
  
  if (!fs.existsSync(errorFilePath)) {
    console.error(`❌ Le fichier d'erreurs n'existe pas: ${errorFilePath}`);
    return 0;
  }
  
  const errorData = JSON.parse(fs.readFileSync(errorFilePath, 'utf8'));
  return errorData.errors.length;
}

// Tester les adresses avec l'API web
async function testAddresses() {
  // Compter les erreurs avant le test
  const initialErrorCount = await countErrors();
  console.log(`📊 Nombre d'erreurs initial: ${initialErrorCount}`);
  
  // Tester chaque adresse
  for (const item of addresses) {
    console.log(`\n🧪 Test: ${item.description}`);
    console.log(`🔤 Adresse: ${item.address}`);
    
    try {
      // Appeler l'API web
      const response = await fetch(`http://localhost:5051/analyse_wallet/${item.address}`);
      const isSuccess = response.status === 200;
      
      console.log(`📡 Statut HTTP: ${response.status} ${response.statusText}`);
      console.log(`🎯 Résultat: ${isSuccess ? '✅ Succès' : '❌ Erreur'} (${item.shouldBeValid ? 'Succès attendu' : 'Erreur attendue'})`);
      
      // Vérifier si le résultat correspond à ce qui est attendu
      if ((isSuccess && !item.shouldBeValid) || (!isSuccess && item.shouldBeValid)) {
        console.log('⚠️ Le résultat ne correspond pas à ce qui était attendu!');
      } else {
        console.log('✅ Le résultat correspond à ce qui était attendu.');
      }
      
    } catch (err) {
      console.error(`❌ Erreur lors de l'appel à l'API: ${err.message}`);
    }
  }
  
  // Attendre un peu pour s'assurer que les erreurs sont enregistrées
  console.log('\n⏱️ Attente de 1 seconde pour s\'assurer que les erreurs sont enregistrées...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Compter les erreurs après le test
  const finalErrorCount = await countErrors();
  console.log(`📊 Nombre d'erreurs final: ${finalErrorCount}`);
  console.log(`📈 Nouvelles erreurs: ${finalErrorCount - initialErrorCount}`);
  
  return finalErrorCount - initialErrorCount;
}

// Exécuter le test
testAddresses()
  .then(newErrors => {
    console.log(`\n🏁 Test terminé! ${newErrors} nouvelles erreurs enregistrées.`);
    
    // Afficher les dernières erreurs
    const errorFilePath = path.join(__dirname, 'output', 'errors.json');
    if (fs.existsSync(errorFilePath)) {
      const errorData = JSON.parse(fs.readFileSync(errorFilePath, 'utf8'));
      console.log('\n📝 Dernières erreurs enregistrées:');
      
      // Afficher les 2 dernières erreurs
      const lastErrors = errorData.errors.slice(-2);
      lastErrors.forEach((error, index) => {
        console.log(`\n[${index + 1}]`);
        console.log(`Timestamp: ${new Date(error.timestamp).toLocaleString()}`);
        console.log(`Adresse: ${error.address}`);
        console.log(`Message: ${error.message}`);
        console.log(`Source: ${error.source}`);
        console.log(`Type: ${error.type}`);
      });
    }
  })
  .catch(err => {
    console.error(`❌ Erreur lors du test: ${err.message}`);
  });
