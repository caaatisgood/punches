import { useState, useEffect } from 'react'

import { getWallet, callSetWip, viewWipGenesis } from '@/utils/wallet'
import Header from '@/components/Header'

const WIP_MAX_CHARS = 100

const PLACEHOLDERS = [
  "building an app to help ppl make consistent progress toward their goal",
]

const local = {
  getWip: () =>
    String(typeof window !== "undefined" && window?.localStorage.getItem("punches_wip") || ""),
  setWip: (wip: string) =>
    typeof window !== "undefined" && window?.localStorage.setItem("punches_wip", wip),
}

const randPlaceholder = PLACEHOLDERS[Math.floor((Math.random() * PLACEHOLDERS.length))]

const Page = () => {
  const [isCsrReady, setIsCsrReady] = useState(false)
  const [wip, setWip] = useState(local.getWip() || "")
  // const [hasGenesisWip, setHasGenesisWip] = useState<boolean>(false)

  useEffect(() => {
    setIsCsrReady(true)
  }, [])
  // const divRef = useRef<HTMLDivElement>(null)

  // useEffect(() => {
  //   if (!divRef.current) return
  //   const divNode = divRef.current
  //   divNode.focus()
  //   const onInput = (event: Event) => {
  //     // @ts-ignore
  //     const text = event.target?.textContent || ""
  //     if (text.length > WIP_MAX_CHARS) {
  //       return
  //     }
  //     setWip(text)
  //   }
  //   divNode.addEventListener('input', onInput)
  //   return () => {
  //     divNode.removeEventListener('input', onInput)
  //   }
  // }, [divRef])

  const updateWip = (wip: string) => {
    setWip(wip)
    local.setWip(wip)
  }

  const onSubmit = async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    const wallet = getWallet()
    let pkh = await wallet.getPKH()
    if (!pkh) {
      // connect wallet
      pkh = await wallet
        .requestPermissions({
          network: {
            // @ts-ignore
            type: 'ghostnet',
          },
        })
        .then((_) => wallet.getPKH())
        .catch(error => {
          alert(error)
          return ""
        })
    }
    // call contract
    await callSetWip(wip);
  }

  if (!isCsrReady) {
    return null
  }

  // check if wallet already set goal

  return (
    <>
      <Header />
      <main
        className={`font-sans flex min-h-screen flex-col items-center justify-center p-4`}
      >
        {/* <h1 className="mb-4 text-center">
          punches / make consistent progress toward your goal
        </h1>
        <br />
        <br />
        <br /> */}
        <p className="mb-4 text-center">sup, glad to see you here. what is your work-in-progress?</p>
        {/* <div
          ref={divRef}
          className="mb-4 text-center text-xl w-full sm:w-2/3 lg:w-2/5 xl:w-96 min-h-1 py-3 outline-none"
          contentEditable
          onKeyDown={(evt) => {
            if (evt.code !== "Backspace" && (divRef.current?.textContent?.length || 0) >= WIP_MAX_CHARS) {
              // evt.preventDefault()
            }
          }}
          onPasteCapture={(evt) => {
            evt.preventDefault()
          [50rem]
        /> */}
        <form className="flex flex-col w-full items-center" onSubmit={onSubmit}>
          <input
            name="wip"
            className="mb-4 bg-neutral-900 text-center text-l w-full sm:w-2/3 lg:w-3/5 xl:w-[50rem] min-h-1 py-3 px-2 outline-none rounded-md"
            value={wip}
            maxLength={WIP_MAX_CHARS}
            type='text'
            autoFocus
            required
            onChange={(evt) => {
              updateWip(evt.target.value)
            }}
            placeholder={randPlaceholder}
          />
          <p className="text-xs">
            {wip.length}/{WIP_MAX_CHARS}
          </p>
          <br />
          <button
            className="shadow-lg shadow-neutral-500/50 px-2 py-1 rounded-md bg-neutral-100 text-neutral-900 disabled:cursor-not-allowed disabled:opacity-80 disabled:shadow-none"
            disabled={wip.length === 0}
            type="submit"
          >
            punch
          </button>
        </form>
      </main>
    </>
  )
}

export default Page
