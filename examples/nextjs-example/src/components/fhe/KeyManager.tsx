'use client';

import { useState, useEffect } from 'react';
import { useFHEVM } from '@fhevm/sdk/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface KeyManagerProps {
  contractAddress: string;
}

/**
 * Key Manager Component
 * Manages FHE public keys
 */
export function KeyManager({ contractAddress }: KeyManagerProps) {
  const { instance, isInitialized, isLoading } = useFHEVM();
  const [keyStatus, setKeyStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  useEffect(() => {
    if (isInitialized && instance) {
      setKeyStatus('available');
    } else if (!isLoading) {
      setKeyStatus('unavailable');
    }
  }, [isInitialized, instance, isLoading]);

  const handleRefresh = () => {
    setKeyStatus('checking');
    setTimeout(() => {
      setKeyStatus(isInitialized ? 'available' : 'unavailable');
    }, 500);
  };

  return (
    <Card title="Key Management">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Key Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              keyStatus === 'available'
                ? 'bg-green-100 text-green-700'
                : keyStatus === 'checking'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {keyStatus === 'available'
              ? 'Available'
              : keyStatus === 'checking'
              ? 'Checking...'
              : 'Unavailable'}
          </span>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Contract:</strong> {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}</p>
            <p><strong>FHEVM:</strong> {isInitialized ? 'Initialized' : 'Not initialized'}</p>
          </div>
        </div>

        <Button onClick={handleRefresh} variant="secondary" fullWidth>
          Refresh Status
        </Button>

        <div className="text-xs text-gray-500 space-y-1">
          <p>Public keys are automatically managed by the FHEVM instance.</p>
          <p>Keys are generated when the FHEVM client is initialized.</p>
        </div>
      </div>
    </Card>
  );
}
