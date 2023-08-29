import { create } from 'zustand'
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType } from '@airgap/beacon-types'

import { KT_ADDRESS } from '../config'

type OperationReturn = Promise<string | undefined>

type Wip = {
  id: number;
  punchIds: number[];
  setAt: string;
  text: string;
}
type Punch = {
  id: number;
  punchedAt: string;
  wipId: number;
  text: string | undefined;
}

interface UserStore {
  address?: string;
  wip?: Wip;
  punches?: Punch[];
  hasSyncedWip: boolean;
  isSyncingWip: boolean;
  isSyncingPunches: boolean;
  sync: () => OperationReturn;
  unsync: () => void;
  syncWip: () => Promise<void | undefined>;
  syncPunches: () => Promise<void | undefined>;
  debug: () => void;
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
  Tezos.setWalletProvider(wallet)
  return wallet
}

if (typeof window !== "undefined") {
  const wallet = initWallet();
  wallet.getPKH().then(async address => {
    useUserStore.setState({
      address,
    })
    await useUserStore.getState().syncWip()
    if (useUserStore.getState().wip?.punchIds?.length) {
      await useUserStore.getState().syncPunches()
    }
  }).catch(() => {})
}

export const useUserStore = create<UserStore>((set, get) => ({
  debug: () => console.log('dafuq?'),
  hasSyncedWip: false,
  isSyncingWip: false,
  isSyncingPunches: false,
  sync: async () => {
    const network = {
      type: DEFAULT_NETWORK,
      rpcUrl: DEFAULT_RPC, // TODO: make it customizable
    }

    const wallet = initWallet();

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
    get().syncWip();
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
    set({ isSyncingWip: true })
    const addr = get().address
    await Tezos.wallet.at(KT_ADDRESS)
      .then((contract) => contract.contractViews.get_wip({ addr, id: 0 }))
      .then(viewResult => viewResult.executeView({ viewCaller: KT_ADDRESS }))
      .then(result => {
        const wip: Wip = {
          id: result.id.toNumber(),
          punchIds: result.punch_ids.map((bn: any) => bn.toNumber()),
          setAt: result.set_at,
          text: result.text,
        }
        set({ wip });
      })
      .catch((error) => {
        console.log("failed to get_wip ///", error)
        set({ isSyncingWip: false })
      })
    if (!get().wip) {
      set({
        isSyncingWip: false,
        hasSyncedWip: true,
      })
      return
    }
    set({
      isSyncingWip: false,
      hasSyncedWip: true,
    })
    get().syncPunches()
  },
  syncPunches: async() => {
    set({
      isSyncingPunches: true,
    })
    const addr = get().address
    await Tezos.wallet.at(KT_ADDRESS)
      .then((contract) => contract.contractViews.get_punches_of_wip({ addr, id: 0 }))
      .then(viewResult => viewResult.executeView({ viewCaller: KT_ADDRESS }))
      .then((result: any[]) => {
        set({
          punches: result.map((punch) => ({
            id: punch.id.toNumber(),
            punchedAt: punch.punched_at,
            wipId: punch.wip_id.toNumber(),
            text: punch.text,
          })),
        })
      })
      .catch((error) => {
        set({
          isSyncingPunches: false,
        })
        console.log("failed to get_punches_of_wip ///", error)
      })
    set({
      isSyncingPunches: false,
    })
  },
}))
