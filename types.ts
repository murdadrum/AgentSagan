export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export type DifficultyLevel = 1 | 2 | 3;

export type GameState = 'welcome' | 'playing' | 'quiz' | 'quiz_done' | 'level_complete' | 'session_over' | 'preloading_level';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text?: string;
  imageUrl?: string;
  quizData?: QuizData;
  isLoading?: boolean;
}

// Types for pre-loaded level content
export interface FactResponse {
    fact: string;
    explanation: string;
    imagePrompt: string;
}

export interface FactBlock {
    type: 'fact';
    factResponse: FactResponse;
    imageUrl: string;
}

export interface QuizBlock {
    type: 'quiz';
    quizData: QuizData;
}

export type LevelContentBlock = FactBlock | QuizBlock;
