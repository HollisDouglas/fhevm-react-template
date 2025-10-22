import { useState, useCallback } from 'react';
import { useFHEVM } from './FHEVMProvider';
import { createEncryptionHelper } from '../core/encryption';
import type { EncryptionOptions, EncryptedInput, FHEVMHookResult } from '../types';

export interface UseEncryptResult extends FHEVMHookResult<EncryptedInput> {
  encrypt: (options: Omit<EncryptionOptions, 'contractAddress' | 'userAddress'>) => Promise<EncryptedInput | null>;
  encryptMultiple: (
    values: Array<{ type: EncryptionOptions['type']; value: any }>
  ) => Promise<EncryptedInput | null>;
}

export function useEncrypt(contractAddress: string, userAddress?: string): UseEncryptResult {
  const { instance, isInitialized } = useFHEVM();
  const [data, setData] = useState<EncryptedInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const encrypt = useCallback(
    async (options: Omit<EncryptionOptions, 'contractAddress' | 'userAddress'>) => {
      if (!instance || !isInitialized) {
        const err = new Error('FHEVM not initialized');
        setError(err);
        return null;
      }

      if (!userAddress) {
        const err = new Error('User address is required');
        setError(err);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const helper = createEncryptionHelper(instance);
        const result = await helper.encryptValue({
          ...options,
          contractAddress,
          userAddress,
        });
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [instance, isInitialized, contractAddress, userAddress]
  );

  const encryptMultiple = useCallback(
    async (values: Array<{ type: EncryptionOptions['type']; value: any }>) => {
      if (!instance || !isInitialized) {
        const err = new Error('FHEVM not initialized');
        setError(err);
        return null;
      }

      if (!userAddress) {
        const err = new Error('User address is required');
        setError(err);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const helper = createEncryptionHelper(instance);
        const result = await helper.encryptMultiple(values, contractAddress, userAddress);
        setData(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Encryption failed');
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [instance, isInitialized, contractAddress, userAddress]
  );

  const refetch = useCallback(async () => {
    // No-op for encryption, as it's action-based
  }, []);

  return {
    data,
    loading,
    error,
    encrypt,
    encryptMultiple,
    refetch,
  };
}
