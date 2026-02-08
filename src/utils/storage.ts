const STORAGE_KEY = 'waterIntakeData'

interface WaterIntakeData {
  counter: number
  history: number[] // Array of water intake for the last 7 days
}

const defaultData: WaterIntakeData = {
  counter: 0,
  history: Array(7).fill(0),
}

let inMemoryData: WaterIntakeData = { ...defaultData }

const isLocalStorageAvailable = () => {
  try {
    const testKey = '__test_localStorage__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}

export const loadData = (): WaterIntakeData => {
  if (isLocalStorageAvailable()) {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      return storedData ? JSON.parse(storedData) : { ...defaultData }
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
      return { ...inMemoryData }
    }
  }
  return { ...inMemoryData }
}

export const saveData = (data: WaterIntakeData): void => {
  inMemoryData = { ...data }
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving data to localStorage:', error)
    }
  }
}

export const clearData = (): void => {
  inMemoryData = { ...defaultData }
  if (isLocalStorageAvailable()) {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing data from localStorage:', error)
    }
  }
}