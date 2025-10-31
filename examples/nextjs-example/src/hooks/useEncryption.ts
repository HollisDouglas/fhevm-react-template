import { useState, useCallback } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';
import type { EncryptedInput } from '@fhevm/sdk';
import { validateEncryptionParams, sanitizeInput } from '@/lib/utils/security';

interface UseEncryptionOptions {
  contractAddress: string;
  userAddress?: string;
}

/**
 * Hook for encrypting values with validation
 */
export function useEncryption({ contractAddress, userAddress }: UseEncryptionOptions) {
  const { encrypt, encryptMultiple, loading, error: sdkError } = useEncrypt(contractAddress, userAddress);
  const [localError, setLocalError] = useState<string | null>(null);

  const encryptValue = useCallback(
    async (type: string, value: any): Promise<EncryptedInput | null> => {
      if (!userAddress) {
        setLocalError('User address is required');
        return null;
      }

      // Validate parameters
      const validation = validateEncryptionParams(contractAddress, userAddress, type, value);
      if (!validation.valid) {
        setLocalError(validation.error || 'Validation failed');
        return null;
      }

      setLocalError(null);

      try {
        // Sanitize input
        const sanitizedValue = sanitizeInput(value, type);

        // Encrypt using SDK
        const result = await encrypt({
          type: type as any,
          value: sanitizedValue,
        });

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Encryption failed';
        setLocalError(errorMsg);
        return null;
      }
    },
    [contractAddress, userAddress, encrypt]
  );

  const encryptValues = useCallback(
    async (values: Array<{ type: string; value: any }>): Promise<EncryptedInput | null> => {
      if (!userAddress) {
        setLocalError('User address is required');
        return null;
      }

      // Validate all values
      for (const { type, value } of values) {
        const validation = validateEncryptionParams(contractAddress, userAddress, type, value);
        if (!validation.valid) {
          setLocalError(validation.error || 'Validation failed');
          return null;
        }
      }

      setLocalError(null);

      try {
        // Sanitize all inputs
        const sanitizedValues = values.map(({ type, value }) => ({
          type,
          value: sanitizeInput(value, type),
        }));

        // Encrypt multiple values
        const result = await encryptMultiple(sanitizedValues);
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Encryption failed';
        setLocalError(errorMsg);
        return null;
      }
    },
    [contractAddress, userAddress, encryptMultiple]
  );

  return {
    encryptValue,
    encryptValues,
    loading,
    error: sdkError?.message || localError,
  };
}
