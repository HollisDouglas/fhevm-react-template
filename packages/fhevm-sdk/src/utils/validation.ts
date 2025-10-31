/**
 * Validation utilities for FHEVM SDK
 * Provides input validation, address checking, and type guards
 */

import { isAddress } from 'ethers';

/**
 * Validates if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return isAddress(address);
}

/**
 * Validates if a value is a valid uint8 (0-255)
 */
export function isValidUint8(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 255;
}

/**
 * Validates if a value is a valid uint16 (0-65535)
 */
export function isValidUint16(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 65535;
}

/**
 * Validates if a value is a valid uint32 (0-4294967295)
 */
export function isValidUint32(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 4294967295;
}

/**
 * Validates if a value is a valid uint64
 */
export function isValidUint64(value: bigint | number): boolean {
  const bigIntValue = typeof value === 'number' ? BigInt(value) : value;
  return bigIntValue >= 0n && bigIntValue <= 18446744073709551615n;
}

/**
 * Validates if a value is a valid boolean
 */
export function isValidBoolean(value: any): boolean {
  return typeof value === 'boolean';
}

/**
 * Validates if a value is valid bytes
 */
export function isValidBytes(value: string | Uint8Array): boolean {
  if (value instanceof Uint8Array) {
    return true;
  }
  if (typeof value === 'string') {
    // Check if it's a valid hex string
    return /^0x[0-9a-fA-F]*$/.test(value);
  }
  return false;
}

/**
 * Validates encryption type
 */
export function isValidEncryptionType(type: string): boolean {
  const validTypes = [
    'bool',
    'uint8',
    'uint16',
    'uint32',
    'uint64',
    'uint128',
    'uint256',
    'address',
    'bytes',
  ];
  return validTypes.includes(type);
}

/**
 * Validates that a provider is available and connected
 */
export function isProviderConnected(provider: any): boolean {
  if (!provider) {
    return false;
  }
  // Check if provider has necessary methods
  return (
    typeof provider.getNetwork === 'function' &&
    typeof provider.getSigner === 'function'
  );
}

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove potentially dangerous characters
  return input.replace(/[<>'"]/g, '');
}

/**
 * Validates a chain ID
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

/**
 * Validates contract address format
 */
export function validateContractAddress(address: string): { valid: boolean; error?: string } {
  if (!address) {
    return { valid: false, error: 'Address is required' };
  }
  if (typeof address !== 'string') {
    return { valid: false, error: 'Address must be a string' };
  }
  if (!isAddress(address)) {
    return { valid: false, error: 'Invalid Ethereum address format' };
  }
  return { valid: true };
}

/**
 * Validates encryption input data
 */
export function validateEncryptionInput(
  type: string,
  value: any
): { valid: boolean; error?: string } {
  if (!isValidEncryptionType(type)) {
    return { valid: false, error: `Invalid encryption type: ${type}` };
  }

  switch (type) {
    case 'bool':
      if (!isValidBoolean(value)) {
        return { valid: false, error: 'Value must be a boolean' };
      }
      break;
    case 'uint8':
      if (!isValidUint8(value)) {
        return { valid: false, error: 'Value must be a valid uint8 (0-255)' };
      }
      break;
    case 'uint16':
      if (!isValidUint16(value)) {
        return { valid: false, error: 'Value must be a valid uint16 (0-65535)' };
      }
      break;
    case 'uint32':
      if (!isValidUint32(value)) {
        return { valid: false, error: 'Value must be a valid uint32 (0-4294967295)' };
      }
      break;
    case 'uint64':
    case 'uint128':
    case 'uint256':
      if (typeof value !== 'bigint' && typeof value !== 'number') {
        return { valid: false, error: `Value must be a bigint or number for ${type}` };
      }
      break;
    case 'address':
      if (!isValidAddress(value)) {
        return { valid: false, error: 'Value must be a valid Ethereum address' };
      }
      break;
    case 'bytes':
      if (!isValidBytes(value)) {
        return { valid: false, error: 'Value must be valid bytes (hex string or Uint8Array)' };
      }
      break;
  }

  return { valid: true };
}
