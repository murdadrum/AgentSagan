
import React, { useState, useCallback, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { GameControls } from './components/GameControls';
import { DifficultySelector } from './components/DifficultySelector';
import { getCosmicFact, generateCosmicQuiz } from './services/geminiService';
import { QUIZ_INTERVAL, TOTAL_FACTS_PER_LEVEL } from './constants';
import { MessageSender } from './types';
import type { ChatMessage, QuizQuestion, DifficultyLevel, GameState, LevelContentBlock, FactBlock, QuizBlock, FactResponse } from './types';

const App: React.FC = () => {
    const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [gameState, setGameState] = useState<GameState>('welcome');
    
    // State for the progressively loaded level content
    const [preloadedLevelContent, setPreloadedLevelContent] = useState<LevelContentBlock[]>([]);
    const [contentIndex, setContentIndex] = useState<number>(0);
    const [factDisplayCount, setFactDisplayCount] = useState<number>(0);

    const preloadFullLevel = useCallback(async (level: DifficultyLevel) => {
        try {
            const knownFactsForUniqueness: string[] = [];
            let factsForNextQuiz: string[] = [];

            for (let i = 0; i < TOTAL_FACTS_PER_LEVEL; i++) {
                const factResponse = await getCosmicFact(i + 1, knownFactsForUniqueness, level);
                knownFactsForUniqueness.push(factResponse.fact);
                factsForNextQuiz.push(factResponse.fact);

                const newFactBlock: FactBlock = { type: 'fact', factResponse };
                setPreloadedLevelContent(prev => [...prev, newFactBlock]);

                if ((i + 1) % QUIZ_INTERVAL === 0 && factsForNextQuiz.length > 0) {
                    const quiz = await generateCosmicQuiz(factsForNextQuiz, level);
                    const newQuizBlock: QuizBlock = { type: 'quiz', quizData: { questions: quiz } };
                    setPreloadedLevelContent(prev => [...prev, newQuizBlock]);
                    factsForNextQuiz = []; // Reset for the next batch
                }
            }
        } catch (error) {
             console.error("Failed to preload level content in background:", error);
             const errorMessage: ChatMessage = {
                id: `ai-error-${Date.now()}`,
                sender: MessageSender.AI,
                text: "A critical error occurred while preparing new lesson materials. Please check your connection and API key. You may need to end the session and start over.",
            };
            setChatHistory(prev => [...prev, errorMessage]);
             // You might want to halt the game or disable further progression here
        }
    }, []);

    const handleSelectDifficulty = useCallback((level: DifficultyLevel) => {
        setDifficultyLevel(level);
        setChatHistory([]); // Clear chat for new level
        setContentIndex(0);
        setFactDisplayCount(0);
        setPreloadedLevelContent([]); // Clear old content

        const welcomeMessage: ChatMessage = {
            id: `ai-start-${Date.now()}`,
            sender: MessageSender.AI,
            text: "Greetings, cadet, and welcome aboard the starship CosmoQuest. I am Commander Sagan, your guide for today's mission. I am currently preparing the briefing materials. The 'Start Mission' button will become available momentarily.",
        };
        setChatHistory([welcomeMessage]);
        setGameState('welcome');
        preloadFullLevel(level); // Fire and forget to load in background
    }, [preloadFullLevel]);

    const advanceJourney = useCallback(() => {
        if (contentIndex >= preloadedLevelContent.length) {
            handleEndMission(true);
            return;
        }

        const currentContent = preloadedLevelContent[contentIndex];
        let newFactDisplayCount = factDisplayCount;
        
        if (currentContent.type === 'fact') {
            newFactDisplayCount++;
            const factMessage: ChatMessage = {
                id: `ai-fact-${Date.now()}`,
                sender: MessageSender.AI,
                text: `📚 **Topic #${newFactDisplayCount}: ${currentContent.factResponse.fact}**\n\n${currentContent.factResponse.explanation}`,
            };
            setChatHistory(prev => [...prev, factMessage]);
            setFactDisplayCount(newFactDisplayCount);
            setGameState('playing');
        } else if (currentContent.type === 'quiz') {
            const quizMessage: ChatMessage = {
                id: `ai-quiz-${Date.now()}`,
                sender: MessageSender.AI,
                quizData: currentContent.quizData
            };
            setChatHistory(prev => [...prev, quizMessage]);
            setGameState('quiz');
        }
        
        setContentIndex(prev => prev + 1);

    }, [contentIndex, preloadedLevelContent, factDisplayCount]);

    const handleQuizComplete = useCallback(() => {
        if (factDisplayCount === TOTAL_FACTS_PER_LEVEL) {
            setGameState('level_complete');
            const levelCompleteMessage: ChatMessage = {
                id: `ai-level-complete-${Date.now()}`,
                sender: MessageSender.AI,
                text: "Excellent work, cadet! You have successfully completed all objectives for this mission. You may now end the session to return to the main menu and select a new assignment."
            };
            setChatHistory(prev => [...prev, levelCompleteMessage]);
        } else {
            setGameState('quiz_done');
        }
    }, [factDisplayCount]);

    const handleEndMission = useCallback((isLevelComplete: boolean = false) => {
        setGameState('session_over');
        if (!isLevelComplete) {
            const gameOverMessage: ChatMessage = {
                id: `ai-gameover-${Date.now()}`,
                sender: MessageSender.AI,
                text: "This concludes our mission. It was a pleasure exploring the cosmos with you, cadet. Return any time to continue your training. Commander Sagan, signing off."
            };
            setChatHistory(prev => [...prev, gameOverMessage]);
        }
        // Reset to initial state after a delay to allow user to read message
        setTimeout(() => {
             setDifficultyLevel(null);
             setChatHistory([]);
             setGameState('welcome');
             setPreloadedLevelContent([]);
             setContentIndex(0);
             setFactDisplayCount(0);
        }, 4000);
    }, []);

    const journeyDisabled = 
        (gameState === 'welcome' && preloadedLevelContent.length === 0) ||
        ((gameState === 'playing' || gameState === 'quiz_done') && !preloadedLevelContent[contentIndex]);


    if (!difficultyLevel) {
        return <DifficultySelector onSelectDifficulty={handleSelectDifficulty} />;
    }

    return (
        <div className="h-screen w-screen flex flex-col font-sans bg-transparent">
            <header className="bg-gray-800/75 backdrop-blur-sm text-white p-4 text-center shadow-md border-b border-gray-700/50">
                <h1 className="text-3xl font-bold tracking-wider">Commander Sagan's CosmoQuest</h1>
            </header>
            <ChatWindow messages={chatHistory} onQuizComplete={handleQuizComplete} />
            <GameControls
                gameState={gameState}
                currentFactNumber={factDisplayCount}
                totalFacts={TOTAL_FACTS_PER_LEVEL}
                disabled={journeyDisabled}
                onStart={advanceJourney}
                onNextFact={advanceJourney}
                onTakeQuiz={advanceJourney} // Quiz is now part of the main journey flow
                onContinue={advanceJourney}
                onEndMission={() => handleEndMission(false)}
            />
        </div>
    );
};

export default App;
