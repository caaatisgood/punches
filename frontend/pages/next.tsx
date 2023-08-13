import { useState } from 'react'

import { getWallet } from '@/utils/wallet'

const WIP_MAX_CHARS = 100

const Page = () => {
  const [wip, setWip] = useState("")
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

  const onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
    const wallet = getWallet()
    wallet
      .requestPermissions({
        network: {
          // @ts-ignore
          type: 'ghostnet',
        },
      })
      .then((_) => wallet.getPKH())
      .then((address) => console.log(`Your address: ${address}`));
  }

  return (
    <main
      className={`font-sans flex min-h-screen flex-col items-center justify-center p-4`}
    >
      <p className="mb-4 text-center">sup, glad to see you here. what are you working on?</p>
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
          className="mb-4 bg-neutral-900 text-center text-xl w-full sm:w-2/3 lg:w-3/5 xl:w-[50rem] min-h-1 py-3 px-2 outline-none rounded-md"
          value={wip}
          maxLength={WIP_MAX_CHARS}
          type='text'
          autoFocus
          required
          onChange={(evt) => {
            setWip(evt.target.value)
          }}
        />
        <p className="text-xs">
          {wip.length}/{WIP_MAX_CHARS}
        </p>
        <button
          className='px-2 py-1'
          type="submit"
        >
          punch
        </button>
      </form>
    </main>
  )
}

export default Page
