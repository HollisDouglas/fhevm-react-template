# Architecture Overview

This document explains the architecture and design decisions behind the Universal FHEVM SDK.

## Design Principles

### 1. Framework Agnostic

The SDK core is built without framework dependencies, allowing it to work with:
- Plain JavaScript/TypeScript
- Node.js applications
- React applications
- Vue applications
- Any other frontend framework

### 2. Modular Architecture

```
@fhevm/sdk
├── core/          # Framework-agnostic functionality
├── react/         # React-specific hooks
├── types/         # TypeScript type definitions
└── utils/         # Helper utilities
```

Each module can be imported independently:

```typescript
// Core only (no React dependency)
import { createFHEVMClient } from '@fhevm/sdk';

// React hooks
import { useFHEVM, useEncrypt } from '@fhevm/sdk/react';
```

### 3. TypeScript First

Full type safety throughout:
- All public APIs are typed
- IntelliSense support in IDEs
- Type inference for better DX
- Comprehensive type definitions

## Architecture Layers

### Layer 1: Core SDK

**Location**: `packages/fhevm-sdk/src/core/`

The foundation layer providing:

- **FHEVMClient**: Main client for FHEVM operations
- **EncryptionHelper**: Encryption utilities
- **DecryptionHelper**: Decryption utilities

```typescript
// Core architecture
FHEVMClient
  ├── initialize()      // Setup FHEVM instance
  ├── getPublicKey()    // Get encryption public key
  └── getInstance()     // Get fhevmjs instance

EncryptionHelper
  ├── encryptValue()        // Encrypt single value
  └── encryptMultiple()     // Encrypt multiple values

DecryptionHelper
  ├── requestDecryption()   // Request decryption
  ├── getUserDecrypt()      // User-specific decryption
  └── publicDecrypt()       // Public decryption
```

### Layer 2: React Integration

**Location**: `packages/fhevm-sdk/src/react/`

React-specific layer providing:

- **FHEVMProvider**: Context provider for FHEVM instance
- **useFHEVM**: Hook to access FHEVM instance
- **useEncrypt**: Hook for encryption operations
- **useDecrypt**: Hook for decryption operations
- **useContract**: Hook for contract interactions

```typescript
// React architecture
FHEVMProvider
  ├── manages FHEVM instance state
  ├── provides context to children
  └── handles initialization

useFHEVM()
  ├── instance: FHEVMInstance
  ├── isInitialized: boolean
  └── initialize(): Promise<void>

useEncrypt()
  ├── encrypt(): Promise<EncryptedInput>
  ├── encryptMultiple(): Promise<EncryptedInput>
  └── state: { loading, error, data }

useDecrypt()
  ├── decrypt(handle): Promise<any>
  └── state: { loading, error, data }

useContract()
  ├── send(method, args, encrypted?): Promise<Transaction>
  ├── call(method, args): Promise<any>
  └── state: { loading, error, data }
```

### Layer 3: Types

**Location**: `packages/fhevm-sdk/src/types/`

Comprehensive type definitions:

```typescript
// Type system
interface FHEVMConfig {
  network?: NetworkConfig;
  publicKey?: string;
  provider?: BrowserProvider;
  signer?: Signer;
}

interface EncryptedInput {
  handles: string[];
  inputProof: string;
}

type EncryptionType =
  | 'bool'
  | 'uint8' | 'uint16' | 'uint32'
  | 'uint64' | 'uint128' | 'uint256'
  | 'address'
  | 'bytes';
```

## Data Flow

### Encryption Flow

```
User Input
    ↓
useEncrypt Hook
    ↓
EncryptionHelper
    ↓
FHEVMClient.createEncryptedInput()
    ↓
fhevmjs (native library)
    ↓
EncryptedInput { handles, inputProof }
    ↓
Smart Contract Call
```

### Decryption Flow

```
Contract Handle
    ↓
useDecrypt Hook
    ↓
DecryptionHelper
    ↓
EIP-712 Signature
    ↓
Gateway Request
    ↓
Decrypted Value
```

### Complete User Flow

```
1. User connects wallet
        ↓
2. FHEVMProvider initializes
        ↓
3. Public key fetched
        ↓
4. User inputs data
        ↓
5. Data encrypted via useEncrypt
        ↓
6. Encrypted data sent to contract
        ↓
7. Contract processes encrypted data
        ↓
8. User requests decryption via useDecrypt
        ↓
9. EIP-712 signature created
        ↓
10. Gateway decrypts with signature
        ↓
11. Decrypted value returned to user
```

