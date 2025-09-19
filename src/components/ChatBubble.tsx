import React from 'react';
import { Message } from './ChatWindow';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
  message: Message;
  className?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, className = "" }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 1
      }}
      className={cn(
        "flex w-full",
        message.isOutgoing ? "justify-end" : "justify-start",
        className
      )}
    >
      <div className={cn(
        "max-w-[70%] rounded-lg px-4 py-3 transition-all duration-200",
        message.isOutgoing 
          ? "bubble-outgoing text-black font-medium glow-accent" 
          : "bubble-incoming text-foreground"
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <div className={cn(
          "flex items-center gap-1 mt-2 text-xs",
          message.isOutgoing ? "text-black/70" : "text-muted"
        )}>
          <span>{formatTime(message.timestamp)}</span>
          {message.isOutgoing && message.status && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-1"
            >
              {message.status === 'sending' && '⏳'}
              {message.status === 'sent' && '✓'}
              {message.status === 'delivered' && '✓✓'}
              {message.status === 'error' && '❌'}
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};