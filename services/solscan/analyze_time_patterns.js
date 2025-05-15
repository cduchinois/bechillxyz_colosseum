import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { DataUtils } from './utils/api_client.js';
import path from 'path';

/**
 * Analyse les modèles temporels dans les activités DeFi
 */
async function analyzeTimePatterns() {
  try {
    console.log('📊 Analyse des modèles temporels dans les activités DeFi...');
    
    // Récupérer l'adresse du portefeuille depuis les arguments de ligne de commande
    const args = process.argv.slice(2);
    const walletAddress = args[0] || process.env.ADDRESS_WALLET;
    
    if (!walletAddress) {
      console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node analyze_time_patterns.js ADDRESS_WALLET');
      return;
    }
    
    // D'abord essayer d'utiliser le fichier de transactions
    const transactionsFile = `./output/transactions_${walletAddress}.json`;
    const activitiesFile = `./output/activities_detailed_summary_${walletAddress}.json`;
    
    let useTransactions = false;
    let useActivities = false;
    
    // Vérifier si le fichier de transactions existe
    if (existsSync(transactionsFile)) {
      console.log(`💡 Utilisation du fichier de transactions: ${transactionsFile}`);
      useTransactions = true;
    } 
    // Sinon vérifier si le fichier d'activités existe
    else if (existsSync(activitiesFile)) {
      console.log(`💡 Utilisation du fichier d'activités: ${activitiesFile}`);
      useActivities = true;
    }
    // Sinon aucun fichier disponible
    else {
      console.error(`❌ Erreur: Aucun fichier de données trouvé pour l'analyse temporelle.`);
      console.error(`Exécutez d'abord acc_transactions.js ou acc_defi_activities.js avec cette adresse.`);
      return;
    }
    
    // Structures pour stocker les résultats
    const timeAnalysis = {
      activityDistribution: {
        byHour: Array(24).fill(0),
        byDayOfWeek: Array(7).fill(0),
        byMonth: Array(12).fill(0)
      },
      byYear: {},
      timeSeries: [],
      activityGaps: [],
      busyPeriods: [],
      weekdayVsWeekend: { 
        weekday: 0, 
        weekend: 0,
        weekdayPercentage: 0,
        weekendPercentage: 0 
      },
      firstActivity: null,
      lastActivity: null,
      averageGap: 0,
      medianGap: 0,
    };
    
    // Variables pour stocker les données d'activité
    let activities = [];
    
    // Traiter selon la source des données
    if (useTransactions) {
      // Charger et traiter les données de transactions
      const transactionsData = JSON.parse(await readFile(transactionsFile, 'utf8'));
      
      // Déterminer le format des données
      const txData = Array.isArray(transactionsData) ? transactionsData : transactionsData.data;
      if (!txData || txData.length === 0) {
        console.warn('⚠️ Aucune donnée de transaction disponible pour l\'analyse temporelle');
        return;
      }
      
      console.log(`📊 Analyse de ${txData.length} transactions...`);
      
      // Extraire les timestamps et trier par ordre chronologique
      activities = txData
        .filter(tx => tx.block_time || tx.blockTime || tx.time)
        .map(tx => {
          const timestamp = tx.block_time || tx.blockTime || (tx.time && !isNaN(Number(tx.time)) ? Number(tx.time) : null);
          if (!timestamp) return null;
          
          const timeInMs = timestamp * (timestamp < 1600000000000 ? 1000 : 1); // Convertir en ms si nécessaire
          return {
            timestamp: timeInMs,
            date: new Date(timeInMs),
            tx_hash: tx.tx_hash || tx.txHash || tx.signature || tx.id || 'unknown',
            activity_type: tx.tx_type || 'TRANSACTION'
          };
        })
        .filter(activity => activity !== null)
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    else if (useActivities) {
      // Charger les données d'activités
      const activitiesData = await DataUtils.loadFromJson(activitiesFile, { data: [] });
      
      if (!activitiesData.data || !Array.isArray(activitiesData.data) || activitiesData.data.length === 0) {
        console.warn('⚠️ Aucune donnée d\'activité disponible pour l\'analyse temporelle');
        return;
      }
      
      console.log(`📊 Analyse de ${activitiesData.data.length} activités...`);
      
      // Trier les activités par date
      activities = [...activitiesData.data]
        .filter(activity => activity.block_time || activity.time)
        .map(activity => {
          const timestamp = activity.block_time || (activity.time && !isNaN(Number(activity.time)) ? Number(activity.time) : null);
          if (!timestamp) return null;
          
          const timeInMs = timestamp * (timestamp < 1600000000000 ? 1000 : 1); // Convertir en ms si nécessaire
          return {
            timestamp: timeInMs,
            date: new Date(timeInMs),
            tx_hash: activity.tx_hash || 'unknown',
            activity_type: activity.activity_type || 'UNKNOWN',
            platform: activity.platform,
            value: activity.value
          };
        })
        .filter(activity => activity !== null)
        .sort((a, b) => a.timestamp - b.timestamp);
    }
    
    if (activities.length === 0) {
      console.warn('⚠️ Aucune activité avec horodatage valide trouvée');
      return;
    }
    
    // Extraire les timestamps pour l'analyse des écarts
    const timestamps = activities.map(activity => activity.timestamp);
    
    // Première et dernière activité
    timeAnalysis.firstActivity = timestamps[0];
    timeAnalysis.lastActivity = timestamps[timestamps.length - 1];
    
    // Calculer les écarts entre les activités
    const gaps = [];
    for (let i = 1; i < timestamps.length; i++) {
      const gap = (timestamps[i] - timestamps[i - 1]) / 1000; // en secondes
      gaps.push(gap);
      
      // Détecter les écarts importants (plus de 1 jour)
      if (gap > 24 * 60 * 60) {
        timeAnalysis.activityGaps.push({
          startTime: new Date(timestamps[i - 1]).toISOString(),
          endTime: new Date(timestamps[i]).toISOString(),
          gapDays: Math.round(gap / (24 * 60 * 60) * 10) / 10,
          tx_before: activities[i-1].tx_hash,
          tx_after: activities[i].tx_hash
        });
      }
    }
    
    // Trier les écarts par durée (du plus long au plus court)
    timeAnalysis.activityGaps.sort((a, b) => b.gapDays - a.gapDays);
    
    // Calculer les écarts moyens et médians
    timeAnalysis.averageGap = gaps.length > 0 ? 
      Math.round(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length / (60 * 60) * 10) / 10 : 0; // en heures
    timeAnalysis.medianGap = gaps.length > 0 ?
      gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)] / (60 * 60) : 0; // en heures
    
    // Comptabiliser le nombre d'activités par heure, jour de la semaine, mois et année
    activities.forEach(activity => {
      const date = activity.date;
      const hour = date.getHours();
      const dayOfWeek = date.getDay(); // 0 = Dimanche, 6 = Samedi
      const month = date.getMonth(); // 0 = Janvier, 11 = Décembre
      const year = date.getFullYear();
      
      timeAnalysis.activityDistribution.byHour[hour]++;
      timeAnalysis.activityDistribution.byDayOfWeek[dayOfWeek]++;
      timeAnalysis.activityDistribution.byMonth[month]++;
      
      if (!timeAnalysis.byYear[year]) {
        timeAnalysis.byYear[year] = 0;
      }
      timeAnalysis.byYear[year]++;
      
      // Weekend vs Weekday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        timeAnalysis.weekdayVsWeekend.weekend++;
      } else {
        timeAnalysis.weekdayVsWeekend.weekday++;
      }
      
      // Time series data
      timeAnalysis.timeSeries.push({
        timestamp: activity.timestamp,
        date: date.toISOString(),
        activityType: activity.activity_type,
        platform: Array.isArray(activity.platform) ? activity.platform[0] : activity.platform || 'unknown',
        tx_hash: activity.tx_hash || 'unknown',
        value: activity.value || 0
      });
    });
    
    // Calculer les pourcentages pour weekday vs weekend
    const total = timeAnalysis.weekdayVsWeekend.weekday + timeAnalysis.weekdayVsWeekend.weekend;
    timeAnalysis.weekdayVsWeekend.weekdayPercentage = Math.round(timeAnalysis.weekdayVsWeekend.weekday / total * 100);
    timeAnalysis.weekdayVsWeekend.weekendPercentage = Math.round(timeAnalysis.weekdayVsWeekend.weekend / total * 100);
    
    // Détecter les périodes les plus actives (fenêtres glissantes de 24h)
    for (let i = 0; i < timestamps.length - 10; i++) {
      const windowStart = timestamps[i];
      const windowEnd = windowStart + 24 * 60 * 60 * 1000; // 24 heures en millisecondes
      
      let activitiesInWindow = 0;
      for (let j = i; j < timestamps.length && timestamps[j] <= windowEnd; j++) {
        activitiesInWindow++;
      }
      
      if (activitiesInWindow >= 10) {
        timeAnalysis.busyPeriods.push({
          startTime: new Date(windowStart).toISOString(),
          endTime: new Date(windowEnd).toISOString(),
          activityCount: activitiesInWindow
        });
      }
    }
    
    // Trier et filtrer les périodes d'activité intense pour ne garder que les plus significatives
    timeAnalysis.busyPeriods.sort((a, b) => b.activityCount - a.activityCount);
    timeAnalysis.busyPeriods = timeAnalysis.busyPeriods.slice(0, 5); // Garder les 5 plus actives
    
    // Analyse mensuelle
    const monthlyData = {};
    activities.forEach(activity => {
      const date = activity.date;
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[yearMonth]) {
        monthlyData[yearMonth] = {
          count: 0,
          value: 0,
          activities: {}
        };
      }
      
      monthlyData[yearMonth].count++;
      monthlyData[yearMonth].value += activity.value || 0;
      
      const actType = activity.activity_type;
      if (!monthlyData[yearMonth].activities[actType]) {
        monthlyData[yearMonth].activities[actType] = 0;
      }
      monthlyData[yearMonth].activities[actType]++;
    });
    
    // Convertir en tableau pour le tri
    const monthlyAnalysis = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: data.count,
      value: Math.round(data.value * 100) / 100,
      activities: data.activities
    }));
    
    // Trier par date
    monthlyAnalysis.sort((a, b) => a.month.localeCompare(b.month));
    
    // Ajouter l'analyse mensuelle au résultat final
    timeAnalysis.monthlyAnalysis = monthlyAnalysis;
    
    // Préparer le chemin du fichier avec l'adresse du portefeuille
    const outputFile = `./output/time_analysis_${walletAddress}.json`;
    
    // Écrire les résultats dans le fichier
    await writeFile(outputFile, JSON.stringify(timeAnalysis, null, 2));
    console.log(`✅ Analyse temporelle terminée. Résultats écrits dans ${outputFile}`);
    
    // Afficher un résumé
    console.log('\n📅 RÉSUMÉ DE L\'ANALYSE TEMPORELLE');
    console.log('----------------------------');
    console.log(`Première activité: ${new Date(timeAnalysis.firstActivity).toLocaleString()}`);
    console.log(`Dernière activité: ${new Date(timeAnalysis.lastActivity).toLocaleString()}`);
    // Gestion du cas où activityGaps est vide ou gapDays est NaN
    const longestInactivityPeriod = timeAnalysis.activityGaps.length > 0 ? 
      (timeAnalysis.activityGaps[0].gapDays || 0) : 0;
    console.log(`Période d'inactivité la plus longue: ${longestInactivityPeriod} jours`);
    console.log(`Activités en semaine: ${timeAnalysis.weekdayVsWeekend.weekdayPercentage}%`);
    console.log(`Activités le weekend: ${timeAnalysis.weekdayVsWeekend.weekendPercentage}%`);
    console.log('----------------------------');
    
    return timeAnalysis;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse temporelle:', error);
    throw error;
  }
}

// Exécuter l'analyse
analyzeTimePatterns();
