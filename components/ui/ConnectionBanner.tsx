import React, { useState, useEffect, useRef } from 'react';
import { WifiOff, CheckCircle2, RefreshCw } from 'lucide-react';
import { useSupabaseStatus } from '../../lib/SupabaseStatusContext';
import { Button } from './LayoutComponents';

export default function ConnectionBanner() {
  const { status, checkNow } = useSupabaseStatus();
  const [checking, setChecking] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const prevStatusRef = useRef(status);

  // Detect transition from disconnected to connected
  useEffect(() => {
    if (prevStatusRef.current === 'disconnected' && status === 'connected') {
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = status;
  }, [status]);

  const handleRetry = async () => {
    setChecking(true);
    await checkNow();
    setChecking(false);
  };

  // Success banner (reconnected)
  if (showReconnected) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="sticky top-0 z-50 bg-success/15 border-b border-success/30 px-4 md:px-8 lg:px-12 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <CheckCircle2 className="size-5 text-success shrink-0" />
        <p className="text-sm font-medium text-foreground">
          Conexao restabelecida. O sistema esta funcionando normalmente.
        </p>
      </div>
    );
  }

  // Warning banner (disconnected)
  if (status === 'disconnected') {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="sticky top-0 z-50 bg-warning/15 border-b border-warning/30 px-4 md:px-8 lg:px-12 py-3 animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <WifiOff className="size-5 text-warning shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                Banco de dados indisponivel
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                O sistema nao consegue se conectar ao servidor. Novos registros nao serao salvos.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={checking}
            className="shrink-0 h-8 text-xs self-end sm:self-center"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${checking ? 'animate-spin' : ''}`} />
            {checking ? 'Verificando...' : 'Tentar novamente'}
          </Button>
        </div>
      </div>
    );
  }

  // Connected or checking: render nothing
  return null;
}
