import React from 'react'

interface ProgressBarProps {
  progress: number
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  const percentage = Math.min(100, Math.max(0, (progress / 8) * 100))

  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2">Progress</h2>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-1 text-right">{percentage}%</p>
    </div>
  )
}

export default ProgressBar