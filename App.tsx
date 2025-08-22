
import React, { useState, useCallback } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { InputBar } from './components/InputBar';
import { getCosmicFact, generateCosmicImage, generateCosmicQuiz } from './services/geminiService';
import { TERMINATION_PHRASE, INITIAL_MESSAGE, QUIZ_INTERVAL } from './constants';
import { MessageSender } from './types';
import type { ChatMessage, QuizQuestion } from './types';

const App: React.FC = () => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [factCount, setFactCount] = useState<number>(0);
    const [factsForQuiz, setFactsForQuiz] = useState<string[]>([]);
    const [isGameOver, setIsGameOver] = useState<boolean>(false);

    const handleUserInput = useCallback(async (message: string) => {
        if (isLoading || isGameOver) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: MessageSender.USER,
            text: message,
        };
        setChatHistory(prev => [...prev, userMessage]);

        if (message.toLowerCase() === TERMINATION_PHRASE.toLowerCase()) {
            setIsGameOver(true);
            const gameOverMessage: ChatMessage = {
                id: `ai-gameover-${Date.now()}`,
                sender: MessageSender.AI,
                text: "Mission control, I understand. It's been an honor exploring the cosmos with you. Come back any time for another voyage. Dr. Sagan signing off."
            };
            setChatHistory(prev => [...prev, gameOverMessage]);
            return;
        }

        setIsLoading(true);
        const loadingMessage: ChatMessage = {
            id: `loading-${Date.now()}`,
            sender: MessageSender.AI,
            isLoading: true,
        };
        setChatHistory(prev => [...prev, loadingMessage]);

        try {
            const factResponse = await getCosmicFact(factCount + 1, factsForQuiz);
            
            const newFactCount = factCount + 1;
            const updatedFactsForQuiz = [...factsForQuiz, factResponse.fact];

            const image = await generateCosmicImage(factResponse.imagePrompt);

            const factMessage: ChatMessage = {
                id: `ai-fact-${Date.now()}`,
                sender: MessageSender.AI,
                text: `**Fact #${newFactCount}: ${factResponse.fact}**\n\n${factResponse.explanation}`,
                imageUrl: image
            };
            setChatHistory(prev => prev.filter(m => !m.isLoading).concat(factMessage));

            setFactCount(newFactCount);

            if (newFactCount % QUIZ_INTERVAL === 0) {
                const quizLoadingMessage: ChatMessage = {
                    id: `loading-quiz-${Date.now()}`,
                    sender: MessageSender.AI,
                    isLoading: true,
                };
                setChatHistory(prev => [...prev, quizLoadingMessage]);
                
                const quizQuestions: QuizQuestion[] = await generateCosmicQuiz(updatedFactsForQuiz);
                const quizMessage: ChatMessage = {
                    id: `ai-quiz-${Date.now()}`,
                    sender: MessageSender.AI,
                    quizData: { questions: quizQuestions }
                };
                setChatHistory(prev => prev.filter(m => !m.isLoading).concat(quizMessage));
                setFactsForQuiz([]);
            } else {
                setFactsForQuiz(updatedFactsForQuiz);
            }

        } catch (error) {
            console.error(error);
            const errorMessage: ChatMessage = {
                id: `ai-error-${Date.now()}`,
                sender: MessageSender.AI,
                text: "Apologies, we seem to have hit some cosmic interference. My connection to the deep space network was interrupted. Could you repeat that?",
            };
            setChatHistory(prev => prev.filter(m => !m.isLoading).concat(errorMessage));
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, isGameOver, factCount, factsForQuiz]);

    return (
        <div className="h-screen w-screen flex flex-col font-sans bg-gray-900">
            <header className="bg-gray-800 text-white p-4 text-center shadow-md border-b border-gray-700">
                <h1 className="text-2xl font-bold tracking-wider">Cosmic Voyage with Dr. Aime Sagan</h1>
            </header>
            <ChatWindow messages={chatHistory} />
            <InputBar onSendMessage={handleUserInput} disabled={isLoading || isGameOver} />
        </div>
    );
};

export default App;
