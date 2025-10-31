import { useState, useCallback } from 'react';
import type { Contract } from 'ethers';
import type { EncryptedInput } from '@fhevm/sdk';

interface ComputationOptions {
  contract: Contract | null;
  method: string;
}

/**
 * Hook for performing confidential computations
 */
export function useComputation({ contract, method }: ComputationOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const compute = useCallback(
    async (encryptedInput: EncryptedInput, ...additionalArgs: any[]) => {
      if (!contract) {
        setError('Contract not initialized');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Call contract method with encrypted input
        const tx = await contract[method](
          encryptedInput.handles[0],
          encryptedInput.inputProof,
          ...additionalArgs
        );

        // Wait for transaction
        const receipt = await tx.wait();

        setResult({
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          success: true,
        });

        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Computation failed';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract, method]
  );

  const computeMultiple = useCallback(
    async (encryptedInputs: EncryptedInput[], ...additionalArgs: any[]) => {
      if (!contract) {
        setError('Contract not initialized');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Flatten all handles and proofs
        const handles = encryptedInputs.flatMap(input => input.handles);
        const proof = encryptedInputs[0].inputProof; // Use first proof

        // Call contract method
        const tx = await contract[method](handles, proof, ...additionalArgs);

        // Wait for transaction
        const receipt = await tx.wait();

        setResult({
          transactionHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          success: true,
        });

        return receipt;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Computation failed';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [contract, method]
  );

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    compute,
    computeMultiple,
    loading,
    error,
    result,
    reset,
  };
}
