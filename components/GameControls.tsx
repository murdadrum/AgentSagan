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
        className={`w-full sm:w-auto text-lg font-bold py-3 px-8 rounded-full transition-all focus:outline-none focus:ring-4 focus:ring-indigo-400 disabled:cursor-not-allowed disabled:bg-gray-600 flex items-center justify-center ${className}`}
    >
        {children}
    </button>
);

export const GameControls: React.FC<GameControlsProps> = ({ gameState, currentFactNumber, totalFacts, disabled, onStart, onNextFact, onTakeQuiz, onContinue, onEndMission }) => {

    const renderCentralContent = () => {
        let button = null;
        let buttonContent: React.ReactNode = '';
        let buttonAction = () => {};
        let buttonClass = 'bg-indigo-600 hover:bg-indigo-500 text-white';
        
        const showProgress = ['playing', 'quiz_done', 'quiz'].includes(gameState);

        switch (gameState) {
            case 'welcome':
                buttonContent = 'Start Lesson';
                buttonAction = onStart;
                break;
            case 'playing':
                if (currentFactNumber > 0 && currentFactNumber % 5 === 0) {
                    buttonContent = 'Take Quiz';
                    buttonAction = onTakeQuiz;
                    buttonClass = 'bg-yellow-500 hover:bg-yellow-400 text-gray-900';
                } else {
                    buttonContent = 'Next Topic';
                    buttonAction = onNextFact;
                }
                break;
            case 'quiz_done':
                 buttonContent = 'Continue Lesson';
                 buttonAction = onContinue;
                 break;
            case 'quiz':
            case 'level_complete':
            case 'session_over':
            default:
                button = null;
                break;
        }

        if (disabled && buttonContent) {
             buttonContent = (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Preparing...</span>
                </>
             );
        }
        
        if (buttonContent) {
            button = <ActionButton onClick={buttonAction} disabled={disabled} className={buttonClass}>{buttonContent}</ActionButton>;
        }
        
        return (
             <div className="flex-grow flex flex-col items-center justify-center space-y-3 px-16 sm:px-0">
                {showProgress && (
                    <div className="w-full max-w-sm">
                        <div className="flex justify-between mb-1">
                             <span className="text-base font-medium text-indigo-300">Lesson Progress</span>
                             <span className="text-sm font-medium text-indigo-300">{currentFactNumber} / {totalFacts}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(currentFactNumber / totalFacts) * 100}%` }}></div>
                        </div>
                    </div>
                )}
                {button}
            </div>
        );
    }

    return (
        <div className="bg-gray-800/75 backdrop-blur-sm p-4 border-t border-gray-700/50 min-h-[90px]">
            <div className="flex items-center justify-center space-x-4 max-w-4xl mx-auto relative h-full">
                {renderCentralContent()}
                 {gameState !== 'session_over' && gameState !== 'level_complete' && (
                     <ActionButton onClick={onEndMission} disabled={disabled && gameState !== 'welcome'} className="bg-red-700 hover:bg-red-600 text-white !w-auto absolute right-4">
                        End Session
                    </ActionButton>
                )}
                 {(gameState === 'level_complete' || gameState === 'session_over') && (
                     <div className="flex-grow flex items-center justify-center">
                        <ActionButton onClick={onEndMission} disabled={false} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                            Return to Menu
                        </ActionButton>
                     </div>
                )}
            </div>
        </div>
    );
};
