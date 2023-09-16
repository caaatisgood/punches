import React from 'react'
import clsx from 'clsx'

import { House } from '@/types'
import { WIP_TEXT_MAX_LEN } from '@/constants/settings'
import { HOUSE_MAP } from '@/constants/house'

const WIP_PLACEHOLDERS = [
  "building an app to help ppl make consistent progress toward their goal",
  "become a person who read regularly",
  "creating video content about cool independent shops",
]

const randWipPlaceholder = WIP_PLACEHOLDERS[Math.floor((Math.random() * WIP_PLACEHOLDERS.length))]

const WipForm: React.FC<{
  wip: string;
  house?: House;
  submissionStatus: string | React.ReactNode;
  onChangeWip: React.ChangeEventHandler<HTMLInputElement>;
  onChangeHouse: React.ChangeEventHandler<HTMLInputElement>;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}> = ({
  wip,
  house,
  submissionStatus,
  onChangeWip,
  onChangeHouse,
  onSubmit,
}) => {
  return (
    <>
      <div className={clsx("text-4xl leading-normal", "mb-8 text-center")}>
        <p>sup, glad to see you here.</p>
        <p>what’s your work-in-progress?</p>
      </div>
      <form className="flex flex-col w-full items-center" onSubmit={onSubmit}>
        <input
          name="wip"
          className="mb-4 dark:bg-neutral-900 text-center text-base w-full sm:w-5/6 lg:w-3/5 xl:w-[50rem] min-h-1 py-3 px-2 outline-none rounded-md"
          value={wip}
          maxLength={WIP_TEXT_MAX_LEN}
          type='text'
          autoFocus
          required
          onChange={onChangeWip}
          placeholder={randWipPlaceholder}
        />
        <p className="text-xs mb-6">
          {wip.length}/{WIP_TEXT_MAX_LEN}
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
                  onChange={onChangeHouse}
                />
              </div>
            )
          })}
        </div>
        <br />
        <button
          className="shadow-md shadow-neutral-500/20 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-900 disabled:cursor-not-allowed disabled:opacity-80 disabled:shadow-none"
          disabled={wip.length === 0 || !house}
          type="submit"
        >
          set wip
        </button>
      </form>
      <div className='mt-3 italic text-sm text-center leading-4'>
        {submissionStatus}&nbsp;
      </div>
    </>
  );
};

export default WipForm;
