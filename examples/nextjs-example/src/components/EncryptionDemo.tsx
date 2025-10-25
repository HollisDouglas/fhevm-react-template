'use client';

import { useState } from 'react';
import { useFHEVM, useEncrypt } from '@fhevm/sdk/react';

interface EncryptionDemoProps {
  account: string;
}

export default function EncryptionDemo({ account }: EncryptionDemoProps) {
  const { isInitialized, isLoading: fhevmLoading } = useFHEVM();
  const [inputValue, setInputValue] = useState('42');
  const [encryptedResult, setEncryptedResult] = useState<any>(null);

  // Example contract address (replace with actual)
  const contractAddress = '0x0000000000000000000000000000000000000000';
  const { encrypt, loading, error } = useEncrypt(contractAddress, account);

  const handleEncrypt = async () => {
    try {
      const result = await encrypt({
        type: 'uint32',
        value: parseInt(inputValue),
      });
      setEncryptedResult(result);
    } catch (err) {
      console.error('Encryption error:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Encryption Demo
      </h2>

      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isInitialized ? 'bg-green-500' : 'bg-yellow-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {fhevmLoading
              ? 'Initializing FHEVM...'
              : isInitialized
              ? 'FHEVM Ready'
              : 'FHEVM Not Initialized'}
          </span>
        </div>

        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Value to Encrypt (uint32)
          </label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter a number"
          />
        </div>

        {/* Encrypt Button */}
        <button
          onClick={handleEncrypt}
          disabled={!isInitialized || loading}
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Encrypting...' : 'Encrypt Value'}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        )}

        {/* Result */}
        {encryptedResult && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Encrypted Result:
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-600">Handles:</span>
                <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(encryptedResult.handles, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-xs text-gray-600">Proof (truncated):</span>
                <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                  {encryptedResult.inputProof.slice(0, 100)}...
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> The FHEVM SDK encrypts your input
            using Fully Homomorphic Encryption (FHE), allowing smart contracts
            to compute on encrypted data without revealing it.
          </p>
        </div>
      </div>
    </div>
  );
}
