import React, { useState } from 'react';
import { ChatWindow, Message } from '@/components/ChatWindow';
import { Composer } from '@/components/Composer';
import { SidebarHistory, ChatHistory } from '@/components/SidebarHistory';
import { CommandCard } from '@/components/CommandCard';
import { SettingsModal } from '@/components/SettingsModal';
import { useToast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hello! How can I help you today?',
    isOutgoing: false,
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    status: 'delivered'
  },
  {
    id: '2',
    content: 'I need help creating a modern web application with React and TypeScript. Can you guide me through the best practices?',
    isOutgoing: true,
    timestamp: new Date(Date.now() - 9 * 60 * 1000),
    status: 'delivered'
  },
  {
    id: '3',
    content: 'Absolutely! I\'d be happy to help you create a modern web application. Here are the key best practices to follow:\n\n1. **Project Structure**: Organize your code with clear separation of concerns\n2. **TypeScript**: Use strict typing for better development experience\n3. **State Management**: Choose appropriate state management solutions\n4. **Testing**: Implement comprehensive testing strategies\n5. **Performance**: Optimize for loading times and user experience\n\nWhich specific area would you like to dive deeper into?',
    isOutgoing: false,
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    status: 'delivered'
  },
  {
    id: '4',
    content: 'Could you elaborate on the project structure part? What\'s the recommended folder organization?',
    isOutgoing: true,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'delivered'
  }
];

const mockChatHistory: ChatHistory[] = [
  {
    id: '1',
    title: 'React Best Practices',
    lastMessage: 'Could you elaborate on the project structure part?',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isPinned: true,
    isActive: true
  },
  {
    id: '2',
    title: 'TypeScript Configuration',
    lastMessage: 'Thanks for the detailed explanation!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isPinned: false,
    isActive: false
  },
  {
    id: '3',
    title: 'API Integration Guide',
    lastMessage: 'What about error handling in async operations?',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isPinned: true,
    isActive: false
  },
  {
    id: '4',
    title: 'UI Component Design',
    lastMessage: 'The component looks great!',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isPinned: false,
    isActive: false
  },
  {
    id: '5',
    title: 'Database Schema Design',
    lastMessage: 'Should I use SQL or NoSQL for this project?',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    isPinned: false,
    isActive: false
  }
];

const Index = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>(mockChatHistory);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: false,
    autoSave: true,
    compactMode: false,
    developerMode: false
  });
  const { toast } = useToast();

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isOutgoing: true,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate message sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
        )
      );

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `I understand you're asking about: "${content}". Let me provide you with a comprehensive response to help you with this topic.`,
          isOutgoing: false,
          timestamp: new Date(),
          status: 'delivered'
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }, 500);
  };

  const handleChatSelect = (chatId: string) => {
    setChatHistory(prev => 
      prev.map(chat => ({ ...chat, isActive: chat.id === chatId }))
    );
    toast({
      title: "Chat Selected",
      description: `Switched to chat: ${chatHistory.find(c => c.id === chatId)?.title}`,
    });
  };

  const handlePinToggle = (chatId: string) => {
    setChatHistory(prev => 
      prev.map(chat => 
        chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
      )
    );
  };

  const handleCommandExecute = (commandId: string) => {
    switch (commandId) {
      case 'settings':
        setIsSettingsOpen(true);
        break;
      case 'new-chat':
        setMessages([]);
        toast({ title: "New Chat", description: "Started a fresh conversation" });
        break;
      case 'export-chat':
        toast({ title: "Export", description: "Chat export feature coming soon!" });
        break;
      default:
        toast({ title: "Command", description: `Executed: ${commandId}` });
    }
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleExportData = () => {
    toast({ title: "Export", description: "Data export initiated" });
    setIsSettingsOpen(false);
  };

  const handleClearHistory = () => {
    setChatHistory([]);
    setMessages([]);
    toast({ title: "Cleared", description: "Chat history has been cleared" });
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg text-foreground">
      {/* Main Layout Grid */}
      <div className="h-screen grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        
        {/* Left Sidebar - Chat History */}
        <div className="lg:col-span-3 xl:col-span-2">
          <SidebarHistory
            chatHistory={chatHistory}
            onChatSelect={handleChatSelect}
            onPinToggle={handlePinToggle}
          />
        </div>

        {/* Center - Chat Area */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-4">
          <div className="flex-1">
            <ChatWindow messages={messages} />
          </div>
          <Composer 
            onSendMessage={handleSendMessage}
            onMicClick={() => toast({ title: "Voice", description: "Voice recording feature coming soon!" })}
            onAttachClick={() => toast({ title: "Attachment", description: "File attachment feature coming soon!" })}
          />
        </div>

        {/* Right Sidebar - Command Center */}
        <div className="lg:col-span-3 xl:col-span-3">
          <CommandCard onCommandExecute={handleCommandExecute} />
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingChange={handleSettingChange}
        onExportData={handleExportData}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
};

export default Index;