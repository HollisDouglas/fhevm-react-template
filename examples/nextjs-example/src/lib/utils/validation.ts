/**
 * Validation utilities
 */

/**
 * Validate uint value is within range
 */
export function isValidUint(value: number | bigint, bits: 8 | 16 | 32 | 64 | 128 | 256): boolean {
  const bigValue = BigInt(value);

  if (bigValue < 0n) {
    return false;
  }

  const maxValue = 2n ** BigInt(bits) - 1n;
  return bigValue <= maxValue;
}

/**
 * Validate bool value
 */
export function isValidBool(value: any): boolean {
  return typeof value === 'boolean' || value === 0 || value === 1 || value === '0' || value === '1';
}

/**
 * Validate network configuration
 */
export function isValidNetwork(chainId: number): boolean {
  const supportedNetworks = [
    1, // Ethereum Mainnet
    11155111, // Sepolia
    8009, // Zama Devnet
  ];

  return supportedNetworks.includes(chainId);
}

/**
 * Validate contract ABI
 */
export function isValidABI(abi: any[]): boolean {
  if (!Array.isArray(abi)) {
    return false;
  }

  return abi.every(item =>
    item &&
    typeof item === 'object' &&
    'type' in item
  );
}

/**
 * Parse and validate user input
 */
export function parseUserInput(input: string, type: string): any {
  try {
    switch (type) {
      case 'bool':
        return input === 'true' || input === '1';

      case 'uint8':
      case 'uint16':
      case 'uint32':
        const num = parseInt(input, 10);
        if (isNaN(num)) throw new Error('Invalid number');
        return num;

      case 'uint64':
      case 'uint128':
      case 'uint256':
        return BigInt(input);

      case 'address':
        if (!/^0x[a-fA-F0-9]{40}$/.test(input)) {
          throw new Error('Invalid address');
        }
        return input;

      case 'bytes':
        return input;

      default:
        return input;
    }
  } catch (error) {
    throw new Error(`Failed to parse ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format display value
 */
export function formatDisplayValue(value: any, type: string): string {
  switch (type) {
    case 'bool':
      return value ? 'true' : 'false';

    case 'uint64':
    case 'uint128':
    case 'uint256':
      return BigInt(value).toString();

    case 'address':
      return `${value.slice(0, 6)}...${value.slice(-4)}`;

    default:
      return String(value);
  }
}
