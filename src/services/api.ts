// API service for connecting to OSKY AI backend
import { API_CONFIG } from '@/config/api';

export interface ApiMessage {
  id: string;
  content: string;
  isOutgoing: boolean;
  timestamp: string;
  status: 'sending' | 'delivered' | 'sent' | 'error';
}

export interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  isPinned: boolean;
  isActive: boolean;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Send message to OSKY AI and get response
  async sendMessage(message: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.reply || 'No response received';
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message. Please check your connection.');
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'health check',
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();