import { useState } from 'react'
import useLocalStorage from './useLocalStorage'

const useWaterIntake = () => {
  const [progress, setProgress] = useLocalStorage<number>('waterIntake', 0)
  const [weeklyIntake, setWeeklyIntake] = useLocalStorage<number[]>(
    'weeklyIntake',
    Array(7).fill(0),
  )

  const addWater = (amount: number) => {
    setProgress((prevProgress) => prevProgress + amount)
    updateWeeklyIntake(amount)
  }

  const resetWater = () => {
    setProgress(0)
  }

  const updateWeeklyIntake = (amount: number) => {
    setWeeklyIntake((prevWeeklyIntake) => {
      const newWeeklyIntake = [...prevWeeklyIntake]
      newWeeklyIntake.shift()
      newWeeklyIntake.push(amount)
      return newWeeklyIntake
    })
  }

  return {
    progress,
    addWater,
    resetWater,
    weeklyIntake,
  }
}

export default useWaterIntake