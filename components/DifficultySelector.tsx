
import React from 'react';
import type { DifficultyLevel } from '../types';

interface DifficultySelectorProps {
  onSelectDifficulty: (level: DifficultyLevel) => void;
  preloadingStatus: Record<DifficultyLevel, 'idle' | 'loading' | 'done'>;
}

const LevelButton: React.FC<{ level: DifficultyLevel; label: string; description: string; onClick: () => void; status: 'idle' | 'loading' | 'done'; }> = ({ level, label, description, onClick, status }) => (
    <button
        onClick={onClick}
        className="bg-gray-800 border-2 border-indigo-500 rounded-lg p-6 text-left w-full hover:bg-indigo-900 hover:border-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label={`Select ${label}`}
    >
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-indigo-300">{label}</h3>
            {status === 'loading' && (
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Preparing...</span>
                </div>
            )}
            {status === 'done' && (
                <div className="flex items-center space-x-2 text-sm text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    <span>Ready</span>
                </div>
            )}
        </div>
        <p className="text-gray-400 mt-2 text-lg">{description}</p>
    </button>
);


export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty, preloadingStatus }) => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center font-sans text-white p-4">
        <div className="max-w-4xl w-full text-center bg-black/50 backdrop-blur-md p-8 rounded-xl border border-gray-700">
             <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                <img src="https://storage.googleapis.com/maker-suite-project-files-prod/ai-drive/v1-0/files/6c97435f-3523-467a-8d75-98d0c7524022" alt="Commander Sagan" className="w-48 h-48 rounded-full border-4 border-indigo-500 object-cover flex-shrink-0" />
                <div>
                    <h1 className="text-5xl font-bold tracking-wider mb-4">Commander Sagan's CosmoQuest</h1>
                    <p className="text-xl text-gray-300 mb-8">I am Commander Sagan, your guide on this astronomical mission. Please select a mission focus. I will prepare the materials while you decide.</p>
                </div>
            </div>
        </div>
        <div className="max-w-4xl w-full mt-8">
            <div className="space-y-4">
                <LevelButton
                    level={1}
                    label="Foundations"
                    description="Explore the fundamental principles of astronomy, from celestial mechanics to the properties of light."
                    onClick={() => onSelectDifficulty(1)}
                    status={preloadingStatus[1]}
                />
                <LevelButton
                    level={2}
                    label="Stellar Systems"
                    description="Journey through star systems, examining stellar evolution, planetary formation, and the search for exoplanets."
                    onClick={() => onSelectDifficulty(2)}
                    status={preloadingStatus[2]}
                />
                <LevelButton
                    level={3}
                    label="Cosmic Frontiers"
                    description="Delve into the universe's greatest mysteries, including black holes, dark energy, and the fabric of spacetime."
                    onClick={() => onSelectDifficulty(3)}
                    status={preloadingStatus[3]}
                />
            </div>
        </div>
    </div>
  );
};