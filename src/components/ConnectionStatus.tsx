import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  className = ""
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
        isConnected 
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
          : "bg-red-500/10 text-red-400 border border-red-500/20",
        className
      )}
    >
      <motion.div
        animate={isConnected ? { rotate: 0 } : { rotate: 180 }}
        transition={{ duration: 0.3 }}
      >
        {isConnected ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
      </motion.div>
      <span>
        {isConnected ? 'Connected' : 'Offline'}
      </span>
    </motion.div>
  );
};