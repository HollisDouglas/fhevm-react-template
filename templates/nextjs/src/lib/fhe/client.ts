import { createFHEVMClient, createEncryptionHelper } from '@fhevm/sdk';
import type { BrowserProvider } from 'ethers';
import type { FHEVMInstance, EncryptedInput } from '@fhevm/sdk';

let fhevmInstance: FHEVMInstance | null = null;

/**
 * Initialize FHEVM client for browser environment
 */
export async function initFHEVM(provider: BrowserProvider): Promise<FHEVMInstance> {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  try {
    fhevmInstance = await createFHEVMClient({ provider });
    return fhevmInstance;
  } catch (error) {
    console.error('Failed to initialize FHEVM:', error);
    throw error;
  }
}

/**
 * Get the current FHEVM instance
 */
export function getFHEVMInstance(): FHEVMInstance | null {
  return fhevmInstance;
}

/**
 * Encrypt a value using FHEVM
 */
export async function encryptValue(
  contractAddress: string,
  userAddress: string,
  type: 'bool' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256' | 'address' | 'bytes',
  value: any
): Promise<EncryptedInput> {
  if (!fhevmInstance) {
    throw new Error('FHEVM not initialized. Call initFHEVM first.');
  }

  const helper = createEncryptionHelper(fhevmInstance);
  return helper.encryptValue({
    type,
    value,
    contractAddress,
    userAddress,
  });
}

/**
 * Encrypt multiple values
 */
export async function encryptMultipleValues(
  contractAddress: string,
  userAddress: string,
  values: Array<{ type: string; value: any }>
): Promise<EncryptedInput> {
  if (!fhevmInstance) {
    throw new Error('FHEVM not initialized. Call initFHEVM first.');
  }

  const helper = createEncryptionHelper(fhevmInstance);
  return helper.encryptMultiple(values, contractAddress, userAddress);
}

/**
 * Reset FHEVM instance
 */
export function resetFHEVM(): void {
  fhevmInstance = null;
}
