'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useEncryption } from '@/hooks/useEncryption';

interface MedicalExampleProps {
  contractAddress: string;
  userAddress: string;
}

/**
 * Medical Records Use Case Example
 * Demonstrates confidential health data storage
 */
export function MedicalExample({ contractAddress, userAddress }: MedicalExampleProps) {
  const [heartRate, setHeartRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [status, setStatus] = useState<string>('');

  const { encryptValues, loading, error } = useEncryption({
    contractAddress,
    userAddress,
  });

  const handleSubmit = async () => {
    if (!heartRate || !bloodPressure) {
      setStatus('Please fill in all fields');
      return;
    }

    setStatus('Encrypting medical data...');

    const encrypted = await encryptValues([
      { type: 'uint32', value: parseInt(heartRate, 10) },
      { type: 'uint32', value: parseInt(bloodPressure, 10) },
    ]);

    if (encrypted) {
      setStatus('Medical data encrypted and stored securely!');
      setHeartRate('');
      setBloodPressure('');
    } else {
      setStatus('Encryption failed');
    }
  };

  return (
    <Card title="Confidential Medical Records">
      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-green-900">HIPAA Compliant</span>
          </div>
          <p className="text-xs text-green-700">All data encrypted with FHE</p>
        </div>

        <div>
          <Input
            label="Heart Rate (bpm)"
            type="number"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            placeholder="e.g., 72"
          />
        </div>

        <div>
          <Input
            label="Blood Pressure (systolic)"
            type="number"
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
            placeholder="e.g., 120"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !heartRate || !bloodPressure}
          fullWidth
        >
          {loading ? 'Encrypting...' : 'Store Medical Data'}
        </Button>

        {(status || error) && (
          <div className={`p-3 rounded-lg text-sm ${
            error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-blue-50 border border-blue-200 text-blue-700'
          }`}>
            {error || status}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Use Case:</strong> Private health records</p>
          <p>Medical data remains encrypted on-chain.</p>
          <p>Only authorized healthcare providers can access the data.</p>
        </div>
      </div>
    </Card>
  );
}
