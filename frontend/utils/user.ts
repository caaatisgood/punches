import { useState, useEffect } from 'react'
import { Tezos, getWallet, callSetWip, viewWipGenesis } from '@/utils/wallet'
import { KT_ADDRESS } from '@/config'

export const usePkh = () => {
  const [pkh, setPkh] = useState<string>();
  useEffect(() => {
    ;(async () => {
      const wallet = await getWallet();
      const pkh = await wallet.getPKH();
      setPkh(pkh);
    })();
  }, []);
  return pkh
}

export const useUser = () => {
  const pkh = usePkh();
  const [genesisWip, setGenesisWip] = useState();

  useEffect(() => {
    ;(async () => {
      const genesisWip = await Tezos.wallet.at(KT_ADDRESS)
        .then((contract) => contract.contractViews.get_wip({ addr: pkh, id: 0 }))
        .then(viewResult => viewResult.executeView({ viewCaller: KT_ADDRESS }))
        .catch(error => {
          console.log("unable to load genesis wip", error);
        })
      setGenesisWip(genesisWip)
    })();
  }, [pkh])

  return {
    pkh,
    genesisWip,
  }
}
