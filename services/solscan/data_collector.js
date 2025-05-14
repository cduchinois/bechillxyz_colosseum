import { SolscanApiClient, DataUtils } from './utils/api_client.js';
import { existsSync } from 'fs';

/**
 * Classe pour collecter les données d'analyse d'un portefeuille Solana
 */
class SolanaDataCollector {
  constructor(walletAddress, options = {}) {
    this.walletAddress = walletAddress;
    this.apiClient = new SolscanApiClient();
    this.options = {
      pageSize: options.pageSize || 100,
      maxPages: options.maxPages || 5,
      includeTokenAccounts: options.includeTokenAccounts !== false,
      includePortfolio: options.includePortfolio !== false,
      includeTransactions: options.includeTransactions !== false,
      includeBalanceChanges: options.includeBalanceChanges !== false,
      ...options
    };
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
   * Collecte les transactions
   * @returns {Promise<object>} - Les transactions
   */
  async collectTransactions() {
    console.log('\n🔄 Collecte des transactions...');
    
    try {
      // Vérifier si un fichier spécifique à ce portefeuille existe déjà
      const specificOutputFile = `./output/transactions_${this.walletAddress}.json`;
      if (existsSync(specificOutputFile)) {
        console.log(`💡 Fichier existant détecté: ${specificOutputFile}`);
        console.log(`💡 Utilisation des données existantes sans appel API...`);
        
        const existingData = await DataUtils.loadFromJson(specificOutputFile);
        
        // Nous n'utilisons plus le fichier standard
        
        console.log(`✅ Transactions chargées depuis le fichier existant`);
        return existingData;
      }
      
      console.log(`💡 Aucun fichier existant trouvé, récupération des données via API...`);
      
      // Limiter explicitement à 40 transactions, peu importe les options
      const transactionLimit = 40; // Fixer la limite à 40
      console.log(`🔒 Application de la limite fixe de ${transactionLimit} pour les transactions`);
      const data = await this.apiClient.getTransactions(this.walletAddress, transactionLimit);
      
      // Sauvegarder uniquement dans le fichier spécifique au portefeuille
      await DataUtils.saveToJson(specificOutputFile, data);
      
      console.log(`✅ Transactions collectées`);
      console.log(`✅ Données sauvegardées dans ${specificOutputFile}`);
      
      return data;
    } catch (error) {
      console.error(`❌ Erreur lors de la collecte des transactions: ${error.message}`);
      return null;
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
