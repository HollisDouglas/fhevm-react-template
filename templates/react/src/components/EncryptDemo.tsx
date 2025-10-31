import { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

interface EncryptDemoProps {
  userAddress: string;
}

export function EncryptDemo({ userAddress }: EncryptDemoProps) {
  const [value, setValue] = useState('');
  const [encryptionType, setEncryptionType] = useState<'uint8' | 'uint32' | 'bool'>('uint32');

  const { encrypt, encryptBool, isLoading, error, result } = useEncrypt(
    CONTRACT_ADDRESS,
    userAddress
  );

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;

    try {
      if (encryptionType === 'bool') {
        await encryptBool(value === 'true');
      } else {
        await encrypt(encryptionType, parseInt(value));
      }
    } catch (err) {
      console.error('Encryption failed:', err);
    }
  };

  return (
    <div className="card">
      <h2>Encryption Demo</h2>
      <p>Encrypt values before sending to your smart contract</p>

      <form onSubmit={handleEncrypt} style={{ marginTop: '1rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="type-select" style={{ marginRight: '0.5rem' }}>
            Type:
          </label>
          <select
            id="type-select"
            value={encryptionType}
            onChange={(e) => setEncryptionType(e.target.value as any)}
            disabled={isLoading}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #ccc',
              background: '#1a1a1a',
              color: 'inherit',
            }}
          >
            <option value="uint8">uint8 (0-255)</option>
            <option value="uint32">uint32</option>
            <option value="bool">bool</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {encryptionType === 'bool' ? (
            <select
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                background: '#1a1a1a',
                color: 'inherit',
              }}
            >
              <option value="">Select value</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter ${encryptionType} value`}
              disabled={isLoading}
              style={{ flex: 1 }}
            />
          )}

          <button type="submit" disabled={isLoading || !value}>
            {isLoading ? 'Encrypting...' : 'Encrypt'}
          </button>
        </div>
      </form>

      {error && <div className="error">Error: {error.message}</div>}

      {result && (
        <div className="success">
          <h3>Encrypted Result:</h3>
          <div style={{ textAlign: 'left', marginTop: '0.5rem' }}>
            <p>
              <strong>Handles:</strong>
            </p>
            <pre style={{ overflow: 'auto', padding: '0.5rem', background: '#2a2a2a' }}>
              {JSON.stringify(result.handles, null, 2)}
            </pre>
            <p style={{ marginTop: '0.5rem' }}>
              <strong>Input Proof:</strong>
            </p>
            <pre style={{ overflow: 'auto', padding: '0.5rem', background: '#2a2a2a' }}>
              {result.inputProof.slice(0, 50)}...
            </pre>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#888' }}>
              Use these values in your contract call
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
