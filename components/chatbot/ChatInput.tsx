import React, { useState } from "react";
import { SendHorizonal } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border border-white/10 bg-bg-deep/60 rounded-xl p-1.5 focus-within:border-accent-1/50 transition-all duration-200"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        disabled={isLoading}
        className="flex-1 bg-transparent px-3 py-1.5 text-sm text-white placeholder-text-secondary/50 focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className={`flex items-center justify-center p-2 rounded-lg bg-gradient-to-br from-accent-1 to-accent-3 text-bg-deep transition-all duration-200
          ${
            !input.trim() || isLoading
              ? "opacity-40 cursor-not-allowed"
              : "hover:shadow-[0_0_15px_rgba(77,228,255,0.4)] active:scale-95 hover:scale-105 cursor-pointer"
          }`}
      >
        <SendHorizonal size={16} />
      </button>
    </form>
  );
};
