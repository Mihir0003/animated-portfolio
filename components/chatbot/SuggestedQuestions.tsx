import React from "react";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  isLoading: boolean;
}

const QUESTIONS = [
  "Tell me about Mihir",
  "Explain AFSNOC",
  "Show Skills",
  "Internship Experience",
  "Download Resume",
  "Contact Information",
  "What projects has Mihir worked on?",
  "What is Dynamic Form Engine?",
];

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  onSelectQuestion,
  isLoading,
}) => {
  return (
    <div className="flex flex-wrap gap-2 my-2 select-none">
      {QUESTIONS.map((question, index) => (
        <button
          key={index}
          type="button"
          onClick={() => !isLoading && onSelectQuestion(question)}
          disabled={isLoading}
          className={`text-xs px-3 py-1.5 rounded-full border border-white/10 bg-bg-deep/40 text-text-secondary transition-all text-left duration-200
            ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-accent-1/50 hover:bg-accent-1/10 hover:text-white active:scale-95 cursor-pointer"
            }`}
        >
          {question}
        </button>
      ))}
    </div>
  );
};
