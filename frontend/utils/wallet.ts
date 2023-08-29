import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType } from '@airgap/beacon-types'

import { Tezos } from '@/store/userStore'
import { House } from '@/types'

import { KT_ADDRESS } from '../config'

let wallet: BeaconWallet

export const getWallet = (): BeaconWallet => {
  if (wallet) {
    return wallet
  }

  wallet = new BeaconWallet({
    name: 'Punches',
    // iconUrl: 'https://tezostaquito.io/img/favicon.svg',
    preferredNetwork: NetworkType.GHOSTNET,
    eventHandlers: {
      PERMISSION_REQUEST_SUCCESS: {
        handler: async (data: any) => {
          console.log('permission data:', data);
        },
      },
    },
  });
  
  Tezos.setWalletProvider(wallet);

  return wallet
}

type KtCallOptions = {
  onWaitingToBeConfirmed?: (hash: string) => void;
  onCompleted?: () => void;
  onFailed?: () => void;
}

export const callGenesisWip = async (
  text: string,
  house: House,
  options?: KtCallOptions
) => {
  Tezos.wallet.at(KT_ADDRESS)
    .then((contract) => contract.methods.genesis_wip(text, house).send())
    .then((op) => {
      options?.onWaitingToBeConfirmed?.(op.opHash)
      return op.confirmation();
    })
    .then((result) => {
      if (result?.completed) {
        options?.onCompleted?.()
        console.log(`tx correctly processed!
          block: ${result.block.header.level}
          chain id: ${result.block.chain_id}`);
      } else {
        options?.onFailed?.()
        alert(`oops, there's def something wrong here. sry bout that :/ please @caaatisgood`);
      }
    })
    .catch((err) => console.log(err));
}

export const callPunch = async (
  text: string,
  options?: KtCallOptions
) => {
  await Tezos.wallet.at(KT_ADDRESS)
    .then((contract) => contract.methods.punch(0, text).send())
    .then((op) => {
      options?.onWaitingToBeConfirmed?.(op.opHash)
      return op.confirmation();
    })
    .then((result) => {
      if (result?.completed) {
        options?.onCompleted?.()
        console.log(`tx correctly processed!
          block: ${result.block.header.level}
          chain id: ${result.block.chain_id}`);
      } else {
        options?.onFailed?.()
        alert(`oops, there's def something wrong here. sry bout that :/ please @caaatisgood`);
      }
    })
}
