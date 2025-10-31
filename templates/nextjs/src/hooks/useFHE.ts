import { useState, useEffect, useCallback } from 'react';
import { useFHEVM } from '@fhevm/sdk/react';
import type { BrowserProvider } from 'ethers';
import { initFHEVM, getFHEVMInstance } from '@/lib/fhe/client';

/**
 * Custom hook for FHE operations
 */
export function useFHE(provider?: BrowserProvider) {
  const { instance, isInitialized, isLoading, error, initialize } = useFHEVM();
  const [localError, setLocalError] = useState<Error | null>(null);

  // Initialize when provider is available
  useEffect(() => {
    if (provider && !isInitialized && !isLoading) {
      initialize({ provider });
    }
  }, [provider, isInitialized, isLoading, initialize]);

  const reinitialize = useCallback(async () => {
    if (provider) {
      setLocalError(null);
      try {
        await initialize({ provider });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize FHE');
        setLocalError(error);
      }
    }
  }, [provider, initialize]);

  return {
    instance: instance || getFHEVMInstance(),
    isInitialized,
    isLoading,
    error: error || localError,
    reinitialize,
  };
}
