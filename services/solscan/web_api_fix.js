// Endpoint pour vérifier le statut de l'analyse d'un portefeuille
app.get('/check_analysis_status/:address', (req, res) => {
  const walletAddress = req.params.address;
  
  // Vérifier d'abord si les fichiers de résultat existent
  const vizFilePath = path.resolve(__dirname, 'output', 'visualizations', `wallet_report_${walletAddress}.html`);
  const reportFilePath = path.resolve(__dirname, 'output', `wallet_report_${walletAddress}.json`);
  
  const vizExists = fs.existsSync(vizFilePath);
  const reportExists = fs.existsSync(reportFilePath);
  const filesExist = vizExists || reportExists;
  
  // Vérifier si l'analyse est en cours d'exécution
  const job = app.locals.analysisJobs && app.locals.analysisJobs[walletAddress];
  
  // Si les fichiers existent, considérer l'analyse comme terminée quel que soit le statut
  if (filesExist) {
    if (job && job.status === 'running') {
      // Mettre à jour le statut dans l'objet global
      job.status = 'completed';
      job.completedAt = new Date();
      console.log(`Analyse considérée comme terminée pour ${walletAddress} car les fichiers existent`);
    }
    
    res.json({
      status: 'completed',
      filesReady: true,
      resultUrl: `/output/${walletAddress}`
    });
    return;
  }
  
  // Si l'analyse est en cours mais les fichiers n'existent pas encore
  if (job) {
    res.json({ 
      status: job.status,
      filesReady: false
    });
    return;
  }
  
  // Aucune analyse en cours et aucun fichier trouvé
  res.json({ status: 'not_found', filesReady: false });
});
