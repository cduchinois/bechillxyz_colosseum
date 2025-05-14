import 'dotenv/config';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Client API pour interagir avec l'API Solscan avec gestion des erreurs améliorée
 */
export class SolscanApiClient {
  constructor(apiKey = process.env.SOLSCAN_API_KEY) {
    if (!apiKey) {
      throw new Error('La clé API Solscan est manquante. Veuillez la définir dans le fichier .env');
    }
    
    this.apiKey = apiKey;
    this.baseUrl = 'https://pro-api.solscan.io/v2.0';
    this.requestOptions = {
      method: "get",
      headers: { "token": this.apiKey },
    };
  }

  /**
   * Effectue une requête vers l'API Solscan avec gestion des erreurs
   * @param {string} endpoint - Le endpoint de l'API
   * @param {object} params - Les paramètres de la requête
   * @returns {Promise<object>} - Les données de la réponse
   */
  async fetchData(endpoint, params = {}) {
    try {
      // Construire l'URL avec les paramètres
      const queryParams = new URLSearchParams();
      console.log(`🔍 Paramètres de la requête: ${JSON.stringify(params, null, 2)}`);
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      
      const url = `${this.baseUrl}${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      console.log(`🌐 Requête API: ${endpoint}`);
      console.log(`🔗 URL: ${url}`);
      
      // Effectuer la requête avec retry logic
      let response;
      let retries = 0;
      const maxRetries = 3;
      
      while (retries < maxRetries) {
        try {
          response = await fetch(url, this.requestOptions);
          break;
        } catch (error) {
          retries++;
          if (retries >= maxRetries) {
            throw error;
          }
          console.warn(`⚠️ Tentative ${retries}/${maxRetries} échouée, nouvelle tentative dans ${retries * 2} secondes...`);
          await new Promise(resolve => setTimeout(resolve, retries * 2000));
        }
      }
      
      // Vérifier le statut de la réponse
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur API (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Réponse API: ${JSON.stringify(data, null, 2)}`);
      // Vérifier si la réponse contient une erreur
      if (data.error) {
        throw new Error(`Erreur API: ${data.error}`);
      }
      
      return data;
    } catch (error) {
      console.error(`❌ Erreur lors de la requête API ${endpoint}:`, error.message);
      throw error;
    }
  }

  /**
   * Récupère les activités DeFi d'un compte
   * @param {string} address - Adresse du portefeuille
   * @param {object} options - Options de pagination et filtres
   * @returns {Promise<object>} - Les activités DeFi
   */
  async getDefiActivities(address, options = {}) {
    const defaultOptions = {
      page: 1,
      page_size: 100,
      sort_by: 'block_time',
      sort_order: 'desc',
    };
    
    const params = { 
      address, 
      ...defaultOptions, 
      ...options 
    };
    
    return this.fetchData('/account/defi/activities', params);
  }

  /**
   * Récupère les changements de balance d'un compte
   * @param {string} address - Adresse du portefeuille
   * @param {object} options - Options de pagination et filtres
   * @returns {Promise<object>} - Les changements de balance
   */
  async getBalanceChanges(address, options = {}) {
    const defaultOptions = {
      page: 1,
      page_size: 100,
      sort_by: 'block_time',
      sort_order: 'desc',
    };
    
    const params = { 
      address, 
      ...defaultOptions, 
      ...options 
    };
    
    return this.fetchData('/account/balance_change', params);
  }

  /**
   * Récupère le portfolio d'un compte
   * @param {string} address - Adresse du portefeuille
   * @returns {Promise<object>} - Les données du portfolio
   */
  async getPortfolio(address) {
    return this.fetchData('/account/portfolio', { address });
  }

  /**
   * Récupère les comptes de token d'un utilisateur
   * @param {string} address - Adresse du portefeuille
   * @param {object} options - Options de pagination et filtres
   * @returns {Promise<object>} - Les comptes de token
   */
  async getTokenAccounts(address, options = {}) {
    const defaultOptions = {
      page: 1,
      page_size: 40,
      type: 'token'
    };
    
    const params = { 
      address, 
      ...defaultOptions, 
      ...options 
    };
    
    return this.fetchData('/account/token-accounts', params);
  }

  /**
   * Récupère les transactions d'un compte
   * @param {string} address - Adresse du portefeuille
   * @param {number} limit - Nombre maximal de transactions à récupérer (plafonné à 40)
   * @returns {Promise<object>} - Les transactions
   */
  async getTransactions(address, limit = 40) {
    // S'assurer que la limite ne dépasse pas 40, quelle que soit la valeur fournie
    const safeLimit = Math.min(limit, 40);
    if (limit > 40) {
      console.log(`⚠️ Limite ajustée de ${limit} à ${safeLimit} pour respecter les contraintes de l'API`);
    }
    console.log(`🔍 Récupération des transactions pour l'adresse ${address} avec une limite de ${safeLimit}`);
    return this.fetchData('/account/transactions', { address, limit: safeLimit });
  }

  /**
   * Récupère les transferts d'un compte
   * @param {string} address - Adresse du portefeuille
   * @param {object} options - Options de pagination et filtres
   * @returns {Promise<object>} - Les transferts
   */
  async getTransfers(address, options = {}) {
    const defaultOptions = {
      page: 1,
      page_size: 10,
      sort_by: 'block_time',
      sort_order: 'desc',
    };
    
    const params = { 
      address, 
      ...defaultOptions, 
      ...options 
    };
    
    return this.fetchData('/account/transfer', params);
  }
  
  /**
   * Récupère les détails d'un compte
   * @param {string} address - Adresse du portefeuille
   * @returns {Promise<object>} - Les détails du compte
   */
  async getAccountDetails(address) {
    return this.fetchData('/account/detail', { address });
  }
  
  /**
   * Récupère les statistiques du marché
   * @param {object} options - Options de pagination et tri
   * @returns {Promise<object>} - Les statistiques du marché
   */
  async getMarketStats(options = {}) {
    const defaultOptions = {
      page: 1,
      page_size: 100,
      sort_by: 'volumes_24h',
      sort_order: 'desc',
    };
    
    const params = { ...defaultOptions, ...options };
    return this.fetchData('/market/list', params);
  }

  /**
   * Récupère le prix d'un token
   * @param {string} tokenAddress - L'adresse du token
   * @returns {Promise<object>} - Les données de prix du token
   */
  async getTokenPrice(tokenAddress) {
    return this.fetchData('/token/price', { address: tokenAddress });
  }
  
  /**
   * Récupère les prix de plusieurs tokens
   * @param {string[]} tokenAddresses - Les adresses des tokens
   * @returns {Promise<Object<string, object>>} - Map des adresses de tokens vers leurs prix
   */
  async getMultipleTokenPrices(tokenAddresses) {
    if (!tokenAddresses || tokenAddresses.length === 0) {
      return {};
    }
    
    // Limiter à 20 requêtes parallèles pour éviter les limitations d'API
    const batchSize = 20;
    const results = {};
    
    // Traiter par lots
    for (let i = 0; i < tokenAddresses.length; i += batchSize) {
      const batch = tokenAddresses.slice(i, i + batchSize);
      const promises = batch.map(address => this.getTokenPrice(address).catch(() => null));
      
      const batchResults = await Promise.allSettled(promises);
      
      batch.forEach((address, index) => {
        if (batchResults[index].status === 'fulfilled' && batchResults[index].value) {
          results[address] = batchResults[index].value;
        }
      });
      console.log(`🔍 Prix récupéré pour ${batch.length} tokens: ${batch.join(', ')}`);
      console.log(`✅ ${Object.keys(results).length} prix de tokens récupérés au total`);
      console.log(`🔄 ${tokenAddresses.length - (i + batchSize)} tokens restants à traiter`);
      // Pause pour éviter les limitations d'API
      if (i + batchSize < tokenAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}

/**
 * Fonctions utilitaires pour le traitement des données
 */
export class DataUtils {
  /**
   * Sauvegarde des données dans un fichier JSON
   * @param {string} filename - Nom du fichier
   * @param {object} data - Données à sauvegarder
   * @returns {Promise<void>}
   */
  static async saveToJson(filename, data) {
    try {
      const dir = path.dirname(filename);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      
      const fs = await import('fs/promises');
      await fs.writeFile(filename, JSON.stringify(data, null, 2));
      console.log(`✓ Données sauvegardées dans ${filename}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la sauvegarde du fichier ${filename}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Charge des données depuis un fichier JSON
   * @param {string} filename - Nom du fichier
   * @param {object} defaultData - Données par défaut si le fichier est introuvable
   * @returns {Promise<object>} - Les données chargées
   */
  static async loadFromJson(filename, defaultData = {}) {
    try {
      if (!existsSync(filename)) {
        console.warn(`⚠️ Fichier non trouvé: ${filename}`);
        return defaultData;
      }
      
      const fs = await import('fs/promises');
      const data = await fs.readFile(filename, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`❌ Erreur lors du chargement du fichier ${filename}:`, error.message);
      return defaultData;
    }
  }
  
  /**
   * Formate une date en chaîne de caractères
   * @param {Date} date - La date à formater
   * @param {string} format - Le format de la date (short, medium, long, full)
   * @returns {string} - La date formatée
   */
  static formatDate(date, format = 'medium') {
    if (!date) return 'N/A';
    
    try {
      const options = { dateStyle: format, timeStyle: 'short' };
      return new Intl.DateTimeFormat('fr-FR', options).format(new Date(date));
    } catch (error) {
      return String(date);
    }
  }
  
  /**
   * Convertit une valeur de token en unités lisibles
   * @param {string|number} amount - Le montant en unités de base
   * @param {number} decimals - Le nombre de décimales du token
   * @returns {number} - Le montant en unités lisibles
   */
  static formatTokenAmount(amount, decimals) {
    if (!amount) return 0;
    
    const value = parseFloat(amount) / Math.pow(10, decimals || 0);
    return decimals ? parseFloat(value.toFixed(decimals)) : value;
  }

  /**
   * Convertit un montant de token natif en valeur estimée USD
   * @param {number} amount - Le montant en unités natives
   * @param {object} tokenPrice - Les données de prix du token
   * @param {number} decimals - Le nombre de décimales du token
   * @returns {number|null} - La valeur estimée en USD, ou null si impossible à calculer
   */
  static estimateUsdValue(amount, tokenPrice, decimals = 6) {
    // Si pas de montant ou pas de données de prix
    if (!amount || !tokenPrice) {
      return null;
    }
    
    let priceValue = null;
    
    // Cas 1: Format priceUsdt direct
    if (tokenPrice.priceUsdt) {
      priceValue = parseFloat(tokenPrice.priceUsdt);
    }
    // Cas 2: Format avec data[0].price (nouveau format)
    else if (tokenPrice.success && tokenPrice.data && Array.isArray(tokenPrice.data) && tokenPrice.data.length > 0) {
      // Prendre le prix le plus récent (premier élément du tableau)
      priceValue = parseFloat(tokenPrice.data[0].price);
    }
    
    // Si aucun prix n'a été trouvé
    if (priceValue === null) {
      return null;
    }
    console.log(`💰 Prix du token: ${priceValue} USD`);
    console.log(`💰 Montant natif: ${amount} unités`);
    // const amountInToken = this.formatTokenAmount(amount, decimals);
    return amount * priceValue;
  }
  
  /**
   * Formate un montant avec son équivalent USD si disponible
   * @param {number} amount - Le montant en unités natives
   * @param {object} tokenPrice - Les données de prix du token
   * @param {string} symbol - Le symbole du token
   * @param {number} decimals - Le nombre de décimales du token
   * @returns {string} - Le montant formaté avec équivalent USD si disponible
   */
  static formatAmountWithUsd(amount, tokenPrice, symbol = '', decimals = 6) {
    const formattedAmount = this.formatTokenAmount(amount, decimals).toLocaleString(undefined, {
      maximumFractionDigits: 4
    });
    
    const usdValue = this.estimateUsdValue(amount, tokenPrice, decimals);
    
    if (usdValue !== null) {
      return `${formattedAmount} ${symbol} (≈$${usdValue.toLocaleString(undefined, {
        maximumFractionDigits: 2
      })})`;
    }
    
    return `${formattedAmount} ${symbol}`;
  }
}
