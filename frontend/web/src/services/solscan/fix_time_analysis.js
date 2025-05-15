import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

async function generateTimeAnalysis() {
  try {
    console.log('🔧 Génération des fichiers d\'analyse temporelle manquants...');
    
    // Récupérer l'adresse du portefeuille depuis les arguments de ligne de commande
    const args = process.argv.slice(2);
    const walletAddress = args[0];
    
    if (!walletAddress) {
      console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node fix_time_analysis.js ADDRESS_WALLET');
      return;
    }
    
    // Préparer le chemin du fichier de transactions spécifique au portefeuille
    const transactionsFile = `./output/transactions_${walletAddress}.json`;
    
    // Vérifier si le fichier existe
    if (!existsSync(transactionsFile)) {
      console.error(`❌ Erreur: Le fichier ${transactionsFile} n'existe pas.`);
      return;
    }
    
    console.log(`💡 Utilisation du fichier de transactions: ${transactionsFile}`);
    
    // Charger les données des transactions
    const transactionsData = JSON.parse(await readFile(transactionsFile, 'utf8'));
    
    // Vérifier la structure des données
    if ((!Array.isArray(transactionsData) && !transactionsData.data) || 
        (Array.isArray(transactionsData) && transactionsData.length === 0) ||
        (!Array.isArray(transactionsData) && (!Array.isArray(transactionsData.data) || transactionsData.data.length === 0))) {
      console.warn('⚠️ Aucune donnée de transaction disponible pour l\'analyse temporelle');
      return;
    }
    
    // Déterminer si les données sont un tableau directement ou contenues dans une propriété data
    const txData = Array.isArray(transactionsData) ? transactionsData : transactionsData.data;
    console.log(`📊 Analyse de ${txData.length} transactions...`);
    
    // Structures pour stocker les résultats
    const timeAnalysis = {
      activityDistribution: {
        byHour: Array(24).fill(0),
        byDayOfWeek: Array(7).fill(0),
        byMonth: Array(12).fill(0)
      },
      weekdayVsWeekend: { 
        weekday: 0, 
        weekend: 0,
        weekdayPercentage: 0,
        weekendPercentage: 0 
      },
      firstActivity: null,
      lastActivity: null,
      activityGaps: [],
      averageGap: 0,
    };
    
    // Extraire les timestamps et trier par ordre chronologique
    const activities = txData
      .filter(tx => tx.block_time || tx.blockTime || tx.time)
      .map(tx => {
        const timestamp = tx.block_time || tx.blockTime || (tx.time && !isNaN(Number(tx.time)) ? Number(tx.time) : null);
        if (!timestamp) return null;
        
        const timeInMs = timestamp * (timestamp < 1600000000000 ? 1000 : 1); // Convertir en ms si nécessaire
        return {
          timestamp: timeInMs,
          date: new Date(timeInMs),
          tx_hash: tx.tx_hash || tx.txHash || tx.signature || tx.id || 'unknown'
        };
      })
      .filter(activity => activity !== null)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    if (activities.length === 0) {
      console.warn('⚠️ Aucune activité avec horodatage valide trouvée');
      return;
    }
    
    // Enregistrer la première et dernière activité
    timeAnalysis.firstActivity = activities[0].timestamp;
    timeAnalysis.lastActivity = activities[activities.length - 1].timestamp;
    
    // Calculer les écarts entre les activités
    const gaps = [];
    const significantGaps = [];
    
    for (let i = 1; i < activities.length; i++) {
      const gap = (activities[i].timestamp - activities[i-1].timestamp) / 1000; // en secondes
      gaps.push(gap);
      
      if (gap > 24 * 60 * 60) { // Écarts de plus d'un jour
        significantGaps.push({
          startTime: new Date(activities[i-1].timestamp).toISOString(),
          endTime: new Date(activities[i].timestamp).toISOString(),
          gapDays: Math.round(gap / (24 * 60 * 60) * 10) / 10
        });
      }
    }
    
    // Trier les écarts significatifs par durée (descendant)
    significantGaps.sort((a, b) => b.gapDays - a.gapDays);
    timeAnalysis.activityGaps = significantGaps;
    
    // Calculer l'écart moyen
    timeAnalysis.averageGap = gaps.length > 0 ? 
      Math.round(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length / (60 * 60) * 10) / 10 : 0; // en heures
    
    // Comptabiliser les activités par heure, jour de la semaine et mois
    activities.forEach(activity => {
      const date = activity.date;
      const hour = date.getHours();
      const dayOfWeek = date.getDay(); // 0 = Dimanche, 6 = Samedi
      const month = date.getMonth(); // 0 = Janvier, 11 = Décembre
      
      timeAnalysis.activityDistribution.byHour[hour]++;
      timeAnalysis.activityDistribution.byDayOfWeek[dayOfWeek]++;
      timeAnalysis.activityDistribution.byMonth[month]++;
      
      // Weekend vs Weekday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        timeAnalysis.weekdayVsWeekend.weekend++;
      } else {
        timeAnalysis.weekdayVsWeekend.weekday++;
      }
    });
    
    // Calculer les pourcentages pour weekday vs weekend
    const total = timeAnalysis.weekdayVsWeekend.weekday + timeAnalysis.weekdayVsWeekend.weekend;
    if (total > 0) {
      timeAnalysis.weekdayVsWeekend.weekdayPercentage = Math.round(timeAnalysis.weekdayVsWeekend.weekday / total * 100);
      timeAnalysis.weekdayVsWeekend.weekendPercentage = Math.round(timeAnalysis.weekdayVsWeekend.weekend / total * 100);
    }
    
    // Préparer le chemin du fichier de sortie
    const outputFile = `./output/time_analysis_${walletAddress}.json`;
    
    // Écrire les résultats dans le fichier
    await writeFile(outputFile, JSON.stringify(timeAnalysis, null, 2));
    console.log(`✅ Analyse temporelle terminée. Résultats écrits dans ${outputFile}`);
    
    // Afficher un résumé
    console.log('\n📅 RÉSUMÉ DE L\'ANALYSE TEMPORELLE');
    console.log('----------------------------');
    console.log(`Première activité: ${new Date(timeAnalysis.firstActivity).toLocaleString()}`);
    console.log(`Dernière activité: ${new Date(timeAnalysis.lastActivity).toLocaleString()}`);
    const longestInactivityPeriod = timeAnalysis.activityGaps.length > 0 ? 
      timeAnalysis.activityGaps[0].gapDays : 0;
    console.log(`Période d'inactivité la plus longue: ${longestInactivityPeriod} jours`);
    console.log(`Activités en semaine: ${timeAnalysis.weekdayVsWeekend.weekdayPercentage}%`);
    console.log(`Activités le weekend: ${timeAnalysis.weekdayVsWeekend.weekendPercentage}%`);
    console.log('----------------------------');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération de l\'analyse temporelle:', error);
  }
}

// Exécuter la fonction
generateTimeAnalysis();
