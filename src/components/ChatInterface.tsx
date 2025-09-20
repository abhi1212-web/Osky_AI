import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Square, Image, Code, FileText, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { APIService } from '@/config/api';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
  type?: 'text' | 'image' | 'file' | 'code';
  metadata?: any;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { isOnline } = useConnectionStatus();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!isOnline) {
      toast({
        title: "Connection Error",
        description: "Unable to send message. Backend is offline.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await APIService.sendChatMessage(
        userMessage.content,
        messages.map(m => ({ role: m.role, content: m.content }))
      );

      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: response.response || 'No response received', isLoading: false }
          : msg
      ));
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isLoading: false }
          : msg
      ));
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!isOnline) {
      toast({
        title: "Connection Error",
        description: "Voice input requires an active connection.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const audioChunks: BlobPart[] = [];

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          
          setIsLoading(true);
          try {
            const response = await APIService.processVoice(audioBlob);
            
            // Add user message with transcription
            const userMessage: Message = {
              id: Date.now().toString(),
              content: response.transcription,
              role: 'user',
              timestamp: new Date(),
              type: 'text'
            };

            // Add AI response
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              content: response.response,
              role: 'assistant',
              timestamp: new Date(),
              type: 'text',
              metadata: { audio: response.audio }
            };

            setMessages(prev => [...prev, userMessage, aiMessage]);

            // Play AI response audio
            if (response.audio) {
              const audio = new Audio(response.audio);
              audio.play().catch(console.error);
            }

          } catch (error) {
            console.error('Voice processing error:', error);
            toast({
              title: "Voice Error",
              description: "Failed to process voice input.",
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
            stream.getTracks().forEach(track => track.stop());
          }
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);

        toast({
          title: "Recording",
          description: "Speak now... Click the microphone again to stop.",
        });

      } catch (error) {
        console.error('Microphone error:', error);
        toast({
          title: "Microphone Error",
          description: "Unable to access microphone. Please check permissions.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isOnline) {
      toast({
        title: "Connection Error",
        description: "File upload requires an active connection.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Upload file
      const uploadResponse = await APIService.uploadFile(file);
      
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: `Uploaded file: ${file.name}`,
        role: 'user',
        timestamp: new Date(),
        type: 'file',
        metadata: uploadResponse.file
      };

      setMessages(prev => [...prev, userMessage]);

      // Analyze document if it's a supported type
      if (file.type.includes('text') || file.type.includes('pdf') || file.type.includes('document')) {
        const analysisResponse = await APIService.analyzeDocument(uploadResponse.file.id);
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `File Analysis:\n\nSummary: ${analysisResponse.analysis.summary}\n\nTopics: ${analysisResponse.analysis.topics.join(', ')}\n\nLanguage: ${analysisResponse.analysis.language}\n\nWord Count: ${analysisResponse.analysis.wordCount}`,
          role: 'assistant',
          timestamp: new Date(),
          type: 'text',
          metadata: analysisResponse.analysis
        };

        setMessages(prev => [...prev, aiMessage]);
      }

      toast({
        title: "Success",
        description: "File uploaded successfully!",
      });

    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  const handleImageGeneration = async () => {
    const prompt = window.prompt('Enter image prompt:');
    if (!prompt) return;

    if (!isOnline) {
      toast({
        title: "Connection Error",
        description: "Image generation requires an active connection.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Generate image: ${prompt}`,
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: 'Generating image...',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await APIService.generateImage(prompt);
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { 
              ...msg, 
              content: `Generated image: ${response.revisedPrompt}`, 
              isLoading: false,
              type: 'image',
              metadata: { imageUrl: response.imageUrl, prompt: response.revisedPrompt }
            }
          : msg
      ));

      toast({
        title: "Success",
        description: "Image generated successfully!",
      });

    } catch (error) {
      console.error('Image generation error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: 'Failed to generate image. Please try again.', isLoading: false }
          : msg
      ));
      
      toast({
        title: "Generation Error",
        description: "Failed to generate image.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeGeneration = async () => {
    const prompt = window.prompt('Enter code generation prompt:');
    if (!prompt) return;
    
    const language = window.prompt('Programming language (default: javascript):', 'javascript') || 'javascript';

    if (!isOnline) {
      toast({
        title: "Connection Error",
        description: "Code generation requires an active connection.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: `Generate ${language} code: ${prompt}`,
      role: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: 'Generating code...',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setIsLoading(true);

    try {
      const response = await APIService.generateCode(prompt, language);
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { 
              ...msg, 
              content: response.code, 
              isLoading: false,
              type: 'code',
              metadata: { language: response.language }
            }
          : msg
      ));

      toast({
        title: "Success",
        description: "Code generated successfully!",
      });

    } catch (error) {
      console.error('Code generation error:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { ...msg, content: 'Failed to generate code. Please try again.', isLoading: false }
          : msg
      ));
      
      toast({
        title: "Generation Error",
        description: "Failed to generate code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <h3 className="text-lg font-semibold mb-2">Welcome to OSKY AI</h3>
                <p>Start a conversation by typing your message below.</p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 chat-message-animate",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                  message.role === 'user'
                    ? "bg-chat-bubble-user text-primary-foreground ml-auto"
                    : "bg-chat-bubble-ai border"
                )}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-current rounded-full typing-indicator"></div>
                      <div className="w-2 h-2 bg-current rounded-full typing-indicator" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full typing-indicator" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-xs opacity-70">Thinking...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">
                    {message.type === 'image' && message.metadata?.imageUrl && (
                      <div className="mb-2">
                        <img 
                          src={message.metadata.imageUrl} 
                          alt={message.metadata.prompt || 'Generated image'}
                          className="max-w-sm rounded-lg"
                        />
                      </div>
                    )}
                    {message.type === 'code' ? (
                      <pre className="bg-muted p-3 rounded-md overflow-x-auto">
                        <code className={`language-${message.metadata?.language || 'javascript'}`}>
                          {message.content}
                        </code>
                      </pre>
                    ) : (
                      message.content
                    )}
                    {message.metadata?.audio && (
                      <div className="mt-2">
                        <audio controls className="w-full max-w-xs">
                          <source src={message.metadata.audio} type="audio/mp3" />
                        </audio>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                    You
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card p-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          accept="*/*"
        />
        
        {showFeatures && (
          <div className="flex gap-2 mb-3 p-2 bg-muted rounded-md">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleImageGeneration}
              disabled={isLoading || !isOnline}
              className="flex items-center gap-1"
            >
              <Image className="h-4 w-4" />
              Generate Image
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCodeGeneration}
              disabled={isLoading || !isOnline}
              className="flex items-center gap-1"
            >
              <Code className="h-4 w-4" />
              Generate Code
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || !isOnline}
              className="flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              Analyze Document
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[44px] max-h-32 resize-none pr-12"
              disabled={isLoading || !isOnline}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="absolute right-2 top-2 h-8 w-8 p-0"
              onClick={() => setShowFeatures(!showFeatures)}
              disabled={isLoading || !isOnline}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={cn(
                "h-11 w-11 p-0",
                isRecording && "bg-red-500 text-white hover:bg-red-600"
              )}
              onClick={handleVoiceInput}
              disabled={isLoading || !isOnline}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              type="submit"
              size="sm"
              className="h-11 w-11 p-0"
              disabled={isLoading || !input.trim() || !isOnline}
            >
              {isLoading ? (
                <Square className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};