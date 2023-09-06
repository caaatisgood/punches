import Head from 'next/head'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

import { House } from '@/types'
import { HOUSE_MAP } from '@/constants/house'
import { callGenesisWip, callPunch } from '@/utils/wallet'
import ls from '@/utils/localStorage'
import { useUserStore } from '@/store/userStore'
import Header from '@/components/Header'
import Countdown from '@/components/Countdown'
import Sketch from '@/components/Sketch'
import useKey from '@/utils/useKey'

const WIP_TEXT_MAX_LEN = 100
const PUNCH_TEXT_MAX_LEN = 50
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

const WIP_PLACEHOLDERS = [
  "building an app to help ppl make consistent progress toward their goal",
  "become a person who read regularly",
  "creating video content about cool independent shops",
]
const PUNCH_PLACEHOLDERS = [
  "half way through the toy flow",
  "worked on getting more ppl on the app",
  "recorded the bridge",
  "edited the next vid",
  "noted down some build plans for the weekend",
  "struggled on a pesky bug",
  "read a blog about product iteration",
]

const local = {
  getWip: () => ls.getItem("wip_text"),
  setWip: (text: string) => ls.setItem("wip_text", text),
  removeWip: () => ls.removeItem("wip_text"),
  getHouse: () => ls.getItem("house") as House || undefined,
  setHouse: (house: string) => ls.setItem("house", house),
  removeHouse: () => ls.removeItem("house"),
}

const randWipPlaceholder = WIP_PLACEHOLDERS[Math.floor((Math.random() * WIP_PLACEHOLDERS.length))]
const randPunchPlaceholder = PUNCH_PLACEHOLDERS[Math.floor((Math.random() * PUNCH_PLACEHOLDERS.length))]

