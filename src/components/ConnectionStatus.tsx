import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ConnectionStatus = () => {
  const { isOnline, isChecking, error, checkConnection } = useConnectionStatus();

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-3 w-3 animate-spin" />;
    }
    return isOnline ? (
      <CheckCircle2 className="h-3 w-3" />
    ) : (
      <AlertCircle className="h-3 w-3" />
    );
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    return isOnline ? 'Online' : 'Offline';
  };

  const getStatusColor = () => {
    if (isChecking) return 'secondary';
    return isOnline ? 'default' : 'destructive';
  };

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={getStatusColor()}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1",
          isOnline && "bg-success text-success-foreground",
          !isOnline && !isChecking && "bg-destructive text-destructive-foreground"
        )}
      >
        {getStatusIcon()}
        <span className="text-xs font-medium">{getStatusText()}</span>
      </Badge>
      
      {!isOnline && !isChecking && (
        <Button
          size="sm"
          variant="outline"
          onClick={checkConnection}
          className="h-6 px-2 text-xs"
        >
          Retry
        </Button>
      )}
      
      {error && !isOnline && (
        <span className="text-xs text-muted-foreground truncate max-w-48">
          {error}
        </span>
      )}
    </div>
  );
};