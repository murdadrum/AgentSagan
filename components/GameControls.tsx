import React from 'react';
import { GameState } from '../types';

interface GameControlsProps {
    gameState: GameState;
    currentFactNumber: number;
    totalFacts: number;
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

export const GameControls: React.FC<GameControlsProps> = ({ gameState, currentFactNumber, totalFacts, disabled, onStart, onNextFact, onTakeQuiz, onContinue, onEndMission }) => {

    const renderCentralContent = () => {
        let button = null;
        let showProgress = false;

        switch (gameState) {
            case 'welcome':
                button = <ActionButton onClick={onStart} disabled={disabled} className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-gray-600">Start Lesson</ActionButton>;
                break;
            case 'playing':
                 showProgress = true;
                if (currentFactNumber > 0 && currentFactNumber % 5 === 0) {
                    button = <ActionButton onClick={onTakeQuiz} disabled={disabled} className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 disabled:bg-gray-600">Take Quiz</ActionButton>;
                } else {
                    button = <ActionButton onClick={onNextFact} disabled={disabled} className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-gray-600">Next Topic</ActionButton>;
                }
                break;
            case 'quiz_done':
                 button = <ActionButton onClick={onContinue} disabled={disabled} className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-gray-600">Continue Lesson</ActionButton>;
                 showProgress = true;
                 break;
            case 'quiz':
            case 'level_complete':
            case 'session_over':
            default:
                button = null;
                break;
        }
        
        return (
             <div className="flex-grow flex flex-col items-center justify-center space-y-2">
                {showProgress && (
                    <div className="text-indigo-300 font-medium">
                        Topic {currentFactNumber} / {totalFacts}
                    </div>
                )}
                {button}
            </div>
        );
    }

    return (
        <div className="bg-gray-800/75 backdrop-blur-sm p-4 border-t border-gray-700/50 min-h-[90px]">
            <div className="flex items-center justify-center space-x-4 max-w-4xl mx-auto">
                {renderCentralContent()}
                {gameState !== 'session_over' && gameState !== 'level_complete' && (
                     <ActionButton onClick={onEndMission} disabled={disabled} className="bg-red-700 hover:bg-red-600 text-white !w-auto absolute right-4 sm:static">
                        End Session
                    </ActionButton>
                )}
                 {(gameState === 'level_complete' || gameState === 'session_over') && (
                     <ActionButton onClick={onEndMission} disabled={false} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                        Return to Menu
                    </ActionButton>
                )}
            </div>
        </div>
    );
};