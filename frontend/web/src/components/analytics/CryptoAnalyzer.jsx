'use client';
import React, { useState } from 'react';
import { InferenceClient } from "@huggingface/inference";

// Récupérer la clé API depuis les variables d'environnement de Next.js
const API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '';

const CryptoAnalyzer = () => {
  const [apiKey, setApiKey] = useState(API_KEY);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Exemple de portefeuille crypto avec 3 SOL et 2 meme coins
  const [portfolioData, setPortfolioData] = useState({
    "wallet": "Fc2UPMkgckcBSyKLpCHj3sMYsywjHsVwMZ74JczZP7cA",
    "totalValueUSD": 2380.45,
    "tokens": [
      {
        "name": "Solana",
        "symbol": "SOL",
        "amount": 12.5,
        "valueUSD": 1875.00,
        "percentOfPortfolio": 78.77
      },
      {
        "name": "Bonk",
        "symbol": "BONK",
        "amount": 5000000,
        "valueUSD": 250.00,
        "percentOfPortfolio": 10.5
      },
      {
        "name": "JitoSol",
        "symbol": "JitoSOL",
        "amount": 2.1,
        "valueUSD": 315.00,
        "percentOfPortfolio": 13.23
      },
      {
        "name": "DogWifHat",
        "symbol": "WIF",
        "amount": 420,
        "valueUSD": 168.00,
        "percentOfPortfolio": 7.06
      },
      {
        "name": "Marinade Staked SOL",
        "symbol": "mSOL",
        "amount": 0.5,
        "valueUSD": 75.00,
        "percentOfPortfolio": 3.15
      }
    ]
  });
  
  const handleUpdatePortfolio = (e) => {
    try {
      const updatedPortfolio = JSON.parse(e.target.value);
      setPortfolioData(updatedPortfolio);
    } catch (err) {
      // Si le JSON n'est pas valide, ne mettez pas à jour l'état
      console.error("JSON invalide:", err);
    }
  };

  const createPrompt = () => {
    return `
      You are a specialized crypto portfolio analyst. Given this detailed portfolio information:
      ${JSON.stringify(portfolioData, null, 2)}
      
      Provide 5 specific and personalized recommendations to improve portfolio diversification and risk management.
      Focus on actionable advice that directly addresses the issues in this specific portfolio.
      
      IMPORTANT:
      1. Each recommendation must be specific to THIS portfolio, not generic advice
      2. Include specific percentages and values when relevant
      3. Mention specific assets in the portfolio by name
      4. Suggest specific actions like "Reduce X by Y%" or "Consider adding Z"
      5. Format as a clean bullet list with each point starting with *
      
      Example of good recommendations:
      * Your Sahur token represents 97% of your portfolio. Reduce this position to less than 30% to minimize risk
      * Your portfolio lacks stablecoins - consider allocating 10-20% to USDC or USDT for stability
      * Add 1-2 large-cap tokens like BTC or ETH to balance your exposure to smaller tokens
    `;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const client = new InferenceClient(apiKey);
      const prompt = createPrompt();
      
      let output = "";
      // Ajouter le provider
      const stream = client.chatCompletionStream({
        model: "Qwen/Qwen3-235B-A22B",
        provider: "novita", // Spécifier le provider approprié
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 500,
        top_p: 0.7,
      });

      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const newContent = chunk.choices[0].delta.content;
          output += newContent;
          setResponse(prev => prev + newContent);
        }
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'appel à l\'API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mb-24 !font-poppins font-poppins">
      <h1 className="mx-auto text-2xl font-bold mb-4 text-center !font-poppins">Analyse de Portefeuille Crypto avec IA</h1>
      
      <div className="mb-4 !font-poppins">
        <label className="block text-sm font-medium mb-2 !font-poppins">Clé API Hugging Face</label>
        <input
          type="password"
          className="w-full p-2 border rounded"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Entrez votre clé API Hugging Face"
        />
      </div>

      <div className="mb-4 !font-poppins">
        <label className="block text-sm font-medium mb-2 !font-poppins">Données du Portefeuille (format JSON)</label>
        <textarea
          className="w-full p-2 border rounded font-mono text-sm"
          rows="15"
          onChange={handleUpdatePortfolio}
          defaultValue={JSON.stringify(portfolioData, null, 2)}
        />
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !apiKey}
          className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-gray-300"
        >
          {isLoading ? 'Analyse en cours...' : 'Analyser le portefeuille'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-4 !font-poppins">
          <h2 className="text-base font-medium mb-2 !font-poppins">Recommandations:</h2>
          <div className="p-4 bg-gray-100 rounded whitespace-pre-wrap !font-poppins">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoAnalyzer;