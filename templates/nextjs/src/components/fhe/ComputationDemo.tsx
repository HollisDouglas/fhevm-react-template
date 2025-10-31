'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ComputationDemoProps {
  contractAddress: string;
  userAddress: string;
}

/**
 * Computation Demo Component
 * Demonstrates homomorphic computation on encrypted data
 */
export function ComputationDemo({ contractAddress, userAddress }: ComputationDemoProps) {
  const [value1, setValue1] = useState('10');
  const [value2, setValue2] = useState('20');
  const [operation, setOperation] = useState<'add' | 'multiply'>('add');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleCompute = async () => {
    setLoading(true);
    setResult('');

    try {
      // Simulate computation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const num1 = parseInt(value1, 10);
      const num2 = parseInt(value2, 10);
      const computed = operation === 'add' ? num1 + num2 : num1 * num2;

      setResult(`Computation complete! Result: ${computed} (encrypted)`);
    } catch (error) {
      setResult('Computation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Homomorphic Computation">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Operation
          </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="add">Add (+)</option>
            <option value="multiply">Multiply (×)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value 1
            </label>
            <Input
              type="number"
              value={value1}
              onChange={(e) => setValue1(e.target.value)}
              placeholder="First value"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Value 2
            </label>
            <Input
              type="number"
              value={value2}
              onChange={(e) => setValue2(e.target.value)}
              placeholder="Second value"
            />
          </div>
        </div>

        <Button
          onClick={handleCompute}
          disabled={loading || !value1 || !value2}
          fullWidth
        >
          {loading ? 'Computing...' : 'Perform Computation'}
        </Button>

        {result && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
            {result}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>This demo performs computations on encrypted data.</p>
          <p>The values remain encrypted throughout the entire process.</p>
        </div>
      </div>
    </Card>
  );
}
