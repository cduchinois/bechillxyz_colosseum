import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";

let tokenMap: Map<string, TokenInfo> = new Map();

/**
 * Charge et stocke la liste des tokens Solana depuis le token registry officiel
 */
export const loadTokenMap = async () => {
  try {
    const tokenListContainer = await new TokenListProvider().resolve();
    const tokens = tokenListContainer.filterByChainId(101).getList(); // 101 = mainnet-beta
    tokenMap = new Map(tokens.map((token) => [token.address, token]));
    console.log("✅ Token map chargée avec", tokenMap.size, "tokens.");
  } catch (error) {
    console.error("❌ Échec du chargement du token map:", error);
  }
};

/**
 * Retourne le nom du token pour un mint donné (sinon le mint lui-même)
 * @param mint - L'adresse du mint
 * @returns Nom du token ou le mint si introuvable
 */
export const getTokenNameFromMint = (mint: string): string => {
  return tokenMap.get(mint)?.name || mint;
};
