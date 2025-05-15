import 'dotenv/config';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Client API pour interagir avec l'API Solscan avec gestion des erreurs améliorée
 */
export class SolscanApiClient {
  constructor(options = {}) {
    const apiKey = options.apiKey || process.env.SOLSCAN_API_KEY;
    
    if (!apiKey) {
      throw new Error('La clé API Solscan est manquante. Veuillez la définir dans le fichier .env ou dans les options du constructeur');
    }
    
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || 'https://pro-api.solscan.io/v2.0';
    this.requestOptions = {
      method: "get",
      headers: { "token": this.apiKey },
    };
    
    // Options pour la gestion des erreurs et des retries
    this.retryOptions = {
      maxRetries: options.maxRetries || 5,
      initialDelay: options.initialDelay || 1000,  // 1 seconde de délai initial
      maxDelay: options.maxDelay || 30000,  // 30 secondes de délai maximum
      factor: options.factor || 2,  // Facteur exponentiel de backoff
      statusCodesToRetry: options.statusCodesToRetry || [408, 429, 500, 502, 503, 504]
    };
    
    // Options de débug
    this.debug = options.debug || false;
  }

  /**
   * Effectue une requête vers l'API Solscan avec gestion avancée des erreurs et exponential backoff
   * @param {string} endpoint - Le endpoint de l'API
   * @param {object} params - Les paramètres de la requête
   * @returns {Promise<object>} - Les données de la réponse
   */
  async fetchData(endpoint, params = {}) {
    try {
      // Construire l'URL avec les paramètres
      const queryParams = new URLSearchParams();
      if (this.debug) {
        console.log(`🔍 Paramètres de la requête: ${JSON.stringify(params, null, 2)}`);
      }
      console.log(`🔍 Paramètres de la requête: ${JSON.stringify(params, null, 2)}`);
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      
      const url = `${this.baseUrl}${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log(`🔗 URL de la requête: ${url}`);
      console.log(`🌐 Requête API: ${endpoint}`);
      if (this.debug) {
        console.log(`🔗 URL: ${url}`);
      }
      
      // Effectuer la requête avec exponential backoff avancé
      let response;
      let retries = 0;
      let delay = this.retryOptions.initialDelay;
      
      while (retries <= this.retryOptions.maxRetries) {
        try {
          response = await fetch(url, this.requestOptions);
          
          // Si la réponse est ok, sortir de la boucle
          if (response.ok) break;
          
          // Si le statut n'est pas dans la liste des codes à réessayer, lancer une erreur immédiatement
          if (!this.retryOptions.statusCodesToRetry.includes(response.status)) {
            const errorText = await response.text();
            throw new Error(`Erreur API (${response.status}): ${errorText}`);
          }
          
          // Log pour les erreurs 429 (rate limit)
          if (response.status === 429) {
            console.warn(`⚠️ Rate limit atteint (429). Temporisation avant nouvelle tentative...`);
            
            // Respecter le Retry-After s'il est fourni
            const retryAfter = response.headers.get('Retry-After');
            if (retryAfter) {
              // Retry-After peut être un nombre de secondes ou une date
              const retryAfterSeconds = isNaN(retryAfter) 
                ? Math.ceil((new Date(retryAfter).getTime() - Date.now()) / 1000)
                : parseInt(retryAfter, 10);
              
              if (retryAfterSeconds > 0) {
                console.warn(`⏱️ Attente de ${retryAfterSeconds} secondes selon l'en-tête Retry-After`);
                await new Promise(resolve => setTimeout(resolve, retryAfterSeconds * 1000));
                continue;  // Tenter à nouveau la requête sans incrémenter le compteur
              }
            }
          }
          
          // Incrémenter le nombre de tentatives
          retries++;
          
          // Si on a dépassé le nombre maximal de tentatives, lancer une erreur
          if (retries > this.retryOptions.maxRetries) {
            const errorText = await response.text();
            throw new Error(`Erreur API après ${retries} tentatives (${response.status}): ${errorText}`);
          }
          
          // Calculer le délai avec jitter pour éviter les rafales synchronisées
          delay = Math.min(
            this.retryOptions.maxDelay,
            delay * this.retryOptions.factor * (1 + 0.2 * Math.random())
          );
          
          console.warn(`⚠️ Tentative ${retries}/${this.retryOptions.maxRetries} échouée (${response.status}), nouvelle tentative dans ${Math.round(delay/1000)} secondes...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
        } catch (error) {
          // Erreur réseau ou autre erreur non liée au statut HTTP
          retries++;
          if (retries > this.retryOptions.maxRetries) {
            throw new Error(`Erreur réseau après ${retries} tentatives: ${error.message}`);
          }
          
          // Calculer le délai avec jitter
          delay = Math.min(
            this.retryOptions.maxDelay,
            delay * this.retryOptions.factor * (1 + 0.2 * Math.random())
          );
          
          console.warn(`⚠️ Erreur réseau, tentative ${retries}/${this.retryOptions.maxRetries}: ${error.message}`);
          console.warn(`⏱️ Nouvelle tentative dans ${Math.round(delay/1000)} secondes...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      // À ce stade, soit la réponse est ok, soit on a lancé une erreur
      const data = await response.json();
      console.log(`✅ Réponse API reçue: ${JSON.stringify(data, null, 2)}`);
      if (this.debug) {
        console.log(`✅ Réponse API reçue: ${JSON.stringify(data, null, 2)}`);
      } else {
        console.log(`✅ Réponse API reçue pour ${endpoint}`);
      }
      
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
   * Récupère les transactions d'un compte avec support de filtrage avancé
   * @param {string} address - Adresse du portefeuille
   * @param {object} options - Options pour la requête
   * @param {number} options.limit - Nombre maximal de transactions à récupérer (plafonné à 40)
   * @param {string} options.before - La signature de la dernière transaction du lot précédent (pour pagination basée sur les signatures)
   * @param {string|Date} options.startDate - Date de début pour le filtrage (format ISO ou objet Date)
   * @param {string|Date} options.endDate - Date de fin pour le filtrage (format ISO ou objet Date)
   * @param {string} options.status - Statut des transactions à récupérer ('success', 'fail')
   * @param {string} options.type - Type de transaction à récupérer
   * @returns {Promise<object>} - Les transactions
   */
  async getTransactions(address, options = {}) {
    const defaultOptions = {
      limit: 40 // Limite max de l'API Solscan par page
    };
    
    const params = {
      address,
      ...defaultOptions
    };
    
    // S'assurer que la limite ne dépasse pas 40
    params.limit = Math.min(options.limit || defaultOptions.limit, 40);
    console.log(`🔍 Limite de transactions: ${params.limit}`);
    console.log(options);
    // Ajouter le paramètre before pour la pagination basée sur les signatures si fourni
    if (options.before) {
      params.before = options.before;
      console.log(`🔍 Pagination basée sur les signatures: before=${options.before.substring(0, 15)}...`);
    }
    
    // Ajouter les filtres de dates si fournis
    // Note: Ces filtres seront appliqués côté client après la récupération des données
    // car l'API ne supporte pas directement le filtrage par date
    
    const filters = [];
    
    if (options.startDate) {
      const startDate = options.startDate instanceof Date 
        ? options.startDate 
        : new Date(options.startDate);
      filters.push(`startDate: ${startDate.toISOString()}`);
    }
    
    if (options.endDate) {
      const endDate = options.endDate instanceof Date 
        ? options.endDate 
        : new Date(options.endDate);
      filters.push(`endDate: ${endDate.toISOString()}`);
    }
    
    if (options.status) {
      filters.push(`status: ${options.status}`);
    }
    
    if (options.type) {
      filters.push(`type: ${options.type}`);
    }
    
    const filterText = filters.length > 0 ? `, filtres: ${filters.join(', ')}` : '';
    console.log(`🔍 Récupération des transactions pour ${address} (limite: ${params.limit}${filterText})`);
    console.log(params);
    // Récupération des données auprès de l'API
    return this.fetchData('/account/transactions', params);
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
