import { useState } from 'react';
import { 
  Search, 
  Copy, 
  Plus, 
  Download, 
  Upload, 
  Code, 
  Image, 
  FileText, 
  Settings,
  Keyboard,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { APIService } from '@/config/api';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
  category: 'actions' | 'tools' | 'media' | 'settings';
  disabled?: boolean;
}

export const CommandCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { isOnline } = useConnectionStatus();

  const commands: CommandItem[] = [
    // Quick Actions
    {
      id: 'search',
      label: 'Quick Search',
      description: 'Search through chat history',
      icon: <Search className="h-4 w-4" />,
      shortcut: 'Ctrl+K',
      category: 'actions',
      action: () => {
        toast({ title: "Search", description: "Opening search..." });
      }
    },
    {
      id: 'copy',
      label: 'Copy Last Response',
      description: 'Copy the last AI response',
      icon: <Copy className="h-4 w-4" />,
      shortcut: 'Ctrl+C',
      category: 'actions',
      action: () => {
        toast({ title: "Copied", description: "Last response copied to clipboard" });
      }
    },
    {
      id: 'new-chat',
      label: 'New Chat',
      description: 'Start a fresh conversation',
      icon: <Plus className="h-4 w-4" />,
      shortcut: 'Ctrl+N',
      category: 'actions',
      action: () => {
        toast({ title: "New Chat", description: "Starting fresh conversation..." });
      }
    },

    // Tools
    {
      id: 'export',
      label: 'Export Chat',
      description: 'Download chat as file',
      icon: <Download className="h-4 w-4" />,
      category: 'tools',
      action: () => {
        toast({ title: "Export", description: "Preparing chat export..." });
      }
    },
    {
      id: 'import',
      label: 'Import File',
      description: 'Upload and analyze file',
      icon: <Upload className="h-4 w-4" />,
      category: 'tools',
      disabled: !isOnline,
      action: async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.pdf,.doc,.docx';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            try {
              await APIService.uploadFile(file);
              toast({ title: "Success", description: `${file.name} uploaded successfully` });
            } catch (error) {
              toast({ 
                title: "Error", 
                description: "Failed to upload file",
                variant: "destructive"
              });
            }
          }
        };
        input.click();
      }
    },
    {
      id: 'code-gen',
      label: 'Code Generation',
      description: 'Generate code snippets',
      icon: <Code className="h-4 w-4" />,
      category: 'tools',
      disabled: !isOnline,
      action: () => {
        toast({ title: "Code Generation", description: "Opening code generator..." });
      }
    },

    // Media
    {
      id: 'image-gen',
      label: 'Image Creation',
      description: 'Generate AI images',
      icon: <Image className="h-4 w-4" />,
      category: 'media',
      disabled: !isOnline,
      action: () => {
        toast({ title: "Image Generation", description: "Opening image creator..." });
      }
    },
    {
      id: 'doc-analysis',
      label: 'Document Analysis',
      description: 'Analyze text documents',
      icon: <FileText className="h-4 w-4" />,
      category: 'media',
      disabled: !isOnline,
      action: () => {
        toast({ title: "Document Analysis", description: "Opening document analyzer..." });
      }
    },

    // Settings
    {
      id: 'settings',
      label: 'Settings',
      description: 'Configure preferences',
      icon: <Settings className="h-4 w-4" />,
      category: 'settings',
      action: () => {
        toast({ title: "Settings", description: "Opening settings panel..." });
      }
    }
  ];

  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    command.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCommands = {
    actions: filteredCommands.filter(cmd => cmd.category === 'actions'),
    tools: filteredCommands.filter(cmd => cmd.category === 'tools'),
    media: filteredCommands.filter(cmd => cmd.category === 'media'),
    settings: filteredCommands.filter(cmd => cmd.category === 'settings'),
  };

  return (
    <div className="flex flex-col h-full bg-card border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Command Center</h2>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Commands */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Quick Actions */}
          {groupedCommands.actions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
              <div className="space-y-1">
                {groupedCommands.actions.map((command) => (
                  <Button
                    key={command.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-3",
                      command.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={command.action}
                    disabled={command.disabled}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="shrink-0 text-muted-foreground">
                        {command.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{command.label}</div>
                        <div className="text-xs text-muted-foreground">{command.description}</div>
                      </div>
                      {command.shortcut && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Keyboard className="h-3 w-3" />
                          <span>{command.shortcut}</span>
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {groupedCommands.actions.length > 0 && (groupedCommands.tools.length > 0 || groupedCommands.media.length > 0) && (
            <Separator />
          )}

          {/* Tools */}
          {groupedCommands.tools.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tools</h3>
              <div className="space-y-1">
                {groupedCommands.tools.map((command) => (
                  <Button
                    key={command.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-3",
                      command.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={command.action}
                    disabled={command.disabled}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="shrink-0 text-muted-foreground">
                        {command.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{command.label}</div>
                        <div className="text-xs text-muted-foreground">{command.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {groupedCommands.tools.length > 0 && groupedCommands.media.length > 0 && (
            <Separator />
          )}

          {/* Media */}
          {groupedCommands.media.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Media</h3>
              <div className="space-y-1">
                {groupedCommands.media.map((command) => (
                  <Button
                    key={command.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-3",
                      command.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={command.action}
                    disabled={command.disabled}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="shrink-0 text-muted-foreground">
                        {command.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{command.label}</div>
                        <div className="text-xs text-muted-foreground">{command.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {groupedCommands.media.length > 0 && groupedCommands.settings.length > 0 && (
            <Separator />
          )}

          {/* Settings */}
          {groupedCommands.settings.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Settings</h3>
              <div className="space-y-1">
                {groupedCommands.settings.map((command) => (
                  <Button
                    key={command.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-3",
                      command.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={command.action}
                    disabled={command.disabled}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="shrink-0 text-muted-foreground">
                        {command.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{command.label}</div>
                        <div className="text-xs text-muted-foreground">{command.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};