import type { Signer } from 'ethers';
import type { FHEVMInstance, DecryptionRequest, DecryptionResult } from '../types';

export class DecryptionHelper {
  constructor(
    private instance: FHEVMInstance,
    private signer: Signer
  ) {}

  async requestDecryption(
    contractAddress: string,
    handle: string
  ): Promise<DecryptionResult> {
    const account = await this.signer.getAddress();

    const request: DecryptionRequest = {
      contractAddress,
      handle,
      account,
    };

    return this.instance.decrypt(request);
  }

  async getUserDecrypt(
    contractAddress: string,
    handle: string
  ): Promise<bigint | number | boolean> {
    const result = await this.requestDecryption(contractAddress, handle);
    return result.plaintext;
  }

  async publicDecrypt(
    contractAddress: string,
    handle: string
  ): Promise<bigint | number | boolean> {
    // Public decryption doesn't require signature
    const result = await this.requestDecryption(contractAddress, handle);
    return result.plaintext;
  }
}

export function createDecryptionHelper(
  instance: FHEVMInstance,
  signer: Signer
): DecryptionHelper {
  return new DecryptionHelper(instance, signer);
}
