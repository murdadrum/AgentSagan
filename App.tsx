import React, { useState, useCallback, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { GameControls } from './components/GameControls';
import { DifficultySelector } from './components/DifficultySelector';
import { getCosmicFact, generateCosmicImage, generateCosmicQuiz } from './services/geminiService';
import { QUIZ_INTERVAL } from './constants';
import { MessageSender } from './types';
import type { ChatMessage, QuizQuestion, DifficultyLevel, GameState } from './types';

// Define a type for the preloaded content for better type safety
type PreloadedContent = {
    factResponse: Awaited<ReturnType<typeof getCosmicFact>>;
    imageUrl: string;
};

const App: React.FC = () => {
    const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [factCount, setFactCount] = useState<number>(0);
    const [factsForQuiz, setFactsForQuiz] = useState<string[]>([]);
    const [gameState, setGameState] = useState<GameState>('welcome');
    
    // New state for pre-loading a batch of facts
    const [preloadedQueue, setPreloadedQueue] = useState<PreloadedContent[]>([]);
    const [isPreloading, setIsPreloading] = useState<boolean>(false);

    const handleSelectDifficulty = useCallback((level: DifficultyLevel) => {
        setDifficultyLevel(level);
        const welcomeMessage: ChatMessage = {
            id: `ai-start-${Date.now()}`,
            sender: MessageSender.AI,
            text: "Hello, Space Explorer! I'm Dr. Aime Sagan, and I'm SO excited you're here! Together, we're going on an amazing adventure through space. I'll share some super cool secrets of the universe with you. After we learn five facts, I'll give you a fun quiz to test your astronaut skills! Are you ready for blast off? Click the 'Start Journey' button below to begin!",
        };
        setChatHistory([welcomeMessage]);
        setGameState('welcome');
        // The useEffect will now trigger the initial preload for the first 5 facts
    }, []);

    const advanceJourney = useCallback(async () => {
        if (isLoading || !difficultyLevel) return;

        // If content is ready, display it immediately for a fast experience
        if (preloadedQueue.length > 0) {
            const { factResponse, imageUrl } = preloadedQueue[0];
            const newFactCount = factCount + 1;
            
            const factMessage: ChatMessage = {
                id: `ai-fact-${Date.now()}`,
                sender: MessageSender.AI,
                text: `🚀 **Fact #${newFactCount}: ${factResponse.fact}**\n\n${factResponse.explanation}`,
                imageUrl: imageUrl
            };

            setChatHistory(prev => [...prev, factMessage]);
            setFactCount(newFactCount);
            setFactsForQuiz(prev => [...prev, factResponse.fact]);
            setGameState('playing');
            setPreloadedQueue(prev => prev.slice(1)); // Consume the first preloaded content
        } else {
            // Fallback: Content is not preloaded (still loading or failed).
            // Show loading state to user and fetch on demand.
            setIsLoading(true);
            const loadingMessage: ChatMessage = {
                id: `loading-${Date.now()}`,
                sender: MessageSender.AI,
                isLoading: true,
            };
            setChatHistory(prev => [...prev, loadingMessage]);

            try {
                const factResponse = await getCosmicFact(factCount + 1, factsForQuiz, difficultyLevel);
                const newFactCount = factCount + 1;
                const image = await generateCosmicImage(factResponse.imagePrompt);

                const factMessage: ChatMessage = {
                    id: `ai-fact-${Date.now()}`,
                    sender: MessageSender.AI,
                    text: `🚀 **Fact #${newFactCount}: ${factResponse.fact}**\n\n${factResponse.explanation}`,
                    imageUrl: image
                };
                setChatHistory(prev => prev.filter(m => !m.isLoading).concat(factMessage));
                
                setFactCount(newFactCount);
                setFactsForQuiz(prev => [...prev, factResponse.fact]);
                setGameState('playing');
            } catch (error) {
                console.error(error);
                const errorMessage: ChatMessage = {
                    id: `ai-error-${Date.now()}`,
                    sender: MessageSender.AI,
                    text: "Whoa, a solar flare must be messing with our signal! My message got lost in some space static. Please try again.",
                };
                setChatHistory(prev => prev.filter(m => !m.isLoading).concat(errorMessage));
                setGameState('playing');
            } finally {
                setIsLoading(false);
            }
        }
    }, [isLoading, difficultyLevel, factCount, factsForQuiz, preloadedQueue]);

    // Effect hook to handle batch pre-loading of facts
    useEffect(() => {
        // Conditions to trigger pre-loading a new batch of 5 facts
        const shouldPreload = 
            difficultyLevel && 
            !isPreloading && 
            preloadedQueue.length === 0 && // Only preload if the queue is empty
            (gameState === 'welcome' || gameState === 'quiz_done');

        if (shouldPreload) {
            const PRELOAD_COUNT = 5;

            const preloadBatch = async () => {
                setIsPreloading(true);
                const currentKnownFacts = [...factsForQuiz];
                const newContentBatch: PreloadedContent[] = [];

                try {
                    for (let i = 0; i < PRELOAD_COUNT; i++) {
                        const nextFactLevel = factCount + i + 1;
                        const factResponse = await getCosmicFact(nextFactLevel, currentKnownFacts, difficultyLevel);
                        // Add new fact to our temp list to ensure uniqueness within the batch
                        currentKnownFacts.push(factResponse.fact);
                        const imageUrl = await generateCosmicImage(factResponse.imagePrompt);
                        newContentBatch.push({ factResponse, imageUrl });
                    }
                    setPreloadedQueue(newContentBatch);
                } catch (error) {
                    console.error("Failed to preload batch of facts:", error);
                    setPreloadedQueue([]); // Clear queue on error to allow fallback
                } finally {
                    setIsPreloading(false);
                }
            };
            preloadBatch();
        }
    }, [difficultyLevel, gameState, factCount, isPreloading, preloadedQueue.length, factsForQuiz]);


    const handleTakeQuiz = useCallback(async () => {
        if (isLoading || !difficultyLevel) return;

        setIsLoading(true);
        setGameState('quiz');
        const quizLoadingMessage: ChatMessage = {
            id: `loading-quiz-${Date.now()}`,
            sender: MessageSender.AI,
            isLoading: true,
        };
        setChatHistory(prev => [...prev, quizLoadingMessage]);

        try {
            const quizQuestions: QuizQuestion[] = await generateCosmicQuiz(factsForQuiz, difficultyLevel);
            const quizMessage: ChatMessage = {
                id: `ai-quiz-${Date.now()}`,
                sender: MessageSender.AI,
                quizData: { questions: quizQuestions }
            };
            setChatHistory(prev => prev.filter(m => !m.isLoading).concat(quizMessage));
            setFactsForQuiz([]);
        } catch (error) {
            console.error(error);
             const errorMessage: ChatMessage = {
                id: `ai-error-${Date.now()}`,
                sender: MessageSender.AI,
                text: "Oh no! I couldn't beam down the quiz questions. A pesky asteroid must have blocked the signal. Let's just continue our journey for now.",
            };
            setChatHistory(prev => prev.filter(m => !m.isLoading).concat(errorMessage));
            setGameState('quiz_done'); // Skip quiz on error
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, difficultyLevel, factsForQuiz]);
    
    const handleQuizComplete = useCallback(() => {
        setGameState('quiz_done');
        // The useEffect will trigger preloading for the next batch of facts
    }, []);

    const handleEndMission = useCallback(() => {
        setGameState('game_over');
        const gameOverMessage: ChatMessage = {
            id: `ai-gameover-${Date.now()}`,
            sender: MessageSender.AI,
            text: "I hear you, mission control! Our space adventure is over for now. It was awesome exploring the stars with you! Come back soon for another trip through the cosmos. Dr. Sagan, over and out!"
        };
        setChatHistory(prev => [...prev, gameOverMessage]);
    }, []);

    if (!difficultyLevel) {
        return <DifficultySelector onSelectDifficulty={handleSelectDifficulty} />;
    }

    return (
        <div className="h-screen w-screen flex flex-col font-sans bg-transparent">
            <header className="bg-gray-800/75 backdrop-blur-sm text-white p-4 text-center shadow-md border-b border-gray-700/50">
                <h1 className="text-3xl font-bold tracking-wider">Cosmic Voyage with Dr. Aime Sagan</h1>
            </header>
            <ChatWindow messages={chatHistory} onQuizComplete={handleQuizComplete} />
            <GameControls
                gameState={gameState}
                factCount={factCount}
                disabled={isLoading}
                onStart={advanceJourney}
                onNextFact={advanceJourney}
                onTakeQuiz={handleTakeQuiz}
                onContinue={advanceJourney}
                onEndMission={handleEndMission}
            />
        </div>
    );
};

export default App;