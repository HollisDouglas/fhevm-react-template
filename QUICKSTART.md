# Quick Start Guide

Get started with the Universal FHEVM SDK in under 5 minutes!

## 🚀 For End Users

### Option 1: Use the SDK in Your Project

```bash
# Install the SDK
npm install @fhevm/sdk ethers

# Create your app file (app.ts)
```

```typescript
import { createFHEVMClient } from '@fhevm/sdk';
import { BrowserProvider } from 'ethers';

// Initialize FHEVM
const provider = new BrowserProvider(window.ethereum);
const fhevm = await createFHEVMClient({ provider });

// Encrypt data
const input = fhevm.createEncryptedInput(contractAddress, userAddress);
input.addUint32(42);
const encrypted = input.encrypt();

// Use in contract call
await contract.myFunction(encrypted.handles, encrypted.inputProof);
```

### Option 2: Use with React

```bash
npm install @fhevm/sdk ethers react react-dom
```

```tsx
import { FHEVMProvider, useFHEVM, useEncrypt } from '@fhevm/sdk/react';

function App() {
  const provider = new BrowserProvider(window.ethereum);

  return (
    <FHEVMProvider provider={provider}>
      <MyComponent />
    </FHEVMProvider>
  );
}

function MyComponent() {
  const { isInitialized } = useFHEVM();
  const { encrypt, loading } = useEncrypt(contractAddress, userAddress);

  const handleEncrypt = async () => {
    const encrypted = await encrypt({ type: 'uint32', value: 42 });
    console.log(encrypted);
  };

  return (
    <button onClick={handleEncrypt} disabled={!isInitialized || loading}>
      Encrypt
    </button>
  );
}
```

## 🔧 For Developers (This Repository)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd fhevm-react-template

# Install all dependencies
npm install
```

### Step 2: Build the SDK

```bash
# Build the SDK package
npm run build:sdk
```

### Step 3: Run Examples

#### Option A: Next.js Example

```bash
# Run Next.js development server
npm run dev:nextjs

# Open http://localhost:3000
```

#### Option B: Governance Contracts

```bash
# Compile contracts
npm run compile:governance

# Run local node (in one terminal)
cd examples/governance-dapp
npm run node

# Deploy (in another terminal)
npm run deploy:local
```

## 📚 Example Workflows

### Workflow 1: Confidential Voting

```typescript
import { useEncrypt, useContract } from '@fhevm/sdk/react';

function VoteButton({ proposalId, choice }) {
  const { encrypt } = useEncrypt(contractAddress, userAddress);
  const { send } = useContract({ contract });

  const vote = async () => {
    // 1. Encrypt vote choice
    const encrypted = await encrypt({
      type: 'uint8',
      value: choice
    });

    // 2. Submit to contract
    const tx = await send('vote', [proposalId], encrypted);

    // 3. Wait for confirmation
    await tx.wait();
    alert('Vote submitted!');
  };

  return <button onClick={vote}>Vote</button>;
}
```

### Workflow 2: Private Token Transfer

```typescript
import { createFHEVMClient } from '@fhevm/sdk';

async function transferPrivately() {
  const fhevm = await createFHEVMClient({ provider });

  // Encrypt recipient and amount
  const input = fhevm.createEncryptedInput(tokenAddress, senderAddress);
  input.addAddress(recipientAddress);
  input.addUint64(amount);
  const encrypted = input.encrypt();

  // Execute transfer
  await tokenContract.transfer(
    encrypted.handles,
    encrypted.inputProof
  );
}
```

### Workflow 3: Node.js Backend

```javascript
import { createFHEVMClient } from '@fhevm/sdk';
import { JsonRpcProvider, Wallet } from 'ethers';

async function serverSideEncrypt() {
  const provider = new JsonRpcProvider(RPC_URL);
  const wallet = new Wallet(PRIVATE_KEY, provider);
  const fhevm = await createFHEVMClient({ provider });

  const input = fhevm.createEncryptedInput(contractAddress, wallet.address);
  input.addUint32(secretValue);
  const encrypted = input.encrypt();

  await contract.processSecret(encrypted.handles, encrypted.inputProof);
}
```

## 🎯 Common Tasks

### Deploy Governance Contract

```bash
# 1. Configure environment
cd examples/governance-dapp
cp .env.example .env
# Edit .env with your settings

# 2. Deploy to Sepolia
npm run deploy:sepolia

# 3. Note the contract address
```

### Integrate with Your Frontend

```bash
# 1. Install SDK
npm install @fhevm/sdk

# 2. Import and use
import { createFHEVMClient } from '@fhevm/sdk';

# 3. Start building!
```

### Deploy Next.js Example

```bash
cd examples/nextjs-example

# Vercel
vercel

# Or Netlify
npm run build
netlify deploy --prod
```

## 🐛 Troubleshooting

### Issue: "Cannot find module '@fhevm/sdk'"

**Solution**: Build the SDK first
```bash
npm run build:sdk
```

### Issue: "Provider is required"

**Solution**: Ensure you pass a provider
```typescript
const provider = new BrowserProvider(window.ethereum);
const fhevm = await createFHEVMClient({ provider });
```

### Issue: "FHEVM not initialized"

**Solution**: Wait for initialization
```typescript
const { isInitialized } = useFHEVM();
if (!isInitialized) {
  return <div>Loading...</div>;
}
```

### Issue: Encryption fails

**Solution**: Check contract address and user address are correct
```typescript
const { encrypt } = useEncrypt(
  '0x...', // Valid contract address
  userAddress // Valid user address
);
```

## 📖 Next Steps

1. **Read the Docs**
   - [SDK Documentation](./packages/fhevm-sdk/README.md)
   - [Architecture Guide](./ARCHITECTURE.md)
   - [Deployment Guide](./DEPLOYMENT.md)

2. **Explore Examples**
   - [Next.js Example](./examples/nextjs-example/)
   - [Governance dApp](./examples/governance-dapp/)

3. **Build Your dApp**
   - Use the SDK in your project
   - Customize the examples
   - Deploy to production

## 🆘 Getting Help

- **Documentation**: Check README files in each package
- **Examples**: See working code in `/examples`
- **Issues**: Report bugs on GitHub
- **Community**: Join discussions

## 🎉 Success!

You're now ready to build confidential dApps with FHEVM!

### What You Can Build

- 🗳️ Private voting systems
- 💰 Confidential token transfers
- 🏦 Private DeFi applications
- 🎮 Secret game mechanics
- 📊 Private governance
- 🔐 Any confidential computation!

### Quick Reference

```typescript
// Initialize
const fhevm = await createFHEVMClient({ provider });

// Encrypt
const input = fhevm.createEncryptedInput(contract, user);
input.addUint32(42);
const encrypted = input.encrypt();

// Use
await contract.method(encrypted.handles, encrypted.inputProof);
```

Happy building! 🚀

---

[← Back to Main README](./README.md) | [View Examples →](./examples/)