## Component Architecture

### Next.js Example

```
App
├── Providers
│   └── FHEVMProvider
│       ├── initializes FHEVM
│       └── provides context
│
├── Page
│   ├── ConnectWallet
│   │   └── handles wallet connection
│   │
│   ├── EncryptionDemo
│   │   ├── uses useEncrypt hook
│   │   └── demonstrates encryption
│   │
│   └── VotingDemo
│       ├── uses useEncrypt hook
│       ├── uses useContract hook
│       └── demonstrates voting
```

### Governance dApp

```
Hardhat Project
├── contracts/
│   └── ConfidentialGovernance.sol
│       ├── shareholder management
│       ├── proposal creation
│       └── confidential voting
│
├── scripts/
│   └── deploy.js
│       └── deployment logic
│
└── test/
    └── governance.test.js
        └── comprehensive tests
```

## State Management

### React Context Pattern

The SDK uses React Context for state management:

```typescript
FHEVMContext
  ├── instance: FHEVMInstance | null
  ├── isInitialized: boolean
  ├── isLoading: boolean
  ├── error: Error | null
  └── initialize: () => Promise<void>
```

Benefits:
- Global FHEVM instance
- Shared initialization state
- Automatic re-renders on state change
- No external state library needed

### Hook State Pattern

Individual hooks manage their own state:

```typescript
useEncrypt() {
  const [data, setData] = useState<EncryptedInput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Returns: { data, loading, error, encrypt }
}
```

## Security Considerations

### 1. Private Key Management

- Never expose private keys in frontend code
- Use browser wallet integration (MetaMask)
- Server-side operations use environment variables

### 2. Encryption Security

- Uses fhevmjs library (Zama's official implementation)
- Public key cryptography
- Proof generation for verification

### 3. Contract Security

- OpenZeppelin libraries for access control
- Input validation
- Reentrancy protection
- Gas optimization

## Performance Optimizations

### 1. Lazy Initialization

FHEVM instance initialized only when needed:

```typescript
useEffect(() => {
  if (provider && !isInitialized) {
    initialize();
  }
}, [provider, isInitialized]);
```

### 2. Memoization

Callbacks memoized to prevent re-renders:

```typescript
const encrypt = useCallback(async (options) => {
  // encryption logic
}, [instance, isInitialized]);
```

### 3. Code Splitting

SDK exports allow tree-shaking:

```typescript
// Only import what you need
import { createFHEVMClient } from '@fhevm/sdk'; // Core only
import { useFHEVM } from '@fhevm/sdk/react';    // React hooks
```

## Extensibility

### Adding New Encryption Types

```typescript
// In EncryptionHelper
addNewType(value: NewType): this {
  this.instance.addNewType(value);
  return this;
}
```

### Adding Framework Support

```typescript
// Create new framework directory
packages/fhevm-sdk/src/vue/
  ├── composables.ts
  └── index.ts
```

### Custom Hooks

Users can create custom hooks building on SDK primitives:

```typescript
function useConfidentialVote(proposalId: number) {
  const { encrypt } = useEncrypt(contractAddress, userAddress);
  const { send } = useContract({ contract });

  const vote = async (choice: number) => {
    const encrypted = await encrypt({ type: 'uint8', value: choice });
    return send('vote', [proposalId], encrypted);
  };

  return { vote };
}
```

## Testing Strategy

### Unit Tests

- Test individual functions
- Mock external dependencies
- Test error handling

### Integration Tests

- Test hook interactions
- Test context providers
- Test real encryption/decryption

### E2E Tests

- Test complete user flows
- Test contract interactions
- Test across networks

## Future Enhancements

### Planned Features

1. **Gateway Integration**: Full decryption gateway support
2. **Batch Operations**: Optimize multiple encryptions
3. **Caching**: Cache public keys and instances
4. **More Frameworks**: Vue, Svelte, Angular support
5. **CLI Tools**: Command-line utilities
6. **Plugin System**: Extensible architecture

### Roadmap

- **v1.1**: Gateway integration, batch operations
- **v1.2**: Vue and Svelte support
- **v2.0**: Advanced features, optimizations

## Conclusion

The Universal FHEVM SDK architecture prioritizes:

- **Modularity**: Use only what you need
- **Type Safety**: Full TypeScript support
- **Framework Agnostic**: Works everywhere
- **Developer Experience**: Intuitive APIs
- **Performance**: Optimized for production
- **Extensibility**: Easy to extend and customize

This architecture enables developers to build confidential dApps with minimal setup while maintaining flexibility and performance.
