# @fhevm/sdk

Universal FHEVM SDK for building confidential smart contract frontends with ease.

## Features

- **Framework Agnostic**: Works with Node.js, Next.js, React, Vue, or any frontend setup
- **Unified API**: Single SDK wrapping all required packages (fhevmjs, ethers)
- **wagmi-like Structure**: Intuitive hooks and utilities familiar to web3 developers
- **TypeScript First**: Full TypeScript support with comprehensive types
- **Production Ready**: Battle-tested encryption and decryption flows

## Installation

```bash
npm install @fhevm/sdk
# or
yarn add @fhevm/sdk
# or
pnpm add @fhevm/sdk
```

## Quick Start

### Core Usage (Framework Agnostic)

```typescript
import { createFHEVMClient } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

// Initialize FHEVM
const provider = new BrowserProvider(window.ethereum);
const fhevm = await createFHEVMClient({ provider });

// Encrypt data
const input = fhevm.createEncryptedInput(contractAddress, userAddress);
input.addUint32(42).addBool(true);
const encryptedData = input.encrypt();

// Use in contract call
const tx = await contract.myFunction(
  encryptedData.handles,
  encryptedData.inputProof
);
```

### React Usage

```tsx
import { FHEVMProvider, useFHEVM, useEncrypt } from '@fhevm/sdk/react';
import { BrowserProvider } from 'ethers';

// 1. Wrap your app with FHEVMProvider
function App() {
  const provider = new BrowserProvider(window.ethereum);

  return (
    <FHEVMProvider provider={provider}>
      <MyComponent />
    </FHEVMProvider>
  );
}

// 2. Use hooks in your components
function MyComponent() {
  const { instance, isInitialized } = useFHEVM();
  const { encrypt, loading, error } = useEncrypt(contractAddress, userAddress);

  const handleVote = async () => {
    const encrypted = await encrypt({
      type: 'uint8',
      value: 1 // Vote choice
    });

    if (encrypted) {
      await contract.vote(
        proposalId,
        encrypted.handles,
        encrypted.inputProof
      );
    }
  };

  return (
    <button onClick={handleVote} disabled={!isInitialized || loading}>
      Cast Vote
    </button>
  );
}
```

## API Reference

### Core API

#### `createFHEVMClient(config)`

Creates and initializes an FHEVM client instance.

**Parameters:**
- `config.provider`: BrowserProvider instance (required)
- `config.publicKey`: Optional pre-configured public key
- `config.network.chainId`: Network chain ID
- `config.network.rpcUrl`: RPC endpoint URL
- `config.network.gatewayUrl`: Optional gateway URL for decryption

**Returns:** `Promise<FHEVMInstance>`

#### `FHEVMInstance.createEncryptedInput(contractAddress, userAddress)`

Creates a builder for encrypted inputs.

**Parameters:**
- `contractAddress`: Target contract address
- `userAddress`: User's wallet address

**Returns:** `EncryptedInputBuilder`

#### `EncryptedInputBuilder` Methods

Chain multiple values to encrypt:

```typescript
const input = instance.createEncryptedInput(contractAddress, userAddress);

input
  .addBool(true)
  .addUint8(42)
  .addUint16(1000)
  .addUint32(100000)
  .addUint64(10000000n)
  .addUint128(BigInt('123456789'))
  .addUint256(BigInt('987654321'))
  .addAddress('0x...')
  .addBytes(new Uint8Array([1, 2, 3]));

const encrypted = input.encrypt();
```

### React Hooks

#### `useFHEVM()`

Access the global FHEVM instance and status.

**Returns:**
```typescript
{
  instance: FHEVMInstance | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  initialize: (config?: FHEVMConfig) => Promise<void>;
}
```

#### `useEncrypt(contractAddress, userAddress)`

Hook for encrypting data.

**Parameters:**
- `contractAddress`: Target contract address
- `userAddress`: User's wallet address

**Returns:**
```typescript
{
  data: EncryptedInput | null;
  loading: boolean;
  error: Error | null;
  encrypt: (options: { type: string; value: any }) => Promise<EncryptedInput>;
  encryptMultiple: (values: Array<{type, value}>) => Promise<EncryptedInput>;
}
```

**Example:**
```tsx
const { encrypt, loading } = useEncrypt(contractAddress, userAddress);

const encrypted = await encrypt({
  type: 'uint32',
  value: 42
});
```

#### `useDecrypt(options)`

Hook for decrypting data.

**Parameters:**
```typescript
{
  contractAddress: string;
  handle?: string;
  signer: Signer;
  enabled?: boolean; // Auto-fetch on mount
}
```

**Returns:**
```typescript
{
  data: bigint | number | boolean | null;
  loading: boolean;
  error: Error | null;
  decrypt: (handle: string) => Promise<any>;
}
```

#### `useContract({ contract })`

Hook for contract interactions with encrypted inputs.

