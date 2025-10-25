import type { FHEVMInstance, EncryptionOptions, EncryptedInput } from '../types';

export class EncryptionHelper {
  constructor(private instance: FHEVMInstance) {}

  async encryptValue(options: EncryptionOptions): Promise<EncryptedInput> {
    const { type, value, contractAddress, userAddress } = options;

    const input = this.instance.createEncryptedInput(contractAddress, userAddress);

    switch (type) {
      case 'bool':
        input.addBool(Boolean(value));
        break;
      case 'uint8':
        input.addUint8(Number(value));
        break;
      case 'uint16':
        input.addUint16(Number(value));
        break;
      case 'uint32':
        input.addUint32(Number(value));
        break;
      case 'uint64':
        input.addUint64(BigInt(value));
        break;
      case 'uint128':
        input.addUint128(BigInt(value));
        break;
      case 'uint256':
        input.addUint256(BigInt(value));
        break;
      case 'address':
        input.addAddress(String(value));
        break;
      case 'bytes':
        input.addBytes(value instanceof Uint8Array ? value : new Uint8Array(value));
        break;
      default:
        throw new Error(`Unsupported encryption type: ${type}`);
    }

    return input.encrypt();
  }

  async encryptMultiple(
    values: Array<{ type: EncryptionOptions['type']; value: any }>,
    contractAddress: string,
    userAddress: string
  ): Promise<EncryptedInput> {
    const input = this.instance.createEncryptedInput(contractAddress, userAddress);

    for (const { type, value } of values) {
      switch (type) {
        case 'bool':
          input.addBool(Boolean(value));
          break;
        case 'uint8':
          input.addUint8(Number(value));
          break;
        case 'uint16':
          input.addUint16(Number(value));
          break;
        case 'uint32':
          input.addUint32(Number(value));
          break;
        case 'uint64':
          input.addUint64(BigInt(value));
          break;
        case 'uint128':
          input.addUint128(BigInt(value));
          break;
        case 'uint256':
          input.addUint256(BigInt(value));
          break;
        case 'address':
          input.addAddress(String(value));
          break;
        case 'bytes':
          input.addBytes(value instanceof Uint8Array ? value : new Uint8Array(value));
          break;
        default:
          throw new Error(`Unsupported encryption type: ${type}`);
      }
    }

    return input.encrypt();
  }
}

export function createEncryptionHelper(instance: FHEVMInstance): EncryptionHelper {
  return new EncryptionHelper(instance);
}
