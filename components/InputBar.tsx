
import React, { useState } from 'react';

interface InputBarProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
    </svg>
);


export const InputBar: React.FC<InputBarProps> = ({ onSendMessage, disabled }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="bg-gray-800 p-4 border-t border-gray-700">
      <form onSubmit={handleSubmit} className="flex items-center space-x-4 max-w-4xl mx-auto">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={disabled ? "Waiting for response..." : "Ask a question or type 'Tell me a fact!'"}
          disabled={disabled}
          className="flex-grow bg-gray-700 text-white rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
          aria-label="User input"
        />
        <button
          type="submit"
          disabled={disabled || !inputValue.trim()}
          className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};
