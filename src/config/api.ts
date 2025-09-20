// API Configuration for OSKY AI Backend - Supabase Edge Functions
export const API_CONFIG = {
  BASE_URL: 'https://diyfbqglbrxwcsrhosqe.supabase.co/functions/v1',
  ENDPOINTS: {
    CHAT: '/chat',
    GENERATE_IMAGE: '/generate-image',
    UPLOAD_FILE: '/upload-file',
    ANALYZE_DOCUMENT: '/analyze-document',
    CODE_GENERATION: '/code-generation',
    VOICE_ASSISTANT: '/voice-assistant',
    HEALTH: '/health'
  },
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3
};

export class APIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'APIError';
  }
}

// API service class with error handling and retries
export class APIService {
  private static async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeWZicWdsYnJ4d2Nzcmhvc3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDY2NzYsImV4cCI6MjA3Mzg4MjY3Nn0.b8cSycXNeUXkUKB7CAJ-7nZ-zgevz45UGoDHh6u5UaM',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeWZicWdsYnJ4d2Nzcmhvc3FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDY2NzYsImV4cCI6MjA3Mzg4MjY3Nn0.b8cSycXNeUXkUKB7CAJ-7nZ-zgevz45UGoDHh6u5UaM',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (retryCount < API_CONFIG.RETRY_ATTEMPTS && error instanceof APIError && error.statusCode !== 400) {
        console.warn(`Request failed, retrying... (${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  static async checkHealth(): Promise<boolean> {
    try {
      await this.makeRequest(API_CONFIG.ENDPOINTS.HEALTH);
      return true;
    } catch {
      return false;
    }
  }

  static async sendChatMessage(message: string, chatHistory: any[] = []): Promise<any> {
    const response = await this.makeRequest(API_CONFIG.ENDPOINTS.CHAT, {
      method: 'POST',
      body: JSON.stringify({
        message,
        history: chatHistory,
      }),
    });

    return response.json();
  }

  static async generateImage(prompt: string, options: any = {}): Promise<any> {
    const response = await this.makeRequest(API_CONFIG.ENDPOINTS.GENERATE_IMAGE, {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        ...options,
      }),
    });

    return response.json();
  }

  static async uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.makeRequest(API_CONFIG.ENDPOINTS.UPLOAD_FILE, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });

    return response.json();
  }

  static async analyzeDocument(fileId: string): Promise<any> {
    const response = await this.makeRequest(API_CONFIG.ENDPOINTS.ANALYZE_DOCUMENT, {
      method: 'POST',
      body: JSON.stringify({ fileId }),
    });

    return response.json();
  }

  static async generateCode(prompt: string, language: string = 'javascript'): Promise<any> {
    const response = await this.makeRequest(API_CONFIG.ENDPOINTS.CODE_GENERATION, {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        language,
      }),
    });

    return response.json();
  }

  static async processVoice(audioBlob: Blob): Promise<any> {
    // Convert blob to base64
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const response = await this.makeRequest(API_CONFIG.ENDPOINTS.VOICE_ASSISTANT, {
            method: 'POST',
            body: JSON.stringify({
              audio: reader.result as string,
              action: 'transcribe'
            }),
          });
          resolve(response.json());
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  }

  static async textToSpeech(text: string): Promise<any> {
    const response = await this.makeRequest(API_CONFIG.ENDPOINTS.VOICE_ASSISTANT, {
      method: 'POST',
      body: JSON.stringify({
        text,
        action: 'speak'
      }),
    });

    return response.json();
  }
}