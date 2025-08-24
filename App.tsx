
import React, { useState, useCallback, useEffect } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { GameControls } from './components/GameControls';
import { DifficultySelector } from './components/DifficultySelector';
import { getCosmicFact, generateCosmicQuiz, generateCosmicImage } from './services/geminiService';
import { QUIZ_INTERVAL, TOTAL_FACTS_PER_LEVEL } from './constants';
import { MessageSender } from './types';
import type { ChatMessage, DifficultyLevel, GameState, LevelContentBlock, FactBlock, QuizBlock, FactResponse } from './types';

const App: React.FC = () => {
    const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [gameState, setGameState] = useState<GameState>('welcome');
    
    const [preloadedContent, setPreloadedContent] = useState<Record<DifficultyLevel, LevelContentBlock[]>>({ 1: [], 2: [], 3: [] });
    const [preloadingStatus, setPreloadingStatus] = useState<Record<DifficultyLevel, 'idle' | 'loading' | 'done'>>({ 1: 'idle', 2: 'idle', 3: 'idle' });

    const [contentIndex, setContentIndex] = useState<number>(0);
    const [factDisplayCount, setFactDisplayCount] = useState<number>(0);

    const currentLevelContent = difficultyLevel ? preloadedContent[difficultyLevel] : [];

    const preloadFullLevel = useCallback(async (level: DifficultyLevel) => {
        if (preloadingStatus[level] !== 'idle') return;
        setPreloadingStatus(prev => ({ ...prev, [level]: 'loading' }));
        
        try {
            const knownFactsForUniqueness: string[] = [];
            let factsForNextQuiz: string[] = [];
            const levelContent: LevelContentBlock[] = [];

            for (let i = 0; i < TOTAL_FACTS_PER_LEVEL; i++) {
                const factResponseWithPrompt = await getCosmicFact(i + 1, knownFactsForUniqueness, level);
                knownFactsForUniqueness.push(factResponseWithPrompt.fact);
                factsForNextQuiz.push(factResponseWithPrompt.fact);
                
                let imageUrl: string | undefined = undefined;
                if (factResponseWithPrompt.imagePrompt) {
                    const imageBytes = await generateCosmicImage(factResponseWithPrompt.imagePrompt);
                    if (imageBytes) {
                        imageUrl = `data:image/jpeg;base64,${imageBytes}`;
                    }
                }

                const factResponse: FactResponse = { ...factResponseWithPrompt, imageUrl };
                const newFactBlock: FactBlock = { type: 'fact', factResponse };
                levelContent.push(newFactBlock);

                if ((i + 1) % QUIZ_INTERVAL === 0 && factsForNextQuiz.length > 0) {
                    const quiz = await generateCosmicQuiz(factsForNextQuiz, level);
                    const newQuizBlock: QuizBlock = { type: 'quiz', quizData: { questions: quiz } };
                    levelContent.push(newQuizBlock);
                    factsForNextQuiz = [];
                }
            }
            setPreloadedContent(prev => ({ ...prev, [level]: levelContent }));
            setPreloadingStatus(prev => ({ ...prev, [level]: 'done' }));
        } catch (error) {
             console.error(`Failed to preload level ${level} content:`, error);
             // Handle error state if needed, e.g., show a persistent error message
        }
    }, [preloadingStatus]);
    
    useEffect(() => {
        preloadFullLevel(1);
        preloadFullLevel(2);
        preloadFullLevel(3);
    }, [preloadFullLevel]);

    const handleSelectDifficulty = useCallback((level: DifficultyLevel) => {
        setDifficultyLevel(level);
        setChatHistory([]);
        setContentIndex(0);
        setFactDisplayCount(0);

        const welcomeMessage: ChatMessage = {
            id: `ai-start-${Date.now()}`,
            sender: MessageSender.AI,
            text: preloadingStatus[level] === 'done'
                ? "Greetings, cadet, and welcome aboard the starship CosmoQuest. I am Commander Sagan, your guide for today's mission. Briefing materials are ready. You may start the mission when you are ready."
                : "Greetings, cadet, and welcome aboard the starship CosmoQuest. I am Commander Sagan, your guide for today's mission. I am currently preparing the briefing materials. The 'Start Mission' button will become available momentarily.",
        };
        setChatHistory([welcomeMessage]);
        setGameState('welcome');
    }, [preloadingStatus]);

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
        setTimeout(() => {
             setDifficultyLevel(null);
             setChatHistory([]);
             setGameState('welcome');
             setContentIndex(0);
             setFactDisplayCount(0);
        }, 4000);
    }, []);

    const advanceJourney = useCallback(() => {
        if (!difficultyLevel || contentIndex >= currentLevelContent.length) {
            handleEndMission(true);
            return;
        }

        const currentContent = currentLevelContent[contentIndex];
        let newFactDisplayCount = factDisplayCount;
        
        if (currentContent.type === 'fact') {
            newFactDisplayCount++;
            const factMessage: ChatMessage = {
                id: `ai-fact-${Date.now()}`,
                sender: MessageSender.AI,
                text: `📚 **Topic #${newFactDisplayCount}: ${currentContent.factResponse.fact}**\n\n${currentContent.factResponse.explanation}`,
                imageUrl: currentContent.factResponse.imageUrl,
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

    }, [contentIndex, currentLevelContent, factDisplayCount, difficultyLevel, handleEndMission]);

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

    const journeyDisabled = 
        (gameState === 'welcome' && (!difficultyLevel || preloadingStatus[difficultyLevel] !== 'done'));


    if (!difficultyLevel) {
        return <DifficultySelector onSelectDifficulty={handleSelectDifficulty} preloadingStatus={preloadingStatus} />;
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
                onTakeQuiz={advanceJourney}
                onContinue={advanceJourney}
                onEndMission={() => handleEndMission(false)}
            />
        </div>
    );
};

export default App;