import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { checkSupabaseHealth, HEALTH_CHECK_INTERVAL_CONNECTED, HEALTH_CHECK_INTERVAL_DISCONNECTED, MAX_BACKOFF, FAILURE_THRESHOLD } from './supabaseHealth';
import type { ConnectionStatus } from '../types';

interface SupabaseStatusContextValue {
  status: ConnectionStatus;
  lastChecked: Date | null;
  checkNow: () => Promise<void>;
  reportSuccess: () => void;
  reportConnectionError: () => void;
}

const SupabaseStatusContext = createContext<SupabaseStatusContextValue | null>(null);

export function SupabaseStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const consecutiveFailures = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const disconnectedAtRef = useRef<number | null>(null);

  const getPollingInterval = useCallback(() => {
    if (status === 'disconnected') {
      if (!disconnectedAtRef.current) return HEALTH_CHECK_INTERVAL_DISCONNECTED;
      const elapsed = Date.now() - disconnectedAtRef.current;
      // Backoff: 30s for first 3min, then 60s, then 120s
      if (elapsed < 180_000) return HEALTH_CHECK_INTERVAL_DISCONNECTED;
      if (elapsed < 780_000) return 60_000;
      return MAX_BACKOFF;
    }
    return HEALTH_CHECK_INTERVAL_CONNECTED;
  }, [status]);

  const runHealthCheck = useCallback(async () => {
    const result = await checkSupabaseHealth();
    setLastChecked(new Date());

    if (result === 'connected') {
      consecutiveFailures.current = 0;
      disconnectedAtRef.current = null;
      setStatus('connected');
    } else {
      consecutiveFailures.current += 1;
      if (consecutiveFailures.current >= FAILURE_THRESHOLD) {
        if (!disconnectedAtRef.current) {
          disconnectedAtRef.current = Date.now();
        }
        setStatus('disconnected');
      }
    }
  }, []);

  const checkNow = useCallback(async () => {
    await runHealthCheck();
  }, [runHealthCheck]);

  const reportSuccess = useCallback(() => {
    consecutiveFailures.current = 0;
    disconnectedAtRef.current = null;
    setStatus('connected');
    setLastChecked(new Date());
  }, []);

  const reportConnectionError = useCallback(() => {
    consecutiveFailures.current += 1;
    if (consecutiveFailures.current >= FAILURE_THRESHOLD) {
      if (!disconnectedAtRef.current) {
        disconnectedAtRef.current = Date.now();
      }
      setStatus('disconnected');
    }
    setLastChecked(new Date());
  }, []);

  // Initial health check
  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  // Polling interval — adjusts based on status
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    const interval = getPollingInterval();
    intervalRef.current = setInterval(runHealthCheck, interval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status, runHealthCheck, getPollingInterval]);

  // Visibility API: re-check when tab becomes visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        runHealthCheck();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [runHealthCheck]);

  return (
    <SupabaseStatusContext.Provider value={{ status, lastChecked, checkNow, reportSuccess, reportConnectionError }}>
      {children}
    </SupabaseStatusContext.Provider>
  );
}

export function useSupabaseStatus() {
  const context = useContext(SupabaseStatusContext);
  if (!context) {
    throw new Error('useSupabaseStatus must be used within SupabaseStatusProvider');
  }
  return context;
}
