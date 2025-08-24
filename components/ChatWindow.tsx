
import React, { useRef, useEffect } from 'react';
import { MessageSender } from '../types';
import type { ChatMessage } from '../types';
import { Quiz } from './Quiz';

interface ChatWindowProps {
  messages: ChatMessage[];
  onQuizComplete: () => void;
}

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 rounded-full">
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" clipRule="evenodd" />
    </svg>
);

const AIIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 rounded-full">
        <path d="M12 2.25a.75.75 0 0 1 .75.75v.516a11.954 11.954 0 0 1 8.991 9.348.75.75 0 0 1-.502.834 10.435 10.435 0 0 1-4.237.94.75.75 0 0 1-.67-.743 8.952 8.952 0 0 0-3.33-6.224.75.75 0 0 1 .166-1.233A9.003 9.003 0 0 0 12 2.25Z" />
        <path d="M12 21.75a.75.75 0 0 1-.75-.75v-.516a11.954 11.954 0 0 1-8.991-9.348.75.75 0 0 1 .502-.834 10.435 10.435 0 0 1 4.237-.94.75.75 0 0 1 .67.743 8.952 8.952 0 0 0 3.33 6.224.75.75 0 0 1-.166 1.233A9.003 9.003 0 0 0 12 21.75Z" />
    </svg>
);


const LoadingBubble: React.FC = () => (
    <div className="flex items-start space-x-4">
        <div className="p-1 bg-indigo-500 rounded-full"><AIIcon/></div>
        <div className="bg-gray-700 rounded-lg p-4 max-w-2xl flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        </div>
    </div>
);


export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onQuizComplete }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.isLoading) {
      return <LoadingBubble />;
    }
    
    const messageContainerClass = msg.sender === MessageSender.USER
      ? 'flex items-start justify-end space-x-4'
      : 'flex items-start space-x-4';
    
    const bubbleClass = msg.sender === MessageSender.USER
      ? 'bg-indigo-600 rounded-lg p-4 max-w-2xl'
      : 'bg-gray-700 rounded-lg p-4 max-w-2xl';

    const Icon = msg.sender === MessageSender.USER ? UserIcon : AIIcon;
    const IconContainer = <div className={`p-1 rounded-full ${msg.sender === MessageSender.USER ? 'bg-indigo-400' : 'bg-indigo-500'}`}><Icon/></div>;

    const messageBody = (
        <div className={bubbleClass}>
            {msg.imageUrl && (
                <img 
                    src={msg.imageUrl}
                    alt="Cosmic visualization"
                    className="rounded-lg mb-4 w-full h-auto object-cover"
                    loading="lazy"
                />
            )}
            {msg.text && <p className="whitespace-pre-wrap text-lg">{msg.text}</p>}
            {msg.quizData && <Quiz quizData={msg.quizData} onComplete={onQuizComplete} />}
        </div>
    );
    
    return (
        <div className={messageContainerClass}>
            {msg.sender !== MessageSender.USER && IconContainer}
            {messageBody}
            {msg.sender === MessageSender.USER && IconContainer}
        </div>
    );
  };
  
  return (
    <div className="flex-grow p-6 overflow-y-auto bg-transparent text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map(msg => <div key={msg.id}>{renderMessageContent(msg)}</div>)}
        <div ref={endOfMessagesRef} />
      </div>
    </div>
  );
};