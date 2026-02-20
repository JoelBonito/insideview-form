import { supabase } from './supabase';
import type { ConnectionStatus } from '../types';

export const HEALTH_CHECK_INTERVAL_CONNECTED = 300_000; // 5 min
export const HEALTH_CHECK_INTERVAL_DISCONNECTED = 30_000; // 30s
export const MAX_BACKOFF = 120_000; // 2 min
export const FAILURE_THRESHOLD = 2;

export function classifyError(status: number | null | undefined, error?: unknown): ConnectionStatus {
  // If we have an error object, log it for debugging purposes in the console (helpful in production)
  if (error) {
    console.debug('[Supabase Health Check] Query error:', { status, error });
  }

  // HTTP 540 = Supabase project paused
  // HTTP 500, 502, 503, 504 = Server/Gateway unavailable or errors 
  if (status === 540 || status === 503 || status === 502 || status === 504) return 'disconnected';

  // Status 0, null, or undefined means the request never reached the server or browser blocked it.
  // This happens heavily on DNS failures (`net::ERR_NAME_NOT_RESOLVED`), CORS, or offline.
  if (!status || status === 0) return 'disconnected';

  // TypeError from fetch (network failure)
  if (error instanceof TypeError) return 'disconnected';

  // Specific message strings just in case
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String((error as { message: string }).message).toLowerCase();
    if (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('network request failed') ||
      msg.includes('fetch') ||
      msg.includes('name_not_resolved')
    ) {
      return 'disconnected';
    }
  }

  // Other explicit server errors (e.g. 400, 401, 403, 404, 500) mean the server IS reachable,
  // but rejected the request for a semantic reason (auth, bad schema, etc).
  // So we consider it 'connected'.
  return 'connected';
}

export async function checkSupabaseHealth(): Promise<ConnectionStatus> {
  try {
    const { error, status } = await supabase
      .schema('insideview')
      .from('agencias')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return classifyError(status, error);
    }

    return 'connected';
  } catch (error) {
    return classifyError(null, error);
  }
}
