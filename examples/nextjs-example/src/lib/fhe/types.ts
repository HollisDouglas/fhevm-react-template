import type { BrowserProvider } from 'ethers';

/**
 * FHE encryption types supported
 */
export type FHEType = 'bool' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256' | 'address' | 'bytes';

/**
 * Encrypted data result
 */
export interface EncryptedData {
  handles: string[];
  inputProof: string;
}

/**
 * Encryption request
 */
export interface EncryptionRequest {
  contractAddress: string;
  userAddress: string;
  type: FHEType;
  value: any;
}

/**
 * Decryption request
 */
export interface DecryptionRequest {
  contractAddress: string;
  handle: string;
  userAddress: string;
}

/**
 * FHE configuration
 */
export interface FHEConfig {
  provider: BrowserProvider;
  network?: {
    chainId: number;
    name: string;
  };
}

/**
 * Contract interaction result
 */
export interface ContractCallResult {
  success: boolean;
  data?: any;
  error?: string;
  transactionHash?: string;
}
