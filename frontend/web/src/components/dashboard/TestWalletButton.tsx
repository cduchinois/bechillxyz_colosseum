"use client";
import React, { useState } from "react";
import { testWalletAddress } from "@/services/heliusService";
import { formatWalletAddress } from "@/utils/walletAddressUtils";
import { getTokenNameFromMint } from "@/lib/tokenMap";

interface TestWalletButtonProps {
  walletAddress?: string;
}

const TestWalletButton: React.FC<TestWalletButtonProps> = ({ walletAddress }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const DEFAULT_TEST_ADDRESS = "6QU5GxYgQbCi87FHwJfk8BuSLZM4SxEvpdswrFXx5pSe";
  const testAddress = walletAddress || DEFAULT_TEST_ADDRESS;

  const handleTest = async () => {
    setIsLoading(true);
    setShowResults(true);
    try {
      const result = await testWalletAddress(testAddress);
      setTestResult(result);
    } catch (error) {
      console.error("Erreur test:", error);
      setTestResult({
        success: true,
        solBalance: 0,
        formattedAssets: [],
        message: "Erreur API - données fictives",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleTest}
        className="bg-yellow-300 hover:bg-yellow-400 text-purple-800 font-bold py-2 px-4 rounded flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? "Chargement..." : `Tester ${formatWalletAddress(testAddress)}`}
      </button>

      {showResults && (
        <div className="mt-4 p-4 rounded-md border border-gray-200 bg-white">
          <h3 className="text-lg font-bold mb-2">Résultats du test</h3>
          <p className="text-green-600 font-medium">✅ Test terminé</p>
          <p>Solde SOL: {testResult?.solBalance || 0} SOL</p>
          {testResult?.message && (
            <p className="text-orange-500">{testResult.message}</p>
          )}
          <div className="bg-gray-100 p-2 rounded text-xs overflow-auto">
            <pre>
              {JSON.stringify(
                testResult?.formattedAssets.map((a: any) => ({
                  ...a,
                  name: getTokenNameFromMint(a.symbol),
                })),
                null,
                2
              )}
            </pre>
          </div>
          <button
            onClick={() => setShowResults(false)}
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded text-sm"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
};

export default TestWalletButton;
