import { useState } from 'react';
import { 
  MessageSquare, 
  Image, 
  Code, 
  Menu,
  ChevronRight,
  Settings,
  LogOut,
  Plus,
  Search,
  Pin,
  Trash2
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface ChatSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  isPinned?: boolean;
  messageCount: number;
}

const mainFeatures = [
  {
    title: "New Chat",
    icon: Plus,
    id: "new-chat",
    description: "Start new conversation",
    action: "newChat"
  },
  {
    title: "Image Generation", 
    icon: Image,
    id: "image",
    description: "Create AI Images",
    subFeatures: [
      { title: "Generate", id: "image-generate", action: "generateImage" },
      { title: "Edit", id: "image-edit", action: "editImage" },
      { title: "Variations", id: "image-variations", action: "imageVariations" }
    ]
  },
  {
    title: "Code Generator",
    icon: Code, 
    id: "code",
    description: "AI Code Generation",
    action: "generateCode"
  }
];

interface AppSidebarProps {
  onFeatureClick?: (action: string) => void;
}

export function AppSidebar({ onFeatureClick }: AppSidebarProps) {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  
  const collapsed = state === "collapsed";
  
  // Mock chat sessions - in real app this would come from API/state
  const [sessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Welcome to OSKY AI',
      preview: 'Getting started with AI assistant',
      timestamp: new Date(),
      isPinned: false,
      messageCount: 3,
    },
    {
      id: '2', 
      title: 'Code Help',
      preview: 'React component optimization',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      isPinned: true,
      messageCount: 12,
    }
  ]);

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFeatureClick = (feature: typeof mainFeatures[0]) => {
    if (feature.subFeatures) {
      setExpandedFeature(expandedFeature === feature.id ? null : feature.id);
    } else {
      onFeatureClick?.(feature.action || feature.id);
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Now';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };

  return (
    <Sidebar className={cn(
      "border-r border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50",
      collapsed ? "w-16" : "w-80"
    )}>
      <SidebarContent className="p-0">
        {/* Header with Logo */}
        <div className={cn("p-4 border-b border-border", collapsed && "px-2")}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-primary-foreground font-bold text-sm">O</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg gradient-text">OSKY AI</h1>
                <p className="text-xs text-muted-foreground">AI Assistant</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Features */}
        <div className={cn("p-4 border-b border-border", collapsed && "px-2")}>
          {!collapsed && (
            <h2 className="text-sm font-medium text-muted-foreground mb-3">AI Tools</h2>
          )}
          <div className="space-y-1">
            {mainFeatures.map((feature) => (
              <div key={feature.id}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeatureClick(feature)}
                  className={cn(
                    "w-full justify-start h-10 px-3 hover:bg-accent/50",
                    collapsed && "px-2 justify-center"
                  )}
                  title={collapsed ? feature.title : undefined}
                >
                  <feature.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="ml-3 text-sm">{feature.title}</span>
                      {feature.subFeatures && (
                        <ChevronRight className={cn(
                          "ml-auto h-4 w-4 transition-transform shrink-0",
                          expandedFeature === feature.id && "rotate-90"
                        )} />
                      )}
                    </>
                  )}
                </Button>
                
                {/* Sub-features */}
                {!collapsed && feature.subFeatures && expandedFeature === feature.id && (
                  <div className="ml-6 mt-1 space-y-1">
                    {feature.subFeatures.map((subFeature) => (
                      <Button
                        key={subFeature.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => onFeatureClick?.(subFeature.action)}
                        className="w-full justify-start h-8 px-3 text-xs hover:bg-accent/30"
                      >
                        <span>{subFeature.title}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat History */}
        {!collapsed && (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-muted-foreground">Recent Chats</h2>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-8 bg-background/50 border-border"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredSessions.map((session, index) => (
                  <div
                    key={session.id}
                    className={cn(
                      "group relative p-3 rounded-lg cursor-pointer transition-all hover:bg-accent/50",
                      index === 0 && "bg-accent/30"
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
                            <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
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
                          className="h-6 w-6 p-0 hover:bg-accent"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Pin className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
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
        )}

        {/* Bottom Actions */}
        <div className={cn("border-t border-border p-4", collapsed && "px-2")}>
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "w-full justify-start h-9 hover:bg-accent/50",
                collapsed ? "justify-center px-2" : "px-3"
              )}
              title={collapsed ? "Settings" : undefined}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="ml-3 text-sm">Settings</span>}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={signOut}
              className={cn(
                "w-full justify-start h-9 text-destructive hover:text-destructive hover:bg-destructive/10",
                collapsed ? "justify-center px-2" : "px-3"
              )}
              title={collapsed ? "Sign Out" : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="ml-3 text-sm">Sign Out</span>}
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}