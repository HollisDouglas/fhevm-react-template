import { createInstance, initFhevm } from 'fhevmjs';
import type { BrowserProvider } from 'ethers';
import type {
  FHEVMConfig,
  FHEVMInstance,
  EncryptedInput,
  DecryptionRequest,
  DecryptionResult,
  EncryptedInputBuilder,
} from '../types';

export class FHEVMClient {
  private instance: any = null;
  private publicKey: string | null = null;
  private config: FHEVMConfig;
  private initialized: boolean = false;

  constructor(config: FHEVMConfig = {}) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize fhevmjs
      await initFhevm();

      // Get provider
      const provider = this.config.provider;
      if (!provider) {
        throw new Error('Provider is required for FHEVM initialization');
      }

      // Get network info
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);

      // Get public key from network or config
      let publicKey = this.config.publicKey;

      if (!publicKey) {
        // Try to fetch from ACL contract (standard FHEVM deployment)
        try {
          const aclAddress = await this.getACLAddress(chainId);
          publicKey = await this.fetchPublicKey(provider, aclAddress);
        } catch (error) {
          console.warn('Could not fetch public key from ACL:', error);
        }
      }

      if (!publicKey) {
        throw new Error('Public key is required. Provide it in config or ensure ACL contract is deployed.');
      }

      // Create fhevmjs instance
      this.instance = await createInstance({
        chainId,
        publicKey,
        gatewayUrl: this.config.network?.gatewayUrl,
      });

      this.publicKey = publicKey;
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize FHEVM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getACLAddress(chainId: number): Promise<string> {
    // Standard ACL addresses for different networks
    const aclAddresses: Record<number, string> = {
      8009: '0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2', // Sepolia
      9000: '0x339EcE85B9E11a3A3AA557582784a15d7F82AAf2', // Mainnet
      // Add more networks as needed
    };

    const address = aclAddresses[chainId];
    if (!address) {
      throw new Error(`ACL address not found for chainId ${chainId}`);
    }

    return address;
  }

  private async fetchPublicKey(provider: BrowserProvider, aclAddress: string): Promise<string> {
    // Fetch public key from ACL contract
    const code = await provider.getCode(aclAddress);
    if (code === '0x') {
      throw new Error('ACL contract not deployed at specified address');
    }

    // Call getPublicKey() on ACL contract
    const abiCoder = new (await import('ethers')).AbiCoder();
    const calldata = abiCoder.encode(['string'], ['getPublicKey()']);

    // For simplicity, return a placeholder - in production, make actual contract call
    throw new Error('Public key fetching not implemented - provide publicKey in config');
  }

  getPublicKey(): string | null {
    return this.publicKey;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  createEncryptedInput(contractAddress: string, userAddress: string): EncryptedInputBuilder {
    if (!this.instance) {
      throw new Error('FHEVM instance not initialized. Call initialize() first.');
    }

    const input = this.instance.createEncryptedInput(contractAddress, userAddress);

    return {
      addBool: (value: boolean) => {
        input.addBool(value);
        return this as any;
      },
      addUint8: (value: number) => {
        input.add8(value);
        return this as any;
      },
      addUint16: (value: number) => {
        input.add16(value);
        return this as any;
      },
      addUint32: (value: number) => {
        input.add32(value);
        return this as any;
      },
      addUint64: (value: bigint) => {
        input.add64(value);
        return this as any;
      },
      addUint128: (value: bigint) => {
        input.add128(value);
        return this as any;
      },
      addUint256: (value: bigint) => {
        input.add256(value);
        return this as any;
      },
      addAddress: (value: string) => {
        input.addAddress(value);
        return this as any;
      },
      addBytes: (value: Uint8Array) => {
        input.addBytes(value);
        return this as any;
      },
      encrypt: (): EncryptedInput => {
        return input.encrypt();
      },
    };
  }

  async decrypt(request: DecryptionRequest): Promise<DecryptionResult> {
    if (!this.instance) {
      throw new Error('FHEVM instance not initialized. Call initialize() first.');
    }

    // Implement EIP-712 signing for decryption
    const { contractAddress, handle, account } = request;

    // This would involve signing the decryption request with EIP-712
    // and calling the gateway for decryption
    throw new Error('Decryption not yet implemented - requires gateway integration');
  }

  getInstance(): FHEVMInstance {
    return {
      generatePublicKey: async () => {
        await this.initialize();
      },
      getPublicKey: () => this.getPublicKey(),
      createEncryptedInput: (contractAddress: string, userAddress: string) =>
        this.createEncryptedInput(contractAddress, userAddress),
      decrypt: (request: DecryptionRequest) => this.decrypt(request),
      isInitialized: () => this.isInitialized(),
    };
  }
}

export async function createFHEVMClient(config: FHEVMConfig = {}): Promise<FHEVMInstance> {
  const client = new FHEVMClient(config);
  await client.initialize();
  return client.getInstance();
}
