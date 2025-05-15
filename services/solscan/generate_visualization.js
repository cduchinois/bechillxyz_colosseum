import { readFile, writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

/**
 * Génère une visualisation HTML des données d'analyse du portefeuille
 * @param {string} walletAddress - Adresse du portefeuille (optionnelle)
 */
async function generateVisualization(walletAddress) {
  try {
    // Vérifier/créer le dossier de visualisations
    const visualDir = path.join('./output', 'visualizations');
    if (!existsSync(visualDir)) {
      mkdirSync(visualDir, { recursive: true });
    }
    
    if (!walletAddress) {
      console.error('❌ Erreur: Aucune adresse de portefeuille fournie. Utilisez le format: node generate_visualization.js ADDRESS_WALLET');
      return;
    }
    
    // Récupérer le rapport consolidé spécifique au portefeuille
    const reportFilename = `./output/wallet_report_${walletAddress}.json`;
    
    if (!existsSync(reportFilename)) {
      console.error(`❌ Erreur: Le fichier ${reportFilename} n'existe pas.`);
      console.error('Exécutez d\'abord analyze_wallet.js avec cette adresse de portefeuille.');
      return;
    }
    
    const reportData = JSON.parse(await readFile(reportFilename, 'utf8'));
    console.log(`✅ Données du rapport chargées: ${reportFilename}`);
    
    // Vérifier si les données d'analyse temporelle existent
    const timeAnalysisFile = `./output/time_analysis_${walletAddress}.json`;
    
    if (existsSync(timeAnalysisFile)) {
      try {
        const timeAnalysisData = JSON.parse(await readFile(timeAnalysisFile, 'utf8'));
        reportData.timeAnalysis = timeAnalysisData;
        
        // S'assurer que les données temporelles sont correctement formatées pour l'affichage
        if (!reportData.summary) {
          reportData.summary = {};
        }
        
        if (!reportData.summary.transactionPeriod) {
          reportData.summary.transactionPeriod = {};
        }
        
        // Utiliser les données de première et dernière activité du time analysis
        if (timeAnalysisData.firstActivity) {
          reportData.summary.transactionPeriod.firstTransaction = 
            typeof timeAnalysisData.firstActivity === 'string' 
              ? timeAnalysisData.firstActivity 
              : new Date(timeAnalysisData.firstActivity).toISOString();
        }
        
        if (timeAnalysisData.lastActivity) {
          reportData.summary.transactionPeriod.lastTransaction = 
            typeof timeAnalysisData.lastActivity === 'string' 
              ? timeAnalysisData.lastActivity 
              : new Date(timeAnalysisData.lastActivity).toISOString();
        }
        
        console.log(`✅ Données d'analyse temporelle chargées: ${timeAnalysisFile}`);
      } catch (error) {
        console.warn(`⚠️ Erreur lors du chargement des données d'analyse temporelle: ${error.message}`);
      }
    } else {
      console.warn(`⚠️ Le fichier ${timeAnalysisFile} n'existe pas. Les graphiques temporels ne seront pas générés.`);
      console.log(`💡 Exécutez d'abord "node fix_time_analysis.js ${walletAddress}" pour générer l'analyse temporelle.`);
      reportData.timeAnalysis = null;
    }
    
    // Générer le contenu HTML
    const htmlContent = generateHtmlContent(reportData);
    
    // Déterminer le nom du fichier HTML (avec l'adresse du portefeuille)
    const htmlFilename = `wallet_report_${walletAddress}.html`;
    
    // Écrire le fichier HTML
    const htmlFilePath = path.join(visualDir, htmlFilename);
    await writeFile(htmlFilePath, htmlContent);
    
    console.log(`✅ Visualisation HTML générée: ${htmlFilePath}`);
    console.log('📊 Ouvrez ce fichier dans votre navigateur pour voir les graphiques et analyses');
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération de la visualisation:', error);
  }
}

/**
 * Génère le contenu HTML de la visualisation
 * @param {Object} data - Les données du rapport consolidé
 * @returns {string} Le contenu HTML
 */
function generateHtmlContent(data) {
  // Préparation des données pour les graphiques
  const platformLabels = data.platforms.topPlatforms.map(p => p.platform).join("','");
  const platformCounts = data.platforms.topPlatforms.map(p => p.count).join(',');
  
  const activityLabels = data.activities.activityBreakdown.map(a => a.type.replace('ACTIVITY_', '')).join("','");
  const activityCounts = data.activities.activityBreakdown.map(a => a.count).join(',');
  
  const tokenLabels = data.tokens.topTokensByVolume.map(t => t.symbol).slice(0, 5).join("','");
  const tokenVolumes = data.tokens.topTokensByVolume.map(t => parseFloat(t.totalVolume)).slice(0, 5).join(',');
  
  const tokenPairsLabels = data.tokenPairs.slice(0, 5).map(p => `${p.token1Symbol} ↔ ${p.token2Symbol}`).join("','");
  const tokenPairsCounts = data.tokenPairs.slice(0, 5).map(p => p.count).join(',');
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport d'Analyse du Portefeuille Solana</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Configuration globale des graphiques pour un thème sombre
        Chart.defaults.color = '#e0e0e0';
        Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.1)';
        Chart.defaults.scale.grid.borderColor = 'rgba(255, 255, 255, 0.2)';
    </script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #e0e0e0;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #121212;
        }
        header {
            background-color: #6200ea;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            text-align: center;
        }
        .summary-card {
            background-color: #1e1e1e;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            padding: 1.5rem;
            margin-bottom: 2rem;
            border: 1px solid #333;
        }
        .chart-container {
            background-color: #1e1e1e;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            padding: 1rem;
            margin-bottom: 2rem;
            border: 1px solid #333;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 2rem;
        }
        h1, h2, h3 {
            color: #b388ff;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        .stat-card {
            background-color: #252525;
            border-left: 4px solid #b388ff;
            padding: 1rem;
            border-radius: 4px;
        }
        .stat-value {
            font-size: 1.8rem;
            font-weight: bold;
            color: #b388ff;
        }
        .stat-label {
            font-size: 0.9rem;
            color: #bdbdbd;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        th, td {
            border: 1px solid #444;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #252525;
            color: #b388ff;
        }
        tr:nth-child(even) {
            background-color: #2c2c2c;
        }
        tr:hover {
            background-color: #333;
        }
        .token-pairs-list {
            list-style-type: none;
            padding: 0;
        }
        .token-pairs-list li {
            padding: 8px 0;
            border-bottom: 1px solid #444;
            font-size: 1.1rem;
        }
        .token-pairs-list li:last-child {
            border-bottom: none;
        }
        footer {
            text-align: center;
            margin-top: 2rem;
            font-size: 0.9rem;
            color: #9e9e9e;
            background-color: #1e1e1e;
            padding: 1rem;
            border-radius: 8px;
            border-top: 1px solid #333;
        }
    </style>
