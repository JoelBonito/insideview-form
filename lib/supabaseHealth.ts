import { supabase } from './supabase';
import type { ConnectionStatus } from '../types';

export const HEALTH_CHECK_INTERVAL_CONNECTED = 300_000; // 5 min
export const HEALTH_CHECK_INTERVAL_DISCONNECTED = 30_000; // 30s
export const MAX_BACKOFF = 120_000; // 2 min
export const FAILURE_THRESHOLD = 2;

export function classifyError(status: number | null, error?: unknown): ConnectionStatus {
  // HTTP 540 = Supabase project paused
  // HTTP 503 = Service unavailable (during restoration after pause)
  if (status === 540 || status === 503) return 'disconnected';

  // status 0 = network/fetch failure
  if (status === 0) return 'disconnected';

  // TypeError from fetch (network failure)
  if (error instanceof TypeError) return 'disconnected';

  // Check error message for network-related issues
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = String((error as { message: string }).message).toLowerCase();
    if (
      msg.includes('failed to fetch') ||
      msg.includes('networkerror') ||
      msg.includes('load failed') ||
      msg.includes('network request failed')
    ) {
      return 'disconnected';
    }
  }

  // Other errors (400, 401, 409, 500, etc.) — server is reachable
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
