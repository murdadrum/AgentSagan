import React, { useState, useCallback } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { GameControls } from './components/GameControls';
import { DifficultySelector } from './components/DifficultySelector';
import { getCosmicFact, generateCosmicImage, generateCosmicQuiz } from './services/geminiService';
import { QUIZ_INTERVAL } from './constants';
import { MessageSender } from './types';
import type { ChatMessage, QuizQuestion, DifficultyLevel, GameState } from './types';

const App: React.FC = () => {
    const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [factCount, setFactCount] = useState<number>(0);
    const [factsForQuiz, setFactsForQuiz] = useState<string[]>([]);
    const [gameState, setGameState] = useState<GameState>('welcome');

    const handleSelectDifficulty = useCallback((level: DifficultyLevel) => {
        setDifficultyLevel(level);
        const welcomeMessage: ChatMessage = {
            id: `ai-start-${Date.now()}`,
            sender: MessageSender.AI,
            text: "Hello, Space Explorer! I'm Dr. Aime Sagan, and I'm SO excited you're here! Together, we're going on an amazing adventure through space. I'll share some super cool secrets of the universe with you. After we learn five facts, I'll give you a fun quiz to test your astronaut skills! Are you ready for blast off? Click the 'Start Journey' button below to begin!",
        };
        setChatHistory([welcomeMessage]);
        setGameState('welcome');
    }, []);

    const fetchNextFact = useCallback(async () => {
        if (isLoading || !difficultyLevel) return;

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
            const updatedFactsForQuiz = [...factsForQuiz, factResponse.fact];
            const image = await generateCosmicImage(factResponse.imagePrompt);

            const factMessage: ChatMessage = {
                id: `ai-fact-${Date.now()}`,
                sender: MessageSender.AI,
                text: `🚀 **Fact #${newFactCount}: ${factResponse.fact}**\n\n${factResponse.explanation}`,
                imageUrl: image
            };
            setChatHistory(prev => prev.filter(m => !m.isLoading).concat(factMessage));
            
            setFactCount(newFactCount);
            setFactsForQuiz(updatedFactsForQuiz);
            setGameState('playing');

        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = {
                id: `ai-error-${Date.now()}`,
                sender: MessageSender.AI,
                text: "Whoa, a solar flare must be messing with our signal! My message got lost in some space static. Please try again.",
            };
            setChatHistory(prev => prev.filter(m => !m.isLoading).concat(errorMessage));
            setGameState('playing'); // Allow user to try again
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, difficultyLevel, factCount, factsForQuiz]);

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
        <div className="h-screen w-screen flex flex-col font-sans bg-gray-900">
            <header className="bg-gray-800 text-white p-4 text-center shadow-md border-b border-gray-700">
                <h1 className="text-3xl font-bold tracking-wider">Cosmic Voyage with Dr. Aime Sagan</h1>
            </header>
            <ChatWindow messages={chatHistory} onQuizComplete={handleQuizComplete} />
            <GameControls
                gameState={gameState}
                factCount={factCount}
                disabled={isLoading}
                onStart={fetchNextFact}
                onNextFact={fetchNextFact}
                onTakeQuiz={handleTakeQuiz}
                onContinue={fetchNextFact}
                onEndMission={handleEndMission}
            />
        </div>
    );
};

export default App;
