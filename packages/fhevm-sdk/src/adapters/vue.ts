import { ref, computed, onMounted, onUnmounted, watch, type Ref } from 'vue';
import { BrowserProvider } from 'ethers';
import type {
  FHEVMConfig,
  FHEVMInstance,
  EncryptionOptions,
  EncryptedInput,
  EncryptionType,
  UseDecryptOptions,
} from '../types';
import { FHEVMClient } from '../core/fhevm-client';
import { EncryptionHelper } from '../core/encryption';
import { DecryptionHelper } from '../core/decryption';
import { getErrorMessage } from '../utils/helpers';

/**
 * Composable for FHEVM instance management
 */
export function useFHEVM(config?: Ref<FHEVMConfig> | FHEVMConfig) {
  const instance = ref<FHEVMInstance | null>(null);
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const initialize = async (initConfig?: FHEVMConfig) => {
    isLoading.value = true;
    error.value = null;

    try {
      const configValue = initConfig || (config && 'value' in config ? config.value : config) || {};

      // Get provider if not provided
      let provider = configValue.provider;
      if (!provider && typeof window !== 'undefined' && (window as any).ethereum) {
        provider = new BrowserProvider((window as any).ethereum);
      }

      if (!provider) {
        throw new Error('No provider available. Install MetaMask or provide a provider.');
      }

      const client = new FHEVMClient({
        ...configValue,
        provider,
      });

      await client.initialize();
      instance.value = client.getInstance();
      isInitialized.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(getErrorMessage(err));
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const reinitialize = async () => {
    instance.value = null;
    isInitialized.value = false;
    await initialize();
  };

  // Auto-initialize on mount if config is provided
  onMounted(() => {
    if (config) {
      initialize();
    }
  });

  // Watch for config changes
  if (config && 'value' in config) {
    watch(
      config,
      () => {
        if (isInitialized.value) {
          reinitialize();
        }
      },
      { deep: true }
    );
  }

  return {
    instance: computed(() => instance.value),
    isInitialized: computed(() => isInitialized.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    initialize,
    reinitialize,
  };
}

/**
 * Composable for encryption operations
 */
export function useEncrypt(
  instanceOrComposable: FHEVMInstance | ReturnType<typeof useFHEVM> | Ref<FHEVMInstance | null>,
  contractAddress: Ref<string> | string
) {
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const result = ref<EncryptedInput | null>(null);

  // Get the instance
  const getInstance = (): FHEVMInstance | null => {
    if ('instance' in instanceOrComposable) {
      return instanceOrComposable.instance.value;
    }
    if ('value' in instanceOrComposable) {
      return instanceOrComposable.value;
    }
    return instanceOrComposable as FHEVMInstance;
  };

  // Get contract address
  const getContractAddress = (): string => {
    return typeof contractAddress === 'string' ? contractAddress : contractAddress.value;
  };

  const encrypt = async (
    type: EncryptionType,
    value: any,
    userAddress: string
  ): Promise<EncryptedInput | null> => {
    isLoading.value = true;
    error.value = null;
    result.value = null;

    try {
      const fhevmInstance = getInstance();
      if (!fhevmInstance) {
        throw new Error('FHEVM instance not available');
      }

      const helper = new EncryptionHelper(fhevmInstance);
      const encrypted = await helper.encryptValue({
        type,
        value,
        contractAddress: getContractAddress(),
        userAddress,
      });

      result.value = encrypted;
      return encrypted;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(getErrorMessage(err));
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const encryptMultiple = async (
    values: Array<{ type: EncryptionType; value: any }>,
    userAddress: string
  ): Promise<EncryptedInput | null> => {
    isLoading.value = true;
    error.value = null;
    result.value = null;

    try {
      const fhevmInstance = getInstance();
      if (!fhevmInstance) {
        throw new Error('FHEVM instance not available');
      }

      const helper = new EncryptionHelper(fhevmInstance);
      const encrypted = await helper.encryptMultiple(
        values,
        getContractAddress(),
        userAddress
      );

      result.value = encrypted;
      return encrypted;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(getErrorMessage(err));
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const encryptBool = async (value: boolean, userAddress: string) => {
    return encrypt('bool', value, userAddress);
  };

  const encryptUint8 = async (value: number, userAddress: string) => {
    return encrypt('uint8', value, userAddress);
  };

  const encryptUint16 = async (value: number, userAddress: string) => {
    return encrypt('uint16', value, userAddress);
  };

  const encryptUint32 = async (value: number, userAddress: string) => {
    return encrypt('uint32', value, userAddress);
  };

  const encryptUint64 = async (value: bigint, userAddress: string) => {
    return encrypt('uint64', value, userAddress);
  };

  const encryptAddress = async (value: string, userAddress: string) => {
    return encrypt('address', value, userAddress);
  };

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    result: computed(() => result.value),
    encrypt,
    encryptMultiple,
    encryptBool,
    encryptUint8,
    encryptUint16,
    encryptUint32,
    encryptUint64,
    encryptAddress,
  };
}

/**
 * Composable for decryption operations
 */
export function useDecrypt(
  instanceOrComposable: FHEVMInstance | ReturnType<typeof useFHEVM> | Ref<FHEVMInstance | null>,
  signer: Ref<any> | any,
  options?: Ref<UseDecryptOptions> | UseDecryptOptions
) {
  const isLoading = ref(false);
  const error = ref<Error | null>(null);
  const result = ref<bigint | number | boolean | null>(null);

  // Get the instance
  const getInstance = (): FHEVMInstance | null => {
    if ('instance' in instanceOrComposable) {
      return instanceOrComposable.instance.value;
    }
    if ('value' in instanceOrComposable) {
      return instanceOrComposable.value;
    }
    return instanceOrComposable as FHEVMInstance;
  };

  // Get signer
  const getSigner = () => {
    return 'value' in signer ? signer.value : signer;
  };

  // Get options
  const getOptions = (): UseDecryptOptions => {
    const opts = options && 'value' in options ? options.value : options;
    return opts || { contractAddress: '', enabled: true };
  };

  const decrypt = async (
    contractAddress: string,
    handle: string
  ): Promise<bigint | number | boolean | null> => {
    isLoading.value = true;
    error.value = null;
    result.value = null;

    try {
      const fhevmInstance = getInstance();
      if (!fhevmInstance) {
        throw new Error('FHEVM instance not available');
      }

      const signerInstance = getSigner();
      if (!signerInstance) {
        throw new Error('Signer not available');
      }

      const helper = new DecryptionHelper(fhevmInstance, signerInstance);
      const decrypted = await helper.getUserDecrypt(contractAddress, handle);

      result.value = decrypted;
      return decrypted;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(getErrorMessage(err));
      return null;
    } finally {
      isLoading.value = false;
    }
  };

  const refetch = async () => {
    const opts = getOptions();
    if (opts.contractAddress && opts.handle) {
      return decrypt(opts.contractAddress, opts.handle);
    }
    return null;
  };

  // Auto-fetch on mount if enabled and options are provided
  onMounted(() => {
    const opts = getOptions();
    if (opts.enabled !== false && opts.contractAddress && opts.handle) {
      decrypt(opts.contractAddress, opts.handle);
    }
  });

  // Watch for option changes
  if (options && 'value' in options) {
    watch(
      options,
      (newOptions) => {
        if (newOptions.enabled !== false && newOptions.contractAddress && newOptions.handle) {
          decrypt(newOptions.contractAddress, newOptions.handle);
        }
      },
      { deep: true }
    );
  }

  return {
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    result: computed(() => result.value),
    decrypt,
    refetch,
  };
}

/**
 * Composable for wallet connection
 */
export function useWallet() {
  const account = ref<string | null>(null);
  const chainId = ref<number | null>(null);
  const provider = ref<BrowserProvider | null>(null);
  const isConnected = ref(false);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const connect = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const browserProvider = new BrowserProvider((window as any).ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const network = await browserProvider.getNetwork();

      provider.value = browserProvider;
      account.value = accounts[0];
      chainId.value = Number(network.chainId);
      isConnected.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(getErrorMessage(err));
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const disconnect = () => {
    account.value = null;
    chainId.value = null;
    provider.value = null;
    isConnected.value = false;
  };

  const switchNetwork = async (targetChainId: number) => {
    if (!isConnected.value) {
      throw new Error('Wallet not connected');
    }

    try {
      const chainIdHex = `0x${targetChainId.toString(16)}`;
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });

      chainId.value = targetChainId;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(getErrorMessage(err));
      throw err;
    }
  };

  // Listen for account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      account.value = accounts[0];
    }
  };

  // Listen for chain changes
  const handleChainChanged = (chainIdHex: string) => {
    chainId.value = parseInt(chainIdHex, 16);
  };

  onMounted(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      (window as any).ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            connect();
          }
        });
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
    }
  });

  return {
    account: computed(() => account.value),
    chainId: computed(() => chainId.value),
    provider: computed(() => provider.value),
    isConnected: computed(() => isConnected.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    connect,
    disconnect,
    switchNetwork,
  };
}
