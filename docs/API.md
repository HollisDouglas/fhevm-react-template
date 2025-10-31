# FHEVM SDK API Reference

Complete API documentation for the FHEVM SDK.

## Table of Contents

- [Core](#core)
  - [FHEVMClient](#fhevmclient)
  - [EncryptionHelper](#encryptionhelper)
  - [DecryptionHelper](#decryptionhelper)
- [React Hooks](#react-hooks)
  - [useFHEVM](#usefhevm)
  - [useEncrypt](#useencrypt)
  - [useDecrypt](#usedecrypt)
- [Vue Composables](#vue-composables)
  - [useFHEVM (Vue)](#usefhevm-vue)
  - [useEncrypt (Vue)](#useencrypt-vue)
  - [useDecrypt (Vue)](#usedecrypt-vue)
  - [useWallet](#usewallet)
- [Types](#types)
- [Utilities](#utilities)

---

## Core

### FHEVMClient

Main class for FHEVM operations.

#### Constructor

```typescript
new FHEVMClient(config?: FHEVMConfig)
```

**Parameters:**
- `config` (optional): Configuration object
  - `network`: Network configuration
    - `chainId`: Chain ID (number)
    - `rpcUrl`: RPC URL (string)
    - `gatewayUrl`: Gateway URL for decryption (string, optional)
  - `publicKey`: FHE public key (string, optional)
  - `provider`: Ethers BrowserProvider (optional)
  - `signer`: Ethers Signer (optional)

#### Methods

##### `initialize(): Promise<void>`

Initializes the FHEVM client.

```typescript
const client = new FHEVMClient({ provider });
await client.initialize();
```

##### `getInstance(): FHEVMInstance`

Returns the FHEVM instance for use with helpers.

```typescript
const instance = client.getInstance();
```

##### `isInitialized(): boolean`

Checks if the client is initialized.

```typescript
if (client.isInitialized()) {
  // Ready to use
}
```

##### `getPublicKey(): string | null`

Returns the FHE public key.

```typescript
const publicKey = client.getPublicKey();
```

---

### EncryptionHelper

Helper class for encryption operations.

#### Constructor

```typescript
new EncryptionHelper(instance: FHEVMInstance)
```

#### Methods

##### `encryptValue(options: EncryptionOptions): Promise<EncryptedInput>`

Encrypts a single value.

```typescript
const encrypted = await helper.encryptValue({
  type: 'uint32',
  value: 42,
  contractAddress: '0x...',
  userAddress: '0x...',
});
```

**Parameters:**
- `options.type`: Encryption type (`'bool'`, `'uint8'`, `'uint16'`, `'uint32'`, `'uint64'`, `'uint128'`, `'uint256'`, `'address'`, `'bytes'`)
- `options.value`: Value to encrypt
- `options.contractAddress`: Target contract address
- `options.userAddress`: User's address

**Returns:** `EncryptedInput` object with `handles` and `inputProof`

##### `encryptMultiple(values, contractAddress, userAddress): Promise<EncryptedInput>`

Encrypts multiple values in a single operation.

```typescript
const encrypted = await helper.encryptMultiple(
  [
    { type: 'uint32', value: 42 },
    { type: 'bool', value: true },
  ],
  '0x...', // contractAddress
  '0x...'  // userAddress
);
```

---

### DecryptionHelper

Helper class for decryption operations with EIP-712 signing.

#### Constructor

```typescript
new DecryptionHelper(instance: FHEVMInstance, signer: Signer)
```

#### Methods

##### `requestDecryption(contractAddress, handle): Promise<DecryptionResult>`

Requests decryption of an encrypted value with EIP-712 signature.

```typescript
const result = await helper.requestDecryption(
  '0x...', // contractAddress
  '0x...'  // handle
);
```

**Returns:** Object with `plaintext` and `signature`

##### `getUserDecrypt(contractAddress, handle): Promise<bigint | number | boolean>`

Decrypts and returns only the plaintext value.

```typescript
const value = await helper.getUserDecrypt('0x...', '0x...');
```

##### `batchDecrypt(contractAddress, handles): Promise<Array<bigint | number | boolean>>`

Decrypts multiple handles at once.

```typescript
const values = await helper.batchDecrypt('0x...', ['0x...', '0x...']);
```

---

## React Hooks

### useFHEVM

React hook for managing FHEVM instance.

```typescript
const { instance, isInitialized, isLoading, error, initialize } = useFHEVM(config?);
```

**Parameters:**
- `config` (optional): FHEVMConfig object

**Returns:**
- `instance`: FHEVMInstance or null
- `isInitialized`: boolean
- `isLoading`: boolean
- `error`: Error or null
- `initialize(config?)`: Function to initialize

**Example:**

```typescript
function App() {
  const { instance, isInitialized, isLoading, error } = useFHEVM({
    provider: new BrowserProvider(window.ethereum),
  });

  if (isLoading) return <div>Initializing...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!isInitialized) return <div>Not initialized</div>;

  return <div>Ready!</div>;
}
```

---

### useEncrypt

React hook for encryption operations.

```typescript
const { encrypt, encryptBool, encryptUint32, isLoading, error, result } =
  useEncrypt(contractAddress, userAddress);
```

**Parameters:**
- `contractAddress`: string
- `userAddress`: string (optional)
- `autoInit`: boolean (optional, default: true)

**Returns:**
- `encrypt(type, value)`: Encrypt a value
- `encryptBool(value)`: Encrypt a boolean
- `encryptUint8(value)`: Encrypt a uint8
- `encryptUint16(value)`: Encrypt a uint16
- `encryptUint32(value)`: Encrypt a uint32
- `encryptUint64(value)`: Encrypt a uint64
- `encryptAddress(value)`: Encrypt an address
- `isLoading`: boolean
- `error`: Error or null
- `result`: EncryptedInput or null

**Example:**

```typescript
function EncryptForm() {
  const { encryptUint32, isLoading, result } = useEncrypt(
    '0x...', // contract address
    '0x...'  // user address
  );

  const handleEncrypt = async () => {
    await encryptUint32(42);
  };

  return (
    <button onClick={handleEncrypt} disabled={isLoading}>
      {isLoading ? 'Encrypting...' : 'Encrypt'}
    </button>
  );
}
```

---

### useDecrypt

React hook for decryption operations.

```typescript
const { decrypt, isLoading, error, result, refetch } =
  useDecrypt(options);
```

**Parameters:**
- `options.contractAddress`: string
- `options.handle`: string (optional)
- `options.account`: string (optional)
- `options.enabled`: boolean (optional, default: true)

**Returns:**
- `decrypt(contractAddress, handle)`: Decrypt a value
- `isLoading`: boolean
- `error`: Error or null
- `result`: bigint | number | boolean | null
- `refetch()`: Refetch the decrypted value

**Example:**

```typescript
function DecryptView({ handle }: { handle: string }) {
  const { result, isLoading, error } = useDecrypt({
    contractAddress: '0x...',
    handle,
    enabled: !!handle,
  });

  if (isLoading) return <div>Decrypting...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Value: {result?.toString()}</div>;
}
```

---

## Vue Composables

### useFHEVM (Vue)

Vue composable for managing FHEVM instance.

```typescript
const { instance, isInitialized, isLoading, error, initialize } = useFHEVM(config?);
```

**Parameters:**
- `config`: Ref<FHEVMConfig> | FHEVMConfig (optional)

**Returns:**
- `instance`: ComputedRef<FHEVMInstance | null>
- `isInitialized`: ComputedRef<boolean>
- `isLoading`: ComputedRef<boolean>
- `error`: ComputedRef<Error | null>
- `initialize(config?)`: Function to initialize
- `reinitialize()`: Function to reinitialize

**Example:**

```vue
<script setup lang="ts">
import { useFHEVM } from '@fhevm/sdk/adapters';
import { BrowserProvider } from 'ethers';

const { instance, isInitialized, isLoading, error } = useFHEVM({
  provider: new BrowserProvider(window.ethereum),
});
</script>

<template>
  <div v-if="isLoading">Initializing...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else-if="isInitialized">Ready!</div>
</template>
```

---

### useEncrypt (Vue)

Vue composable for encryption operations.

```typescript
const { encrypt, encryptBool, encryptUint32, isLoading, error, result } =
  useEncrypt(instance, contractAddress);
```

**Parameters:**
- `instance`: FHEVMInstance | ReturnType<typeof useFHEVM> | Ref<FHEVMInstance | null>
- `contractAddress`: Ref<string> | string

**Returns:**
- `encrypt(type, value, userAddress)`: Encrypt a value
- `encryptBool(value, userAddress)`: Encrypt a boolean
- `encryptUint8(value, userAddress)`: Encrypt a uint8
- `encryptUint16(value, userAddress)`: Encrypt a uint16
- `encryptUint32(value, userAddress)`: Encrypt a uint32
- `encryptUint64(value, userAddress)`: Encrypt a uint64
- `encryptAddress(value, userAddress)`: Encrypt an address
- `encryptMultiple(values, userAddress)`: Encrypt multiple values
- `isLoading`: ComputedRef<boolean>
- `error`: ComputedRef<Error | null>
- `result`: ComputedRef<EncryptedInput | null>

**Example:**

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useFHEVM, useEncrypt } from '@fhevm/sdk/adapters';

const fhevm = useFHEVM();
const contractAddress = ref('0x...');
const { encryptUint32, isLoading, result } = useEncrypt(
  fhevm.instance,
  contractAddress
);

const handleEncrypt = async () => {
  await encryptUint32(42, '0x...');
};
</script>

<template>
  <button @click="handleEncrypt" :disabled="isLoading">
    {{ isLoading ? 'Encrypting...' : 'Encrypt' }}
  </button>
</template>
```

---

### useDecrypt (Vue)

Vue composable for decryption operations.

```typescript
const { decrypt, isLoading, error, result, refetch } =
  useDecrypt(instance, signer, options?);
```

**Parameters:**
- `instance`: FHEVMInstance | ReturnType<typeof useFHEVM> | Ref<FHEVMInstance | null>
- `signer`: Ref<Signer> | Signer
- `options`: Ref<UseDecryptOptions> | UseDecryptOptions (optional)
  - `contractAddress`: string
  - `handle`: string (optional)
  - `enabled`: boolean (optional)

**Returns:**
- `decrypt(contractAddress, handle)`: Decrypt a value
- `isLoading`: ComputedRef<boolean>
- `error`: ComputedRef<Error | null>
- `result`: ComputedRef<bigint | number | boolean | null>
- `refetch()`: Refetch the decrypted value

---

### useWallet

Vue composable for wallet connection management.

```typescript
const { account, chainId, provider, isConnected, connect, disconnect, switchNetwork } =
  useWallet();
```

**Returns:**
- `account`: ComputedRef<string | null>
- `chainId`: ComputedRef<number | null>
- `provider`: ComputedRef<BrowserProvider | null>
- `isConnected`: ComputedRef<boolean>
- `isLoading`: ComputedRef<boolean>
- `error`: ComputedRef<Error | null>
- `connect()`: Connect wallet
- `disconnect()`: Disconnect wallet
- `switchNetwork(chainId)`: Switch to different network

**Example:**

```vue
<script setup lang="ts">
import { useWallet } from '@fhevm/sdk/adapters';

const { account, isConnected, connect, disconnect } = useWallet();
</script>

<template>
  <button v-if="!isConnected" @click="connect">
    Connect Wallet
  </button>
  <div v-else>
    <p>Connected: {{ account }}</p>
    <button @click="disconnect">Disconnect</button>
  </div>
</template>
```

---

## Types

### FHEVMConfig

```typescript
interface FHEVMConfig {
  network?: {
    chainId: number;
    rpcUrl: string;
    gatewayUrl?: string;
  };
  publicKey?: string;
  provider?: BrowserProvider;
  signer?: Signer;
}
```

### EncryptedInput

```typescript
interface EncryptedInput {
  handles: string[];
  inputProof: string;
}
```

### EncryptionType

```typescript
type EncryptionType =
  | 'bool'
  | 'uint8'
  | 'uint16'
  | 'uint32'
  | 'uint64'
  | 'uint128'
  | 'uint256'
  | 'address'
  | 'bytes';
```

### DecryptionResult

```typescript
interface DecryptionResult {
  plaintext: bigint | number | boolean;
  signature: string;
}
```

---

## Utilities

### Validation

```typescript
import {
  isValidAddress,
  isValidHex,
  validateEncryptionInput,
  validateContractAddress,
} from '@fhevm/sdk/utils';
```

### Formatting

```typescript
import {
  formatBigInt,
  parseToBigInt,
  shortenAddress,
  formatEther,
  parseEther,
} from '@fhevm/sdk/utils';
```

### Constants

```typescript
import {
  FHEVM_NETWORKS,
  ACL_ADDRESSES,
  GATEWAY_URLS,
  getNetworkConfig,
  isSupportedNetwork,
} from '@fhevm/sdk/utils';
```

### Helpers

```typescript
import {
  delay,
  retryWithBackoff,
  debounce,
  throttle,
  getCurrentAccount,
  switchNetwork,
} from '@fhevm/sdk/utils';
```

---

## Error Handling

All async functions may throw errors. Always wrap in try-catch:

```typescript
try {
  const result = await helper.getUserDecrypt(contractAddress, handle);
} catch (error) {
  console.error('Decryption failed:', error.message);
}
```

Common errors:
- `NOT_INITIALIZED`: FHEVM not initialized
- `INVALID_ADDRESS`: Invalid Ethereum address
- `INVALID_HANDLE`: Invalid handle format
- `ENCRYPTION_FAILED`: Encryption operation failed
- `DECRYPTION_FAILED`: Decryption operation failed
- `NETWORK_ERROR`: Network request failed

---

## License

MIT
