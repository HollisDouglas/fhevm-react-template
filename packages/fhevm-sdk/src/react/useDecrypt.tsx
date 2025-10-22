import { useState, useEffect, useCallback } from 'react';
import type { Signer } from 'ethers';
import { useFHEVM } from './FHEVMProvider';
import { createDecryptionHelper } from '../core/decryption';
import type { FHEVMHookResult } from '../types';

export interface UseDecryptOptions {
  contractAddress: string;
  handle?: string;
  account?: string;
  signer?: Signer;
  enabled?: boolean;
}

export interface UseDecryptResult extends FHEVMHookResult<bigint | number | boolean> {
  decrypt: (handle: string) => Promise<bigint | number | boolean | null>;
}

export function useDecrypt(options: UseDecryptOptions): UseDecryptResult {
  const { contractAddress, handle, signer, enabled = true } = options;
  const { instance, isInitialized } = useFHEVM();
  const [data, setData] = useState<bigint | number | boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const decrypt = useCallback(
    async (handleToDecrypt: string) => {
      if (!instance || !isInitialized) {
        const err = new Error('FHEVM not initialized');
        setError(err);
        return null;
      }

      if (!signer) {
        const err = new Error('Signer is required for decryption');
        setError(err);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const helper = createDecryptionHelper(instance, signer);
        const result = await helper.getUserDecrypt(contractAddress, handleToDecrypt);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Decryption failed');
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [instance, isInitialized, contractAddress, signer]
  );

  const refetch = useCallback(async () => {
    if (handle && enabled) {
      await decrypt(handle);
    }
  }, [handle, enabled, decrypt]);

  useEffect(() => {
    if (handle && enabled && instance && isInitialized && signer) {
      decrypt(handle);
    }
  }, [handle, enabled, instance, isInitialized, signer, decrypt]);

  return {
    data,
    loading,
    error,
    decrypt,
    refetch,
  };
}
