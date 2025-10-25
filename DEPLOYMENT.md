# Deployment Guide

This guide covers deploying the FHEVM SDK examples to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [SDK Package Deployment](#sdk-package-deployment)
- [Next.js Example Deployment](#nextjs-example-deployment)
- [Governance Contract Deployment](#governance-contract-deployment)
- [Environment Configuration](#environment-configuration)

## Prerequisites

- Node.js 18+ installed
- npm/yarn/pnpm package manager
- Git installed
- MetaMask or similar Web3 wallet
- Access to an Ethereum RPC provider (Alchemy, Infura, or public nodes)

## SDK Package Deployment

### Building the SDK

```bash
# From project root
npm install
npm run build:sdk
```

### Publishing to npm (Optional)

If you want to publish the SDK to npm:

```bash
cd packages/fhevm-sdk

# Update version in package.json
npm version patch  # or minor, major

# Login to npm (first time only)
npm login

# Publish
npm publish --access public
```

## Next.js Example Deployment

### Deploy to Vercel

The easiest way to deploy the Next.js example:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to Example**
   ```bash
   cd examples/nextjs-example
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Follow Prompts**
   - Link to your Vercel account
   - Configure project settings
   - Deploy!

### Deploy to Netlify

1. **Build the Project**
   ```bash
   cd examples/nextjs-example
   npm install
   npm run build
   ```

2. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Manual Deployment

For other hosting providers:

```bash
cd examples/nextjs-example
npm install
npm run build
npm run start  # Or follow your provider's instructions
```

### Environment Variables

Set these environment variables for production:

```env
NEXT_PUBLIC_CHAIN_ID=8009
NEXT_PUBLIC_RPC_URL=https://devnet.zama.ai
NEXT_PUBLIC_GATEWAY_URL=https://gateway.fhevm.io
```

## Governance Contract Deployment

### Deploy to Local Network

1. **Start Hardhat Node**
   ```bash
   cd examples/governance-dapp
   npm run node
   ```

2. **Deploy Contract** (in another terminal)
   ```bash
   npm run deploy:local
   ```

### Deploy to Sepolia Testnet

1. **Configure Environment**
   ```bash
   cd examples/governance-dapp
   cp .env.example .env
   ```

2. **Edit .env File**
   ```env
   SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   PRIVATE_KEY=your_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key  # Optional, for verification
   ```

3. **Get Sepolia ETH**
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Request test ETH for your deployment address

4. **Deploy**
   ```bash
   npm run deploy:sepolia
   ```

5. **Verify on Etherscan** (Optional)
   ```bash
   npx hardhat verify --network sepolia CONTRACT_ADDRESS
   ```

### Deploy to FHEVM Network

For deploying to actual FHEVM-enabled networks:

1. **Update hardhat.config.js**
   ```javascript
   fhevmSepolia: {
     url: "https://devnet.zama.ai",
     accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
     chainId: 8009,
   }
   ```

2. **Deploy**
   ```bash
   npm run deploy:fhevm
   ```

### Deploy to Mainnet

⚠️ **Warning**: Only deploy to mainnet after thorough testing!

1. **Ensure All Tests Pass**
   ```bash
   npm test
   ```

2. **Configure Mainnet Settings**
   ```env
   MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
   PRIVATE_KEY=your_production_private_key
   ```

3. **Deploy**
   ```bash
   npm run deploy:mainnet
   ```

## Environment Configuration

### Development

```env
# .env.development
NODE_ENV=development
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
```

### Production

```env
# .env.production
NODE_ENV=production
NEXT_PUBLIC_CHAIN_ID=8009
NEXT_PUBLIC_RPC_URL=https://devnet.zama.ai
NEXT_PUBLIC_GATEWAY_URL=https://gateway.fhevm.io
```

## Post-Deployment

### Update Frontend with Contract Address

After deploying contracts, update the frontend:

```typescript
// examples/nextjs-example/src/components/VotingDemo.tsx
const contractAddress = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
```

### Test the Deployment

1. Open the deployed URL
2. Connect your wallet
3. Test encryption functionality
4. Test contract interactions
5. Verify on block explorer

## Monitoring

### Vercel Dashboard

- Monitor deployments at [vercel.com/dashboard](https://vercel.com/dashboard)
- View logs and analytics
- Set up custom domains

### Contract Verification

Verify your contracts on Etherscan for transparency:

```bash
npx hardhat verify --network sepolia \
  CONTRACT_ADDRESS \
  "Constructor Arg 1" "Constructor Arg 2"
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules .next dist
npm install
npm run build
```

### Deployment Issues

- Check environment variables are set correctly
- Ensure you have sufficient gas/ETH
- Verify network configuration
- Check RPC endpoint is accessible

### Contract Deployment Fails

- Verify private key has sufficient ETH
- Check network configuration in hardhat.config.js
- Ensure contract compiles without errors
- Check gas price settings

## Security Checklist

Before deploying to production:

- [ ] Never commit private keys or secrets
- [ ] Use environment variables for sensitive data
- [ ] Test thoroughly on testnet first
- [ ] Have contracts audited (for mainnet)
- [ ] Set up monitoring and alerts
- [ ] Configure proper access controls
- [ ] Enable rate limiting if applicable
- [ ] Set up backup systems

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Hardhat Deployment Guide](https://hardhat.org/guides/deploying.html)
- [FHEVM Documentation](https://docs.fhevm.io)
- [Etherscan Verification](https://docs.etherscan.io/tutorials/verifying-contracts)

## Support

For deployment issues:
- Check the [GitHub Issues](https://github.com/your-org/fhevm-sdk/issues)
- Review documentation in each package
- Consult the community forums

---

Happy Deploying! 🚀
