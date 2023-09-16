import React from "react"

import Countdown from "./Countdown"

export const Loader = () => (
  <div className="flex-1 flex items-center justify-center">
    loading stuff, brb...
  </div>
)

export const AfterGenesisWip: React.FC<{ cta: () => void }> = ({ cta }) => {
  return (
    <>
      <p className="text-center">you’re all set. so happy for you taking the first step. you’re truly amazing.</p>
      <p className="text-center mb-4">now get back to biz, work on it, and come back to make your first punch.</p>
      <div className="text-center">
        <button className="underline" onClick={cta}>continue {"->"}</button>
      </div>
    </>
  )
}

export const AfterPunch: React.FC<{ cta: () => void }> = ({ cta }) => (
  <>
    <p className="mb-4 text-center">
      punched.<br /><br />
      another solid step on your wip.<br />
      staying consistent is not always easy.<br />
      but hey, you back on it today.<br />
      so you should be proud of yourself.<br /><br />
      see you at the next one?
    </p>
    <div className="text-center">
      <button className="underline" onClick={cta}>continue {"->"}</button>
    </div>
  </>
)

export const PunchCd: React.FC<{ nextPunchAt?: Date, countdownCallback: () => void }> = ({ nextPunchAt, countdownCallback }) => (
  <>
    <p className="mb-4 text-center">your next punch will be avail in</p>
    <p className="font-mono mb-4 text-center">
      {nextPunchAt && (
        <Countdown date={nextPunchAt} callback={countdownCallback} />
      )}
    </p>
    <p className="text-center">
      you’re either working on your wip or on the way to work on your wip.
    </p>
  </>
)
