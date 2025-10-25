import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { BrowserProvider } from 'ethers';
import { createFHEVMClient } from '../core/fhevm-client';
import type { FHEVMConfig, FHEVMInstance, FHEVMContextValue } from '../types';

const FHEVMContext = createContext<FHEVMContextValue | null>(null);

export interface FHEVMProviderProps {
  children: React.ReactNode;
  config?: FHEVMConfig;
  provider?: BrowserProvider;
}

export function FHEVMProvider({ children, config, provider }: FHEVMProviderProps) {
  const [instance, setInstance] = useState<FHEVMInstance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const initialize = useCallback(async (customConfig?: FHEVMConfig) => {
    if (isInitialized || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const finalConfig: FHEVMConfig = {
        ...config,
        ...customConfig,
        provider: customConfig?.provider || provider || config?.provider,
      };

      if (!finalConfig.provider) {
        throw new Error('Provider is required for FHEVM initialization');
      }

      const fhevmInstance = await createFHEVMClient(finalConfig);
      setInstance(fhevmInstance);
      setIsInitialized(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
      setError(error);
      console.error('FHEVM initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [config, provider, isInitialized, isLoading]);

  // Auto-initialize if provider is available
  useEffect(() => {
    if (provider && !isInitialized && !isLoading && !error) {
      initialize();
    }
  }, [provider, isInitialized, isLoading, error, initialize]);

  const value: FHEVMContextValue = {
    instance,
    isInitialized,
    isLoading,
    error,
    initialize,
  };

  return <FHEVMContext.Provider value={value}>{children}</FHEVMContext.Provider>;
}

export function useFHEVM(): FHEVMContextValue {
  const context = useContext(FHEVMContext);
  if (!context) {
    throw new Error('useFHEVM must be used within FHEVMProvider');
  }
  return context;
}
