import React, { useEffect, useRef } from "react";
import { X, Minus, AlertCircle } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { SuggestedQuestions } from "./SuggestedQuestions";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onClose: () => void;
  onMinimize: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  error,
  onSendMessage,
  onClose,
  onMinimize,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages list or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-[520px] w-full sm:w-[380px] bg-bg-deep/90 border border-glass-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300">
      {/* Chat Window Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-bg-mid/40">
        <div className="flex items-center gap-2">
          {/* Status Glow Dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-3 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-3"></span>
          </span>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide font-orbitron">Mihir AI Assistant</h3>
            <p className="text-[10px] text-text-secondary/70 m-0">Retrieval-Augmented Chatbot</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onMinimize}
            className="p-1 rounded-md hover:bg-white/5 text-text-secondary hover:text-white transition-colors cursor-pointer"
            title="Minimize"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-white/5 text-text-secondary hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-1/10 border border-accent-1/30 text-accent-1 self-start shadow-[0_0_10px_rgba(77,228,255,0.15)] animate-pulse">
              <span className="text-[10px] font-bold">AI</span>
            </div>
            <div className="bg-bg-mid/45 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-1 animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-1 animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-1 animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="flex items-center gap-2 text-xs p-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips & Input Footer */}
      <div className="p-3 border-t border-white/10 bg-bg-mid/20 flex flex-col gap-2">
        {/* Only show questions helper when there isn't active loader */}
        <div className="max-h-[90px] overflow-y-auto scrollbar-none">
          <SuggestedQuestions onSelectQuestion={onSendMessage} isLoading={isLoading} />
        </div>
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
