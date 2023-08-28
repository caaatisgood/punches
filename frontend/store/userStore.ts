import { create } from 'zustand'
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType } from '@airgap/beacon-types'

type OperationReturn = Promise<string | undefined>

interface UserStore {
  address?: string;
  sync: () => OperationReturn;
  unsync: () => void;
}

const DEFAULT_RPC = 'https://ghostnet.ecadinfra.com'
const DEFAULT_NETWORK = NetworkType.GHOSTNET

const Tezos = new TezosToolkit(DEFAULT_RPC)

let wallet: BeaconWallet

const initWallet = () => {
  if (wallet) return wallet
  wallet = new BeaconWallet({
    name: 'punches',
    // appUrl: '',
    // iconUrl: '',
    preferredNetwork: DEFAULT_NETWORK,
  })
  return wallet
}

if (typeof window !== "undefined") {
  const wallet = initWallet();
  wallet.getPKH().then(address => {
    useUserStore.setState({
      address,
    })
  }).catch(() => {})
}

export const useUserStore = create<UserStore>((set) => ({
  sync: async () => {
    const network = {
      type: DEFAULT_NETWORK,
      rpcUrl: DEFAULT_RPC, // TODO: make it customizable
    }

    const wallet = initWallet();

    Tezos.setWalletProvider(wallet)

    const activeAccount = await wallet.client.getActiveAccount()
    if (
      !activeAccount ||
      activeAccount.network?.rpcUrl !== network.rpcUrl
    ) {
      await wallet.requestPermissions({ network })
      await wallet.client.getActiveAccount()
    }
    const address = await wallet.getPKH()
    set({
      address,
    })
    return address
  },
  unsync: async () => {
    await wallet.client.clearActiveAccount()
    set({
      address: undefined,
    })
  },
}))
