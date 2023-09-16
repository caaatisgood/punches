import Head from 'next/head'
import { useState, useEffect } from 'react'

import { House } from '@/types'
import { callGenesisWip, callPunch } from '@/utils/wallet'
import ls from '@/utils/localStorage'
import { useUserStore } from '@/store/userStore'
import Header from '@/components/Header'
import {
  Loader,
  AfterGenesisWip,
  AfterPunch,
  PunchCd,
} from '@/components/common'
import PunchForm from '@/components/PunchForm'
import WipForm from '@/components/WipForm'
import Sketch from '@/components/Sketch'
import useKey from '@/utils/useKey'

const PUNCH_CD = 86_400 * 1_000

const isInPunchCd = (dateString: string | undefined) => {
  if (!dateString) return false
  return Date.now() < new Date(dateString).getTime() + PUNCH_CD
}
const getNextPunchAt = (dateString: string | undefined) => {
  if (!dateString) {
    return
  }
  return new Date(new Date(dateString).getTime() + PUNCH_CD)
}

const local = {
  getWip: () => ls.getItem("wip_text"),
  setWip: (text: string) => ls.setItem("wip_text", text),
  removeWip: () => ls.removeItem("wip_text"),
  getHouse: () => ls.getItem("house") as House || undefined,
  setHouse: (house: string) => ls.setItem("house", house),
  removeHouse: () => ls.removeItem("house"),
}

const Page = () => {
  const [isCsrReady, setIsCsrReady] = useState(false)
  const [wipText, setWipText] = useState(local.getWip() || "")
  const [punchText, setPunchText] = useState("")
  const [house, setHouse] = useState<House | undefined>(local.getHouse())
  const [txStatus, setTxStatus] = useState<string | React.ReactNode>()
  const [justSetGenesisWip, setJustSetGenesisWip] = useState<boolean>(false)
  const [justPunch, setJustPunch] = useState<boolean>(false)
  const [, forceRerender] = useKey()

  const {
    address,
    wip,
    sync,
    syncWip,
    hasSyncedWip,
    isSyncingWip,
    punches,
    syncPunches,
    isSyncingPunches,
    // isSyncingAllPunches,
    // hasSyncedAllPunches,
    syncAllPunches,
    allPunches,
    house: chainHouse,
  } = useUserStore()

  const lastPunchAt = punches?.[0]?.punchedAt
  const nextPunchAt = getNextPunchAt(lastPunchAt)

  useEffect(() => {
    setIsCsrReady(true)
  }, [])

  const updateWip = (wipText: string) => {
    setWipText(wipText)
    local.setWip(wipText)
  }

  const updateHouse = (house: House) => {
    setHouse(house)
    local.setHouse(house)
  }

  const resetWip = () => {
    setWipText("")
    setHouse(undefined)
    local.removeWip()
    local.removeHouse()
  }

  const onSubmitGenesisWip = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    let tempAddr: string | undefined
    if (!address) {
      tempAddr = await sync()
    }
    if (!address && !tempAddr) {
      setTxStatus("unable to sync")
      return
    }
    if (wip) {
      return
    }
    await callGenesisWip(wipText, house!, {
      onWaitingToBeConfirmed: () => {
        setTxStatus("confirming your wip, this would take about 15 sec, hang tight...")
      },
      onCompleted: async () => {
        resetWip()
        setJustSetGenesisWip(true)
        syncAllPunches()
        await syncWip()
        setTxStatus("")
      },
    })
  }

  const onSubmitPunch = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    await callPunch(punchText, {
      onWaitingToBeConfirmed: () => {
        setTxStatus("confirming your punch, this would take about 15 sec, hang tight...")
      },
      onCompleted: async () => {
        setPunchText("")
        setJustPunch(true)
        syncAllPunches()
        await syncPunches()
        setTxStatus("")
      },
    })
  }

  const genesisWipContinue = () => {
    setJustSetGenesisWip(false)
  }

  const punchContinue = () => {
    setJustPunch(false)
  }

  if (!isCsrReady) {
    return null
  }

  const _renderContent = () => {
    if (isSyncingWip || isSyncingPunches || (address && !hasSyncedWip)) {
      return (
        <Loader />
      )
    }
    if (justSetGenesisWip) {
      return (
        <AfterGenesisWip cta={genesisWipContinue} />
      )
    }
    if (wip) {
      return (
        <>
          <div className='flex flex-row flex-1 w-full'>
            <div className='flex-1 flex flex-col items-center justify-center basis-1/2 min-w-[300px]'>
              {justPunch ? (
                <AfterPunch cta={punchContinue} />
              ) : isInPunchCd(lastPunchAt) ? (
                <PunchCd nextPunchAt={nextPunchAt} countdownCallback={forceRerender} />
              ) : (
                <PunchForm
                  wip={wip.text}
                  punch={punchText}
                  hasPunches={!!punches?.length}
                  house={chainHouse}
                  submissionStatus={txStatus}
                  onChangePunch={(evt) => {
                    setPunchText(evt.target.value)
                  }}
                  onSubmit={onSubmitPunch}
                />
              )}
            </div>
            <div className='flex-1 flex items-center justify-center flex-col'>
              <Sketch punches={allPunches} />
              <p className="text-sm italic">these are each and every punches from n&w s4 ppl</p>
            </div>
          </div>
        </>
      )
    }
    return (
      <WipForm
        wip={wipText}
        house={house}
        submissionStatus={txStatus}
        onChangeWip={(evt) => {
          updateWip(evt.target.value)
        }}
        onChangeHouse={(evt) => {
          updateHouse(evt.target.value as House)
        }}
        onSubmit={onSubmitGenesisWip}
      />
    )
  }

  return (
    <>
      <Head>
        <title>make consistent progress toward your goal | punches</title>
        <link rel="icon" type="image/x-icon" href="/favicon.png" />
      </Head>
      <main
        className={`font-sans flex min-h-screen flex-col items-center justify-center p-4`}
      >
        <Header />
        <div className="flex-1 flex items-center w-full">
          <div className='w-full justify-center'>
            {_renderContent()}
          </div>
        </div>
      </main>
    </>
  )
}

export default Page
