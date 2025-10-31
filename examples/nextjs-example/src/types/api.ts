/**
 * API request and response types
 */

/**
 * Encryption API request
 */
export interface EncryptionAPIRequest {
  contractAddress: string;
  userAddress: string;
  type: string;
  value: any;
}

/**
 * Encryption API response
 */
export interface EncryptionAPIResponse {
  success: boolean;
  data?: {
    handles: string[];
    inputProof: string;
  };
  error?: string;
}

/**
 * Decryption API request
 */
export interface DecryptionAPIRequest {
  contractAddress: string;
  handle: string;
  userAddress: string;
  signature?: string;
}

/**
 * Decryption API response
 */
export interface DecryptionAPIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Computation API request
 */
export interface ComputationAPIRequest {
  contractAddress: string;
  method: string;
  handles: string[];
  inputProof: string;
  args?: any[];
}

/**
 * Computation API response
 */
export interface ComputationAPIResponse {
  success: boolean;
  data?: {
    transactionHash: string;
    blockNumber: number;
  };
  error?: string;
}

/**
 * Keys API response
 */
export interface KeysAPIResponse {
  success: boolean;
  publicKey?: string;
  error?: string;
}

/**
 * Generic API error
 */
export interface APIError {
  message: string;
  code?: string;
  details?: any;
}
