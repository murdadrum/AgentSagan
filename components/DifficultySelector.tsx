
import React from 'react';
import type { DifficultyLevel } from '../types';

interface DifficultySelectorProps {
  onSelectDifficulty: (level: DifficultyLevel) => void;
}

const LevelButton: React.FC<{ level: DifficultyLevel, label: string, description: string, onClick: () => void }> = ({ level, label, description, onClick }) => (
    <button
        onClick={onClick}
        className="bg-gray-800 border-2 border-indigo-500 rounded-lg p-6 text-left w-full hover:bg-indigo-900 hover:border-indigo-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
        aria-label={`Select ${label}`}
    >
        <h3 className="text-2xl font-bold text-indigo-300">{label}</h3>
        <p className="text-gray-400 mt-2 text-lg">{description}</p>
    </button>
);


export const DifficultySelector: React.FC<DifficultySelectorProps> = ({ onSelectDifficulty }) => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center font-sans text-white p-4">
        <div className="max-w-2xl w-full text-center bg-black/50 backdrop-blur-md p-8 rounded-xl border border-gray-700">
            <h1 className="text-5xl font-bold tracking-wider mb-4">Welcome to Commander Sagan's CosmoQuest</h1>
            <p className="text-xl text-gray-300 mb-8">I am Commander Sagan, your guide on this astronomical mission. Please select a mission focus.</p>
            <div className="space-y-4">
                <LevelButton
                    level={1}
                    label="Foundations"
                    description="Explore the fundamental principles of astronomy, from celestial mechanics to the properties of light."
                    onClick={() => onSelectDifficulty(1)}
                />
                <LevelButton
                    level={2}
                    label="Stellar Systems"
                    description="Journey through star systems, examining stellar evolution, planetary formation, and the search for exoplanets."
                    onClick={() => onSelectDifficulty(2)}
                />
                <LevelButton
                    level={3}
                    label="Cosmic Frontiers"
                    description="Delve into the universe's greatest mysteries, including black holes, dark energy, and the fabric of spacetime."
                    onClick={() => onSelectDifficulty(3)}
                />
            </div>
        </div>
    </div>
  );
};