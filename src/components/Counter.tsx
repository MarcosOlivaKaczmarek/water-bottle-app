import React, { useContext } from 'react'
import { WaterIntakeContext } from '../context/WaterIntakeContext'

const Counter = () => {
  const { intake, incrementIntake, decrementIntake } = useContext(WaterIntakeContext)

  return (
    <div className="flex items-center justify-center space-x-4 mb-4">
      <button
        aria-label="Decrement water intake"
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={decrementIntake}
        disabled={intake <= 0}
      >
        -
      </button>
      <span className="text-xl">{intake}</span>
      <button
        aria-label="Increment water intake"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={incrementIntake}
      >
        +
      </button>
    </div>
  )
}

export default Counter