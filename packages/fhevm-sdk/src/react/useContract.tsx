import { useState, useCallback } from 'react';
import type { Contract, ContractTransactionResponse } from 'ethers';
import { useFHEVM } from './FHEVMProvider';
import type { EncryptedInput, FHEVMHookResult } from '../types';

export interface UseContractOptions {
  contract: Contract;
}

export interface UseContractResult extends FHEVMHookResult<ContractTransactionResponse> {
  send: (
    method: string,
    args: any[],
    encryptedInput?: EncryptedInput
  ) => Promise<ContractTransactionResponse | null>;
  call: (method: string, args: any[]) => Promise<any>;
}

export function useContract(options: UseContractOptions): UseContractResult {
  const { contract } = options;
  const { isInitialized } = useFHEVM();
  const [data, setData] = useState<ContractTransactionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const send = useCallback(
    async (method: string, args: any[], encryptedInput?: EncryptedInput) => {
      if (!isInitialized) {
        const err = new Error('FHEVM not initialized');
        setError(err);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        let finalArgs = args;

        // If encrypted input provided, append to args
        if (encryptedInput) {
          finalArgs = [...args, encryptedInput.handles, encryptedInput.inputProof];
        }

        const tx = await contract[method](...finalArgs);
        setData(tx);
        return tx;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Contract call failed');
        setError(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract, isInitialized]
  );

  const call = useCallback(
    async (method: string, args: any[]) => {
      if (!isInitialized) {
        throw new Error('FHEVM not initialized');
      }

      try {
        const result = await contract[method](...args);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Contract read failed');
        throw error;
      }
    },
    [contract, isInitialized]
  );

  const refetch = useCallback(async () => {
    // No-op for contract interactions
  }, []);

  return {
    data,
    loading,
    error,
    send,
    call,
    refetch,
  };
}
