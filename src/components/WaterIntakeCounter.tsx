import React, { useState } from 'react'

const WaterIntakeCounter: React.FC = () => {
  const [count, setCount] = useState(0)

  const increment = () => {
    setCount(count + 1)
  }

  const decrement = () => {
    if (count > 0) {
      setCount(count - 1)
    }
  }

  return (
    <div className="flex items-center justify-center space-x-4">
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={decrement}
        aria-label="Decrement water intake"
      >
        -
      </button>
      <span className="text-2xl font-bold" data-testid="water-intake-count">
        {count}
      </span>
      <button
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={increment}
        aria-label="Increment water intake"
      >
        +
      </button>
    </div>
  )
}

export default WaterIntakeCounter