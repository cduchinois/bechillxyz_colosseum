import fs from 'fs';
import path from 'path';

/**
 * Classe pour l'exportation des données au format CSV
 */
export class CsvExporter {
  /**
   * Convertit les transactions en CSV
   * @param {Array} transactions - Les transactions à convertir
   * @param {Array} fields - Les champs à inclure
   * @returns {string} - Le contenu CSV
   */
  static transactionsToCSV(transactions, fields = null) {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return 'No data available';
    }

    // Si aucun champ n'est spécifié, utiliser tous les champs de la première transaction
    if (!fields) {
      // Déterminer les champs de base à inclure (liste commune pour la plupart des transactions)
      fields = [
        'tx_hash',
        'signature', 
        'block_time', 
        'time', 
        'slot', 
        'status', 
        'fee'
      ];

      // Ajouter des champs supplémentaires s'ils sont présents
      const firstTx = transactions[0];
      if (firstTx.signer) fields.push('signer');
      if (firstTx.parsed_instructions) fields.push('instruction_types');
      if (firstTx.program_ids) fields.push('program_ids');
    }

    // Générer l'en-tête CSV
    const header = fields.join(',');
    
    // Générer les lignes de données
    const rows = transactions.map(tx => {
      return fields.map(field => {
        let value = tx[field];
        
        // Traitement spécial pour certains champs
        if (field === 'signer' && Array.isArray(value)) {
          value = value.join('|');
        } else if (field === 'parsed_instructions' && Array.isArray(value)) {
          value = value.map(instruction => instruction.type || 'unknown').join('|');
        } else if (field === 'instruction_types' && Array.isArray(tx.parsed_instructions)) {
          value = tx.parsed_instructions.map(instruction => instruction.type || 'unknown').join('|');
        } else if (field === 'program_ids' && Array.isArray(value)) {
          value = value.join('|');
        } else if (field === 'time' && value) {
          // Formater la date pour qu'elle soit plus lisible
          value = value.replace('T', ' ').replace('.000Z', '');
        }
        
        // Échapper les virgules et les guillemets
        if (typeof value === 'string') {
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
        }
        
        return value !== undefined && value !== null ? value : '';
      }).join(',');
    });
    
    // Combiner l'en-tête et les lignes de données
    return [header, ...rows].join('\n');
  }

  /**
   * Exporte les transactions au format CSV
   * @param {Array} transactions - Les transactions à exporter
   * @param {string} outputPath - Le chemin du fichier de sortie
   * @param {Array} fields - Les champs à inclure
   * @returns {Promise<string>} - Le chemin du fichier exporté
   */
  static async exportTransactionsToCSV(transactions, outputPath, fields = null) {
    try {
      // Extraire les données si elles sont dans un format imbriqué
      const transactionsData = transactions.data || transactions || [];
      
      // Convertir les transactions en CSV
      const csvContent = this.transactionsToCSV(transactionsData, fields);
      
      // Créer le répertoire de sortie s'il n'existe pas
      const directory = path.dirname(outputPath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      
      // Écrire le fichier CSV
      fs.writeFileSync(outputPath, csvContent, 'utf8');
      
      return outputPath;
    } catch (error) {
      console.error(`❌ Erreur lors de l'exportation en CSV: ${error.message}`);
      throw error;
    }
  }

  /**
   * Génère un nom de fichier CSV avec un horodatage
   * @param {string} prefix - Le préfixe du nom de fichier
   * @param {string} address - L'adresse du portefeuille
   * @returns {string} - Le nom de fichier
   */
  static generateFileName(prefix, address) {
    const date = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    return `${prefix}_${address}_${date}.csv`;
  }
}
