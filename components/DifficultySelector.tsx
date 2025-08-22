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
                    label="Level 1: Cadet"
                    description="Embark on your first mission! Simple facts, fun analogies, and an exciting adventure for new recruits."
                    onClick={() => onSelectDifficulty(1)}
                />
                <LevelButton
                    level={2}
                    label="Level 2: Captain"
                    description="Take command of your learning with more detailed explanations, perfect for curious minds ready to dive deeper."
                    onClick={() => onSelectDifficulty(2)}
                />
                <LevelButton
                    level={3}
                    label="Level 3: Commander"
                    description="Master the universe with a challenging journey featuring in-depth, technical information for seasoned space experts."
                    onClick={() => onSelectDifficulty(3)}
                />
            </div>
        </div>
    </div>
  );
};