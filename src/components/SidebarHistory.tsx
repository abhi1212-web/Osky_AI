import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Pin, MessageSquare, Clock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isPinned?: boolean;
  isActive?: boolean;
}

interface SidebarHistoryProps {
  chatHistory: ChatHistory[];
  onChatSelect: (chatId: string) => void;
  onPinToggle: (chatId: string) => void;
  className?: string;
}

export const SidebarHistory: React.FC<SidebarHistoryProps> = ({
  chatHistory,
  onChatSelect,
  onPinToggle,
  className = ""
}) => {
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const pinnedChats = chatHistory.filter(chat => chat.isPinned);
  const recentChats = chatHistory.filter(chat => !chat.isPinned);

  const renderChatItem = (chat: ChatHistory) => (
    <div
      key={chat.id}
      className={cn(
        "group relative p-3 rounded-lg cursor-pointer transition-all duration-200",
        "hover:bg-glass-bg border border-transparent hover:border-glass-border",
        chat.isActive && "bg-glass-bg border-glass-border glow-accent"
      )}
      onClick={() => onChatSelect(chat.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-4 w-4 text-accent shrink-0" />
            <h3 className="text-sm font-medium text-foreground truncate">
              {chat.title}
            </h3>
          </div>
          <p className="text-xs text-muted truncate mb-2">
            {chat.lastMessage}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(chat.timestamp)}</span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onPinToggle(chat.id);
          }}
          className={cn(
            "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
            chat.isPinned && "opacity-100 text-secondary"
          )}
        >
          <Pin className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn("glass-card h-full flex flex-col", className)}>
      <div className="p-4 border-b border-glass-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-accent" />
          Chat History
        </h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {pinnedChats.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-secondary" />
                <h3 className="text-sm font-medium text-secondary">Pinned</h3>
              </div>
              <div className="space-y-2">
                {pinnedChats.map(renderChatItem)}
              </div>
            </div>
          )}

          {recentChats.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted" />
                <h3 className="text-sm font-medium text-muted">Recent</h3>
              </div>
              <div className="space-y-2">
                {recentChats.map(renderChatItem)}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};