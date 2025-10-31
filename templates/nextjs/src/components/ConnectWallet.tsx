interface ConnectWalletProps {
  connected: boolean;
  account: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function ConnectWallet({
  connected,
  account,
  onConnect,
  onDisconnect,
}: ConnectWalletProps) {
  if (!connected) {
    return (
      <button
        onClick={onConnect}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="bg-white px-4 py-2 rounded-lg shadow">
        <span className="text-sm text-gray-600">Connected:</span>
        <span className="ml-2 font-mono text-sm">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
      </div>
      <button
        onClick={onDisconnect}
        className="text-gray-600 hover:text-gray-900 transition"
      >
        Disconnect
      </button>
    </div>
  );
}
