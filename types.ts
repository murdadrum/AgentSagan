
export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

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
