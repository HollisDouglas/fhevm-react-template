import { FHEVMProvider } from '@fhevm/sdk/react';
import { BrowserProvider } from 'ethers';
import { useState, useEffect } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { EncryptDemo } from './components/EncryptDemo';
import { DecryptDemo } from './components/DecryptDemo';

function App() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const browserProvider = new BrowserProvider((window as any).ethereum);
      setProvider(browserProvider);

      // Check if already connected
      browserProvider.send('eth_accounts', []).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        }
      });
    }
  }, []);

  const handleConnect = (connectedAccount: string) => {
    setAccount(connectedAccount);
  };

  const handleDisconnect = () => {
    setAccount(null);
  };

  if (!provider) {
    return (
      <div className="card error">
        <h2>MetaMask Not Found</h2>
        <p>Please install MetaMask to use this application.</p>
        <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
          Download MetaMask
        </a>
      </div>
    );
  }

  return (
    <FHEVMProvider config={{ provider }}>
      <div className="App">
        <h1>FHEVM React Template</h1>
        <p>Confidential Smart Contract Frontend</p>

        <WalletConnect
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          connectedAccount={account}
        />

        {account && (
          <>
            <EncryptDemo userAddress={account} />
            <DecryptDemo />
          </>
        )}

        <div className="card" style={{ marginTop: '2rem', textAlign: 'left' }}>
          <h3>Getting Started</h3>
          <ul>
            <li>Connect your wallet using the button above</li>
            <li>Set your contract address in the .env file</li>
            <li>Use the encryption demo to encrypt values</li>
            <li>Use the decryption demo to decrypt handles</li>
          </ul>
        </div>
      </div>
    </FHEVMProvider>
  );
}

export default App;
