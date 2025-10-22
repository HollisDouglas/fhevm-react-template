# Confidential Governance dApp Example

This example demonstrates a complete confidential governance system using the FHEVM SDK. It includes smart contracts for corporate voting and shareholder management with privacy-preserving features.

## Features

- ✅ Confidential shareholder voting
- ✅ Board member management
- ✅ Proposal creation and lifecycle
- ✅ Share-weighted voting power
- ✅ Multiple proposal types (Board, Budget, Merger, etc.)
- ✅ FHEVM SDK integration ready

## Project Structure

```
governance-dapp/
├── contracts/
│   └── ConfidentialGovernance.sol   # Main governance contract
├── scripts/
│   └── deploy.js                     # Deployment script
├── test/                             # Test files
├── hardhat.config.js                 # Hardhat configuration
├── package.json
└── .env.example                      # Environment template
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Deploy

```bash
# Deploy to local network
npm run node  # In one terminal
npm run deploy:local  # In another terminal

# Deploy to Sepolia testnet
npm run deploy:sepolia
```

## Contract Overview

### ConfidentialGovernance

Main governance contract with the following capabilities:

**Admin Functions:**
- `initCompany(name, totalShares)` - Initialize the company
- `addBoard(address)` - Add board members
- `addShareholder(address, shares, name)` - Register shareholders

**Governance Functions:**
- `createProposal(type, title, days)` - Create governance proposals
- `vote(proposalId, choice)` - Cast votes
- `voteConfidential(proposalId, choice)` - Cast encrypted votes (FHEVM)
- `finalize(proposalId)` - Finalize proposals after deadline
- `getResults(proposalId)` - Get voting results

**View Functions:**
- `getCompanyInfo()` - Get company details
- `getProposalInfo(id)` - Get proposal details
- `getShareholderInfo(address)` - Get shareholder details
- `hasVotedOn(id, address)` - Check if address has voted

## Proposal Types

| Type | Name | Threshold |
|------|------|-----------|
| 0 | BOARD | 50% |
| 1 | BUDGET | 60% |
| 2 | MERGER | 75% |
| 3 | DIVIDEND | 50% |
| 4 | BYLAW | 50% |
| 5 | STRATEGIC | 50% |

## Usage Example

```javascript
const { ethers } = require("hardhat");

async function main() {
  const governance = await ethers.getContractAt(
    "ConfidentialGovernance",
    contractAddress
  );

  // Initialize company
  await governance.initCompany("Tech Corp", 1000000);

  // Add board member
  await governance.addBoard(boardMemberAddress);

  // Register shareholder
  await governance.addShareholder(
    shareholderAddress,
    10000,
    "Alice Johnson"
  );

  // Create proposal
  const proposalId = await governance.createProposal(
    0,  // BOARD type
    "Elect new board member",
    7   // 7 days voting period
  );

  // Cast vote
  await governance.vote(proposalId, 1); // 1 = FOR, 2 = AGAINST

  // Finalize after deadline
  await governance.finalize(proposalId);

  // Get results
  const [forVotes, againstVotes, passed] = await governance.getResults(proposalId);
  console.log(`Proposal ${passed ? "PASSED" : "FAILED"}`);
}
```

## Integration with FHEVM SDK

This contract is designed to work seamlessly with the FHEVM SDK. The `voteConfidential` function can accept encrypted inputs:

```javascript
import { createFHEVMClient } from '@fhevm/sdk';

// Initialize FHEVM
const fhevm = await createFHEVMClient({ provider });

// Encrypt vote choice
const input = fhevm.createEncryptedInput(contractAddress, userAddress);
input.addUint8(1); // Vote choice
const encrypted = input.encrypt();

// Submit confidential vote
await contract.voteConfidential(
  proposalId,
  encrypted.handles,
  encrypted.inputProof
);
```

## Testing

The contract includes comprehensive tests covering:
- Company initialization
- Board member management
- Shareholder registration
- Proposal creation
- Voting mechanisms
- Result calculation
- Access control

## Security Considerations

- ✅ OpenZeppelin Ownable for access control
- ✅ Double voting prevention
- ✅ Deadline enforcement
- ✅ Share-weighted voting
- ✅ Input validation

## License

MIT

## Learn More

- [FHEVM SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
