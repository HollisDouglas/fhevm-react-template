# FHEVM SDK Tutorial

Step-by-step guide to building confidential smart contract applications with the FHEVM SDK.

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Building a React Application](#building-a-react-application)
5. [Building a Vue Application](#building-a-vue-application)
6. [Advanced Usage](#advanced-usage)
7. [Testing](#testing)
8. [Deployment](#deployment)

---

## Introduction

The FHEVM SDK enables you to build frontends for confidential smart contracts using Fully Homomorphic Encryption (FHE). With this SDK, you can:

- Encrypt sensitive data before sending it to smart contracts
- Decrypt encrypted values returned from contracts
- Integrate seamlessly with React, Vue, or vanilla JavaScript
- Handle wallet connections and network management

---

## Installation

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- MetaMask or another Web3 wallet

### Install the SDK

```bash
npm install @fhevm/sdk ethers
```

Or with yarn:

```bash
yarn add @fhevm/sdk ethers
```

---

## Quick Start

### Basic Setup (Vanilla JavaScript)

```typescript
import { FHEVMClient, EncryptionHelper } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

// 1. Create a provider
const provider = new BrowserProvider(window.ethereum);

// 2. Initialize FHEVM client
const client = new FHEVMClient({ provider });
await client.initialize();

// 3. Get the instance
const instance = client.getInstance();

// 4. Create encryption helper
const encryptionHelper = new EncryptionHelper(instance);

// 5. Encrypt a value
const userAddress = await provider.getSigner().getAddress();
const encrypted = await encryptionHelper.encryptValue({
  type: 'uint32',
  value: 42,
  contractAddress: '0x...',
  userAddress,
});

console.log('Encrypted:', encrypted);
```

---

## Building a React Application

### Step 1: Create a New React Project

```bash
npm create vite@latest my-fhevm-app -- --template react-ts
cd my-fhevm-app
npm install
npm install @fhevm/sdk ethers
```

### Step 2: Set Up FHEVM Provider

Create `src/providers/FHEVMProvider.tsx`:

```typescript
import { FHEVMProvider } from '@fhevm/sdk/react';
import { BrowserProvider } from 'ethers';
import { ReactNode, useEffect, useState } from 'react';

export function AppFHEVMProvider({ children }: { children: ReactNode }) {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      setProvider(new BrowserProvider(window.ethereum));
    }
  }, []);

  if (!provider) {
    return <div>Loading wallet provider...</div>;
  }

  return (
    <FHEVMProvider config={{ provider }}>
      {children}
    </FHEVMProvider>
  );
}
```

### Step 3: Create a Wallet Connect Component

Create `src/components/WalletConnect.tsx`:

```typescript
import { useState } from 'react';
import { BrowserProvider } from 'ethers';

export function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    setIsConnecting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div>
      {!account ? (
        <button onClick={connect} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div>
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      )}
    </div>
  );
}
```

### Step 4: Create an Encryption Component

Create `src/components/EncryptForm.tsx`:

```typescript
import { useState } from 'react';
import { useEncrypt } from '@fhevm/sdk/react';

const CONTRACT_ADDRESS = '0x...'; // Your contract address

export function EncryptForm({ userAddress }: { userAddress: string }) {
  const [value, setValue] = useState('');
  const { encryptUint32, isLoading, error, result } = useEncrypt(
    CONTRACT_ADDRESS,
    userAddress
  );

  const handleEncrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value) return;

    await encryptUint32(parseInt(value));
  };

  return (
    <div>
      <h2>Encrypt a Number</h2>

      <form onSubmit={handleEncrypt}>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a number"
          disabled={isLoading}
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Encrypting...' : 'Encrypt'}
        </button>
      </form>

      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}

      {result && (
        <div>
          <h3>Encrypted Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

### Step 5: Create a Decryption Component

Create `src/components/DecryptView.tsx`:

```typescript
import { useDecrypt } from '@fhevm/sdk/react';

const CONTRACT_ADDRESS = '0x...'; // Your contract address

export function DecryptView({ handle }: { handle: string }) {
  const { result, isLoading, error, refetch } = useDecrypt({
    contractAddress: CONTRACT_ADDRESS,
    handle,
    enabled: !!handle,
  });

  return (
    <div>
      <h2>Decrypt Value</h2>

      {isLoading && <div>Decrypting...</div>}

      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}

      {result !== null && (
        <div>
          <h3>Decrypted Value:</h3>
          <p>{result.toString()}</p>
          <button onClick={refetch}>Refresh</button>
        </div>
      )}
    </div>
  );
}
```

### Step 6: Put It All Together

Update `src/App.tsx`:

```typescript
import { AppFHEVMProvider } from './providers/FHEVMProvider';
import { WalletConnect } from './components/WalletConnect';
import { EncryptForm } from './components/EncryptForm';
import { DecryptView } from './components/DecryptView';
import { useState } from 'react';

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [handle, setHandle] = useState('');

  return (
    <AppFHEVMProvider>
      <div style={{ padding: '2rem' }}>
        <h1>FHEVM Application</h1>

        <WalletConnect />

        {account && (
          <>
            <EncryptForm userAddress={account} />

            <div style={{ marginTop: '2rem' }}>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="Enter handle to decrypt"
              />
            </div>

            {handle && <DecryptView handle={handle} />}
          </>
        )}
      </div>
    </AppFHEVMProvider>
  );
}

export default App;
```

### Step 7: Run Your Application

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Building a Vue Application

### Step 1: Create a New Vue Project

```bash
npm create vite@latest my-fhevm-vue-app -- --template vue-ts
cd my-fhevm-vue-app
npm install
npm install @fhevm/sdk ethers
```

### Step 2: Create Wallet Connect Component

Create `src/components/WalletConnect.vue`:

```vue
<script setup lang="ts">
import { useWallet } from '@fhevm/sdk/adapters';

const { account, isConnected, isLoading, connect, disconnect } = useWallet();
</script>

<template>
  <div class="wallet-connect">
    <button v-if="!isConnected" @click="connect" :disabled="isLoading">
      {{ isLoading ? 'Connecting...' : 'Connect Wallet' }}
    </button>

    <div v-else class="connected">
      <p>Connected: {{ account?.slice(0, 6) }}...{{ account?.slice(-4) }}</p>
      <button @click="disconnect">Disconnect</button>
    </div>
  </div>
</template>

<style scoped>
.wallet-connect {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

button {
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

### Step 3: Create Encryption Component

Create `src/components/EncryptForm.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useFHEVM, useEncrypt } from '@fhevm/sdk/adapters';

const props = defineProps<{
  userAddress: string;
}>();

const CONTRACT_ADDRESS = '0x...'; // Your contract address

const fhevm = useFHEVM();
const { encryptUint32, isLoading, error, result } = useEncrypt(
  fhevm.instance,
  CONTRACT_ADDRESS
);

const value = ref('');

const handleEncrypt = async () => {
  if (!value.value) return;
  await encryptUint32(parseInt(value.value), props.userAddress);
};
</script>

<template>
  <div class="encrypt-form">
    <h2>Encrypt a Number</h2>

    <form @submit.prevent="handleEncrypt">
      <input
        v-model="value"
        type="number"
        placeholder="Enter a number"
        :disabled="isLoading"
      />

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Encrypting...' : 'Encrypt' }}
      </button>
    </form>

    <div v-if="error" class="error">
      Error: {{ error.message }}
    </div>

    <div v-if="result" class="result">
      <h3>Encrypted Result:</h3>
      <pre>{{ JSON.stringify(result, null, 2) }}</pre>
    </div>
  </div>
</template>

<style scoped>
.encrypt-form {
  margin: 2rem 0;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

form {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

input {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex: 1;
}

.error {
  color: red;
  margin-top: 1rem;
}

.result {
  margin-top: 1rem;
}

pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
```

### Step 4: Create Main App

Update `src/App.vue`:

```vue
<script setup lang="ts">
import { useFHEVM, useWallet } from '@fhevm/sdk/adapters';
import WalletConnect from './components/WalletConnect.vue';
import EncryptForm from './components/EncryptForm.vue';

const fhevm = useFHEVM();
const { account, isConnected } = useWallet();
</script>

<template>
  <div id="app">
    <h1>FHEVM Vue Application</h1>

    <div v-if="fhevm.isLoading.value">
      Initializing FHEVM...
    </div>

    <div v-else-if="fhevm.error.value" class="error">
      FHEVM Error: {{ fhevm.error.value.message }}
    </div>

    <div v-else>
      <WalletConnect />

      <EncryptForm v-if="isConnected && account" :user-address="account" />
    </div>
  </div>
</template>

<style>
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: Arial, sans-serif;
}

h1 {
  color: #42b883;
}

.error {
  color: red;
  padding: 1rem;
  border: 1px solid red;
  border-radius: 4px;
  margin: 1rem 0;
}
</style>
```

### Step 5: Run Your Application

```bash
npm run dev
```

---

## Advanced Usage

### Working with Smart Contracts

```typescript
import { Contract } from 'ethers';
import { useEncrypt } from '@fhevm/sdk/react';

const CONTRACT_ABI = [...]; // Your contract ABI
const CONTRACT_ADDRESS = '0x...';

function VotingApp() {
  const { encryptUint8, result } = useEncrypt(CONTRACT_ADDRESS);
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setContract(new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer));
  }, []);

  const castVote = async (voteChoice: number) => {
    // Encrypt the vote
    const encrypted = await encryptUint8(voteChoice);

    if (!encrypted || !contract) return;

    // Send encrypted vote to contract
    const tx = await contract.castVote(
      encrypted.handles[0],
      encrypted.inputProof
    );

    await tx.wait();
    console.log('Vote cast successfully!');
  };

  return (
    <div>
      <button onClick={() => castVote(1)}>Vote Yes</button>
      <button onClick={() => castVote(0)}>Vote No</button>
    </div>
  );
}
```

### Batch Encryption

```typescript
const { encryptMultiple } = useEncrypt(CONTRACT_ADDRESS, userAddress);

const encrypted = await encryptMultiple([
  { type: 'uint32', value: 100 },
  { type: 'uint32', value: 200 },
  { type: 'bool', value: true },
]);
```

### Error Handling

```typescript
const { encrypt, error } = useEncrypt(CONTRACT_ADDRESS);

try {
  await encrypt('uint32', value);
} catch (err) {
  console.error('Encryption failed:', err);
}

// Or use the error state
if (error) {
  console.error('Error:', error.message);
}
```

### Custom Network Configuration

```typescript
const { initialize } = useFHEVM();

await initialize({
  network: {
    chainId: 8009,
    rpcUrl: 'https://devnet.zama.ai',
    gatewayUrl: 'https://gateway.zama.ai',
  },
  publicKey: '0x...', // Optional: provide FHE public key
});
```

---

## Testing

### Unit Testing with Vitest

```typescript
import { describe, it, expect, vi } from 'vitest';
import { EncryptionHelper } from '@fhevm/sdk';

describe('EncryptionHelper', () => {
  it('should encrypt a uint32 value', async () => {
    const mockInstance = {
      createEncryptedInput: vi.fn().mockReturnValue({
        addUint32: vi.fn().mockReturnThis(),
        encrypt: vi.fn().mockReturnValue({
          handles: ['0x...'],
          inputProof: '0x...',
        }),
      }),
    };

    const helper = new EncryptionHelper(mockInstance as any);

    const result = await helper.encryptValue({
      type: 'uint32',
      value: 42,
      contractAddress: '0x1234...',
      userAddress: '0x5678...',
    });

    expect(result.handles).toHaveLength(1);
    expect(result.inputProof).toBeTruthy();
  });
});
```

### Integration Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useFHEVM } from '@fhevm/sdk/react';

describe('useFHEVM', () => {
  it('should initialize FHEVM instance', async () => {
    const { result } = renderHook(() => useFHEVM());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.instance).toBeTruthy();
  });
});
```

---

## Deployment

### Build for Production

React:
```bash
npm run build
```

Vue:
```bash
npm run build
```

### Environment Variables

Create `.env`:

```
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=8009
VITE_RPC_URL=https://devnet.zama.ai
VITE_GATEWAY_URL=https://gateway.zama.ai
```

Use in code:

```typescript
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID);
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## Next Steps

- Read the [API Reference](./API.md) for detailed documentation
- Check out example applications in the `/examples` directory
- Join the community Discord for support
- Contribute to the SDK on GitHub

---

## Troubleshooting

### MetaMask Not Detected

Make sure MetaMask is installed and enabled. Check:

```typescript
if (typeof window.ethereum === 'undefined') {
  alert('Please install MetaMask!');
}
```

### Initialization Fails

Check that:
1. Provider is properly connected
2. Network is supported
3. Public key is available

### Encryption/Decryption Errors

Common issues:
- Invalid contract address format
- Wrong network/chain ID
- Missing signer for decryption
- Gateway unreachable

Enable debug logging:

```typescript
console.log('Instance:', instance);
console.log('Is initialized:', instance?.isInitialized());
```

---

## License

MIT
