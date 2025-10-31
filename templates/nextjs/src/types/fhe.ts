import type { BrowserProvider, Contract } from 'ethers';
import type { FHEVMInstance, EncryptedInput } from '@fhevm/sdk';

/**
 * FHE data types
 */
export type FHEType = 'bool' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256' | 'address' | 'bytes';

/**
 * FHE context state
 */
export interface FHEContextState {
  instance: FHEVMInstance | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Encryption result
 */
export interface EncryptionResult {
  encrypted: EncryptedInput;
  timestamp: number;
  type: FHEType;
  contractAddress: string;
}

/**
 * Decryption result
 */
export interface DecryptionResult {
  value: any;
  type: FHEType;
  timestamp: number;
}

/**
 * Contract interaction options
 */
export interface ContractInteractionOptions {
  contract: Contract;
  method: string;
  encryptedInput: EncryptedInput;
  additionalArgs?: any[];
}

/**
 * Transaction result
 */
export interface TransactionResult {
  hash: string;
  blockNumber: number;
  success: boolean;
  timestamp: number;
}
