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

const useLocalStorage = () => {
  const [isAvailable, setIsAvailable] = useState(false)

  useEffect(() => {
    try {
      const testKey = '__test__'
      localStorage.setItem(testKey, testKey)
      localStorage.removeItem(testKey)
      setIsAvailable(true)
    } catch (e) {
      setIsAvailable(false)
    }
  }, [])

  return isAvailable
}

export const WaterIntakeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const localStorageAvailable = useLocalStorage()
  const [intake, setIntake] = useState(() => {
    const storedIntake = localStorageAvailable
      ? localStorage.getItem('intake')
      : null
    return storedIntake ? parseInt(storedIntake, 10) : 0
  })
  const [dailyIntake, setDailyIntake] = useState<number[]>(() => {
    const storedDailyIntake = localStorageAvailable
      ? localStorage.getItem('dailyIntake')
      : null
    return storedDailyIntake ? JSON.parse(storedDailyIntake) : Array(7).fill(0)
  })
  const [currentDayIndex, setCurrentDayIndex] = useState(new Date().getDay())

  useEffect(() => {
    if (localStorageAvailable) {
      localStorage.setItem('intake', String(intake))
      localStorage.setItem('dailyIntake', JSON.stringify(dailyIntake))
    }
  }, [intake, dailyIntake, localStorageAvailable])

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
