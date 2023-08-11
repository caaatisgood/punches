import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

const Tezos = new TezosToolkit('https://testnet-tezos.giganode.io');

let wallet: BeaconWallet

export const getWallet = (): BeaconWallet => {
  if (wallet) {
    return wallet
  }

  wallet = new BeaconWallet({
    name: 'Punches',
    // iconUrl: 'https://tezostaquito.io/img/favicon.svg',
    // @ts-ignore
    preferredNetwork: 'ghostnet',
    eventHandlers: {
      PERMISSION_REQUEST_SUCCESS: {
        handler: async (data: any) => {
          console.log('permission data:', data);
        },
      },
    },
  });
  
  Tezos.setProvider({ wallet });

  return wallet
}
