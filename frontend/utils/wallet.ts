import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType } from '@airgap/beacon-types'

import { KT_ADDRESS } from '../config'

export const Tezos = new TezosToolkit('https://ghostnet.ecadinfra.com');

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

export const callSetWip = async (wip: string) => {
  Tezos.wallet.at(KT_ADDRESS)
    .then((contract) => {
      console.log(contract)
      return contract.methods.set_wip(wip).send()
    })
    .then((op) => {
      console.log(`Hash: ${op.opHash}`);
      return op.confirmation();
    })
    .then((result) => {
      console.log(result);
      if (result?.completed) {
        console.log(`Transaction correctly processed!
          Block: ${result.block.header.level}
          Chain ID: ${result.block.chain_id}`);
      } else {
        alert('An error has occurred')
      }
    })
    .catch((err) => alert(err));
}

export const viewWipGenesis = async (addr: string) => {
  return Tezos.wallet.at(KT_ADDRESS)
    .then((contract) => contract.contractViews.user_wip({ addr, id: 0 }))
    .then(viewResult => viewResult.executeView({ viewCaller: KT_ADDRESS }))
    .then(result => {
      console.log(result)
    })
}
