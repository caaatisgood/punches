import { useState, useEffect } from 'react'
import clsx from 'clsx'

import { House } from '@/types'
import { HOUSE_MAP } from '@/constants/house'
import { callGenesisWip, callPunch } from '@/utils/wallet'
import { useUserStore } from '@/store/userStore'
import Header from '@/components/Header'
import Countdown from '@/components/Countdown'

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
]
const PUNCH_PLACEHOLDERS = [
  "half way through the toy flow",
  "worked on getting more ppl on the app",
  "recorded the bridge",
  "edited the next vid",
  "noted down plans for next week",
  "struggled on a pesky bug",
  "read a blog about product iteration",
]

const ls = {
  getItem: (key: string) =>
    typeof window !== "undefined" && window.localStorage.getItem(`punches__${key}`),
  setItem: (key: string, value: string) => {
    typeof window !== "undefined" && window?.localStorage.setItem(`punches__${key}`, value)
  },
  removeItem: (key: string) => {
    typeof window !== "undefined" && window?.localStorage.removeItem(`punches__${key}`)
  },
}

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

const Page = () => {
  const [isCsrReady, setIsCsrReady] = useState(false)
  const [wipText, setWipText] = useState(local.getWip() || "")
  const [punchText, setPunchText] = useState("")
  const [house, setHouse] = useState<House | undefined>(local.getHouse())
  const [txStatus, setTxStatus] = useState<string | React.ReactNode>()
  const [justSetGenesisWip, setJustSetGenesisWip] = useState<boolean>(false)
  const [justPunch, setJustPunch] = useState<boolean>(false)

  const { address, wip, sync, syncWip, hasSyncedWip, isSyncingWip, punches, syncPunches, isSyncingPunches } = useUserStore()

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
        setTxStatus("your wip is waiting to be confirmed...")
      },
      onCompleted: async () => {
        resetWip()
        setJustSetGenesisWip(true)
        await syncWip()
        setTxStatus("")
      },
    })
  }

  const onSubmitPunch = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    await callPunch(punchText, {
      onWaitingToBeConfirmed: () => {
        setTxStatus("your punch is waiting to be confirmed...")
      },
      onCompleted: async () => {
        setPunchText("")
        setJustPunch(true)
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
        "brb..."
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
      if (justPunch) {
        return (
          <>
            <p className="mb-4 text-center">
              punched.<br />
              another solid step on your wip.<br />
              staying consistent is not always easy.<br />
              but hey, you back on it today.<br />
              so you should be proud of yourself.<br /><br />
              aight see you tmr.
            </p>
            <button className="underline" onClick={punchContinue}>continue {"->"}</button>
          </>
        )
      }
      if (isInPunchCd(lastPunchAt)) {
        return (
          <>
            <p className="mb-4 text-center">your next punch will be avail in</p>
            <p className="font-mono mb-4 text-center">
              {nextPunchAt && (
                <Countdown date={nextPunchAt} />
              )}
            </p>
            <p className="text-center">
              you’re either working on your wip or on the way to work on your wip.
            </p>
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
          <p className="text-center">hey again, how’s <i>“{wip.text}”</i> going?</p>
          <p className="text-center">what are the updates today?</p>
          <br />
          <p className='mb-4 text-center text-sm'>
            leave a note if you like to
          </p>
          <form className="flex flex-col w-full items-center" onSubmit={onSubmitPunch}>
            <input
              name="punch"
              className="mb-4 bg-neutral-900 text-center text-l w-full sm:w-4/5 lg:w-3/5 xl:w-[36rem] min-h-1 py-3 px-2 outline-none rounded-md"
              value={punchText}
              maxLength={PUNCH_TEXT_MAX_LEN}
              type='text'
              autoFocus
              onChange={(evt) => {
                setPunchText(evt.target.value)
              }}
              placeholder={randPunchPlaceholder}
            />
            <p className="text-xs mb-6">
              {punchText.length}/{PUNCH_TEXT_MAX_LEN}
            </p>
            <button
              className="shadow-lg shadow-neutral-500/50 px-2 py-1 rounded-md bg-neutral-100 text-neutral-900 disabled:cursor-not-allowed disabled:opacity-80 disabled:shadow-none"
              type="submit"
            >
              punch
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
        <p className="mb-4 text-center">sup, glad to see you here. what’s your work-in-progress?</p>
        <form className="flex flex-col w-full items-center" onSubmit={onSubmitGenesisWip}>
          <input
            name="wip"
            className="mb-4 bg-neutral-900 text-center text-l w-full sm:w-5/6 lg:w-3/5 xl:w-[50rem] min-h-1 py-3 px-2 outline-none rounded-md"
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
            className="shadow-lg shadow-neutral-500/50 px-2 py-1 rounded-md bg-neutral-100 text-neutral-900 disabled:cursor-not-allowed disabled:opacity-80 disabled:shadow-none"
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
      <Header />
      <main
        className={`font-sans flex min-h-screen flex-col items-center justify-center p-4`}
      >
        {_renderContent()}
      </main>
    </>
  )
}

export default Page