</head>
<body>
    <header>
        <h1>Rapport d'Analyse du Portefeuille Solana</h1>
        <p>Adresse: ${data.walletAddress}</p>
        <p>Généré le: ${new Date(data.generatedAt).toLocaleString()}</p>
    </header>

    <div class="summary-card">
        <h2>Résumé du Portefeuille</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${data.summary.totalTransactions}</div>
                <div class="stat-label">Transactions totales sur la période</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.summary.uniqueTokens}</div>
                <div class="stat-label">Tokens uniques</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.summary.volumeTraded}</div>
                <div class="stat-label">Volume total (unités combinées)</div>
            </div>
            ${data.summary.topVolumes && data.summary.topVolumes.length > 0 ? `
            <div class="stat-card">
                <div class="stat-value">${data.summary.topVolumes[0].volume} ${data.summary.topVolumes[0].symbol}</div>
                <div class="stat-label">Volume principal</div>
            </div>` : ''}
            <div class="stat-card">
                <div class="stat-value">${data.summary.uniquePlatforms}</div>
                <div class="stat-label">Plateformes utilisées</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.platforms?.mainPlatform || 'N/A'}</div>
                <div class="stat-label">Plateforme principale</div>
            </div>
        </div>
    </div>
    
    <div class="summary-card">
        <h2>Analyse Temporelle</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${data.summary?.transactionPeriod?.firstTransaction ? new Date(data.summary.transactionPeriod.firstTransaction).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short', year: 'numeric'}) + ', ' + new Date(data.summary.transactionPeriod.firstTransaction).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) : 'N/A'}</div>
                <div class="stat-label">Première activité</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.summary?.transactionPeriod?.lastTransaction ? new Date(data.summary.transactionPeriod.lastTransaction).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short', year: 'numeric'}) + ', ' + new Date(data.summary.transactionPeriod.lastTransaction).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'}) : 'N/A'}</div>
                <div class="stat-label">Dernière activité</div>
            </div>
            ${data.timeAnalysis?.activityGaps ? `
            <div class="stat-card">
                <div class="stat-value">${data.timeAnalysis.activityGaps.length > 0 ? data.timeAnalysis.activityGaps[0]?.gapDays || 0 : 0} jours</div>
                <div class="stat-label">Période d'inactivité la plus longue</div>
            </div>` : ''}
            <div class="stat-card">
                <div class="stat-value">${data.timeAnalysis?.weekdayVsWeekend?.weekdayPercentage || data.summary?.weekdayVsWeekend?.weekdayPercentage || 'N/A'}%</div>
                <div class="stat-label">Activités en semaine</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.timeAnalysis?.weekdayVsWeekend?.weekendPercentage || data.summary?.weekdayVsWeekend?.weekendPercentage || 'N/A'}%</div>
                <div class="stat-label">Activités le weekend</div>
            </div>
        </div>
    </div>

    <div class="grid">
        <div class="chart-container">
            <h2>Répartition par Plateforme</h2>
            <canvas id="platformsChart"></canvas>
        </div>
        <div class="chart-container">
            <h2>Types d'Activités</h2>
            <canvas id="activitiesChart"></canvas>
        </div>
    </div>

    <div class="grid">
        <div class="chart-container">
            <h2>Top 5 Tokens par Volume</h2>
            <canvas id="tokensChart"></canvas>
        </div>
        <div class="chart-container">
            <h2>Top 5 Paires de Tokens</h2>
            <canvas id="pairsChart"></canvas>
        </div>
    </div>
    
    <div class="summary-card">
        <h2>Principales Paires de Tokens</h2>
        ${data.tokenPairs && data.tokenPairs.length > 0 ? `
        <ul class="token-pairs-list">
            ${data.tokenPairs.slice(0, 5).map(pair => 
                `<li>${pair.token1Symbol} ↔ ${pair.token2Symbol}: ${pair.count} transactions</li>`
            ).join('')}
        </ul>
        ` : '<p>Aucune paire de tokens trouvée.</p>'}
    </div>
    
    ${data.usdEstimates ? `
    <div class="summary-card">
        <h2>Estimation de Valeur USD</h2>
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">$${parseFloat(data.usdEstimates.totalEstimatedUsd).toLocaleString(undefined, {maximumFractionDigits: 2})}</div>
                <div class="stat-label">Valeur totale estimée</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.usdEstimates.tokensWithEstimates}</div>
                <div class="stat-label">Tokens avec estimation prix</div>
            </div>
        </div>
        
        <h3>Top Tokens par Valeur USD</h3>
        <table>
            <tr>
                <th>Token</th>
                <th>Volume Natif</th>
                <th>Prix USDT</th>
                <th>Valeur USD Estimée</th>
            </tr>
            ${data.usdEstimates.topTokensByUsdValue.map(token => `
            <tr>
                <td>${token.symbol}</td>
                <td>${parseFloat(token.totalVolume).toLocaleString(undefined, {maximumFractionDigits: 4})} unités</td>
                <td>$${parseFloat(token.priceUsdt).toFixed(6)}</td>
                <td>$${parseFloat(token.usdValue).toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
            </tr>`).join('')}
        </table>
    </div>
    ` : ''}
    
    ${data.timeAnalysis ? `
    <h2>Analyse Temporelle</h2>
    <div class="grid">
        <div class="chart-container">
            <h2>Distribution par Heure de la Journée</h2>
            <canvas id="hourlyChart"></canvas>
        </div>
        <div class="chart-container">
            <h2>Distribution par Jour de la Semaine</h2>
            <canvas id="weekdayChart"></canvas>
        </div>
    </div>
    
    <div class="grid">
        <div class="chart-container">
            <h2>Distribution par Mois</h2>
            <canvas id="monthlyChart"></canvas>
        </div>
        <div class="chart-container">
            <h2>Activités Semaine vs Weekend</h2>
            <canvas id="weekendChart"></canvas>
        </div>
    </div>
    ` : ''}

    <div class="summary-card">
        <h2>Détails des Tokens</h2>
        <table>
            <tr>
                <th>Token</th>
                <th>Volume Total</th>
                <th>Transactions</th>
                <th>% du Volume</th>
            </tr>
            ${data.tokens.topTokensByVolume.slice(0, 10).map(token => `
            <tr>
                <td>${token.symbol || token.token}</td>
                <td>${parseFloat(token.totalVolume).toFixed(3)} ${token.symbol} (unités natives)</td>
                <td>${token.transactionCount}</td>
                <td>${token.percentage}</td>
            </tr>`).join('')}
        </table>
    </div>
    
    <script>
        // Graphique des plateformes
        new Chart(document.getElementById('platformsChart'), {
            type: 'pie',
            data: {
                labels: ['${platformLabels}'],
                datasets: [{
                    data: [${platformCounts}],
                    backgroundColor: ['#7c4dff', '#b388ff', '#651fff', '#aa00ff', '#d500f9']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Distribution des Plateformes'
                    }
                }
            }
        });
        
        // Graphique des types d'activités
        new Chart(document.getElementById('activitiesChart'), {
            type: 'doughnut',
            data: {
                labels: ['${activityLabels}'],
                datasets: [{
                    data: [${activityCounts}],
                    backgroundColor: ['#00b0ff', '#00e5ff', '#1de9b6', '#00e676', '#76ff03', '#ffea00', '#ffc400']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Distribution des Types d\'Activités'
                    }
                }
            }
        });
        
        // Graphique des tokens par volume
        new Chart(document.getElementById('tokensChart'), {
            type: 'bar',
            data: {
                labels: ['${tokenLabels}'],
                datasets: [{
                    label: 'Volume (unités natives)',
                    data: [${tokenVolumes}],
                    backgroundColor: '#bb86fc'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Volume par Token (en unités natives, non-convertis)'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.raw + ' unités';
                            }
                        }
                    }
                }
            }
        });
        
        // Graphique des paires de tokens
        new Chart(document.getElementById('pairsChart'), {
            type: 'bar',
            data: {
                labels: ['${tokenPairsLabels}'],
                datasets: [{
                    label: 'Nombre de Transactions',
                    data: [${tokenPairsCounts}],
                    backgroundColor: '#03dac6'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Nombre de Transactions par Paire'
                    }
                }
            }
        });
        ${data.timeAnalysis ? `
        // Graphique de distribution par heure
        new Chart(document.getElementById('hourlyChart'), {
            type: 'bar',
            data: {
                labels: Array.from({length: 24}, (_, i) => \`\${i}h\`),
                datasets: [{
                    label: 'Nombre d\'activités',
                    data: ${JSON.stringify(data.timeAnalysis.activityDistribution.byHour)},
                    backgroundColor: '#00e676',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribution des activités par heure de la journée'
                    }
                }
            }
        });
        
        // Graphique de distribution par jour de la semaine
        new Chart(document.getElementById('weekdayChart'), {
            type: 'bar',
            data: {
                labels: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
                datasets: [{
                    label: 'Nombre d\'activités',
                    data: ${JSON.stringify(data.timeAnalysis.activityDistribution.byDayOfWeek)},
                    backgroundColor: '#ffab00',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribution des activités par jour de la semaine'
                    }
                }
            }
        });
        
        // Graphique de distribution par mois
        new Chart(document.getElementById('monthlyChart'), {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
                datasets: [{
                    label: 'Nombre d\'activités',
                    data: ${JSON.stringify(data.timeAnalysis.activityDistribution.byMonth)},
                    backgroundColor: '#00b0ff',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribution des activités par mois'
                    }
                }
            }
        });
        
        // Graphique des activités semaine vs weekend
        new Chart(document.getElementById('weekendChart'), {
            type: 'pie',
            data: {
                labels: ['Semaine', 'Weekend'],
                datasets: [{
                    data: [${data.timeAnalysis.weekdayVsWeekend.weekday}, ${data.timeAnalysis.weekdayVsWeekend.weekend}],
                    backgroundColor: ['#536dfe', '#ff4081']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Répartition des activités Semaine/Weekend'
                    }
                }
            }
        });
        ` : ''}
    </script>

    <footer>
        <p>Analyse réalisée par Solana DeFi Analyzer • ${new Date().getFullYear()}</p>
    </footer>
</body>
</html>`;
}

// Récupérer l'adresse du portefeuille depuis les arguments de ligne de commande
const args = process.argv.slice(2);
const walletAddress = args[0] || process.env.ADDRESS_WALLET;

// Exécuter la génération de visualisation avec l'adresse du portefeuille si disponible
generateVisualization(walletAddress);