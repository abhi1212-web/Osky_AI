import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useState } from 'react';

export const ConnectionIssueAlert = () => {
  const { isOnline, error, checkConnection } = useConnectionStatus();
  const [isDismissed, setIsDismissed] = useState(false);

  if (isOnline || isDismissed) {
    return null;
  }

  return (
    <Alert className="m-4 border-destructive bg-destructive/10">
      <AlertTriangle className="h-4 w-4 text-destructive" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong>Connection Issue</strong>
          <br />
          Unable to connect to OSKY AI backend. Using offline mode.
          {error && (
            <div className="text-xs text-muted-foreground mt-1">
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            size="sm"
            variant="outline"
            onClick={checkConnection}
            className="h-8"
          >
            Retry
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};