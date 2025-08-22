export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export type DifficultyLevel = 1 | 2 | 3;

export type GameState = 'welcome' | 'playing' | 'quiz' | 'quiz_done' | 'game_over';

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
