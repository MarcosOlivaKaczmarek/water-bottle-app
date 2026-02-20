import React, { useState } from 'react'

interface WaterLoggingProps {
  onLogWater: (amount: number) => void
}

const WaterLogging: React.FC<WaterLoggingProps> = ({ onLogWater }) => {
  const [customAmount, setCustomAmount] = useState<number | undefined>(undefined)

  const handlePresetAmount = (amount: number) => {
    onLogWater(amount)
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    setCustomAmount(isNaN(value) ? undefined : value)
  }

  const handleLogCustomAmount = () => {
    if (customAmount !== undefined) {
      onLogWater(customAmount)
      setCustomAmount(undefined)
    }
  }

  return (
    <div className="rounded-md bg-white p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Log Water Intake</h2>
      <div className="space-x-4 mb-4">
        <button
          className="rounded-md bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={() => handlePresetAmount(250)}
        >
          Small Glass (250ml)
        </button>
        <button
          className="rounded-md bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={() => handlePresetAmount(500)}
        >
          Large Glass (500ml)
        </button>
        <button
          className="rounded-md bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={() => handlePresetAmount(750)}
        >
          Small Bottle (750ml)
        </button>
        <button
          className="rounded-md bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          onClick={() => handlePresetAmount(1000)}
        >
          Large Bottle (1000ml)
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <input
          type="number"
          placeholder="Custom amount (ml)"
          className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          onChange={handleCustomAmountChange}
          value={customAmount === undefined ? '' : customAmount}
        />
        <button
          className="rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={handleLogCustomAmount}
          disabled={!customAmount}
        >
          Log Custom Amount
        </button>
      </div>
    </div>
  )
}

export default WaterLogging
