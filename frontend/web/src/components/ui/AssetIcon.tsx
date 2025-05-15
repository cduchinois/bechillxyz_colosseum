import React from 'react';
import { getAssetColor } from '@/utils/Formatter';

interface AssetIconProps {
  symbol: string;
}

export const AssetIcon: React.FC<AssetIconProps> = ({ symbol }) => {
  // On utilise la même fonction que dans les autres composants
  const colorClass = getAssetColor(symbol);
  
  return (
    <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-black font-bold border border-gray-100 shadow-sm`}>
      {symbol.charAt(0)}
    </div>
  );
};

export default AssetIcon;