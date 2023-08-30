import { StoreApi, UseBoundStore, create } from 'zustand'
import { TezosToolkit } from '@taquito/taquito'
import { BeaconWallet } from '@taquito/beacon-wallet'
import { NetworkType } from '@airgap/beacon-types'

import { House } from '@/types'
import { KT_ADDRESS } from '@/config'

type OperationReturn = Promise<string | undefined>

type Wip = {
  id: number;
  punchIds: number[];
  setAt: string;
  text: string;
}
export type Punch = {
  id: number;
  punchedAt: string;
  wipId: number;
  text: string | undefined;
  house: House;
}

interface UserStore {
  address?: string;
  house?: House;
  wip?: Wip;
  punches?: Punch[];
  allPunches?: Punch[];
  allPunchCount?: number;
  hasSyncedWip: boolean;
  isSyncingWip: boolean;
  isSyncingPunches: boolean;
  isSyncingAllPunches: boolean;
  hasSyncedAllPunches: boolean;
  sync: () => OperationReturn;
  unsync: () => void;
  syncWip: () => Promise<void | undefined>;
  syncPunches: () => Promise<void | undefined>;
  syncAllPunches: () => Promise<void | undefined>;
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

const afterSync = (state: UserStore) => {
  state.syncPunches()
  state.syncAllPunches()
}

if (typeof window !== "undefined") {
  const wallet = initWallet();
  wallet.getPKH().then(async address => {
    useUserStore.setState({
      address,
    })
    await useUserStore.getState().syncWip()
    if (useUserStore.getState().wip?.punchIds?.length) {
      afterSync(useUserStore.getState())
    }
  }).catch(() => {})
}

export const useUserStore = create<UserStore>((set, get) => ({
  debug: () => console.log('dafuq?'),
  hasSyncedWip: false,
  isSyncingWip: false,
  isSyncingPunches: false,
  isSyncingAllPunches: false,
  hasSyncedAllPunches: false,
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
    afterSync(get())
    return address
  },
  unsync: async () => {
    await wallet.client.clearActiveAccount()
    set({
      address: undefined,
      wip: undefined,
      house: undefined,
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
    Tezos.wallet.at(KT_ADDRESS)
      .then((contract) => contract.contractViews.get_house(addr))
      .then(viewResult => viewResult.executeView({ viewCaller: KT_ADDRESS }))
      .then((result: House) => {
        set({
          house: result,
        })
      })
      .catch((error) => {
        console.log("failed to get_house ///", error)
      })
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
          punches: result.map(_adaptPunch),
          isSyncingPunches: false,
        })
      })
      .catch((error) => {
        set({
          isSyncingPunches: false,
        })
        console.log("failed to get_punches_of_wip ///", error)
      })
  },
  syncAllPunches: async () => {
    set({
      isSyncingAllPunches: true,
    })
    await Tezos.wallet.at(KT_ADDRESS)
      .then((contract) => contract.contractViews.get_punches())
      .then(viewResult => viewResult.executeView({ viewCaller: KT_ADDRESS }))
      .then((result: any[]) => {
        set({
          allPunches: result.map(_adaptPunch),
          isSyncingAllPunches: false,
        })
      })
      .catch((error) => {
        set({
          isSyncingAllPunches: false,
        })
        console.log("failed to get_punches ///", error)
      })
  },
}))

const _adaptPunch = (punch: any): Punch => ({
  id: punch.id.toNumber(),
  punchedAt: punch.punched_at,
  wipId: punch.wip_id.toNumber(),
  text: punch.text,
  house: punch.house,
})
