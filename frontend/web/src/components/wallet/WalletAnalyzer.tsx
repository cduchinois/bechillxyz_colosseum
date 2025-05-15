'use client';
import React, { useState, useEffect } from 'react';
import { InferenceClient } from "@huggingface/inference";

// Get API key from Next.js environment variables
const API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '';

const WalletAnalyzer = () => {
  const [walletData, setWalletData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('FuRS2oiXnGvwabV7JYjBU1VQCa6aida7LDybt91xy1YH');
  interface AnalysisType {
    totalValue: number;
    tokenCount: number;
    suspiciousTokensCount: number;
    legitTokensCount: number;
    nftCount: number;
    suspiciousNftsCount: number;
    tokens: any[];
    suspiciousTokens: any[];
    suspiciousNfts: any[];
  }
  const [analysis, setAnalysis] = useState<AnalysisType | null>(null);
  const [apiKey, setApiKey] = useState(API_KEY);
  const [aiRecommendations, setAiRecommendations] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to set mock data
  const setMockData = () => {
    const mockData = [
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
      },
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
              attributes: { tags: ['compressed'] },
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
            // ... other NFTs (omitted for brevity)
          ]
        }
      }
    ];
    
    setWalletData(mockData);
    analyzeWallet(mockData);
  };

  // Function to create prompt for the Hugging Face API
  const createPrompt = () => {
    if (!analysis) return '';
    
    // Create a portfolio object similar to your example
    const portfolioData = {
      wallet: walletAddress,
      totalValueUSD: analysis.totalValue,
      tokens: analysis.tokens.map(token => ({
        name: token.ref || "Unknown Token",
        symbol: token.data.address.slice(0, 5),
        amount: token.data.amount,
        valueUSD: token.value,
        percentOfPortfolio: (token.value / analysis.totalValue) * 100
      }))
    };

    // Add information about suspicious NFTs
    const suspiciousNftsInfo = analysis.suspiciousNfts.length > 0 
      ? `\nWARNING: This wallet also contains ${analysis.suspiciousNftsCount} suspicious NFTs that appear to be phishing attempts.` 
      : '';

    return `
      You are a specialized crypto portfolio analyst. Given this detailed portfolio information:
      ${JSON.stringify(portfolioData, null, 2)}
      ${suspiciousNftsInfo}
      
      Provide 5 specific and personalized recommendations to improve portfolio security and risk management.
      Focus on actionable advice that directly addresses the issues in this specific portfolio.
      
      IMPORTANT:
      1. Each recommendation must be specific to THIS portfolio, not generic advice
      2. Include specific percentages and values when relevant
      3. Mention specific assets in the portfolio by name if they look suspicious
      4. Suggest specific actions like "Move assets to a new wallet" or "Be careful with 'pump' tokens"
      5. Format as a clean bullet list with each point starting with *
      
      Example of good recommendations:
      * Your Sahur token represents 97% of your portfolio. Reduce this position to less than 30% to minimize risk
      * Your portfolio lacks stablecoins - consider allocating 10-20% to USDC or USDT for stability
      * Add 1-2 large-cap tokens like BTC or ETH to balance your exposure to smaller tokens
    `;
  };

  // Function to get AI recommendations via Hugging Face
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoading(true);
      let output = "";
      const prompt = createPrompt();
      
      if (!prompt) {
        setError('Analysis data is not available');
        setIsLoading(false);
        return;
      }
      
      try {
      // Initialize the client with your API key
      const client = new InferenceClient(apiKey);
      // Add the provider
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
        max_tokens: 500,
        top_p: 0.7,
      });

      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices.length > 0) {
          const newContent = chunk.choices[0].delta.content;
          output += newContent;
          setAiRecommendations(prev => prev + newContent);
        }
      }
    } catch (err: unknown) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while calling the API');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to analyze wallet data
  const analyzeWallet = (data: any[]) => {
    if (!data) return;
    
    // Find token data
    const tokensData = data.find(item => 
      item.type === 'multiple' && 
      item.platformId === 'wallet-tokens'
    );
    
    // Find NFT data
    const nftsData = data.find(item => 
      item.type === 'multiple' && 
      item.platformId === 'wallet-nfts'
    );
    
    // Check if data exists
    if (!tokensData) {
      setAnalysis({
          totalValue: 0,
          tokenCount: 0,
          suspiciousTokensCount: 0,
          legitTokensCount: 0,
          nftCount: nftsData?.data?.assets?.length || 0,
          suspiciousNftsCount: 0,
          tokens: [],
          suspiciousTokens: [],
          suspiciousNfts: []
        });
      return;
    }
    
    // Extract tokens
    const tokens = tokensData.data.assets;
    
    // Calculate total value
    const totalValue = tokensData.value || 0;
    
    // Analyze each token to detect suspicious tokens (based on simple heuristics)
    const suspiciousTokens = tokens.filter((token: any) => {
      const address = token.data.address.toLowerCase();
      // Check if the address contains suspicious keywords
      return address.includes('pump');
    });
    
    // Analyze NFTs to detect suspicious ones
    const suspiciousNfts = nftsData?.data?.assets?.filter((nft: any) => {
      // Check if the name or attributes contain suspicious keywords
      const name = nft.name.toLowerCase();
      const hasTimeLeft = nft.data.attributes?.some((attr: { trait_type?: string; value: string }) => 
        attr.trait_type?.toLowerCase().includes('time') && 
        attr.trait_type?.toLowerCase().includes('left')
      );
      const hasAmount = nft.data.attributes?.some((attr: { trait_type?: string; value: string }) => 
        attr.trait_type?.toLowerCase().includes('amount')
      );
      const isAirdrop = name.includes('airdrop') || name.includes('drop');
      
      // If the NFT has attributes like "TIME LEFT" or references an airdrop/drop
      return hasTimeLeft || isAirdrop || hasAmount;
    }) || [];
    
    setAnalysis({
      totalValue,
      tokenCount: tokens.length,
      suspiciousTokensCount: suspiciousTokens.length,
      legitTokensCount: tokens.length - suspiciousTokens.length,
      nftCount: nftsData?.data?.assets?.length || 0,
      suspiciousNftsCount: suspiciousNfts.length,
      tokens,
      suspiciousTokens,
      suspiciousNfts
    });
  };

  // Load data on startup
  useEffect(() => {
    setMockData();
  }, []);

  return (
    <div className="p-4 max-w-6xl mb-24 !font-poppins font-poppins">
      <h1 className="mx-auto text-2xl font-bold mb-4 text-center !font-poppins">Solana Wallet Analysis with AI</h1>
      
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

      <div className="flex items-center space-x-2 mb-4">
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          className="flex-grow p-2 border rounded !font-poppins"
          placeholder="Solana wallet address"
        />
        <button
          onClick={setMockData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Analyze'}
        </button>
      </div>

      {analysis && (
        <div className="space-y-6 !font-poppins">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Portfolio Overview</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Total value:</span> ${analysis.totalValue.toFixed(2)} USD</p>
                <p><span className="font-medium">Number of tokens:</span> {analysis.tokenCount}</p>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full mr-2"></div>
                  <p>Legitimate tokens: {analysis.legitTokensCount}</p>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-500 rounded-full mr-2"></div>
                  <p>Suspicious tokens: {analysis.suspiciousTokensCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">NFTs</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Total NFTs:</span> {analysis.nftCount}</p>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-red-500 rounded-full mr-2"></div>
                  <p>Suspicious NFTs (potential scams): {analysis.suspiciousNftsCount}</p>
                </div>
                <p className="text-sm italic">Suspicious NFTs typically include airdrops and NFTs with time limits ("TIME LEFT").</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-2">Token Details</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left">Address</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-right">Amount</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-right">Value (USD)</th>
                      <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.tokens.map((token, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="py-2 px-4 border-b border-gray-200">
                          <div className="flex items-center">
                            <span className="font-mono text-xs">{token.data.address.slice(0, 10)}...{token.data.address.slice(-4)}</span>
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b border-gray-200 text-right">{token.data.amount.toLocaleString()}</td>
                        <td className="py-2 px-4 border-b border-gray-200 text-right">${token.value.toFixed(4)}</td>
                        <td className="py-2 px-4 border-b border-gray-200 text-center">
                          {analysis.suspiciousTokens.includes(token) ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Suspicious
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Legitimate
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {analysis.suspiciousNfts.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Suspicious NFTs (Potential Scams)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.suspiciousNfts.slice(0, 6).map((nft, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">{nft.name}</h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Suspicious
                        </span>
                      </div>
                      {nft.imageUri && (
                        <div className="mt-2 h-32 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                          <img src="/api/placeholder/300/200" alt="NFT" className="object-cover w-full h-full" />
                        </div>
                      )}
                      <div className="mt-2 text-sm">
                        <p className="text-xs font-mono text-gray-500">{nft.data.address.slice(0, 8)}...{nft.data.address.slice(-4)}</p>
                        <div className="mt-1">
                          {nft.data.attributes?.slice(0, 3).map((attr: { trait_type?: string; value: string }, idx: number) => (
                            <div key={idx} className="text-xs flex justify-between">
                              <span className="text-gray-500">{attr.trait_type}:</span>
                              <span className="font-medium">{attr.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {analysis.suspiciousNfts.length > 6 && (
                  <p className="text-center mt-2 text-sm text-gray-500">
                    + {analysis.suspiciousNfts.length - 6} more suspicious NFTs
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Security Analysis</h2>
            <div className="space-y-2">
              <p className="font-medium">Alerts:</p>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.suspiciousTokensCount > 0 && (
                  <li className="text-red-600">
                    Your wallet contains {analysis.suspiciousTokensCount} suspicious tokens that could be scams.
                  </li>
                )}
                {analysis.suspiciousNftsCount > 0 && (
                  <li className="text-red-600">
                    Your wallet contains {analysis.suspiciousNftsCount} suspicious NFTs that are likely phishing attempts.
                  </li>
                )}
                {analysis.suspiciousNftsCount > 5 && (
                  <li className="text-red-600 font-bold">
                    HIGH ALERT: Large number of phishing NFTs detected. Extreme caution advised.
                  </li>
                )}
              </ul>
              
              <p className="font-medium mt-4">Recommendations:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>NEVER visit the websites mentioned in suspicious NFTs.</li>
                <li>NEVER sign transactions from these websites.</li>
                <li>Consider using a separate wallet for your valuable assets.</li>
                <li>Regularly check your wallet for unsolicited tokens.</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center mb-4 mt-8">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !apiKey}
              className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-gray-300 !font-poppins"
            >
              {isLoading ? 'Analysis in progress...' : 'Get AI Recommendations'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {aiRecommendations && (
            <div className="mt-4 !font-poppins">
              <h2 className="text-base font-medium mb-2 !font-poppins">AI Recommendations:</h2>
              <div className="p-4 bg-gray-100 rounded whitespace-pre-wrap !font-poppins">
                {aiRecommendations}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletAnalyzer;