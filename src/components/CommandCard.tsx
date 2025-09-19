import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  Settings, 
  Download, 
  Upload, 
  Copy, 
  Search, 
  Terminal, 
  FileText,
  Code,
  Image,
  Music,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  category: 'quick' | 'tools' | 'media' | 'settings';
}

interface CommandCardProps {
  commands?: Command[];
  onCommandExecute: (commandId: string) => void;
  className?: string;
}

const defaultCommands: Command[] = [
  {
    id: 'quick-search',
    title: 'Quick Search',
    description: 'Search through chat history',
    icon: Search,
    shortcut: 'Ctrl+K',
    category: 'quick'
  },
  {
    id: 'copy-last',
    title: 'Copy Last Response',
    description: 'Copy the last AI response',
    icon: Copy,
    shortcut: 'Ctrl+C',
    category: 'quick'
  },
  {
    id: 'new-chat',
    title: 'New Chat',
    description: 'Start a fresh conversation',
    icon: Zap,
    shortcut: 'Ctrl+N',
    category: 'quick'
  },
  {
    id: 'export-chat',
    title: 'Export Chat',
    description: 'Download chat as file',
    icon: Download,
    category: 'tools'
  },
  {
    id: 'import-file',
    title: 'Import File',
    description: 'Upload and analyze file',
    icon: Upload,
    category: 'tools'
  },
  {
    id: 'code-gen',
    title: 'Code Generation',
    description: 'Generate code snippets',
    icon: Code,
    category: 'tools'
  },
  {
    id: 'image-gen',
    title: 'Image Creation',
    description: 'Generate AI images',
    icon: Image,
    category: 'media'
  },
  {
    id: 'text-doc',
    title: 'Document Analysis',
    description: 'Analyze text documents',
    icon: FileText,
    category: 'media'
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Configure preferences',
    icon: Settings,
    category: 'settings'
  }
];

export const CommandCard: React.FC<CommandCardProps> = ({
  commands = defaultCommands,
  onCommandExecute,
  className = ""
}) => {
  const categories = {
    quick: 'Quick Actions',
    tools: 'Tools',
    media: 'Media',
    settings: 'Settings'
  };

  const groupedCommands = commands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  return (
    <div className={cn("glass-card h-full flex flex-col", className)}>
      <div className="p-4 border-b border-glass-border">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Terminal className="h-5 w-5 text-accent" />
          Command Center
        </h2>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {Object.entries(categories).map(([categoryKey, categoryTitle]) => {
            const categoryCommands = groupedCommands[categoryKey] || [];
            if (categoryCommands.length === 0) return null;

            return (
              <div key={categoryKey}>
                <h3 className="text-sm font-medium text-muted mb-3">
                  {categoryTitle}
                </h3>
                <div className="space-y-2">
                  {categoryCommands.map((command) => (
                    <Button
                      key={command.id}
                      variant="ghost"
                      onClick={() => onCommandExecute(command.id)}
                      className={cn(
                        "w-full justify-start p-3 h-auto group",
                        "hover:bg-glass-bg hover:border-glass-border border border-transparent",
                        "transition-all duration-200"
                      )}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <command.icon className="h-5 w-5 text-accent shrink-0 mt-0.5 group-hover:text-accent-glow transition-colors" />
                        <div className="flex-1 text-left">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">
                              {command.title}
                            </span>
                            {command.shortcut && (
                              <span className="text-xs text-muted font-mono bg-glass-bg px-2 py-1 rounded">
                                {command.shortcut}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted text-left">
                            {command.description}
                          </p>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};