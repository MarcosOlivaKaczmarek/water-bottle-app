import React, { useContext } from 'react'
import { WaterIntakeContext } from '../context/WaterIntakeContext'

const SevenDayWaterIntakeChart = () => {
  const { dailyIntake } = useContext(WaterIntakeContext)

  const maxIntake = Math.max(...dailyIntake, 1) // Ensure maxIntake is at least 1 to avoid division by zero

  const getDayLabel = (index: number): string => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days[index]
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-2">7-Day Water Intake</h2>
      <div className="flex items-end h-32 border-b border-gray-300">
        {dailyIntake.map((intake, index) => {
          const barHeight = (intake / maxIntake) * 100
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="bg-blue-500 w-full mb-1 transition-all duration-300"
                style={{ height: `${barHeight}%` }}
              ></div>
              <span className="text-xs">{getDayLabel(index)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SevenDayWaterIntakeChart
