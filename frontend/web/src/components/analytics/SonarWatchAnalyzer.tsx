'use client';
import React, { useState } from 'react';
import { InferenceClient } from "@huggingface/inference";

// Récupérer la clé API depuis les variables d'environnement de Next.js
const API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '';

const SonarWatchAnalyzer = () => {
  const [apiKey, setApiKey] = useState(API_KEY);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Données du portefeuille SonarWatch
  const [portfolioData, setPortfolioData] = useState({
    "wallet": "FuRS2oiXnGvwabV7JYjBU1VQCa6aida7LDybt91xy1YH",
    "totalValueUSD": 14.967755327925707,
    "tokens": [
      {
        "name": "Unknown Token (AV6Qoo6RPMmgYR8uoPPafaWirWH7NgF3xYdVzoHRHRGZ)",
        "symbol": "PUMP",
        "amount": 1000000,
        "valueUSD": 14.752709440777062,
        "percentOfPortfolio": 98.56,
        "address": "3thcjdnbBsiLWKvQ2a5X5R5vA3TqGQiXCb6PHDTEpump"
      },
      {
        "name": "Unknown Token (2dpneteBcmaApja8nR896oDn494T1s3yyaaHj2RzwrhM)",
        "symbol": "PUMP",
        "amount": 28091.211521,
        "valueUSD": 0.20890068936806233,
        "percentOfPortfolio": 1.40,
        "address": "BQvp4dQwVPAMeWFRYzMccaiQjBrz5FNSJ1shp2nipump"
      },
      {
        "name": "Unknown Token (6G7fh5PtGJUtK3V6mYYHevUeefxjv51F1ghxHXtZeA4F)",
        "symbol": "PUMP",
        "amount": 1000,
        "valueUSD": 0.0061451977805815385,
        "percentOfPortfolio": 0.04,
        "address": "93oQmcKUwVXeNL5tpvbu6YnSmMLkAU3En1MFJqqYpump"
      }
    ],
    "suspiciousNFTs": [
      {
        "name": "100 SOL JUPDAO.COM",
        "type": "Airdrop/Phishing",
        "riskLevel": "High"
      },
      {
        "name": "1000$ BOME Drop BOMEDROP.com",
        "type": "Airdrop/Phishing",
        "riskLevel": "High"
      },
      {
        "name": "$PASS BOX #1",
        "type": "Airdrop/Phishing",
        "riskLevel": "Medium"
      },
      {
        "name": "9433$SLERF Drop",
        "type": "Airdrop/Phishing",
        "riskLevel": "High"
      },
      {
        "name": "$SLERF Airdrop",
        "type": "Airdrop/Phishing",
        "riskLevel": "High"
      },
      {
        "name": "3000$ WIF Drop 3000WIF.com",
        "type": "Airdrop/Phishing",
        "riskLevel": "High"
      },
      {
        "name": "4000$ W Drop 4000W.io",
        "type": "Airdrop/Phishing",
        "riskLevel": "High"
      },
      {
        "name": "4000Jup For You 4000Jup.com",
        "type": "Airdrop/Phishing",
        "riskLevel": "High"
      },
      {
        "name": "3000$W Token Ticket",
        "type": "Airdrop/Phishing",
        "riskLevel": "High"
      },
      {
        "name": "A WOLFS #2235",
        "type": "Airdrop/Phishing",
        "riskLevel": "Medium"
      },
      {
        "name": "Slеrf #2252",
        "type": "Airdrop/Phishing",
        "riskLevel": "Medium"
      }
    ]
  });
  
  const handleUpdatePortfolio = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      You are a specialized crypto portfolio analyst with expertise in detecting scams and suspicious tokens on Solana. Given this detailed wallet information:
      ${JSON.stringify(portfolioData, null, 2)}
      
      Provide a complete analysis with:
      1. Identification of legitimate tokens vs meme coins or potential scam tokens
      2. Risk assessment of the suspicious NFTs in the wallet
      3. 5 specific and personalized recommendations to improve portfolio security and risk management
      
      IMPORTANT:
      - Focus particularly on whether tokens containing "pump" in their address are legitimate or suspicious
      - Analyze if all tokens in the wallet appear to be meme coins or if there are any legitimate tokens
      - Assess the high number of suspicious NFTs that appear to be phishing attempts
      - Include specific percentages and values when relevant
      - Format recommendations as a clean bullet list with each point starting with *
      
      Structure your response with these sections:
      - Wallet Security Summary
      - Token Analysis (legitimate vs meme/scam)
      - NFT Risk Assessment 
      - Recommendations
    `;
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
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
        provider: "novita", 
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 800,
        top_p: 0.7,
      });

      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const newContent = chunk.choices[0].delta.content;
          output += newContent;
          setResponse(prev => prev + newContent);
        }
      }
    } catch (err: any) {
      console.error('Erreur:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'appel à l\'API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mb-24 !font-poppins font-poppins">
      <h1 className="mx-auto text-2xl font-bold mb-4 text-center !font-poppins">Analyse SonarWatch de Portefeuille Solana</h1>
      
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
        <label className="block text-sm font-medium mb-2 !font-poppins">Données SonarWatch (format JSON)</label>
        <textarea
          className="w-full p-2 border rounded font-mono text-sm"
          rows={15}
          onChange={handleUpdatePortfolio}
          defaultValue={JSON.stringify(portfolioData, null, 2)}
        />
      </div>

      <div className="bg-red-50 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Alerte de Sécurité</h2>
        <p className="mb-2">Votre portefeuille contient:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li className="text-red-600">
            <strong>3 tokens</strong> dont les adresses contiennent le mot "pump" (potentiellement suspects)
          </li>
          <li className="text-red-600">
            <strong>11 NFTs suspects</strong> qui semblent être des tentatives de phishing
          </li>
        </ul>
        <p className="mt-2 text-red-800 font-semibold">
          Nous vous recommandons de faire analyser votre portefeuille par l'IA pour obtenir des conseils détaillés.
        </p>
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
          <h2 className="text-xl font-medium mb-2 !font-poppins">Analyse de Sécurité:</h2>
          <div className="p-4 bg-gray-100 rounded whitespace-pre-wrap !font-poppins">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default SonarWatchAnalyzer;