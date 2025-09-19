import { useState, useEffect, useCallback } from 'react';
import { apiService, ApiMessage, ChatSession } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  content: string;
  isOutgoing: boolean;
  timestamp: Date;
  status: 'sending' | 'delivered' | 'sent' | 'error';
}

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  isPinned: boolean;
  isActive: boolean;
}

export const useApiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('1');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const { toast } = useToast();

  // Check API connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await apiService.healthCheck();
      setIsConnected(connected);
      if (!connected) {
        toast({
          title: "Connection Issue",
          description: "Unable to connect to OSKY AI backend. Using offline mode.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connected",
          description: "Successfully connected to OSKY AI backend.",
        });
      }
    };
    checkConnection();
  }, [toast]);

  // Load initial mock chat history for UI demonstration
  useEffect(() => {
    const mockChatHistory: ChatHistory[] = [
      {
        id: '1',
        title: 'OSKY AI Chat',
        lastMessage: 'Chat with OSKY AI',
        timestamp: new Date(),
        isPinned: true,
        isActive: true
      }
    ];
    setChatHistory(mockChatHistory);
    setCurrentChatId('1');
  }, []);

  // Send message
  const handleSendMessage = useCallback(async (content: string) => {
    const tempId = Date.now().toString();
    const newMessage: Message = {
      id: tempId,
      content,
      isOutgoing: true,
      timestamp: new Date(),
      status: 'sending'
    };

    // Add message to UI immediately
    setMessages(prev => [...prev, newMessage]);

    if (!isConnected) {
      // Offline mode - simulate response
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === tempId ? { ...msg, status: 'error' } : msg
          )
        );
        toast({
          title: "Offline Mode",
          description: "Cannot send messages while offline",
          variant: "destructive",
        });
      }, 1000);
      return;
    }

    try {
      // Send to OSKY AI API
      const aiReply = await apiService.sendMessage(content);
      
      // Update message status to delivered
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? { ...msg, status: 'delivered' } : msg
        )
      );

      // Add AI response
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: aiReply,
        isOutgoing: false,
        timestamp: new Date(),
        status: 'delivered'
      };

      setMessages(prev => [...prev, aiResponse]);

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Update message status to failed
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? { ...msg, status: 'error' } : msg
        )
      );

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }, [isConnected, toast]);

  // Select chat (simplified for single chat)
  const handleChatSelect = useCallback((chatId: string) => {
    setChatHistory(prev => 
      prev.map(chat => ({ ...chat, isActive: chat.id === chatId }))
    );
    setCurrentChatId(chatId);
    
    const selectedChat = chatHistory.find(c => c.id === chatId);
    toast({
      title: "Chat Selected",
      description: `Switched to: ${selectedChat?.title}`,
    });
  }, [chatHistory, toast]);

  // Toggle pin (simplified for UI only)
  const handlePinToggle = useCallback((chatId: string) => {
    setChatHistory(prev => 
      prev.map(chat => 
        chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
      )
    );
  }, []);

  // Create new chat (simplified)
  const handleNewChat = useCallback(() => {
    setMessages([]);
    toast({ title: "New Chat", description: "Started a new conversation with OSKY AI" });
  }, [toast]);

  return {
    messages,
    chatHistory,
    currentChatId,
    isLoading,
    isConnected,
    handleSendMessage,
    handleChatSelect,
    handlePinToggle,
    handleNewChat,
  };
};