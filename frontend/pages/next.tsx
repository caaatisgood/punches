import { useState, useEffect } from 'react'
import clsx from 'clsx'

import { House } from '@/types'
import { HOUSE_MAP } from '@/constants/house'
import { callGenesisWip } from '@/utils/wallet'
import { useUserStore } from '@/store/userStore'
import Header from '@/components/Header'

const WIP_TEXT_MAX_LEN = 100
const PUNCH_TEXT_MAX_LEN = 50

const PLACEHOLDERS = [
  "building an app to help ppl make consistent progress toward their goal",
]

const ls = {
  getItem: (key: string) =>
    typeof window !== "undefined" && window.localStorage.getItem(`punches__${key}`),
  setItem: (key: string, value: string) => {
    typeof window !== "undefined" && window?.localStorage.setItem(`punches__${key}`, value)
  },
}

const local = {
  getWip: () => ls.getItem("wip_text"),
  setWip: (text: string) => ls.setItem("wip_text", text),
  getHouse: () => ls.getItem("house") as House || undefined,
  setHouse: (house: string) => ls.setItem("house", house),
}

const randPlaceholder = PLACEHOLDERS[Math.floor((Math.random() * PLACEHOLDERS.length))]

const Page = () => {
  const [isCsrReady, setIsCsrReady] = useState(false)
  const [wipText, setWipText] = useState(local.getWip() || "")
  const [house, setHouse] = useState<House>(local.getHouse())
  const [txStatus, setTxStatus] = useState<string | React.ReactNode>()
  const [justSetGenesisWip, setJustSetGenesisWip] = useState<boolean>(false)

  const { address, wip, sync, syncWip } = useUserStore()

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

  const onSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    let tempAddr: string | undefined
    if (!address) {
      tempAddr = await sync()
    }
    if (!address && !tempAddr) {
      setTxStatus("unable to sync")
      return
    }
    await callGenesisWip(wipText, house, {
      onWaitingToBeConfirmed: () => {
        setTxStatus("your wip is waiting to be confirmed...")
      },
      onCompleted: async () => {
        updateWip("")
        await syncWip()
        setJustSetGenesisWip(true)
        setTxStatus("")
      },
    })
  }

  if (!isCsrReady) {
    return null
  }

  return (
    <>
      <Header />
      <main
        className={`font-sans flex min-h-screen flex-col items-center justify-center p-4`}
      >
        {(wip) ? (
          <>
            {justSetGenesisWip ? (
              <>
                <p className="text-center">you’re all set. and you’re truly amazing.</p>
                <p className="text-center mb-4">now get back to biz, work on it, and come back to make your first punch.</p>
              </>
            ) : (
              <p className="text-center">hey again, how’s “{wip.text}” going?</p>
            )}
          </>
        ) : (
          <>
            <p className="mb-4 text-center">sup, glad to see you here. what is your work-in-progress?</p>
            <form className="flex flex-col w-full items-center" onSubmit={onSubmit}>
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
                placeholder={randPlaceholder}
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
        )}
      </main>
    </>
  )
}

export default Page
