import React from 'react';
import { Info } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Profile {
  type: string;
  description: string;
  chillScore: number;
  riskScore: number;
  bucketSplit: {
    speculative: number;
    steady: number;
  };
}

interface ProfileTabProps {
  profile: Profile;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-[#7036cd]">
          {profile.type}
        </h2>
        <p className="text-gray-700 mt-2 mb-6">
          {profile.description}
        </p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <span className="mr-1">😎</span>
                <span className="font-medium">Chill score</span>
              </div>
              <div className="flex items-center">
                <span>{profile.chillScore}%</span>
                <Info size={16} className="ml-1 text-gray-400" />
              </div>
            </div>
            <ProgressBar progress={profile.chillScore} color="bg-[#FFFF4F]" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <span className="mr-1">⚠️</span>
                <span className="font-medium">Risk score</span>
              </div>
              <div className="flex items-center">
                <span>{profile.riskScore}%</span>
                <Info size={16} className="ml-1 text-gray-400" />
              </div>
            </div>
            <ProgressBar progress={profile.riskScore} color="bg-[#7036cd]" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <div className="flex items-center">
                <span className="mr-1">✌️</span>
                <span className="font-medium">Bucket split</span>
              </div>
              <div className="flex items-center">
                <Info size={16} className="ml-1 text-gray-400" />
              </div>
            </div>
            <div className="flex">
              <div style={{width: `${profile.bucketSplit.speculative}%`}}>
                <div className="bg-[#FFFF4F] h-4 rounded-l-full w-full"></div>
              </div>
              <div style={{width: `${profile.bucketSplit.steady}%`}}>
                <div className="bg-green-400 h-4 rounded-r-full w-full"></div>
              </div>
            </div>
            <div className="flex justify-between mt-1 text-sm">
              <div>{profile.bucketSplit.speculative}% speculative</div>
              <div>{profile.bucketSplit.steady}% steady</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;