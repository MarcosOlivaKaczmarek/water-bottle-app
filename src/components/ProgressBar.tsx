import React, { useContext } from 'react'
import { WaterIntakeContext } from '../context/WaterIntakeContext'

const ProgressBar = () => {
  const { intake } = useContext(WaterIntakeContext)
  const percentage = Math.min(100, Math.max(0, (intake / 8) * 100))

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      <div
        className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        role="progressbar"
      ></div>
    </div>
  )
}

export default ProgressBar