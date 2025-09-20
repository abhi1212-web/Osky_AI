import { useState, useEffect } from 'react';
import { APIService } from '@/config/api';

export interface ConnectionStatus {
  isOnline: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export const useConnectionStatus = (checkInterval: number = 30000) => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: false,
    isChecking: true,
    lastChecked: null,
    error: null,
  });

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, isChecking: true, error: null }));
    
    try {
      const isHealthy = await APIService.checkHealth();
      setStatus({
        isOnline: isHealthy,
        isChecking: false,
        lastChecked: new Date(),
        error: isHealthy ? null : 'Backend is not responding',
      });
    } catch (error) {
      setStatus({
        isOnline: false,
        isChecking: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Connection failed',
      });
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Set up interval for periodic checks
    const interval = setInterval(checkConnection, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval]);

  return {
    ...status,
    checkConnection,
  };
};