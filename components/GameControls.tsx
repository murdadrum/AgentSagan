import React from 'react';
import { GameState } from '../types';
import { QUIZ_INTERVAL } from '../constants';

interface GameControlsProps {
    gameState: GameState;
    factCount: number;
    disabled: boolean;
    onStart: () => void;
    onNextFact: () => void;
    onTakeQuiz: () => void;
    onContinue: () => void;
    onEndMission: () => void;
}

const ActionButton: React.FC<{ onClick: () => void; disabled: boolean; children: React.ReactNode; className?: string }> = ({ onClick, disabled, children, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full sm:w-auto text-lg font-bold py-3 px-8 rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

export const GameControls: React.FC<GameControlsProps> = ({ gameState, factCount, disabled, onStart, onNextFact, onTakeQuiz, onContinue, onEndMission }) => {

    const renderCentralButton = () => {
        switch (gameState) {
            case 'welcome':
                return <ActionButton onClick={onStart} disabled={disabled} className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-gray-600">Start Journey</ActionButton>;
            case 'playing':
                if (factCount > 0 && factCount % QUIZ_INTERVAL === 0) {
                    return <ActionButton onClick={onTakeQuiz} disabled={disabled} className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 disabled:bg-gray-600">Take Quiz!</ActionButton>;
                }
                return <ActionButton onClick={onNextFact} disabled={disabled} className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-gray-600">Next Fact</ActionButton>;
            case 'quiz_done':
                 return <ActionButton onClick={onContinue} disabled={disabled} className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-gray-600">Continue Journey</ActionButton>;
            case 'quiz':
            case 'game_over':
            default:
                return null;
        }
    }

    return (
        <div className="bg-gray-800 p-4 border-t border-gray-700">
            <div className="flex items-center justify-center space-x-4 max-w-4xl mx-auto">
                <div className="flex-grow flex justify-center">
                    {renderCentralButton()}
                </div>
                {gameState !== 'game_over' && (
                     <ActionButton onClick={onEndMission} disabled={disabled} className="bg-red-700 hover:bg-red-600 text-white !w-auto absolute right-4 sm:static">
                        End Mission
                    </ActionButton>
                )}
            </div>
        </div>
    );
};
