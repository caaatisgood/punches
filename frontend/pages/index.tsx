import { useState } from 'react'
import Head from 'next/head'
import dayjs from 'dayjs'

const GOAL_MAX_CHARS = 50

export default function Home() {
  const [goal, setGoal] = useState<string>("")
  const [goalTouched, setGoalTouched] = useState(false)
  const [punchDate, setPunchDate] = useState("")

  const isFormReady = goal && punchDate

  const onChangeGoal = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setGoal(evt.target.value)
    setGoalTouched(true)
  }

  const onChangeDate = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setPunchDate(evt.target.value)
  }

  const onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault()
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-center p-4`}
    >
      <Head>
        <title>punches | make consistent progress toward your goal.</title>
      </Head>
      <div>
        <form onSubmit={onSubmit}>
          <label className="flex flex-col mb-12">
            <span className="mb-2 pl-2 border-l-4 border-l-yellow-400 border-solid text-lg">
              What is your goal?{" "}{goalTouched && <small>({goal.length}/{GOAL_MAX_CHARS})</small>}
            </span>
            <input
              className="bg-transparent outline-none border-yellow-400 border-dashed border-l-4 px-2 py-1"
              name="goal"
              value={goal}
              maxLength={GOAL_MAX_CHARS}
              type="text"
              onChange={onChangeGoal}
              required
            />
          </label>
          <fieldset className="mb-12">
            <legend className="mb-2 pl-2 border-l-4 border-l-yellow-400 border-solid text-lg">When will be your first punch?</legend>
            <div className='flex items-center gap-2 flex-wrap'>
              {Array.from({ length: 7 }).map((_, index) => {
                const A_DAY = 86400000
                const dateMs = Date.now() + index * A_DAY
                const dateString = new Date(dateMs).toISOString().substring(0, 10)
                const isNextYear = new Date().getFullYear() !== new Date(dateMs).getFullYear()
                return (
                  <div key={index}>
                    <input
                      className="hidden peer"
                      id={dateString}
                      type="radio"
                      name="punch-date"
                      value={dateString}
                      checked={dateString === punchDate}
                      onChange={onChangeDate}
                      required
                    />
                    <label
                      htmlFor={dateString}
                      className="flex justify-center items-center text-center h-16 w-20 border-2 border-dashed peer-checked:border-yellow-400 peer-checked:text-yellow-400 cursor-pointer"
                    >
                      {index === 0
                        ? "Today"
                        : index === 1
                        ? "Tomorrow"
                        : (
                          <>
                            {dayjs(dateString).format("MMM D")}
                            {isNextYear && (
                              <>
                                <br />
                                {dayjs(dateString).format("YYYY")}
                              </>
                            )}
                          </>
                        )
                      }
                    </label>
                  </div>
                )
              })}
            </div>
          </fieldset>
          <button
            className={`px-2 py-1 border-2 ${isFormReady ? " border-yellow-400 text-yellow-400" : ""}`}
            disabled={!isFormReady}
          >
            proceed
          </button>
        </form>
      </div>
    </main>
  )
}
