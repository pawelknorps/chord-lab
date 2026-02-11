import { useState, useEffect, useCallback } from 'react';
import * as MicrophoneService from '../core/audio/MicrophoneService';

export interface UseMicrophoneResult {
  start: () => Promise<void>;
  stop: () => void;
  isActive: boolean;
  stream: MediaStream | null;
  error: Error | null;
}

/**
 * Hook for app-wide microphone (REQ-MIC-02). Subscribes to MicrophoneService;
 * start/stop update single stream; isActive and stream stay in sync.
 */
export function useMicrophone(): UseMicrophoneResult {
  const [isActive, setIsActive] = useState(MicrophoneService.isActive());
  const [stream, setStream] = useState<MediaStream | null>(MicrophoneService.getStream());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = MicrophoneService.subscribe(() => {
      setIsActive(MicrophoneService.isActive());
      setStream(MicrophoneService.getStream());
    });
    return unsubscribe;
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      await MicrophoneService.start();
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, []);

  const stop = useCallback(() => {
    MicrophoneService.stop();
    setError(null);
  }, []);

  return { start, stop, isActive, stream, error };
}
