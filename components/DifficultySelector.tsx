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
    <div className="h-screen w-screen flex flex-col items-center justify-center font-sans bg-gray-900 text-white p-4">
        <div className="max-w-2xl text-center">
            <h1 className="text-5xl font-bold tracking-wider mb-4">Welcome to your Cosmic Voyage!</h1>
            <p className="text-xl text-gray-300 mb-8">I'm Dr. Aime Sagan. Before we blast off, please select a difficulty level for our journey.</p>
            <div className="space-y-4">
                <LevelButton
                    level={1}
                    label="Level 1: Young Explorer"
                    description="Ages 6-10. Simple facts, fun analogies, and an exciting adventure for budding astronauts!"
                    onClick={() => onSelectDifficulty(1)}
                />
                <LevelButton
                    level={2}
                    label="Level 2: Star Cadet"
                    description="Ages 11-18. More detailed explanations for curious minds ready to dive deeper into the cosmos."
                    onClick={() => onSelectDifficulty(2)}
                />
                <LevelButton
                    level={3}
                    label="Level 3: Astrophysicist"
                    description="Ages 20+. A challenging journey with in-depth, technical information for seasoned space enthusiasts."
                    onClick={() => onSelectDifficulty(3)}
                />
            </div>
        </div>
    </div>
  );
};