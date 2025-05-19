import { expect, describe, it } from '@jest/globals';
import { isValidSolanaAddress } from '../index';

describe('isValidSolanaAddress', () => {
  it('should return true for valid Solana address', () => {
    const validAddress = 'GthTyfd3EV9Y8wN6zhZeES5PgT2jQVzLrZizfZquAY5S';
    expect(isValidSolanaAddress(validAddress)).toBe(true);
  });

  it('should return false for invalid Solana address', () => {
    const invalidAddress = 'not-a-valid-address';
    expect(isValidSolanaAddress(invalidAddress)).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidSolanaAddress('')).toBe(false);
  });

  it('should return false for null or undefined', () => {
    // @ts-ignore - Testing invalid inputs
    expect(isValidSolanaAddress(null)).toBe(false);
    // @ts-ignore - Testing invalid inputs
    expect(isValidSolanaAddress(undefined)).toBe(false);
  });
});
