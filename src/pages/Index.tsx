import { ChatHistory } from '@/components/ChatHistory';
import { ChatInterface } from '@/components/ChatInterface';
import { CommandCenter } from '@/components/CommandCenter';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { ConnectionIssueAlert } from '@/components/ConnectionIssueAlert';

const Index = () => {
  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Chat History */}
      <div className="w-80 shrink-0">
        <ChatHistory />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-card px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold gradient-text">OSKY AI</h1>
              <p className="text-sm text-muted-foreground">Advanced AI Assistant</p>
            </div>
            <ConnectionStatus />
          </div>
        </div>

        {/* Connection Issue Alert */}
        <ConnectionIssueAlert />

        {/* Chat Interface */}
        <div className="flex-1">
          <ChatInterface />
        </div>
      </div>

      {/* Right Sidebar - Command Center */}
      <div className="w-80 shrink-0">
        <CommandCenter />
      </div>
    </div>
  );
};

export default Index;
