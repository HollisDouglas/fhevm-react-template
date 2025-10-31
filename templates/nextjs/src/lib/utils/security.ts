/**
 * Security utilities for FHE operations
 */

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Sanitize user input before encryption
 */
export function sanitizeInput(value: any, type: string): any {
  switch (type) {
    case 'bool':
      return Boolean(value);

    case 'uint8':
    case 'uint16':
    case 'uint32':
      return Math.max(0, Math.floor(Number(value)));

    case 'uint64':
    case 'uint128':
    case 'uint256':
      return BigInt(value);

    case 'address':
      if (!isValidAddress(value)) {
        throw new Error('Invalid address format');
      }
      return value;

    case 'bytes':
      return value;

    default:
      return value;
  }
}

/**
 * Validate encryption parameters
 */
export function validateEncryptionParams(
  contractAddress: string,
  userAddress: string,
  type: string,
  value: any
): { valid: boolean; error?: string } {
  if (!isValidAddress(contractAddress)) {
    return { valid: false, error: 'Invalid contract address' };
  }

  if (!isValidAddress(userAddress)) {
    return { valid: false, error: 'Invalid user address' };
  }

  const supportedTypes = ['bool', 'uint8', 'uint16', 'uint32', 'uint64', 'uint128', 'uint256', 'address', 'bytes'];
  if (!supportedTypes.includes(type)) {
    return { valid: false, error: `Unsupported type: ${type}` };
  }

  if (value === undefined || value === null) {
    return { valid: false, error: 'Value cannot be null or undefined' };
  }

  return { valid: true };
}

/**
 * Generate a secure random identifier
 */
export function generateSecureId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}
