import { useState } from 'react';
import { MessageSquare, Pin, Trash2, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  isPinned?: boolean;
  messageCount: number;
}

export const ChatHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'OSKY AI Chat',
      preview: 'Chat with OSKY AI',
      timestamp: new Date(),
      isPinned: false,
      messageCount: 0,
    },
  ]);

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter(session => session.isPinned);
  const regularSessions = filteredSessions.filter(session => !session.isPinned);

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const SessionItem = ({ session, isActive = false }: { session: ChatSession; isActive?: boolean }) => (
    <div
      className={cn(
        "group relative p-3 rounded-lg cursor-pointer transition-colors",
        isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary/50"
      )}
    >
      <div className="flex items-start gap-2">
        <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">{session.title}</h4>
            {session.isPinned && (
              <Pin className="h-3 w-3 text-primary shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{session.preview}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(session.timestamp)}
            </span>
            {session.messageCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {session.messageCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Hover actions */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              // Toggle pin
            }}
          >
            <Pin className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              // Delete session
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-sidebar-bg border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sidebar-foreground">Chat History</h2>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-sidebar-bg border-sidebar-border"
          />
        </div>
      </div>

      {/* Chat Sessions */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Pinned */}
          {pinnedSessions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Pin className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium text-muted-foreground">Pinned</h3>
              </div>
              <div className="space-y-2">
                {pinnedSessions.map((session) => (
                  <SessionItem key={session.id} session={session} />
                ))}
              </div>
            </div>
          )}

          {pinnedSessions.length > 0 && regularSessions.length > 0 && (
            <Separator className="bg-sidebar-border" />
          )}

          {/* Regular Sessions */}
          {regularSessions.length > 0 && (
            <div className="space-y-2">
              {regularSessions.map((session, index) => (
                <SessionItem 
                  key={session.id} 
                  session={session} 
                  isActive={index === 0} // First session is active by default
                />
              ))}
            </div>
          )}

          {filteredSessions.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No chats found' : 'No chat history yet'}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};