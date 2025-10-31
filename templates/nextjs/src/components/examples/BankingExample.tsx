'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEncryption } from '@/hooks/useEncryption';

interface BankingExampleProps {
  contractAddress: string;
  userAddress: string;
}

/**
 * Banking Use Case Example
 * Demonstrates confidential balance and transaction handling
 */
export function BankingExample({ contractAddress, userAddress }: BankingExampleProps) {
  const [balance, setBalance] = useState('1000');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [status, setStatus] = useState<string>('');

  const { encryptValues, loading, error } = useEncryption({
    contractAddress,
    userAddress,
  });

  const handleTransfer = async () => {
    if (!transferAmount || !recipient) {
      setStatus('Please fill in all fields');
      return;
    }

    setStatus('Encrypting transfer data...');

    const encrypted = await encryptValues([
      { type: 'uint64', value: BigInt(transferAmount) },
      { type: 'address', value: recipient },
    ]);

    if (encrypted) {
      setStatus('Transfer encrypted and ready to submit!');
      // In a real app, this would call the smart contract
    } else {
      setStatus('Encryption failed');
    }
  };

  return (
    <Card title="Confidential Banking">
      <div className="space-y-4">
        <div className="p-4 bg-indigo-50 rounded-lg">
          <div className="text-sm text-gray-600">Current Balance</div>
          <div className="text-2xl font-bold text-indigo-900">
            {balance} tokens (encrypted)
          </div>
        </div>

        <div>
          <Input
            label="Recipient Address"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
          />
        </div>

        <div>
          <Input
            label="Transfer Amount"
            type="number"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            placeholder="Amount to transfer"
          />
        </div>

        <Button
          onClick={handleTransfer}
          disabled={loading || !transferAmount || !recipient}
          fullWidth
        >
          {loading ? 'Processing...' : 'Send Confidential Transfer'}
        </Button>

        {(status || error) && (
          <div className={`p-3 rounded-lg text-sm ${
            error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {error || status}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Use Case:</strong> Private banking transactions</p>
          <p>Balance and transaction amounts remain encrypted on-chain.</p>
          <p>Only authorized parties can decrypt and view the data.</p>
        </div>
      </div>
    </Card>
  );
}
