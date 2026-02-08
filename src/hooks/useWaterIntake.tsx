import { useState, useEffect } from 'react'

const useLocalStorage = (key: string, initialValue: any) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('localStorage is not available', error)
      return initialValue // Fallback to initial value
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.error('localStorage is not available', error)
      // Handle the error or use an in-memory fallback
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}

export const useWaterIntake = () => {
  const [progress, setProgress] = useLocalStorage('waterIntakeProgress', 0)
  const [weeklyIntake, setWeeklyIntake] = useLocalStorage(
    'waterIntakeWeeklyData',
    Array(7).fill(0),
  )

  useEffect(() => {
    // Load initial values from localStorage on component mount
    if (typeof window !== 'undefined') {
      const storedProgress = localStorage.getItem('waterIntakeProgress')
      if (storedProgress) {
        setProgress(parseInt(storedProgress))
      }

      const storedWeeklyIntake = localStorage.getItem('waterIntakeWeeklyData')
      if (storedWeeklyIntake) {
        setWeeklyIntake(JSON.parse(storedWeeklyIntake))
      }
    }
  }, [setProgress, setWeeklyIntake])

  const addWater = (amount: number) => {
    setProgress((prevProgress: number) => {
      const newProgress = prevProgress + amount
      updateWeeklyIntake(newProgress)
      return newProgress
    })
  }

  const updateWeeklyIntake = (currentProgress: number) => {
    setWeeklyIntake((prevWeeklyIntake: number[]) => {
      const newWeeklyIntake = [...prevWeeklyIntake]
      newWeeklyIntake.shift()
      newWeeklyIntake.push(currentProgress)
      return newWeeklyIntake
    })
  }

  return { progress, addWater, weeklyIntake }
}
