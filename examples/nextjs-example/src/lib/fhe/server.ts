import { createFHEVMClient } from '@fhevm/sdk';
import { JsonRpcProvider } from 'ethers';
import type { FHEVMInstance } from '@fhevm/sdk';

let serverFhevmInstance: FHEVMInstance | null = null;

/**
 * Initialize FHEVM for server-side operations
 */
export async function initServerFHEVM(rpcUrl?: string): Promise<FHEVMInstance> {
  if (serverFhevmInstance) {
    return serverFhevmInstance;
  }

  try {
    const provider = new JsonRpcProvider(rpcUrl || process.env.NEXT_PUBLIC_RPC_URL || 'https://devnet.zama.ai');
    serverFhevmInstance = await createFHEVMClient({ provider });
    return serverFhevmInstance;
  } catch (error) {
    console.error('Failed to initialize server FHEVM:', error);
    throw error;
  }
}

/**
 * Get server FHEVM instance
 */
export function getServerFHEVMInstance(): FHEVMInstance | null {
  return serverFhevmInstance;
}
