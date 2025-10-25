'use client';

import { ReactNode, useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { FHEVMProvider } from '@fhevm/sdk/react';

export function Providers({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const browserProvider = new BrowserProvider(window.ethereum);
      setProvider(browserProvider);
    }
  }, []);

  if (!provider) {
    return <>{children}</>;
  }

  return (
    <FHEVMProvider
      provider={provider}
      config={{
        network: {
          chainId: 8009, // Sepolia FHEVM testnet
          rpcUrl: 'https://devnet.zama.ai',
        }
      }}
    >
      {children}
    </FHEVMProvider>
  );
}
