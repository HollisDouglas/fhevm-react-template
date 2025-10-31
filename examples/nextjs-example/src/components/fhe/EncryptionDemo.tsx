'use client';

import { useState } from 'react';
import { useEncryption } from '@/hooks/useEncryption';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface EncryptionDemoProps {
  contractAddress: string;
  userAddress: string;
}

/**
 * Encryption Demo Component
 * Demonstrates FHE encryption capabilities
 */
export function EncryptionDemo({ contractAddress, userAddress }: EncryptionDemoProps) {
  const [inputValue, setInputValue] = useState('42');
  const [inputType, setInputType] = useState<'uint32' | 'bool' | 'uint64'>('uint32');
  const [result, setResult] = useState<string>('');

  const { encryptValue, loading, error } = useEncryption({
    contractAddress,
    userAddress,
  });

  const handleEncrypt = async () => {
    let value: any = inputValue;

    // Parse value based on type
    if (inputType === 'bool') {
      value = inputValue === 'true' || inputValue === '1';
    } else if (inputType === 'uint64') {
      value = BigInt(inputValue);
    } else {
      value = parseInt(inputValue, 10);
    }

    const encrypted = await encryptValue(inputType, value);

    if (encrypted) {
      setResult(`Encrypted! Handle: ${encrypted.handles[0].slice(0, 10)}...`);
    }
  };

  return (
    <Card title="Encryption Demo">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Type
          </label>
          <select
            value={inputType}
            onChange={(e) => setInputType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="uint32">Uint32</option>
            <option value="uint64">Uint64</option>
            <option value="bool">Boolean</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Value to Encrypt
          </label>
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputType === 'bool' ? 'true or false' : 'Enter a number'}
          />
        </div>

        <Button
          onClick={handleEncrypt}
          disabled={loading || !inputValue}
          fullWidth
        >
          {loading ? 'Encrypting...' : 'Encrypt Value'}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {result}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>This demo encrypts data using Fully Homomorphic Encryption.</p>
          <p>The encrypted data can be used in smart contracts while remaining confidential.</p>
        </div>
      </div>
    </Card>
  );
}
