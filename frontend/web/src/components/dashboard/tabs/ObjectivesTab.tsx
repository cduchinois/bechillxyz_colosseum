import React from 'react';
import { PlusCircle } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface Objective {
  goal: string;
  description: string;
  progress: number;
  color: string;
}

interface ObjectivesTabProps {
  objectives: Objective[];
}

const ObjectivesTab: React.FC<ObjectivesTabProps> = ({ objectives }) => {
  return (
    <div>
      <div className="bg-white rounded-xl p-6 shadow-md mb-6">
        <h2 className="text-xl font-bold text-[#7036cd] mb-4">Vue d'ensemble</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-gray-500 text-sm mb-1">Objectifs actifs</div>
            <div className="text-2xl font-bold text-[#7036cd]">3</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-gray-500 text-sm mb-1">Progression moyenne</div>
            <div className="text-2xl font-bold text-[#7036cd]">65%</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-gray-500 text-sm mb-1">Complétés</div>
            <div className="text-2xl font-bold text-[#7036cd]">2</div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#7036cd]">Mes objectifs</h2>
          <div>
            <button className="text-sm bg-[#FFFF4F] hover:bg-yellow-300 text-[#7036cd] px-4 py-2 rounded-lg flex items-center">
              <PlusCircle size={18} className="mr-2" />
              Ajouter un objectif
            </button>
          </div>
        </div>
        
        <div className="divide-y">
          {objectives.map((objective, index) => (
            <div key={index} className="p-5 hover:bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold text-[#7036cd]">{objective.goal}</div>
                <div className="text-gray-500">Progress {objective.progress}%</div>
              </div>
              <div className="text-gray-600 mb-3">{objective.description}</div>
              <ProgressBar progress={objective.progress} color={objective.color} height="h-2" />
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-bold text-[#7036cd] mb-4">Objectifs complétés</h2>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🎉</div>
          <p>Vous avez complété 2 objectifs cette année.</p>
          <button className="mt-4 text-sm text-[#7036cd] underline">Voir l'historique</button>
        </div>
      </div>
    </div>
  );
};

export default ObjectivesTab;