import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";

let tokenMap: Map<string, TokenInfo> = new Map();

export async function loadTokenMap() {
  const tokens = await new TokenListProvider().resolve();
  const list = tokens.filterByChainId(101).getList(); // mainnet-beta
  tokenMap = new Map(list.map((token) => [token.address, token]));
}

export function getTokenName(mint: string): string {
  return tokenMap.get(mint)?.name || mint;
}

export function getTokenSymbol(mint: string): string {
  return tokenMap.get(mint)?.symbol || mint;
}
