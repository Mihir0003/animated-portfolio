import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Bot Avatar on Left */}
      {!isUser && (
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-1/10 border border-accent-1/30 text-accent-1 self-start shadow-[0_0_10px_rgba(77,228,255,0.15)]">
          <Bot size={16} />
        </div>
      )}

      {/* Message Content Container */}
      <div className="flex flex-col max-w-[80%] gap-1">
        <div
          className={`rounded-2xl px-4 py-2.5 border text-sm backdrop-blur-md transition-all
            ${
              isUser
                ? "bg-gradient-to-br from-accent-1/15 to-accent-3/10 border-accent-1/20 text-white rounded-tr-sm"
                : "bg-bg-mid/45 border-white/10 text-text-primary rounded-tl-sm shadow-sm"
            }`}
        >
          {/* Markdown parser to support rich formatting like bold list and links */}
          <div className="prose prose-invert max-w-none text-xs md:text-sm leading-relaxed break-words font-sans">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target={href?.startsWith("http") ? "_blank" : undefined}
                    rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-accent-1 font-semibold underline hover:text-accent-3 transition-colors"
                  >
                    {children}
                  </a>
                ),
                p: ({ children }) => <p className="m-0 mb-1 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="pl-4 my-1 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="pl-4 my-1 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                code: ({ children }) => (
                  <code className="bg-black/40 px-1 py-0.5 rounded text-accent-2 font-mono text-[0.8rem]">
                    {children}
                  </code>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Timestamp */}
        <span
          className={`text-[10px] px-1 text-text-secondary/50 font-sans ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {/* User Avatar on Right */}
      {isUser && (
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-2/10 border border-accent-2/30 text-accent-2 self-start shadow-[0_0_10px_rgba(255,143,63,0.15)]">
          <User size={16} />
        </div>
      )}
    </div>
  );
};
