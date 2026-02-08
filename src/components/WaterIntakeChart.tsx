import React, { useContext } from 'react'
import { WaterIntakeContext } from '../context/WaterIntakeContext'

const WaterIntakeChart = () => {
  const { dailyIntake } = useContext(WaterIntakeContext)
  const maxIntake = Math.max(...dailyIntake)

  return (
    <div className="mt-8 w-full">
      <h2 className="mb-2 text-lg font-semibold text-gray-700">7-Day Water Intake</h2>
      <div className="flex h-32 items-end border-b border-gray-300">
        {dailyIntake.map((intake, index) => {
          const barHeight = maxIntake > 0 ? (intake / maxIntake) * 100 : 0
          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className="mb-1 w-6 transition-all duration-300"
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: 'rgba(59, 130, 246, 0.75)',
                }}
              ></div>
              <span className="text-xs text-gray-600">{getDayLabel(index)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const getDayLabel = (index: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[index]
}

export default WaterIntakeChart
