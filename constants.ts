
import { MessageSender } from './types';
import type { ChatMessage } from './types';

export const TERMINATION_PHRASE = "Houston, we have a problem.";
export const QUIZ_INTERVAL = 5;

export const INITIAL_MESSAGE: ChatMessage = {
    id: `ai-start-${Date.now()}`,
    sender: MessageSender.AI,
    text: "Greetings, future stargazer! I'm Dr. Aime Sagan, your guide on this cosmic voyage. I'll share fascinating facts about our universe, starting with the basics and venturing into the deep unknown. After every five facts, we'll have a little quiz to see what you've learned. Ready to begin? Just say 'Tell me a fact!' to get started.",
};
