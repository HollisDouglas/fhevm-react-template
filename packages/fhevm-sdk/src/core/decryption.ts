import type { Signer, TypedDataDomain, TypedDataField } from 'ethers';
import type { FHEVMInstance, DecryptionRequest, DecryptionResult } from '../types';
import {
  EIP712_DOMAIN_TYPE,
  EIP712_DECRYPTION_REQUEST_TYPE,
  getGatewayUrl,
} from '../utils/constants';
import { validateContractAddress, validateHandle } from '../utils/validation';
import { retryWithBackoff, withTimeout } from '../utils/helpers';

interface EIP712DecryptionRequest {
  contractAddress: string;
  handle: string;
  userAddress: string;
  nonce: bigint;
}

interface GatewayDecryptionRequest {
  signature: string;
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  message: EIP712DecryptionRequest;
}

interface GatewayDecryptionResponse {
  plaintext: string;
  success: boolean;
  error?: string;
}

export class DecryptionHelper {
  private nonce: bigint = 0n;
  private chainId: number | null = null;

  constructor(
    private instance: FHEVMInstance,
    private signer: Signer
  ) {}

  /**
   * Initializes the decryption helper with chain ID
   */
  private async initialize(): Promise<void> {
    if (this.chainId === null) {
      const provider = this.signer.provider;
      if (!provider) {
        throw new Error('Signer must have a provider');
      }
      const network = await provider.getNetwork();
      this.chainId = Number(network.chainId);
    }
  }

  /**
   * Creates an EIP-712 typed data structure for decryption request
   */
  private createEIP712TypedData(
    contractAddress: string,
    handle: string,
    userAddress: string,
    kmsVerifierAddress: string
  ): {
    domain: TypedDataDomain;
    types: Record<string, TypedDataField[]>;
    message: EIP712DecryptionRequest;
  } {
    const domain: TypedDataDomain = {
      name: 'FHEVM Decryption',
      version: '1',
      chainId: this.chainId!,
      verifyingContract: kmsVerifierAddress,
    };

    const types: Record<string, TypedDataField[]> = {
      DecryptionRequest: [
        { name: 'contractAddress', type: 'address' },
        { name: 'handle', type: 'bytes32' },
        { name: 'userAddress', type: 'address' },
        { name: 'nonce', type: 'uint256' },
      ],
    };

    const message: EIP712DecryptionRequest = {
      contractAddress,
      handle,
      userAddress,
      nonce: this.nonce++,
    };

    return { domain, types, message };
  }

  /**
   * Signs a decryption request using EIP-712
   */
  private async signDecryptionRequest(
    contractAddress: string,
    handle: string,
    userAddress: string,
    kmsVerifierAddress: string
  ): Promise<{
    signature: string;
    domain: TypedDataDomain;
    types: Record<string, TypedDataField[]>;
    message: EIP712DecryptionRequest;
  }> {
    const { domain, types, message } = this.createEIP712TypedData(
      contractAddress,
      handle,
      userAddress,
      kmsVerifierAddress
    );

    // Sign the typed data using EIP-712
    const signature = await this.signer.signTypedData(domain, types, message);

    return { signature, domain, types, message };
  }

  /**
   * Sends decryption request to the KMS gateway
   */
  private async requestFromGateway(
    request: GatewayDecryptionRequest,
    gatewayUrl: string
  ): Promise<string> {
    const response = await fetch(`${gatewayUrl}/decrypt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gateway request failed: ${response.status} ${errorText}`);
    }

    const data: GatewayDecryptionResponse = await response.json();

    if (!data.success) {
      throw new Error(`Gateway decryption failed: ${data.error || 'Unknown error'}`);
    }

