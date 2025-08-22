import React, { useState } from 'react';
import type { QuizData } from '../types';

interface QuizProps {
  quizData: QuizData;
  onComplete: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ quizData, onComplete }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelectAnswer = (questionIndex: number, answer: string) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };
  
  const handleSubmit = () => {
      setSubmitted(true);
      onComplete();
  };

  const calculateScore = () => {
    return quizData.questions.reduce((score, question, index) => {
      return selectedAnswers[index] === question.correctAnswer ? score + 1 : score;
    }, 0);
  };
  
  const getButtonClass = (questionIndex: number, option: string) => {
    if (!submitted) {
      return selectedAnswers[questionIndex] === option
        ? 'bg-indigo-600'
        : 'bg-gray-600 hover:bg-gray-500';
    }
    
    const isCorrect = option === quizData.questions[questionIndex].correctAnswer;
    const isSelected = selectedAnswers[questionIndex] === option;

    if (isCorrect) return 'bg-green-600';
    if (isSelected && !isCorrect) return 'bg-red-600';
    return 'bg-gray-600 opacity-70';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 my-4 border border-indigo-500 shadow-lg">
      <h2 className="text-3xl font-bold text-indigo-300 mb-4 border-b border-gray-600 pb-2">Pop Quiz, Space Explorer!</h2>
      <div className="space-y-6">
        {quizData.questions.map((q, index) => (
          <div key={index} className="bg-gray-700 p-4 rounded-md">
            <p className="font-semibold text-xl text-white mb-3">{index + 1}. {q.question}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.options.map((option, optIndex) => (
                <button
                  key={optIndex}
                  onClick={() => handleSelectAnswer(index, option)}
                  disabled={submitted}
                  className={`w-full text-left p-3 rounded-md text-white transition-all text-lg ${getButtonClass(index, option)}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!submitted ? (
         <button 
           onClick={handleSubmit} 
           disabled={Object.keys(selectedAnswers).length !== quizData.questions.length}
           className="mt-6 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
         >
           Submit Answers
         </button>
      ) : (
        <div className="mt-6 text-center bg-gray-900 p-4 rounded-lg">
            <p className="text-2xl font-bold text-white">Quiz Complete!</p>
            <p className="text-3xl text-indigo-300 mt-2">You scored {calculateScore()} out of {quizData.questions.length}</p>
        </div>
      )}
    </div>
  );
};
