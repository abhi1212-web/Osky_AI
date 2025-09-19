import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Paperclip, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ComposerProps {
  onSendMessage: (message: string) => void;
  onMicClick?: () => void;
  onAttachClick?: () => void;
  className?: string;
  placeholder?: string;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  onMicClick,
  onAttachClick,
  className = "",
  placeholder = "Type your message..."
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    setIsRecording(!isRecording);
    onMicClick?.();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass-card p-4", className)}
    >
      <div className="flex items-end gap-3">
        {/* Attachment Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onAttachClick}
            className="text-muted hover:text-accent hover:bg-glass-bg transition-colors shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "min-h-[44px] max-h-32 resize-none bg-input border-border text-foreground",
              "placeholder:text-muted focus:ring-2 focus:ring-accent focus:border-accent",
              "pr-12 rounded-lg transition-all duration-200"
            )}
            rows={1}
          />
          
          {/* Character count or status */}
          {message.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 bottom-2 text-xs text-muted"
            >
              {message.length}
            </motion.div>
          )}
        </div>

        {/* Mic Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMicClick}
            className={cn(
              "shrink-0 transition-all duration-200",
              isRecording 
                ? "text-destructive hover:text-destructive bg-destructive/10 glow-secondary" 
                : "text-muted hover:text-secondary hover:bg-glass-bg"
            )}
          >
            <motion.div
              animate={isRecording ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ repeat: isRecording ? Infinity : 0, duration: 1 }}
            >
              <Mic className="h-5 w-5" />
            </motion.div>
          </Button>
        </motion.div>

        {/* Send Button */}
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          animate={message.trim() ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        >
          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            className={cn(
              "shrink-0 bg-accent hover:bg-accent-glow text-black font-medium",
              "transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
              message.trim() && "glow-accent"
            )}
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};