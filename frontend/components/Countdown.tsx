import { memo, useState, useEffect, useCallback } from 'react'

const Countdown = ({ date, callback }: { date: Date, callback: () => void }) => {
  const calculateSecondsRemaining = useCallback(() => {
    const now = Date.now()
    const differenceInSeconds = Math.floor((date.getTime() - now) / 1000)
    return differenceInSeconds > 0 ? differenceInSeconds : 0
  }, [date])

  const [secondsRemaining, setSecondsRemaining] = useState(calculateSecondsRemaining())

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedSecondsRemaining = calculateSecondsRemaining()
      setSecondsRemaining(updatedSecondsRemaining)

      if (updatedSecondsRemaining === 0) {
        callback()
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [date, calculateSecondsRemaining, callback])

  const hours = Math.floor(secondsRemaining / 3600)
  const minutes = Math.floor((secondsRemaining % 3600) / 60)
  const seconds = secondsRemaining % 60

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

export default memo(Countdown)
