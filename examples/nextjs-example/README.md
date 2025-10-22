# Next.js FHEVM Example

This is a complete Next.js application demonstrating the use of the FHEVM SDK for building confidential smart contract frontends.

## Features

- ✅ FHEVM SDK integration with React hooks
- ✅ Wallet connection (MetaMask)
- ✅ Encryption demonstration
- ✅ Confidential voting example
- ✅ Modern UI with Tailwind CSS
- ✅ TypeScript support
- ✅ App Router (Next.js 14)

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- MetaMask browser extension

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
nextjs-example/
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Main page
│   │   ├── providers.tsx    # FHEVM provider setup
│   │   └── globals.css      # Global styles
│   └── components/
│       ├── ConnectWallet.tsx     # Wallet connection UI
│       ├── EncryptionDemo.tsx    # Encryption example
│       └── VotingDemo.tsx        # Voting example
├── public/                   # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Usage Examples

### Using FHEVM Hooks

```tsx
import { useFHEVM, useEncrypt } from '@fhevm/sdk/react';

function MyComponent() {
  const { isInitialized } = useFHEVM();
  const { encrypt, loading } = useEncrypt(contractAddress, userAddress);

  const handleEncrypt = async () => {
    const encrypted = await encrypt({
      type: 'uint32',
      value: 42
    });
    // Use encrypted data in contract call
  };

  return (
    <button onClick={handleEncrypt} disabled={!isInitialized || loading}>
      Encrypt
    </button>
  );
}
```

### Confidential Contract Interaction

```tsx
import { useContract, useEncrypt } from '@fhevm/sdk/react';

function VotingComponent() {
  const { encrypt } = useEncrypt(contractAddress, userAddress);
  const { send } = useContract({ contract });

  const vote = async (choice: number) => {
    // 1. Encrypt the vote
    const encrypted = await encrypt({
      type: 'uint8',
      value: choice
    });

    // 2. Submit to contract
    const tx = await send('vote', [proposalId], encrypted);
    await tx.wait();
  };
}
```

## Configuration

### Network Setup

Edit `src/app/providers.tsx` to configure the network:

```tsx
<FHEVMProvider
  provider={provider}
  config={{
    network: {
      chainId: 8009,
      rpcUrl: 'https://devnet.zama.ai',
    }
  }}
>
```

### Contract Addresses

Update contract addresses in component files:

- `src/components/EncryptionDemo.tsx`
- `src/components/VotingDemo.tsx`

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [FHEVM Official Docs](https://docs.fhevm.io)

## License

MIT
