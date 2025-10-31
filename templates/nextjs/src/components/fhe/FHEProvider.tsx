'use client';

import React from 'react';
import { FHEVMProvider as SDKFHEVMProvider } from '@fhevm/sdk/react';
import type { BrowserProvider } from 'ethers';

interface FHEProviderProps {
  children: React.ReactNode;
  provider?: BrowserProvider;
}

/**
 * FHE Context Provider
 * Wraps the SDK's FHEVMProvider with app-specific configuration
 */
export function FHEProvider({ children, provider }: FHEProviderProps) {
  return (
    <SDKFHEVMProvider provider={provider}>
      {children}
    </SDKFHEVMProvider>
  );
}
