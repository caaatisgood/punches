import { create } from 'zustand'
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType } from '@airgap/beacon-types'

import { KT_ADDRESS } from '../config'

type OperationReturn = Promise<string | undefined>

type Wip = {
  id: number;
  punch_ids: number[];
  set_at: string;
  wip: string;
}

interface UserStore {
  address?: string;
  wip?: Wip;
  punches?: any;
  sync: () => OperationReturn;
  unsync: () => void;
  syncWip: () => Promise<void | undefined>;
}

const DEFAULT_RPC = 'https://ghostnet.ecadinfra.com'
const DEFAULT_NETWORK = NetworkType.GHOSTNET

export const Tezos = new TezosToolkit(DEFAULT_RPC)

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
  wallet.getPKH().then(async address => {
    useUserStore.setState({
      address,
    })
    await useUserStore.getState().syncWip()
    if (useUserStore.getState().wip?.punch_ids?.length) {
    }
  }).catch(() => {})
}

export const useUserStore = create<UserStore>((set, get) => {
  return {
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
        wip: undefined,
      })
    },
    syncWip: async () => {
      // fetch genesis wip
      const addr = get().address
      await Tezos.wallet.at(KT_ADDRESS)
        .then((contract) => contract.contractViews.get_wip({ addr, id: 0 }))
        .then(viewResult => viewResult.executeView({ viewCaller: KT_ADDRESS }))
        .then(result => {
          const wip: Wip = {
            ...result,
            id: result.id.toNumber(),
            punch_ids: result.punch_ids.map((bn: any) => bn.toNumber()),
          }
          set({ wip });
        })
        .catch((error) => console.log("failed to get_wip ///", error))
      if (!get().wip) {
        return
      }
      await Tezos.wallet.at(KT_ADDRESS)
        .then((contract) => contract.contractViews.get_punches_of_wip({ addr, id: 0 }))
        .then(viewResult => viewResult.executeView({ viewCaller: KT_ADDRESS }))
        .then(result => {
          set({
            punches: result,
          })
        })
        .catch((error) => console.log("failed to get_punches_of_wip ///", error))
    },
  }
})
