import React from 'react'
import clsx from 'clsx'

import { House } from '@/types'
import { PUNCH_TEXT_MAX_LEN } from '@/constants/settings'

const PUNCH_PLACEHOLDERS = [
  "half way through the toy flow",
  "worked on getting more ppl on the app",
  "recorded the bridge",
  "edited the next vid",
  "noted down some build plans for the weekend",
  "read a blog about product iteration",
]
const randPunchPlaceholder = PUNCH_PLACEHOLDERS[Math.floor((Math.random() * PUNCH_PLACEHOLDERS.length))]

const PunchForm: React.FC<{
  wip: string;
  punch: string;
  hasPunches?: boolean;
  house?: House;
  submissionStatus: string | React.ReactNode;
  onChangePunch: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}> = ({
  wip,
  punch,
  hasPunches,
  house,
  submissionStatus,
  onChangePunch,
  onSubmit,
}) => {
  return (
    <>
      <div className={clsx("mb-8 text-center")}>
        <p>hey again, how’s <i>“{wip}”</i> going?</p>
        <p>any new updates?</p>
      </div>
      <p className='mb-4 text-center text-sm'>
        leave a note here
      </p>
      <form className="flex flex-col w-full items-center" onSubmit={onSubmit}>
        <input
          name="punch"
          className="mb-4 dark:bg-neutral-900 text-center text-base w-full sm:w-4/5 lg:w-3/5 xl:w-[36rem] min-h-1 py-3 px-2 outline-none rounded-md"
          value={punch}
          maxLength={PUNCH_TEXT_MAX_LEN}
          type='text'
          autoFocus
          onChange={onChangePunch}
          placeholder={randPunchPlaceholder}
        />
        <p className="text-xs">
          {punch.length}/{PUNCH_TEXT_MAX_LEN}
        </p>
        {/* msg to those who haven't punched yet */}
        {!hasPunches && (
          <>
            <p className="mt-6">
              punch it to see a new viz with a bit more&nbsp;
              <span className={clsx(
                house === "spectreseek" && "text-red-500 bg-red-500",
                house === "erevald" && "text-green-500 bg-green-500",
                house === "gaudmire" && "text-yellow-500 bg-yellow-500",
                house === "alterok" && "text-blue-500 bg-blue-500",
              )}>{house}</span>
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
        {submissionStatus}&nbsp;
      </div>
    </>
  )
}

export default PunchForm
