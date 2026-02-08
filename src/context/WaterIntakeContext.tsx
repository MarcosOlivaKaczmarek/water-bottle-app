import React, { createContext, useState, useEffect } from 'react'

interface WaterIntakeContextProps {
  intake: number
  dailyIntake: number[]
  incrementIntake: () => void
  decrementIntake: () => void
}

const defaultContextValue: WaterIntakeContextProps = {
  intake: 0,
  dailyIntake: [0, 0, 0, 0, 0, 0, 0],
  incrementIntake: () => {},
  decrementIntake: () => {},
}

export const WaterIntakeContext = createContext(defaultContextValue)

export const WaterIntakeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [intake, setIntake] = useState(0)
  const [dailyIntake, setDailyIntake] = useState<number[]>(
    Array(7).fill(0),
  )
  const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay())

  useEffect(() => {
    const intervalId = setInterval(() => {
      const todayIndex = new Date().getDay()
      if (todayIndex !== currentDayIndex) {
        setCurrentDayIndex(todayIndex)
        setDailyIntake((prevDailyIntake) => {
          const newDailyIntake = [...prevDailyIntake]
          newDailyIntake[todayIndex] = 0
          return newDailyIntake
        })
        setIntake(0)
      }
    }, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [currentDayIndex])

  const incrementIntake = () => {
    setIntake((prevIntake) => {
      const newIntake = prevIntake + 1
      setDailyIntake((prevDailyIntake) => {
        const updatedDailyIntake = [...prevDailyIntake]
        updatedDailyIntake[currentDayIndex] = newIntake // Update today's intake
        return updatedDailyIntake
      })
      return newIntake
    })
  }

  const decrementIntake = () => {
    setIntake((prevIntake) => {
      const newIntake = prevIntake > 0 ? prevIntake - 1 : 0
      setDailyIntake((prevDailyIntake) => {
        const updatedDailyIntake = [...prevDailyIntake]
        updatedDailyIntake[currentDayIndex] = newIntake // Update today's intake
        return updatedDailyIntake
      })
      return newIntake
    })
  }

  return (
    <WaterIntakeContext.Provider
      value={{ intake, dailyIntake, incrementIntake, decrementIntake }}
    >
      {children}
    </WaterIntakeContext.Provider>
  )
}