const titleStyle = "text-4xl leading-normal"

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
        <div className="flex-1 flex items-center">
          loading stuff, brb...
        </div>
      )
    }
    if (justSetGenesisWip) {
      return (
        <>
          <p className="text-center">you’re all set. so happy for you taking the first step. you’re truly amazing.</p>
          <p className="text-center mb-4">now get back to biz, work on it, and come back to make your first punch.</p>
          <button className="underline" onClick={genesisWipContinue}>continue {"->"}</button>
        </>
      )
    }
    if (wip) {
      return (
        <>
          <div className='flex flex-row flex-1 w-full'>
            <div className='flex-1 flex flex-col items-center justify-center basis-1/2 min-w-[300px]'>
              {justPunch ? (
                <>
                  <p className="mb-4 text-center">
                    punched.<br /><br />
                    another solid step on your wip.<br />
                    staying consistent is not always easy.<br />
                    but hey, you back on it today.<br />
                    so you should be proud of yourself.<br /><br />
                    see you at the next one?
                  </p>
                  <button className="underline" onClick={punchContinue}>continue {"->"}</button>
                </>
              ) : isInPunchCd(lastPunchAt) ? (
                <>
                  <p className="mb-4 text-center">your next punch will be avail in</p>
                  <p className="font-mono mb-4 text-center">
                    {nextPunchAt && (
                      <Countdown date={nextPunchAt} timesup={forceRerender} />
                    )}
                  </p>
                  <p className="text-center">
                    you’re either working on your wip or on the way to work on your wip.
                  </p>
                </>
              ) : (
                <>
                  <div className={clsx("mb-8 text-center")}>
                    <p>hey again, how’s <i>“{wip.text}”</i> going?</p>
                    <p>any new updates?</p>
                  </div>
                  <p className='mb-4 text-center text-sm'>
                    leave a note here
                  </p>
                  <form className="flex flex-col w-full items-center" onSubmit={onSubmitPunch}>
                    <input
                      name="punch"
                      className="mb-4 dark:bg-neutral-900 text-center text-base w-full sm:w-4/5 lg:w-3/5 xl:w-[36rem] min-h-1 py-3 px-2 outline-none rounded-md"
                      value={punchText}
                      maxLength={PUNCH_TEXT_MAX_LEN}
                      type='text'
                      autoFocus
                      onChange={(evt) => {
                        setPunchText(evt.target.value)
                      }}
                      placeholder={randPunchPlaceholder}
                    />
                    <p className="text-xs">
                      {punchText.length}/{PUNCH_TEXT_MAX_LEN}
                    </p>
                    {/* msg to those who havent punched yet */}
                    {punches?.length === 0 && (
                      <>
                        <p className="mt-6">
                          punch it to see a new viz with a bit more&nbsp;
                          <span className={clsx(
                            chainHouse === "spectreseek" && "text-red-500 bg-red-500",
                            chainHouse === "erevald" && "text-green-500 bg-green-500",
                            chainHouse === "gaudmire" && "text-yellow-500 bg-yellow-500",
                            chainHouse === "alterok" && "text-blue-500 bg-blue-500",
                          )}>{chainHouse}</span>
                          &nbsp;vibe
                        </p>
                      </>
                    )}
                    <button
                      className="mt-6 shadow-md shadow-neutral-500/50 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-900 disabled:cursor-not-allowed disabled:opacity-80 disabled:shadow-none"
                      type="submit"
                    >
                      punch
                    </button>
                  </form>
                  <div className='mt-3 italic text-sm text-center leading-4'>
                    {txStatus}&nbsp;
                  </div>
                </>
              )}
            </div>
            <div className='flex-1 flex items-center justify-center flex-col'>
              <Sketch punches={allPunches} />
              <p className="text-sm italic">these are each and every punches from n&w s4 ppl</p>
            </div>
          </div>
          {/* TODO: need more mood boosts here */}
          {/* <p className="text-center">
          </p>
          <p className="text-center">
            you got this.
          </p> */}
        </>
      )
    }
    return (
      <>
        <div className={clsx(titleStyle, "mb-8 text-center")}>
          <p>sup, glad to see you here.</p>
          <p>what’s your work-in-progress?</p>
        </div>
        <form className="flex flex-col w-full items-center" onSubmit={onSubmitGenesisWip}>
          <input
            name="wip"
            className="mb-4 dark:bg-neutral-900 text-center text-base w-full sm:w-5/6 lg:w-3/5 xl:w-[50rem] min-h-1 py-3 px-2 outline-none rounded-md"
            value={wipText}
            maxLength={WIP_TEXT_MAX_LEN}
            type='text'
            autoFocus
            required
            onChange={(evt) => {
              updateWip(evt.target.value)
            }}
            placeholder={randWipPlaceholder}
          />
          <p className="text-xs mb-6">
            {wipText.length}/{WIP_TEXT_MAX_LEN}
          </p>
          <div className="mb-2 flex gap-2 justify-center" title="choose wisely.">
            {Object.values(HOUSE_MAP).map(({ house: h }) => {
              const checked = h === house
              return (
                <div key={h}>
                  <label
                    className={clsx(
                      "rounded-md block w-6 h-6 cursor-pointer",
                      h === "spectreseek" && (checked ? "bg-red-500" : "bg-red-900"),
                      h === "erevald" && (checked ? "bg-green-500" : "bg-green-900"),
                      h === "gaudmire" && (checked ? "bg-yellow-500" : "bg-yellow-900"),
                      h === "alterok" && (checked ? "bg-blue-500" : "bg-blue-900"),
                      !checked && "opacity-85"
                    )}
                    htmlFor={h}
                    title={h}
                  />
                  <input
                    className="opacity-0 h-0 w-0 overflow-hidden absolute z-0"
                    type="radio"
                    id={h}
                    name={h}
                    value={h}
                    checked={checked}
                    onChange={(evt) => { updateHouse(evt.target.value as House) }}
                  />
                </div>
              )
            })}
          </div>
          <br />
          <button
            className="shadow-md shadow-neutral-500/20 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-900 disabled:cursor-not-allowed disabled:opacity-80 disabled:shadow-none"
            disabled={wipText.length === 0 || !house}
            type="submit"
          >
            set wip
          </button>
        </form>
        <div className='mt-3 italic text-sm text-center leading-4'>
          {txStatus}&nbsp;
        </div>
      </>
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
          <div className='w-full'>
            {_renderContent()}
          </div>
        </div>
      </main>
    </>
  )
}

export default Page
