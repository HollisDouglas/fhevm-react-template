import type { BrowserProvider, Signer, Contract } from 'ethers';

export interface FHEVMConfig {
  network?: {
    chainId: number;
    rpcUrl: string;
    gatewayUrl?: string;
  };
  publicKey?: string;
  provider?: BrowserProvider;
  signer?: Signer;
}

export interface EncryptedInput {
  handles: string[];
  inputProof: string;
}

export interface DecryptionRequest {
  contractAddress: string;
  handle: string;
  account: string;
}

export interface DecryptionResult {
  plaintext: bigint | number | boolean;
  signature: string;
}

export interface FHEVMInstance {
  generatePublicKey: () => Promise<void>;
  getPublicKey: () => string | null;
  createEncryptedInput: (contractAddress: string, userAddress: string) => EncryptedInputBuilder;
  decrypt: (request: DecryptionRequest) => Promise<DecryptionResult>;
  isInitialized: () => boolean;
}

export interface EncryptedInputBuilder {
  addBool(value: boolean): this;
  addUint8(value: number): this;
  addUint16(value: number): this;
  addUint32(value: number): this;
  addUint64(value: bigint): this;
  addUint128(value: bigint): this;
  addUint256(value: bigint): this;
  addAddress(value: string): this;
  addBytes(value: Uint8Array): this;
  encrypt(): EncryptedInput;
}

export interface ContractInteraction {
  contract: Contract;
  method: string;
  args: any[];
  encryptedInputs?: EncryptedInput;
}

export type EncryptionType =
  | 'bool'
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint128'
  | 'uint256'
  | 'address'
  | 'bytes';

export interface EncryptionOptions {
  type: EncryptionType;
  value: any;
  contractAddress: string;
  userAddress: string;
}

export interface FHEVMHookResult<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseEncryptOptions {
  contractAddress: string;
  userAddress?: string;
  autoInit?: boolean;
}

export interface UseDecryptOptions {
  contractAddress: string;
  handle?: string;
  account?: string;
  enabled?: boolean;
}

export interface FHEVMContextValue {
  instance: FHEVMInstance | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  initialize: (config?: FHEVMConfig) => Promise<void>;
}