**Parameters:**
- `contract`: Ethers Contract instance

**Returns:**
```typescript
{
  send: (method, args, encryptedInput?) => Promise<TransactionResponse>;
  call: (method, args) => Promise<any>;
  loading: boolean;
  error: Error | null;
}
```

**Example:**
```tsx
const { send, loading } = useContract({ contract });

await send('vote', [proposalId], encryptedInput);
```

## Usage Examples

### Example 1: Confidential Voting

```tsx
import { useEncrypt, useContract } from '@fhevm/sdk/react';

function VotingComponent({ contract, proposalId, userAddress }) {
  const { encrypt } = useEncrypt(contract.address, userAddress);
  const { send, loading } = useContract({ contract });

  const castVote = async (choice: number) => {
    // Encrypt vote choice
    const encrypted = await encrypt({
      type: 'uint8',
      value: choice
    });

    // Submit encrypted vote
    const tx = await send('vote', [proposalId], encrypted);
    await tx.wait();
  };

  return (
    <div>
      <button onClick={() => castVote(1)} disabled={loading}>
        Vote For
      </button>
      <button onClick={() => castVote(2)} disabled={loading}>
        Vote Against
      </button>
    </div>
  );
}
```

### Example 2: Private Token Transfer

```tsx
import { useEncrypt, useContract } from '@fhevm/sdk/react';

function TransferComponent({ contract, userAddress }) {
  const { encryptMultiple } = useEncrypt(contract.address, userAddress);
  const { send } = useContract({ contract });

  const transfer = async (to: string, amount: bigint) => {
    // Encrypt recipient and amount
    const encrypted = await encryptMultiple([
      { type: 'address', value: to },
      { type: 'uint64', value: amount }
    ]);

    // Execute transfer
    const tx = await send('transfer', [], encrypted);
    await tx.wait();
  };

  return <TransferForm onSubmit={transfer} />;
}
```

### Example 3: Node.js Usage

```typescript
import { createFHEVMClient } from '@fhevm/sdk';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';

async function main() {
  // Setup
  const provider = new JsonRpcProvider(RPC_URL);
  const wallet = new Wallet(PRIVATE_KEY, provider);
  const contract = new Contract(ADDRESS, ABI, wallet);

  // Initialize FHEVM
  const fhevm = await createFHEVMClient({
    provider,
    network: { chainId: 8009 }
  });

  // Encrypt and send
  const input = fhevm.createEncryptedInput(
    contract.address,
    wallet.address
  );

  input.addUint32(100);
  const encrypted = input.encrypt();

  const tx = await contract.myFunction(
    encrypted.handles,
    encrypted.inputProof
  );

  await tx.wait();
  console.log('Transaction completed');
}
```

## TypeScript Support

The SDK is written in TypeScript and provides comprehensive type definitions:

```typescript
import type {
  FHEVMConfig,
  FHEVMInstance,
  EncryptedInput,
  EncryptedInputBuilder,
  EncryptionType,
  DecryptionRequest,
  DecryptionResult
} from '@fhevm/sdk';
```

## Advanced Configuration

### Custom Network Configuration

```typescript
const fhevm = await createFHEVMClient({
  provider,
  network: {
    chainId: 8009,
    rpcUrl: 'https://your-rpc-url.com',
    gatewayUrl: 'https://gateway.fhevm.io'
  },
  publicKey: 'your-public-key' // Optional: provide your own public key
});
```

### Manual Initialization

```tsx
function App() {
  const { initialize, isInitialized } = useFHEVM();

  useEffect(() => {
    if (!isInitialized) {
      initialize({
        provider: myProvider,
        publicKey: MY_PUBLIC_KEY
      });
    }
  }, []);
}
```

## Best Practices

1. **Initialize Once**: Initialize FHEVM at the app root level
2. **Handle Errors**: Always check for errors in hooks
3. **Loading States**: Show loading indicators during encryption/decryption
4. **Type Safety**: Use TypeScript for better development experience
5. **Gas Optimization**: Batch multiple encrypted inputs when possible

## Supported Types

The SDK supports encryption of the following types:

- `bool`: Boolean values
- `uint8`, `uint16`, `uint32`: Small integers
- `uint64`, `uint128`, `uint256`: Large integers (use BigInt)
- `address`: Ethereum addresses
- `bytes`: Byte arrays

## Troubleshooting

### "Provider is required for FHEVM initialization"

Ensure you pass a valid BrowserProvider or JsonRpcProvider to the client or provider prop.

### "FHEVM not initialized"

Wait for initialization to complete or check the `isInitialized` flag before using hooks.

### "Public key is required"

Either provide a `publicKey` in the config or ensure the ACL contract is deployed on your network.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or PR on GitHub.

## Support

For issues and questions:
- GitHub Issues: [Report a bug](https://github.com/your-org/fhevm-sdk/issues)
- Documentation: [Full docs](https://docs.fhevm.io)
