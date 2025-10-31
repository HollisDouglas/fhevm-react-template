import { useState } from 'react';
import { BrowserProvider } from 'ethers';

interface WalletConnectProps {
  onConnect: (account: string) => void;
  onDisconnect: () => void;
  connectedAccount: string | null;
}

export function WalletConnect({
  onConnect,
  onDisconnect,
  connectedAccount,
}: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const provider = new BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      onConnect(accounts[0]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Failed to connect:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    onDisconnect();
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="card">
      <h2>Wallet Connection</h2>

      {!connectedAccount ? (
        <>
          <button onClick={connect} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>

          {error && <div className="error">{error}</div>}
        </>
      ) : (
        <div>
          <p>
            Connected: <strong>{shortenAddress(connectedAccount)}</strong>
          </p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      )}
    </div>
  );
}
