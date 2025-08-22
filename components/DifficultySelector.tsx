import React from 'react';
import type { DifficultyLevel } from '../types';

interface DifficultySelectorProps {
  onSelectDifficulty: (level: DifficultyLevel) => void;
  isLoading: boolean;
  progress: { loaded: number; total: number; message: string; };
}

const LevelButton: React.FC<{ level: DifficultyLevel, label: string, description: string, onClick: () => void, disabled: boolean }> = ({ level, label, description, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="bg-gray-800 border-2 border-indigo-500 rounded-lg p-6 text-left w-full hover:bg-indigo-900 hover:border-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-wait"
        aria-label={`Select ${label}`}
    >
        <h3 className="text-2xl font-bold text-indigo-300">{label}</h3>
        <p className="text-gray-400 mt-2 text-lg">{description}</p>
    </button>
);


export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty, isLoading, progress }) => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center font-sans text-white p-4">
        <div className="max-w-2xl w-full text-center bg-black/50 backdrop-blur-md p-8 rounded-xl border border-gray-700 relative">
            {isLoading && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 rounded-xl">
                    <div className="w-16 h-16 border-4 border-t-transparent border-indigo-400 rounded-full animate-spin"></div>
                    <p className="text-lg mt-4">{progress.message}</p>
                    <div className="w-3/4 bg-gray-600 rounded-full h-2.5 mt-2">
                         <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(progress.loaded / progress.total) * 100}%` }}></div>
                    </div>
                </div>
            )}
            <h1 className="text-5xl font-bold tracking-wider mb-4">Welcome to CosmoQuest</h1>
            <p className="text-xl text-gray-300 mb-8">I am Commander Aime, your guide on this astronomical journey. Please select a topic focus for our session.</p>
            <div className="space-y-4">
                <LevelButton
                    level={1}
                    label="Foundations"
                    description="Explore the fundamental principles of astronomy, from celestial mechanics to the properties of light."
                    onClick={() => onSelectDifficulty(1)}
                    disabled={isLoading}
                />
                <LevelButton
                    level={2}
                    label="Stellar Systems"
                    description="Journey through star systems, examining stellar evolution, planetary formation, and the search for exoplanets."
                    onClick={() => onSelectDifficulty(2)}
                    disabled={isLoading}
                />
                <LevelButton
                    level={3}
                    label="Cosmic Frontiers"
                    description="Delve into the universe's greatest mysteries, including black holes, dark energy, and the fabric of spacetime."
                    onClick={() => onSelectDifficulty(3)}
                    disabled={isLoading}
                />
            </div>
        </div>
    </div>
  );
};