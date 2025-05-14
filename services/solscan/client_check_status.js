// Code client pour vérifier le statut de l'analyse
function checkAnalysisStatus() {
  fetch(`/check_analysis_status/${walletAddress}`)
    .then(response => response.json())
    .then(data => {
      const progressText = document.querySelector('.progress-text');
      
      // Log pour déboguer le statut reçu
      console.log(`Statut reçu: ${data.status}`, data);
      
      if (data.status === 'completed' || data.filesReady === true) {
        // L'analyse est terminée avec succès ou les fichiers sont prêts
        clearInterval(checkInterval);
        
        // Mettre à jour le texte de progression
        progressText.textContent = 'Analyse complète terminée avec succès !';
        
        // Afficher la notification
        document.getElementById('notification').style.display = 'block';
        
        // Activer le lien vers les résultats
        document.getElementById('view-results').style.opacity = '1';
        
        // Masquer le spinner
        document.querySelector('.loader').style.display = 'none';
        
        // Jouer un son de notification
        try {
          const audio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhY//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAKRAAAAAAAAAbCGGDKwAAAAAAAAAAAAAAAAAAAAAP/jOMAAAAIAAABEAyAAAP/PJUDiXf7sGAAAZJidTGGJ5OJ9/g7I/0A30339g2Ocl37NC6yX8c5YevqQAIACf/zApf1x1hL0b/Md/Lu/9dP/KP8i/5d/9GMx/uDf1DFn/935x37oPJhf/7jFBPy8f+sP+yv////8f//0uv//yIX/8h5//5XEAUQBP/1hS/rjrCXo3+Y//rcXy38o/yL/l3/0YzH+4N/UOCIX/+4xQT8vH/rD/sr////x///S6///Ihf/yGQyGQzCSJQlf/+MYxAUMKyZ8AZmQAPSqmS+czO6maIi7MzREdmQyi+YyGMjrMzBmdLMhCBMZDIZmZjTMYQgTGRhi+dPO655sgoRERHMzM6IiI/MzMzMzRERMZdEREREQiIiOZmZmZmYRAACGYiIZoCGiIhERE//4xjEEwvjFmQBmSADc55i8Ew0TIQZERERMzOiZmZoinMRMzMzM6IuiIiIiJEdDKIiO+ZmZkMoiHEREREwII6GREQwMH1///Mzoz8zMzMzMzOiPzMzM/MzMzMzM6ZmZmZmZmaZmaYiIAEMAAAH//jGMQZC9sd6AMSQAc9qYg2JOT6J76d/btOu/qpa0nZ7d+2//Xfn++jSQbVs78AAAAAAAQGEP8+78+JE/yIiP/iQiIiIiESePEid//xIeJERmR4iIiIiJCJDxMjIzMkPERERERESMzMzJAAAEIAg//jGMQlDsABoAMGMAYOvWEho+N//afO///1+5RQXebIcCwD//59qHFQQQAH/////kOR///5CHcGRDkIEQpm7//////9ynV2UU6n/////oUCtLiAAAcIBQ0RM/2WJRMnEzPmZkaZmZmaIiPmiImaJIZo//MzR//jGMQUC7ADIgHhOAMzNJSJ9iO7f/cIh+2RaAFQ///buRFMBiCH////4fh+H/h+IBCRTeIfnjf/4E8cPwgQBBN/BP///0P//o3egIglEOj//////Q58QTwxGFQAAgCANNEoocA00aSNNFGkkUaaRtGmmkU0U//jGMQ8D0gCBQMrPiEaaKSRFJJG0Ya0jtGkkjTRTr1GmlkdpJJG2kjTWNNGSHf////JJJJ/5gICB3//5JJEAQCAIDyCAAIJP////9naREkk7v//9SJJIogAAUAoIxdyshfcLbe1L1BLV67Pb2+3e3Rtb/0N7//jGMQ2DkAB6BcpNie3e1W3W+3Nvty17q1urd7e/bXb7d7d7W17a9va2vbOqqqqqqAAIB6kUVVVV9b0NTU1NTX9vt7e3t7a2tra3/t7e3t7a2t0NTNvb29va2pqampqa363v0NTU1NTU0NTU1NQDAIAH//jGMQ9CsAASAHhGAPm5ubm5vb380NDQ0NNTU1M3/TU1NTU1NQYAAgAAAAAAAABrEDTIyO7u7oi7oiEXdzMzMzmbuoiIu7uyf/mYzO7u7oiIiIiM7ui7u6Ii6K7oiN3RGZmZmbohXd3MzMRHd0Yq//jGMR4EHMeNAHAGAGZkR3REREQrMzO7ou7rd3RDMzNERERERCszM7ui7uoiIiL/+ZmZ/+iIiIiMzM7u//mZmZvmZmZmZjMzMzMzMzM3//M3zMzMzMzMzO7u7u7IiIiI///u7oiIzMzMzu7u7u4A//jGMREDXgqVAMGGAIiIiIiIiImZmYj//MzMmZmZiIjM//zMzpmZjLpmZEREf////MzMzO7u7u7u7kREREREQkIhESESIiIiIiIiIi7u7u7u7iIiIiIiIiLu7u7u7i7u7u7u7u7u7u7u7u4AAAEg//jGMRADpAKRCGDGAOCCoqEJ8CioBBUKhoODgoKii4KCi4OdnZ2QkJCXl5eUlJSSkoODg4KF0NDQzpCSklJ3d3dikpKSnZ2SkpKSkpeXl5KDg4OCgoOF25CQk52Sg4KDhc6QkJKSkpKSAAABIAAA//jGMQ0C/AKAAGIGAEAgEAQ2EBQYGCAgKAgQEBAQEBAQEBAQEBAQEBAQECAQCAgICAoSEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAA//jGMRGCfg6EAGHEABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQUAABAgQKEDBwoULFixYoWLGDhw4cOHDixYsWLFixQsYOGDBQoUKGDBgoUKFCxIsQIABAAAA//jGMRfDkAB6AHHGAAAAAAAAlL9ahUSEpEhIlJCQlpkJCWmQkJCQlJSUlJSUoSEhKSkiRIVqFSRISkSEiUkJCWmQkJaZCQkJCUlJSUlJShISEpKSJEhWoVJEhKRISJSQkJaZCQlpkJCQkJAAAQAA//jGMRLDIAiEgMGMAEpKUlJShISE1KSkpKSkhISEtMhISEhLS0tLS0uQkJCampKSJEmpiQkJiYmJqalJSUmpqUlJqYmJiYmJiampSUlJSQmJidnZ2ZCQkJeXl5eXlpaXl5eXlpaWl5eWAAHIAQA=');
          audio.play();
        } catch (e) {
          console.log('Son de notification non supporté');
        }
        
        // Redirection automatique vers la visualisation HTML après 2 secondes
        const visualizationUrl = `/output/visualizations/wallet_report_${walletAddress}.html`;
        
        // Afficher un message de redirection
        progressText.textContent = 'Redirection vers le rapport dans 2 secondes...';
        
        // Rediriger après un délai pour laisser le temps de voir la notification
        completionTimeout = setTimeout(() => {
          window.location.href = visualizationUrl;
        }, 2000);
        
      } else if (data.status === 'failed') {
        // L'analyse a échoué
        clearInterval(checkInterval);
        progressText.textContent = 'L'analyse a échoué.';
        
        // Afficher la notification d'erreur
        document.getElementById('error-details').textContent = data.error || 'Veuillez réessayer ou contacter l'administrateur.';
        document.getElementById('notification-error').style.display = 'block';
        
        // Masquer le spinner
        document.querySelector('.loader').style.display = 'none';
        
      } else if (data.status === 'running') {
        // L'analyse est toujours en cours
        progressText.textContent = 'Traitement des données en cours... Veuillez patienter.';
      } else {
        // Statut inconnu
        progressText.textContent = 'Vérification du statut...';
        console.log('Statut inconnu reçu:', data.status);
      }
    })
    .catch(error => {
      console.error('Erreur lors de la vérification du statut:', error);
    });
}
