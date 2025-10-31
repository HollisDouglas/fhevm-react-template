import { useState } from 'react';
import { useDecrypt } from '@fhevm/sdk/react';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export function DecryptDemo() {
  const [handle, setHandle] = useState('');
  const [enableDecrypt, setEnableDecrypt] = useState(false);

  const { result, isLoading, error, refetch } = useDecrypt({
    contractAddress: CONTRACT_ADDRESS,
    handle: enableDecrypt ? handle : undefined,
    enabled: enableDecrypt && !!handle,
  });

  const handleDecrypt = () => {
    if (handle) {
      setEnableDecrypt(true);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="card">
      <h2>Decryption Demo</h2>
      <p>Decrypt encrypted handles from your smart contract</p>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <input
          type="text"
          value={handle}
          onChange={(e) => {
            setHandle(e.target.value);
            setEnableDecrypt(false);
          }}
          placeholder="Enter encrypted handle (0x...)"
          disabled={isLoading}
          style={{ flex: 1 }}
        />

        <button onClick={handleDecrypt} disabled={isLoading || !handle}>
          {isLoading ? 'Decrypting...' : 'Decrypt'}
        </button>
      </div>

      {error && <div className="error">Error: {error.message}</div>}

      {result !== null && (
        <div className="success">
          <h3>Decrypted Value:</h3>
          <p style={{ fontSize: '1.5em', marginTop: '0.5rem' }}>
            <strong>{result.toString()}</strong>
          </p>
          <button onClick={handleRefresh} style={{ marginTop: '1rem' }}>
            Refresh
          </button>
        </div>
      )}

      <div style={{ marginTop: '1rem', fontSize: '0.9em', color: '#888', textAlign: 'left' }}>
        <p>
          <strong>Note:</strong> Handles are encrypted values returned from your smart contract.
          They typically look like: 0x1234567890abcdef...
        </p>
      </div>
    </div>
  );
}
