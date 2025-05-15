import React from 'react';

interface ProgressBarProps {
  progress: number;
  color: string;
  height?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, color, height = 'h-4' }) => (
  <div className={`w-full bg-gray-100 rounded-full ${height}`}>
    <div 
      className={`${color} rounded-full ${height}`} 
      style={{ width: `${progress}%` }}
    ></div>
  </div>
);

export default ProgressBar;