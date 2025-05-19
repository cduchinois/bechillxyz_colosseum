import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';

// Copy of the validation function to avoid client-side imports from our library
const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

interface AddressInputProps {
  onAddressSubmit: (address: string) => void;
  isLoading: boolean;
}

export default function AddressInput({ onAddressSubmit, isLoading }: AddressInputProps) {
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      setError('Address is required');
      return;
    }

    if (!isValidSolanaAddress(address.trim())) {
      setError('Invalid Solana address');
      return;
    }

    setError('');
    onAddressSubmit(address.trim());
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Enter Solana Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Fetch Transactions'}
        </button>
      </form>
    </div>
  );
}
