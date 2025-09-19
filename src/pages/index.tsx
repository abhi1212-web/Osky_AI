import React, { useState } from 'react';
import { ChatWindow } from '@/components/ChatWindow';
import { Composer } from '@/components/Composer';
import { SidebarHistory } from '@/components/SidebarHistory';
import { CommandCard } from '@/components/CommandCard';
import { SettingsModal } from '@/components/SettingsModal';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { useToast } from '@/hooks/use-toast';
import { useApiChat } from '@/hooks/useApiChat';

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: false,
    autoSave: true,
    compactMode: false,
    developerMode: false
  });
  const { toast } = useToast();
  
  const {
    messages,
    chatHistory,
    isLoading,
    isConnected,
    handleSendMessage,
    handleChatSelect,
    handlePinToggle,
    handleNewChat,
  } = useApiChat();

  // Handle command execution

  const handleCommandExecute = (commandId: string) => {
    switch (commandId) {
      case 'settings':
        setIsSettingsOpen(true);
        break;
      case 'new-chat':
        handleNewChat();
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
    // This would need to be implemented in the API service
    toast({ title: "Clear History", description: "Feature coming soon!" });
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen bg-bg text-foreground">
      {/* Connection Status Bar */}
      <div className="fixed top-4 right-4 z-50">
        <ConnectionStatus isConnected={isConnected} />
      </div>

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