'use client';
import React, { useState } from 'react';
import { InferenceClient } from "@huggingface/inference";

// Récupérer la clé API depuis les variables d'environnement de Next.js
const API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '';

const RawSonarWatchAnalyzer = () => {
  const [apiKey, setApiKey] = useState(API_KEY);
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Exemple de logs SonarWatch bruts
  const [rawLogs, setRawLogs] = useState(`> nx run plugins:run-fetcher wallet-tokens-solana FuRS2oiXnGvwabV7JYjBU1VQCa6aida7LDybt91xy1YH

Fetching...
[
  {
    type: 'multiple',
    networkId: 'solana',
    platformId: 'wallet-nfts',
    label: 'Wallet',
    value: null,
    data: {
      assets: [
        {
          type: 'collectible',
          attributes: { tags: [ 'compressed' ] },
          name: '100 SOL JUPDAO.COM',
          data: {
            address: 'E7AGj1MkBf496fEJqyw6f7QVPUSAcYai1xLD1hoi73z4',
            amount: 1,
            price: null,
            name: '100 SOL JUPDAO.COM',
            dataUri: 'https://bafybeiew5sdgvaeqgoulakjonr5gam5x4tmy5whyjpsdupsdsx5f4nsfha.ipfs.nftstorage.link/daojup.json',
            attributes: [
              { value: '100 SOL', trait_type: 'Amount' },
              { value: '1 Hour', trait_type: 'TIME LEFT' },
              { value: 'http://JUPDAO.COM', trait_type: 'WEBSITE' }
            ],
            collection: {
              floorPrice: null,
              id: '39JFYKdYfJmFfCpYjUkkvh8zbWvSvDQy9J71nGFnfZey',
              name: '100 SOL JUPDAO.COM'
            }
          },
          networkId: 'solana',
          imageUri: 'https://bafybeiewqmozddfe6s3ul3tbsllrqdsbmsuxml74uo5b7svjs722jiefly.ipfs.nftstorage.link/jupdao.gift',
          value: null
        },
        /* Beaucoup d'autres NFTs omis pour brièveté */
      ]
    }
  },
  {
    type: 'multiple',
    networkId: 'solana',
    platformId: 'wallet-tokens',
    label: 'Wallet',
    value: 14.967755327925707,
    data: {
      assets: [
        {
          type: 'token',
          networkId: 'solana',
          value: 14.752709440777062,
          data: {
            address: '3thcjdnbBsiLWKvQ2a5X5R5vA3TqGQiXCb6PHDTEpump',
            amount: 1000000,
            price: 0.000014752709440777062,
            yield: undefined
          },
          attributes: {},
          link: undefined,
          ref: 'AV6Qoo6RPMmgYR8uoPPafaWirWH7NgF3xYdVzoHRHRGZ',
          sourceRefs: undefined
        },
        {
          type: 'token',
          networkId: 'solana',
          value: 0.20890068936806233,
          data: {
            address: 'BQvp4dQwVPAMeWFRYzMccaiQjBrz5FNSJ1shp2nipump',
            amount: 28091.211521,
            price: 0.000007436514057497859,
            yield: undefined
          },
          attributes: {},
          link: undefined,
          ref: '2dpneteBcmaApja8nR896oDn494T1s3yyaaHj2RzwrhM',
          sourceRefs: undefined
        },
        {
          type: 'token',
          networkId: 'solana',
          value: 0.0061451977805815385,
          data: {
            address: '93oQmcKUwVXeNL5tpvbu6YnSmMLkAU3En1MFJqqYpump',
            amount: 1000,
            price: 0.000006145197780581538,
            yield: undefined
          },
          attributes: {},
          link: undefined,
          ref: '6G7fh5PtGJUtK3V6mYYHevUeefxjv51F1ghxHXtZeA4F',
          sourceRefs: undefined
        }
      ]
    }
  }
]
Finished in: 1.98ss`);

  const handleUpdateLogs = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRawLogs(e.target.value);
  };

  const createPrompt = () => {
    return `
      As a friendly crypto security expert, analyze these Solana wallet logs and provide a brief assessment:
      
      \`\`\`
      ${rawLogs}
      \`\`\`
      
      FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:
  
      ## Wallet Overview
      [Single sentence about total value and token count]
  
      ## Token Analysis
      [Single sentence about token legitimacy, specifically addressing if "pump" tokens are suspicious]
  
      ## NFT Security Alert
      [Single sentence identifying suspicious NFTs with TIME LEFT attributes or external website links]
  
      ## Protection Tips
      • [First tip]
      • [Second tip]
      • [Third tip]
  
      STRICT REQUIREMENTS:
      - Total response must be under 100 words
      - Use warm, direct language
      - Be specific about risks without being verbose
      - Do not explain your thinking process
      - Do not refer to "sections" or your formatting
      - No introductory or closing text - stick to the template exactly
    `;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResponse('');

    try {
      const client = new InferenceClient(apiKey);
      const prompt = createPrompt();
      
      let output = "";
      /*
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
      */
      const stream = client.chatCompletionStream({
        model: "deepseek-ai/DeepSeek-Prover-V2-671B",
        messages: [
            {
                role: "user",
                content: prompt
            },
            
        ],
        provider: "novita",
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
    } catch (err: unknown) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'appel à l\'API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-6xl mb-24 !font-poppins font-poppins">
      <h1 className="mx-auto text-2xl font-bold mb-4 text-center !font-poppins">SonarWatch Raw Logs Analyzer</h1>
      
      <div className="mb-4 !font-poppins">
        <label className="block text-sm font-medium mb-2 !font-poppins">Hugging Face API Key</label>
        <input
          type="password"
          className="w-full p-2 border rounded"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your Hugging Face API key"
        />
      </div>

      <div className="mb-4 !font-poppins">
        <label className="block text-sm font-medium mb-2 !font-poppins">SonarWatch Raw Logs</label>
        <textarea
          className="w-full p-2 border rounded font-mono text-sm"
          rows={15}
          onChange={handleUpdateLogs}
          value={rawLogs}
        />
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">Wallet Safety Scanner</h2>
        <p className="mb-2">
          We'll help you to identify legitimate tokens vs meme coins and alert you to potential phishing NFTs in your wallet.
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !apiKey}
          className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-gray-300"
        >
          {isLoading ? 'Scanning...' : 'Analyze My Wallet'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-4 !font-poppins">
          <h2 className="text-xl font-medium mb-2 !font-poppins">Wallet Security Assessment:</h2>
          <div className="p-4 bg-gray-100 rounded whitespace-pre-wrap !font-poppins">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};

export default RawSonarWatchAnalyzer;