    return data.plaintext;
  }

  /**
   * Parses the plaintext result based on expected type
   */
  private parsePlaintext(plaintext: string): bigint | number | boolean {
    // If it's a hex string
    if (plaintext.startsWith('0x')) {
      const value = BigInt(plaintext);

      // Check if it's likely a boolean (0 or 1)
      if (value === 0n || value === 1n) {
        return value === 1n;
      }

      // Check if it fits in a number (< 2^53 - 1)
      if (value < 9007199254740991n) {
        return Number(value);
      }

      return value;
    }

    // Try to parse as number
    const numValue = Number(plaintext);
    if (!isNaN(numValue)) {
      return numValue;
    }

    // Try to parse as boolean
    if (plaintext === 'true') return true;
    if (plaintext === 'false') return false;

    // Default to bigint
    return BigInt(plaintext);
  }

  /**
   * Requests decryption of an encrypted value
   */
  async requestDecryption(
    contractAddress: string,
    handle: string
  ): Promise<DecryptionResult> {
    // Validate inputs
    validateContractAddress(contractAddress);
    validateHandle(handle);

    // Initialize if needed
    await this.initialize();

    // Get user address
    const userAddress = await this.signer.getAddress();

    // Get KMS verifier address for this chain
    const kmsVerifierAddress = this.getKmsVerifierAddress();
    const gatewayUrl = this.getGatewayUrl();

    // Sign the decryption request using EIP-712
    const { signature, domain, types, message } = await this.signDecryptionRequest(
      contractAddress,
      handle,
      userAddress,
      kmsVerifierAddress
    );

    // Request decryption from gateway with retry logic
    const plaintext = await retryWithBackoff(
      async () =>
        withTimeout(
          this.requestFromGateway(
            { signature, domain, types, message },
            gatewayUrl
          ),
          30000 // 30 second timeout
        ),
      3, // 3 retry attempts
      1000 // 1 second base delay
    );

    return {
      plaintext: this.parsePlaintext(plaintext),
      signature,
    };
  }

  /**
   * Gets the KMS verifier address for the current chain
   */
  private getKmsVerifierAddress(): string {
    if (this.chainId === null) {
      throw new Error('Chain ID not initialized');
    }

    // Standard KMS verifier addresses
    const kmsAddresses: Record<number, string> = {
      8009: '0x9D6891A6240D6130c54ae243d8005063D05fE14b', // Zama Devnet
      9000: '0x9D6891A6240D6130c54ae243d8005063D05fE14b', // Zama Testnet
      31337: '0x9D6891A6240D6130c54ae243d8005063D05fE14b', // Local
    };

    const address = kmsAddresses[this.chainId];
    if (!address) {
      throw new Error(`KMS verifier address not configured for chain ID ${this.chainId}`);
    }

    return address;
  }

  /**
   * Gets the gateway URL for the current chain
   */
  private getGatewayUrl(): string {
    if (this.chainId === null) {
      throw new Error('Chain ID not initialized');
    }

    const url = getGatewayUrl(this.chainId);
    if (!url) {
      throw new Error(`Gateway URL not configured for chain ID ${this.chainId}`);
    }

    return url;
  }

  /**
   * Decrypts a value and returns only the plaintext
   */
  async getUserDecrypt(
    contractAddress: string,
    handle: string
  ): Promise<bigint | number | boolean> {
    const result = await this.requestDecryption(contractAddress, handle);
    return result.plaintext;
  }

  /**
   * Decrypts a public value (doesn't require user signature in some implementations)
   * For full FHEVM implementation, this still requires signature
   */
  async publicDecrypt(
    contractAddress: string,
    handle: string
  ): Promise<bigint | number | boolean> {
    const result = await this.requestDecryption(contractAddress, handle);
    return result.plaintext;
  }

  /**
   * Batch decrypt multiple handles
   */
  async batchDecrypt(
    contractAddress: string,
    handles: string[]
  ): Promise<Array<bigint | number | boolean>> {
    validateContractAddress(contractAddress);

    const results = await Promise.all(
      handles.map((handle) => this.getUserDecrypt(contractAddress, handle))
    );

    return results;
  }
}

export function createDecryptionHelper(
  instance: FHEVMInstance,
  signer: Signer
): DecryptionHelper {
  return new DecryptionHelper(instance, signer);
}
