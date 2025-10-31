# FHEVM React Template

A production-ready React template for building confidential smart contract applications using Fully Homomorphic Encryption (FHE).

## Features

- React 18 with TypeScript
- Vite for fast development and building
- FHEVM SDK integration for encryption/decryption
- Ethers.js v6 for blockchain interactions
- Pre-configured wallet connection
- Encryption and decryption demo components
- Production-ready build configuration

## Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- MetaMask or another Web3 wallet

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your contract details:

```bash
cp .env.example .env
```

Edit `.env`:

```
VITE_CONTRACT_ADDRESS=0xYourContractAddress
VITE_CHAIN_ID=8009
VITE_RPC_URL=https://devnet.zama.ai
VITE_GATEWAY_URL=https://gateway.zama.ai
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Project Structure

```
src/
├── components/
│   ├── WalletConnect.tsx    # Wallet connection component
│   ├── EncryptDemo.tsx      # Encryption demo
│   └── DecryptDemo.tsx      # Decryption demo
├── hooks/                    # Custom React hooks
├── utils/                    # Utility functions
├── types/                    # TypeScript type definitions
├── App.tsx                   # Main application component
├── main.tsx                  # Application entry point
└── index.css                 # Global styles
```

## Usage

### Connecting Wallet

```typescript
import { WalletConnect } from './components/WalletConnect';

function App() {
  const [account, setAccount] = useState<string | null>(null);

  return (
    <WalletConnect
      onConnect={setAccount}
      onDisconnect={() => setAccount(null)}
      connectedAccount={account}
    />
  );
}
```

### Encrypting Values

```typescript
import { useEncrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { encryptUint32, isLoading, result } = useEncrypt(
    contractAddress,
    userAddress
  );

  const handleEncrypt = async () => {
    await encryptUint32(42);
    // Use result.handles and result.inputProof in contract call
  };

  return <button onClick={handleEncrypt}>Encrypt</button>;
}
```

### Decrypting Values

```typescript
import { useDecrypt } from '@fhevm/sdk/react';

function MyComponent({ handle }: { handle: string }) {
  const { result, isLoading, error } = useDecrypt({
    contractAddress,
    handle,
  });

  return <div>Decrypted value: {result?.toString()}</div>;
}
```

### Working with Smart Contracts

```typescript
import { Contract } from 'ethers';
import { useEncrypt } from '@fhevm/sdk/react';

function VotingComponent() {
  const { encryptUint8 } = useEncrypt(contractAddress, userAddress);

  const vote = async (choice: number) => {
    const encrypted = await encryptUint8(choice);

    const contract = new Contract(contractAddress, abi, signer);
    const tx = await contract.vote(
      encrypted.handles[0],
      encrypted.inputProof
    );

    await tx.wait();
  };

  return <button onClick={() => vote(1)}>Vote</button>;
}
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

## Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Static Hosting

Build the project and upload the `dist/` directory to any static hosting service.

## Configuration

### Network Configuration

Update `src/config.ts` to add custom networks:

```typescript
export const NETWORKS = {
  devnet: {
    chainId: 8009,
    name: 'Zama Devnet',
    rpcUrl: 'https://devnet.zama.ai',
  },
  // Add more networks...
};
```

### Contract ABI

Place your contract ABI in `src/contracts/`:

```typescript
export const CONTRACT_ABI = [
  // Your contract ABI
];
```

## Troubleshooting

### MetaMask Not Detected

Make sure MetaMask is installed and enabled in your browser.

### Build Errors

Clear node_modules and reinstall:

```bash
rm -rf node_modules
npm install
```

### Network Issues

Verify your `.env` file has the correct network configuration.

## Learn More

- [FHEVM SDK Documentation](../../docs/API.md)
- [FHEVM Tutorial](../../docs/TUTORIAL.md)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Ethers.js Documentation](https://docs.ethers.org/v6)

## License

MIT
