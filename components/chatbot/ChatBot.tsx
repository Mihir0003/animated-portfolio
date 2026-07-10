"use client";

import React, { useState } from "react";
import { MessageSquare, Bot } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatWindow } from "./ChatWindow";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE = `Hello 👋

I'm Mihir's AI Assistant.

I can answer questions about:
• Skills & Technologies
• Professional Experience
• Projects (MicroStore, TaskFlow, EchoChat)
• Jio-bp Internship (AFSNOC platform)
• Resume Download
• Contact Information

Try asking:
"Tell me about Mihir" or "Explain AFSNOC" or "What technologies does Mihir know?"`;

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener("open-chatbot", handleOpenChatbot);
    return () => window.removeEventListener("open-chatbot", handleOpenChatbot);
  }, []);

  const handleSendMessage = async (text: string) => {
    // 1. Append user message
    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // 2. Format history for RAG API (excluding timestamps)
      // Send the entire message list; the API will automatically slice the last 10 messages
      const formattedHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add the current user message to history
      formattedHistory.push({
        role: "user",
        content: text,
      });

      // 3. Post to next API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          history: formattedHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to retrieve response from AI assistant.");
      }

      // 4. Append assistant message
      const botMessage: Message = {
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error("Error communicating with AI Portfolio Assistant:", err);
      setError("Failed to fetch response. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence mode="wait">
        {/* Closed State / Minimized State -> Floating Icon */}
        {(!isOpen || isMinimized) && (
          <motion.button
            key="floating-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1, shadow: "0px 0px 20px rgba(77,228,255,0.4)" }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleOpen}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-bg-mid to-bg-deep border border-accent-1/40 text-accent-1 shadow-glow cursor-pointer relative group"
          >
            <span className="absolute inset-0 rounded-full bg-accent-1/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></span>
            <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
            
            {/* Tooltip */}
            <span className="absolute right-16 scale-0 group-hover:scale-100 bg-bg-deep border border-glass-border text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all origin-right duration-200 shadow-lg">
              Chat with Mihir AI!
            </span>
          </motion.button>
        )}

        {/* Opened & Maximized Chat Window */}
        {isOpen && !isMinimized && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="origin-bottom-right"
          >
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              error={error}
              onSendMessage={handleSendMessage}
              onClose={() => setIsOpen(false)}
              onMinimize={() => setIsMinimized(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ChatBot;
