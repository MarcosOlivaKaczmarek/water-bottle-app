import React, { useContext } from 'react'
import { WaterIntakeContext } from '../context/WaterIntakeContext'

const WaterIntakeCounter: React.FC = () => {
  const { intake, incrementIntake, decrementIntake } = useContext(WaterIntakeContext)

  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        className="rounded-full bg-red-500 py-2 px-4 font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-red-300"
        onClick={decrementIntake}
        aria-label="Decrement water intake"
        disabled={intake <= 0}
      >
        -
      </button>
      <span className="text-2xl font-bold text-gray-800" data-testid="water-intake-count">
        {intake}
      </span>
      <button
        className="rounded-full bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={incrementIntake}
        aria-label="Increment water intake"
      >
        +
      </button>
    </div>
  )
}

export default WaterIntakeCounter
