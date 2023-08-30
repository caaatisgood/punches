import { useState, useCallback } from 'react'

const randString = () => Math.random().toString().substring(2, 7)

const useKey = (): [string, () => void] => {
  const [key, setKey] = useState<string>(randString)
  const updateKey = useCallback(() => {
    setKey(randString)
  }, [])

  return [key, updateKey]
}

export default useKey
