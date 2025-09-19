import React from 'react';
import { ChatBubble } from './ChatBubble';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface Message {
  id: string;
  content: string;
  isOutgoing: boolean;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'error';
}

interface ChatWindowProps {
  messages: Message[];
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, className = "" }) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="glass-card flex-1 p-4">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatBubble 
                key={message.id} 
                message={message}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};