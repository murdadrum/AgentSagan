import React, { useState, useCallback, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { GameControls } from './components/GameControls';
import { DifficultySelector } from './components/DifficultySelector';
import { getCosmicFact, generateCosmicImage, generateCosmicQuiz } from './services/geminiService';
import { QUIZ_INTERVAL, TOTAL_FACTS_PER_LEVEL } from './constants';
import { MessageSender } from './types';
import type { ChatMessage, QuizQuestion, DifficultyLevel, GameState, LevelContentBlock, FactResponse } from './types';

// Define a type for the preloading progress state
type PreloadProgress = {
    loaded: number;
    total: number;
    message: string;
};

const App: React.FC = () => {
    const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [gameState, setGameState] = useState<GameState>('welcome');
    
    // State for the fully preloaded level
    const [preloadedLevelContent, setPreloadedLevelContent] = useState<LevelContentBlock[]>([]);
    const [contentIndex, setContentIndex] = useState<number>(0);
    const [factDisplayCount, setFactDisplayCount] = useState<number>(0);
    
    const [isPreloadingLevel, setIsPreloadingLevel] = useState<boolean>(false);
    const [preloadProgress, setPreloadProgress] = useState<PreloadProgress>({ loaded: 0, total: 1, message: '' });

    const preloadFullLevel = useCallback(async (level: DifficultyLevel) => {
        setIsPreloadingLevel(true);
        setChatHistory([]); // Clear chat for new level
        setContentIndex(0);
        setFactDisplayCount(0);

        try {
            const allFactsForLevel: FactResponse[] = [];
            const knownFactsForUniqueness: string[] = [];
            const totalPreloadSteps = TOTAL_FACTS_PER_LEVEL + TOTAL_FACTS_PER_LEVEL + (TOTAL_FACTS_PER_LEVEL / QUIZ_INTERVAL);
            let currentStep = 0;

            // 1. Generate all 15 facts sequentially to ensure uniqueness
            for (let i = 0; i < TOTAL_FACTS_PER_LEVEL; i++) {
                currentStep++;
                setPreloadProgress({ loaded: currentStep, total: totalPreloadSteps, message: `Generating topic ${i + 1}/${TOTAL_FACTS_PER_LEVEL}...` });
                const factResponse = await getCosmicFact(i + 1, knownFactsForUniqueness, level);
                allFactsForLevel.push(factResponse);
                knownFactsForUniqueness.push(factResponse.fact);
            }

            // 2. Generate all 15 images in parallel for speed
            const imagePromises = allFactsForLevel.map((fact, i) => {
                 return generateCosmicImage(fact.imagePrompt).then(image => {
                    currentStep++;
                    setPreloadProgress({ loaded: currentStep, total: totalPreloadSteps, message: `Creating illustration ${i + 1}/${TOTAL_FACTS_PER_LEVEL}...` });
                    return image;
                 });
            });
            const allImagesForLevel = await Promise.all(imagePromises);

            // 3. Generate all 3 quizzes
            const allQuizzesForLevel: QuizQuestion[][] = [];
            for (let i = 0; i < TOTAL_FACTS_PER_LEVEL / QUIZ_INTERVAL; i++) {
                currentStep++;
                setPreloadProgress({ loaded: currentStep, total: totalPreloadSteps, message: `Preparing quiz ${i + 1}/${TOTAL_FACTS_PER_LEVEL / QUIZ_INTERVAL}...` });
                const factSlice = allFactsForLevel.slice(i * QUIZ_INTERVAL, (i + 1) * QUIZ_INTERVAL).map(f => f.fact);
                const quiz = await generateCosmicQuiz(factSlice, level);
                allQuizzesForLevel.push(quiz);
            }

            // 4. Assemble the final content queue
            const finalContentQueue: LevelContentBlock[] = [];
            let quizIndex = 0;
            for (let i = 0; i < TOTAL_FACTS_PER_LEVEL; i++) {
                finalContentQueue.push({ type: 'fact', factResponse: allFactsForLevel[i], imageUrl: allImagesForLevel[i] });
                if ((i + 1) % QUIZ_INTERVAL === 0) {
                    finalContentQueue.push({ type: 'quiz', quizData: { questions: allQuizzesForLevel[quizIndex] } });
                    quizIndex++;
                }
            }
            
            setPreloadedLevelContent(finalContentQueue);

            const welcomeMessage: ChatMessage = {
                id: `ai-start-${Date.now()}`,
                sender: MessageSender.AI,
                text: "Greetings, and welcome to CosmoQuest. I am Commander Aime, your guide for today's lesson. All materials for our session have been pre-loaded. We will cover 15 topics, with a short quiz after every five. To begin, please press the 'Start Lesson' button below.",
            };
            setChatHistory([welcomeMessage]);
            setGameState('welcome');

        } catch (error) {
             console.error("Failed to preload level:", error);
             const errorMessage: ChatMessage = {
                id: `ai-error-${Date.now()}`,
                sender: MessageSender.AI,
                text: "A critical error occurred while preparing the lesson materials. Please check your connection and API key, then refresh to try again.",
            };
            setChatHistory([errorMessage]);
            setGameState('session_over'); // A fatal error
        } finally {
            setIsPreloadingLevel(false);
        }
    }, []);

    const handleSelectDifficulty = useCallback((level: DifficultyLevel) => {
        setDifficultyLevel(level);
        setGameState('preloading_level');
        preloadFullLevel(level);
    }, [preloadFullLevel]);

    const advanceJourney = useCallback(() => {
        if (contentIndex >= preloadedLevelContent.length) {
             // Should be handled by level_complete state, but as a safeguard
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
                imageUrl: currentContent.imageUrl
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
                text: "Excellent work! You have completed all topics for this lesson. You may now end the session to return to the main menu and select a new topic."
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
                text: "This concludes our session. It was a pleasure exploring the cosmos with you. Return any time to continue your studies. Commander Aime, signing off."
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

    if (!difficultyLevel) {
        return <DifficultySelector onSelectDifficulty={handleSelectDifficulty} isLoading={false} progress={{loaded:0, total:1, message:''}} />;
    }
    
    if (gameState === 'preloading_level') {
         return <DifficultySelector onSelectDifficulty={() => {}} isLoading={isPreloadingLevel} progress={preloadProgress} />;
    }

    return (
        <div className="h-screen w-screen flex flex-col font-sans bg-transparent">
            <header className="bg-gray-800/75 backdrop-blur-sm text-white p-4 text-center shadow-md border-b border-gray-700/50">
                <h1 className="text-3xl font-bold tracking-wider">CosmoQuest with Commander Aime</h1>
            </header>
            <ChatWindow messages={chatHistory} onQuizComplete={handleQuizComplete} />
            <GameControls
                gameState={gameState}
                currentFactNumber={factDisplayCount}
                totalFacts={TOTAL_FACTS_PER_LEVEL}
                disabled={isLoading}
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