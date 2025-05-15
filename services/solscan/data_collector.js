import { SolscanApiClient, DataUtils } from './utils/api_client.js';
import { existsSync } from 'fs';

/**
 * Classe pour collecter les données d'analyse d'un portefeuille Solana
 * avec support amélioré de filtrage, exportation CSV et gestion d'erreurs
 */
class SolanaDataCollector {
  /**
   * Valide une adresse Solana
   * @param {string} address - L'adresse à valider
   * @returns {boolean} true si l'adresse est valide, false sinon
   * @static
   */
  static validateSolanaAddress(address) {
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
   * Constructeur
   * @param {string} walletAddress - L'adresse du portefeuille Solana
   * @param {object} options - Options de configuration
   * @param {number} options.pageSize - Nombre d'éléments par page
   * @param {number} options.maxPages - Nombre maximal de pages à récupérer
   * @param {boolean} options.includeTokenAccounts - Inclure les comptes de tokens
   * @param {boolean} options.includePortfolio - Inclure le portfolio
   * @param {boolean} options.includeTransactions - Inclure les transactions
   * @param {boolean} options.includeBalanceChanges - Inclure les changements de balance
   * @param {string} options.apiEndpoint - URL de l'API personnalisée (optionnel)
   * @param {string} options.apiKey - Clé API personnalisée (optionnel)
   * @param {number} options.maxRetries - Nombre maximal de tentatives en cas d'erreur
   * @param {string|Date} options.startDate - Date de début pour le filtrage des transactions
   * @param {string|Date} options.endDate - Date de fin pour le filtrage des transactions
   * @param {string} options.transactionType - Type de transaction à filtrer
   * @param {string} options.transactionStatus - Statut de transaction à filtrer ('success', 'fail')
   * @param {boolean} options.verbose - Mode verbeux
   * @param {boolean} options.debug - Mode debug
   */
  constructor(walletAddress, options = {}) {
    // Valider l'adresse du portefeuille
    if (!SolanaDataCollector.validateSolanaAddress(walletAddress)) {
      throw new Error(`Adresse Solana invalide: ${walletAddress}. Une adresse Solana valide est encodée en base58 et a généralement entre 32 et 44 caractères.`);
    }
    
    this.walletAddress = walletAddress;
    
    // Configuration de l'API client avec options avancées
    const apiClientOptions = {
      baseUrl: options.apiEndpoint,
      apiKey: options.apiKey,
      maxRetries: options.maxRetries || 5,
      debug: options.debug || false
    };
    
    this.apiClient = new SolscanApiClient(apiClientOptions);
    
    // Options générales
    this.options = {
      pageSize: options.pageSize || 100,
      maxPages: options.maxPages || 5,
      includeTokenAccounts: options.includeTokenAccounts !== false,
      includePortfolio: options.includePortfolio !== false,
      includeTransactions: options.includeTransactions !== false,
      includeBalanceChanges: options.includeBalanceChanges !== false,
      
      // Options de filtrage pour les transactions
      startDate: options.startDate || null,
      endDate: options.endDate || null,
      transactionType: options.transactionType || null,
      transactionStatus: options.transactionStatus || null,
      
      // Options d'export
      exportFormat: options.exportFormat || null, // 'csv', 'json', etc.
      exportPath: options.exportPath || './output',
      
      // Options de verbosité
      verbose: options.verbose || false,
      debug: options.debug || false,
      
      ...options
    };
    
    if (this.options.verbose) {
      console.log(`🔧 Configuration du collecteur pour ${walletAddress}:`);
      console.log(`   - API endpoint: ${apiClientOptions.baseUrl || 'Par défaut'}`);
      console.log(`   - Filtres transactions: ${this.getFilterSummary()}`);
    }
  }
  
  /**
   * Résume les filtres actifs pour les logs
   * @returns {string} Un résumé des filtres actifs
   */
  getFilterSummary() {
    const filters = [];
    
    if (this.options.startDate) {
      const date = this.options.startDate instanceof Date 
        ? this.options.startDate.toISOString().split('T')[0]
        : this.options.startDate;
      filters.push(`après ${date}`);
    }
    
    if (this.options.endDate) {
      const date = this.options.endDate instanceof Date 
        ? this.options.endDate.toISOString().split('T')[0]
        : this.options.endDate;
      filters.push(`avant ${date}`);
    }
    
    if (this.options.transactionType) {
      filters.push(`type: ${this.options.transactionType}`);
    }
    
    if (this.options.transactionStatus) {
      filters.push(`statut: ${this.options.transactionStatus}`);
    }
    
    return filters.length > 0 ? filters.join(', ') : 'aucun';
  }
  
  /**
   * Collecte toutes les données demandées
   * @returns {Promise<object>} - Les données collectées
   */
  async collectAllData() {
    console.log(`🔍 Collecte des données pour le portefeuille ${this.walletAddress}...`);
    
    const result = {
      walletAddress: this.walletAddress,
      collectedAt: new Date().toISOString(),
      defiActivities: null,
      tokenAccounts: null,
      portfolio: null,
      transactions: null,
      balanceChanges: null,
    };
    
    try {
      // Collecter les activités DeFi (toujours incluses)
      result.defiActivities = await this.collectDefiActivities();
      
      // Collecter les données optionnelles en parallèle
      const optionalData = await Promise.allSettled([
        this.options.includeTokenAccounts ? this.collectTokenAccounts() : null,
        this.options.includePortfolio ? this.collectPortfolio() : null,
        this.options.includeTransactions ? this.collectTransactions() : null,
        this.options.includeBalanceChanges ? this.collectBalanceChanges() : null,
      ]);
      
      // Assigner les résultats des promises au résultat final
      if (this.options.includeTokenAccounts) {
        result.tokenAccounts = optionalData[0].status === 'fulfilled' ? optionalData[0].value : null;
      }
      
      if (this.options.includePortfolio) {
        result.portfolio = optionalData[1].status === 'fulfilled' ? optionalData[1].value : null;
      }
      
      if (this.options.includeTransactions) {
        result.transactions = optionalData[2].status === 'fulfilled' ? optionalData[2].value : null;
      }
      
      if (this.options.includeBalanceChanges) {
        result.balanceChanges = optionalData[3].status === 'fulfilled' ? optionalData[3].value : null;
      }
      
      return result;
      
    } catch (error) {
      console.error(`❌ Erreur lors de la collecte des données: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Collecte les activités DeFi avec pagination intelligente
   * @returns {Promise<object>} - Les activités DeFi
   */
  async collectDefiActivities() {
    console.log('\n📊 Collecte des activités DeFi...');
    
    try {
      // Vérifier si un fichier spécifique à ce portefeuille existe déjà
      const specificOutputFile = `./output/activities_detailed_summary_${this.walletAddress}.json`;
      if (existsSync(specificOutputFile)) {
        console.log(`💡 Fichier existant détecté: ${specificOutputFile}`);
        console.log(`💡 Utilisation des données existantes sans appel API...`);
        
        const existingData = await DataUtils.loadFromJson(specificOutputFile);
        
        // Nous n'utilisons plus le fichier standard
        
        console.log(`✅ ${existingData.data?.length || 0} activités DeFi chargées depuis le fichier existant`);
        return existingData;
      }
      
      console.log(`💡 Aucun fichier existant trouvé, récupération des données via API...`);
      
      let allActivities = [];
      let page = 1;
      let hasMoreData = true;
      
      while (hasMoreData && page <= this.options.maxPages) {
        console.log(`   Page ${page}/${this.options.maxPages}...`);
        
        const data = await this.apiClient.getDefiActivities(this.walletAddress, {
          page,
          page_size: this.options.pageSize
        });
        
        if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
          hasMoreData = false;
        } else {
          allActivities = allActivities.concat(data.data);
          
          // Si on reçoit moins d'éléments que la taille de page, on a tout récupéré
          if (data.data.length < this.options.pageSize) {
            hasMoreData = false;
          }
        }
        
        // Conserver les métadonnées
        if (page === 1) {
          this.metaData = data.metadata;
        }
        
        page++;
      }
      
      // Construire le résultat final
      const result = {
        data: allActivities,
        metadata: this.metaData
      };
      
      // Sauvegarder uniquement dans le fichier spécifique au portefeuille
      await DataUtils.saveToJson(specificOutputFile, result);
      
      console.log(`✅ ${allActivities.length} activités DeFi collectées`);
      console.log(`✅ Données sauvegardées dans ${specificOutputFile}`);
      
      return result;
      
    } catch (error) {
      console.error(`❌ Erreur lors de la collecte des activités DeFi: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Collecte les comptes de tokens
   * @returns {Promise<object>} - Les comptes de tokens
   */
  async collectTokenAccounts() {
    console.log('\n💰 Collecte des comptes de tokens...');
    
    try {
      // Vérifier si un fichier spécifique à ce portefeuille existe déjà
      const specificOutputFile = `./output/token_accounts_${this.walletAddress}.json`;
      if (existsSync(specificOutputFile)) {
        console.log(`💡 Fichier existant détecté: ${specificOutputFile}`);
        console.log(`💡 Utilisation des données existantes sans appel API...`);
        
        const existingData = await DataUtils.loadFromJson(specificOutputFile);
        
        // Nous n'utilisons plus le fichier standard
        
        console.log(`✅ Comptes de tokens chargés depuis le fichier existant`);
        return existingData;
      }
      
      console.log(`💡 Aucun fichier existant trouvé, récupération des données via API...`);
      
      const data = await this.apiClient.getTokenAccounts(this.walletAddress);
      
      // Sauvegarder uniquement dans le fichier spécifique au portefeuille
      await DataUtils.saveToJson(specificOutputFile, data);
      
      console.log(`✅ Comptes de tokens collectés`);
      console.log(`✅ Données sauvegardées dans ${specificOutputFile}`);
      
      return data;
    } catch (error) {
      console.error(`❌ Erreur lors de la collecte des comptes de tokens: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Collecte le portfolio du portefeuille
   * @returns {Promise<object>} - Le portfolio
   */
  async collectPortfolio() {
    console.log('\n📈 Collecte du portfolio...');
    
    try {
      // Vérifier si un fichier spécifique à ce portefeuille existe déjà
      const specificOutputFile = `./output/portfolio_${this.walletAddress}.json`;
      if (existsSync(specificOutputFile)) {
        console.log(`💡 Fichier existant détecté: ${specificOutputFile}`);
        console.log(`💡 Utilisation des données existantes sans appel API...`);
        
        const existingData = await DataUtils.loadFromJson(specificOutputFile);
        
        // Nous n'utilisons plus le fichier standard
        
        console.log(`✅ Portfolio chargé depuis le fichier existant`);
        return existingData;
      }
      
      console.log(`💡 Aucun fichier existant trouvé, récupération des données via API...`);
      
      const data = await this.apiClient.getPortfolio(this.walletAddress);
      
      // Sauvegarder uniquement dans le fichier spécifique au portefeuille
      await DataUtils.saveToJson(specificOutputFile, data);
      
      console.log(`✅ Portfolio collecté`);
      console.log(`✅ Données sauvegardées dans ${specificOutputFile}`);
      
      return data;
    } catch (error) {
      console.error(`❌ Erreur lors de la collecte du portfolio: ${error.message}`);
      return null;
    }
  }
  
  /**
   * Collecte les transactions avec pagination basée sur la signature de la dernière transaction
   * et support de filtrage par date, type et statut
   * @param {object} overrideOptions - Options pour remplacer temporairement les options par défaut
   * @returns {Promise<object>} - Les transactions
   */
  async collectTransactions(overrideOptions = {}) {
    console.log('\n🔄 Collecte des transactions...');
    
    // Fusionner les options par défaut avec les options temporaires
    const options = { ...this.options, ...overrideOptions };
    
    // Afficher les filtres si en mode verbeux
    if (options.verbose && this.getFilterSummary() !== 'aucun') {
      console.log(`🔍 Filtres actifs: ${this.getFilterSummary()}`);
    }
    
    try {
      // Vérifier si un fichier spécifique à ce portefeuille existe déjà et si forceRefresh n'est pas activé
      const specificOutputFile = `./output/transactions_${this.walletAddress}.json`;
      let shouldFetchData = true;
      let existingData = null;
      
      if (existsSync(specificOutputFile) && !options.forceRefresh) {
        console.log(`💡 Fichier existant détecté: ${specificOutputFile}`);
        existingData = await DataUtils.loadFromJson(specificOutputFile);
        
        // Vérifier si nous avons suffisamment de transactions et pas de filtres actifs
        // La structure peut être soit { transactions: [] } soit { data: [] }
        const existingTransactionsLength = existingData.transactions?.length || existingData.data?.length || 0;
        const hasFilters = options.startDate || options.endDate || options.transactionType || options.transactionStatus;
        
        if (existingTransactionsLength >= options.maxTransactions && !hasFilters) {
          console.log(`✅ ${existingTransactionsLength} transactions déjà disponibles dans le fichier existant (max ${options.maxTransactions})`);
          shouldFetchData = false;
          
          // Si un export CSV est demandé, on utilise les données existantes
          if (options.exportFormat === 'csv') {
            await this.exportTransactionsToCSV(existingData, options);
          }
          
          return existingData;
        } else {
          if (hasFilters) {
            console.log(`🔍 Des filtres sont actifs, récupération des données requise pour application des filtres`);
          } else {
            console.log(`⚠️  ${existingTransactionsLength} transactions trouvées dans le fichier existant, collecte de données supplémentaires requise...`);
          }
        }
      }
      
      console.log(`🔄 Récupération des données via API...`);
      
      // Configuration pour la collecte des transactions
      const maxTransactions = options.maxTransactions || 200; // Objectif par défaut: 200 transactions
      const pageSize = 40; // Taille de page maximale autorisée par l'API
      const maxBatches = options.maxBatches || 5; // Limite par défaut: 5 lots de requêtes
      
      console.log(`🔒 Configuration: récupération de ${maxTransactions} transactions max en ${maxBatches} lots de ${pageSize}`);
      
      // Initialiser le tableau avec les transactions existantes s'il y en a
      let allTransactions = [];
      
      // Gérer les différentes structures possibles
      if (existingData && !options.forceRefresh) {
        if (existingData.transactions && Array.isArray(existingData.transactions)) {
          allTransactions = existingData.transactions;
        } else if (existingData.data && Array.isArray(existingData.data)) {
          allTransactions = existingData.data;
        }
        console.log(`🔄 Démarrage avec ${allTransactions.length} transactions déjà collectées`);
      }

      let batchCount = 0;
      let hasMoreData = true;
      let lastSignature = null;
      // Si nous avons des transactions existantes, utiliser la dernière signature pour la pagination

      // Si forceRefresh est activé, on repart de zéro
      if (options.forceRefresh) {
        console.log(`🔄 Mode force refresh activé: collecte des données depuis le début`);
        allTransactions = [];
        lastSignature = null;
      }

      if (allTransactions.length > 0 && !options.forceRefresh) {
        console.log(`🔄 Utilisation de la dernière transaction existante pour la pagination`);
        // Les signatures de transactions peuvent être dans différents champs selon l'API
        lastSignature = allTransactions[allTransactions.length - 1].signature || 
                       allTransactions[allTransactions.length - 1].tx_hash;
        console.log(`   Dernière signature trouvée: ${lastSignature}`);
        console.log(allTransactions[allTransactions.length - 1].signature);
        if (lastSignature) {
          console.log(`🔄 Utilisation de la signature existante pour la pagination: ${lastSignature.substring(0, 15)}...`);
        } else {
          console.log(`⚠️ Aucune signature trouvée dans les transactions existantes, impossible d'utiliser la pagination`);
        }
      }
      else {
        console.log(`🔄 Aucune transaction existante trouvée, démarrage de la collecte depuis le début`);
          shouldFetchData = true;
          // Options pour l'API, incluant les filtres applicables côté serveur
          const apiOptions = { 
            limit: pageSize,
            // On passe les filtres pour que l'API puisse les afficher dans ses logs,
            // même s'ils seront principalement appliqués côté client
            startDate: options.startDate,
            endDate: options.endDate,
            status: options.transactionStatus,
            type: options.transactionType
          };
          const dataApi = await this.apiClient.getTransactions(this.walletAddress, apiOptions);
          // console.log(dataApi);
          const transactions = dataApi.data || [];
          // console.log(transactions);
          console.log(`   ${transactions.length} transactioooons récupérées`);
          allTransactions = allTransactions.concat(transactions);
          console.log(`   ${allTransactions.length} transactions récupéréeeeees`);
          batchCount++;
          // console.log(`   ${data.length} transactions récupérées`);
      }
      
      while (hasMoreData && batchCount < maxBatches && allTransactions.length < maxTransactions) {
      // while (hasMoreData && batchCount < maxBatches && allTransactions.length < maxTransactions || allTransactions.length == 0) {
        console.log(`   Lot ${batchCount + 1}/${maxBatches}${lastSignature ? ' (avec pagination par signature)' : ' (première requête)'}...`);
        console.log(`   Transactions collectées jusqu'à présent: ${allTransactions.length}/${maxTransactions}`);
        
        // Options pour l'API, incluant les filtres applicables côté serveur
        const apiOptions = { 
          limit: pageSize,
          // On passe les filtres pour que l'API puisse les afficher dans ses logs,
          // même s'ils seront principalement appliqués côté client
          startDate: options.startDate,
          endDate: options.endDate,
          status: options.transactionStatus,
          type: options.transactionType
        };
        
        // Ajouter le paramètre before pour la pagination basée sur les signatures
        if (lastSignature) {
          apiOptions.before = lastSignature;
          console.log(`   Pagination avec signature: ${lastSignature.substring(0, 15)}...`);
        }
        
        console.log(`   Tentative de récupération de ${pageSize} transactions supplémentaires...`);
        const dataApi = await this.apiClient.getTransactions(this.walletAddress, apiOptions);
        // console.log(data);


        const transactions = dataApi.data || [];
        // console.log(transactions);
        if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
          hasMoreData = false;
          console.log(`   Aucune transaction supplémentaire trouvée`);
        } else {
          allTransactions = allTransactions.concat(transactions);
          console.log(`   ${transactions.length} transactions récupérées (total: ${allTransactions.length})`);
          
          // Sauvegarder la signature de la dernière transaction pour la pagination basée sur les signatures
          if (transactions.length > 0) {
            // La signature peut être dans le champ 'signature' ou 'tx_hash' selon l'API
            lastSignature = transactions[transactions.length - 1].signature || 
                           transactions[transactions.length - 1].tx_hash;
                           
            if (lastSignature) {
              console.log(`   Signature pour la prochaine pagination: ${lastSignature.substring(0, 15)}...`);
            } else {
              console.log(`   ⚠️ Aucune signature trouvée dans la dernière transaction, impossible de continuer la pagination`);
              hasMoreData = false;
            }
          }
          
          // Si on reçoit moins d'éléments que la taille de page, on a tout récupéré
          if (transactions.length < pageSize) {
            hasMoreData = false;
            console.log(`   Toutes les transactions disponibles ont été récupérées`);
          }
        }
        batchCount++;
      }
      
      // Appliquer les filtres côté client
      let filteredTransactions = allTransactions;
      const hasFilters = options.startDate || options.endDate || options.transactionType || options.transactionStatus;
      
      if (hasFilters) {
        console.log(`🔍 Application des filtres côté client...`);
        
        // Filtrer par date de début
        if (options.startDate) {
          const startDate = options.startDate instanceof Date 
            ? options.startDate 
            : new Date(options.startDate);
          
          filteredTransactions = filteredTransactions.filter(tx => {
            // Les dates peuvent être stockées dans block_time ou time
            const txDate = tx.time ? new Date(tx.time) : 
                          tx.block_time ? new Date(tx.block_time * 1000) : null;
            
            return txDate && txDate >= startDate;
          });
          
          console.log(`   Filtre par date de début (${startDate.toISOString()}): ${filteredTransactions.length} transactions restantes`);
        }
        
        // Filtrer par date de fin
        if (options.endDate) {
          const endDate = options.endDate instanceof Date 
            ? options.endDate 
            : new Date(options.endDate);
          
          filteredTransactions = filteredTransactions.filter(tx => {
            // Les dates peuvent être stockées dans block_time ou time
            const txDate = tx.time ? new Date(tx.time) : 
                          tx.block_time ? new Date(tx.block_time * 1000) : null;
            
            return txDate && txDate <= endDate;
          });
          
          console.log(`   Filtre par date de fin (${endDate.toISOString()}): ${filteredTransactions.length} transactions restantes`);
        }
        
        // Filtrer par type de transaction
        if (options.transactionType) {
          filteredTransactions = filteredTransactions.filter(tx => {
            // Le type peut être dans différents champs selon l'API
            const txType = tx.type || 
                          (tx.parsed_instructions && tx.parsed_instructions[0] ? tx.parsed_instructions[0].type : null);
            
            // Vérifier si le type contient la chaîne recherchée (insensible à la casse)
            return txType && txType.toLowerCase().includes(options.transactionType.toLowerCase());
          });
          
          console.log(`   Filtre par type (${options.transactionType}): ${filteredTransactions.length} transactions restantes`);
        }
        
        // Filtrer par statut
        if (options.transactionStatus) {
          filteredTransactions = filteredTransactions.filter(tx => {
            return tx.status && tx.status.toLowerCase() === options.transactionStatus.toLowerCase();
          });
          
          console.log(`   Filtre par statut (${options.transactionStatus}): ${filteredTransactions.length} transactions restantes`);
        }
      }
      
      // Construire le résultat final en limitant au nombre maximum de transactions souhaité
      const finalTransactions = filteredTransactions.slice(0, maxTransactions);
      
      // Adapter la structure en fonction de la structure de l'API
      // L'API retourne { success: true, data: [...transactions], metadata: {} }
      const result = {
        success: true,
        data: finalTransactions,
        metadata: {
          total: finalTransactions.length,
          batches_fetched: batchCount,
          max_batches: maxBatches,
          batch_size: pageSize,
          max_requested: maxTransactions,
          pagination_method: "signature_based",
          last_signature: lastSignature,
          address: this.walletAddress,
          collected_at: new Date().toISOString(),
          filters: {
            startDate: options.startDate ? (options.startDate instanceof Date ? options.startDate.toISOString() : options.startDate) : null,
            endDate: options.endDate ? (options.endDate instanceof Date ? options.endDate.toISOString() : options.endDate) : null,
            transactionType: options.transactionType || null,
            transactionStatus: options.transactionStatus || null
          }
        }
      };
      
      // Sauvegarder dans le fichier spécifique au portefeuille (sauf si ce sont des résultats filtrés)
      if (!hasFilters) {
        console.log(`💡 Aucun filtre actif, sauvegarde des données dans le fichier spécifique au portefeuille...`);
        console.log(`   ${finalTransactions.length} transactions collectées`);
        // console.dir(result, { depth: null });
        await DataUtils.saveToJson(specificOutputFile, result);
        console.log(`✅ Données sauvegardées dans ${specificOutputFile}`);
      } else {
        // Si des filtres sont appliqués, on sauvegarde dans un fichier séparé avec le nom des filtres
        const filtersString = Object.entries(result.metadata.filters)
          .filter(([_, value]) => value !== null)
          .map(([key, value]) => {
            if (key.includes('Date') && value) {
              // Formater les dates plus simplement
              return `${key.replace('Date', '')}-${value.split('T')[0]}`;
            }
            return value ? `${key}-${value}` : null;
          })
          .filter(Boolean)
          .join('_');
          
        if (filtersString) {
          const filteredOutputFile = `./output/transactions_${this.walletAddress}_${filtersString}.json`;
          await DataUtils.saveToJson(filteredOutputFile, result);
          console.log(`✅ Données filtrées sauvegardées dans ${filteredOutputFile}`);
        }
      }
      
      // Si un export CSV est demandé
      if (options.exportFormat === 'csv') {
        await this.exportTransactionsToCSV(result, options);
      }
      
      // Logs de fin
      console.log(`✅ ${finalTransactions.length}/${allTransactions.length} transactions après filtrage`);
      console.log(`✅ ${batchCount} lots de requêtes utilisés (maximum: ${maxBatches})`);
      
      if (allTransactions.length < maxTransactions && !hasFilters) {
        console.log(`ℹ️  Moins de ${maxTransactions} transactions recoltées pour ce portefeuille`);
      } else if (allTransactions.length >= maxTransactions) {
        console.log(`✅ Objectif de ${maxTransactions} transactions atteint`);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Erreur lors de la collecte des transactions: ${error.message}`);
      if (options.debug) {
        console.error(error.stack);
      }
      return { 
        success: false, 
        error: error.message,
        data: []
      };
    }
  }
  
  /**
   * Exporte les transactions au format CSV
   * @param {object} transactions - Les transactions à exporter
   * @param {object} options - Options d'exportation
   * @returns {Promise<string>} - Le chemin du fichier exporté
   */
  async exportTransactionsToCSV(transactions, options = {}) {
    try {
      // Importer le module CsvExporter
      const { CsvExporter } = await import('./utils/csv_exporter.js');
      
      // Déterminer le chemin de sortie
      const exportDir = options.exportPath || './output';
      const fileName = options.exportFileName || 
                      CsvExporter.generateFileName('transactions', this.walletAddress);
      
      const outputPath = `${exportDir}/${fileName}`;
      
      console.log(`📊 Exportation des transactions au format CSV...`);
      
      // Exporter les transactions
      const exportedPath = await CsvExporter.exportTransactionsToCSV(
        transactions,
        outputPath,
        options.exportFields || null
      );
      
      console.log(`✅ Transactions exportées avec succès dans ${exportedPath}`);
      return exportedPath;
    } catch (error) {
      console.error(`❌ Erreur lors de l'exportation en CSV: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Collecte les changements de balance
   * @returns {Promise<object>} - Les changements de balance
   */
  async collectBalanceChanges() {
    console.log('\n💱 Collecte des changements de balance...');
    
    try {
      // Vérifier si un fichier spécifique à ce portefeuille existe déjà
      const specificOutputFile = `./output/balance_changes_${this.walletAddress}.json`;
      if (existsSync(specificOutputFile)) {
        console.log(`💡 Fichier existant détecté: ${specificOutputFile}`);
        console.log(`💡 Utilisation des données existantes sans appel API...`);
        
        const existingData = await DataUtils.loadFromJson(specificOutputFile);
        
        // Nous n'utilisons plus le fichier standard
        
        console.log(`✅ Changements de balance chargés depuis le fichier existant`);
        return existingData;
      }
      
      console.log(`💡 Aucun fichier existant trouvé, récupération des données via API...`);
      
      const data = await this.apiClient.getBalanceChanges(this.walletAddress);
      
      // Sauvegarder uniquement dans le fichier spécifique au portefeuille
      await DataUtils.saveToJson(specificOutputFile, data);
      
      console.log(`✅ Changements de balance collectés`);
      console.log(`✅ Données sauvegardées dans ${specificOutputFile}`);
      
      return data;
    } catch (error) {
      console.error(`❌ Erreur lors de la collecte des changements de balance: ${error.message}`);
      return null;
    }
  }
}

export default SolanaDataCollector;
