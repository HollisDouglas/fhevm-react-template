'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { useFHEVM, useEncrypt, useContract } from '@fhevm/sdk/react';

interface VotingDemoProps {
  account: string;
  provider: BrowserProvider | null;
}

// Simple voting contract ABI (example)
const VOTING_ABI = [
  'function vote(uint256 proposalId, bytes calldata handles, bytes calldata inputProof) external',
  'function getProposalInfo(uint256 proposalId) external view returns (string memory title, bool active)',
];

export default function VotingDemo({ account, provider }: VotingDemoProps) {
  const { isInitialized } = useFHEVM();
  const [contract, setContract] = useState<Contract | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number>(1);
  const [proposalId] = useState<number>(0);

  // Example contract address - replace with actual deployed contract
  const contractAddress = '0x0000000000000000000000000000000000000000';

  const { encrypt, loading: encrypting } = useEncrypt(contractAddress, account);
  const { send, loading: sending, error } = useContract(
    contract ? { contract } : { contract: null as any }
  );

  useEffect(() => {
    if (provider) {
      const votingContract = new Contract(
        contractAddress,
        VOTING_ABI,
        provider
      );
      setContract(votingContract);
    }
  }, [provider]);

  const handleVote = async () => {
    if (!contract || !isInitialized) return;

    try {
      // Encrypt the vote choice
      const encrypted = await encrypt({
        type: 'uint8',
        value: selectedChoice,
      });

      if (!encrypted) {
        alert('Failed to encrypt vote');
        return;
      }

      // Submit encrypted vote to contract
      const tx = await send('vote', [proposalId], encrypted);

      if (tx) {
        alert('Vote submitted successfully! Transaction: ' + tx.hash);
      }
    } catch (err) {
      console.error('Voting error:', err);
      alert('Failed to submit vote');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Confidential Voting Demo
      </h2>

      <div className="space-y-4">
        {/* Proposal Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            Proposal #{proposalId}
          </h3>
          <p className="text-sm text-gray-600">
            Example proposal for testing confidential voting
          </p>
        </div>

        {/* Vote Choice */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Vote
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedChoice(1)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                selectedChoice === 1
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✓ For
            </button>
            <button
              onClick={() => setSelectedChoice(2)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                selectedChoice === 2
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ✗ Against
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleVote}
          disabled={!isInitialized || encrypting || sending}
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {encrypting
            ? 'Encrypting Vote...'
            : sending
            ? 'Submitting Vote...'
            : 'Submit Confidential Vote'}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error.message}</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-800 mb-2">
            Privacy Guaranteed
          </h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>✓ Your vote is encrypted before submission</li>
            <li>✓ Only you can decrypt your vote</li>
            <li>✓ Results are computed on encrypted data</li>
            <li>✓ No one can see how you voted</li>
          </ul>
        </div>

        {/* Note about demo */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This is a demo interface. To use it with a
            real contract, update the <code>contractAddress</code> constant with
            your deployed contract address.
          </p>
        </div>
      </div>
    </div>
  );
}
