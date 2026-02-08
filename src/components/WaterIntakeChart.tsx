import React from 'react'

const WaterIntakeChart = () => {
  const dailyIntake = [0, 0, 0, 0, 0, 0, 0]
  const maxIntake = Math.max(...dailyIntake)

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold mb-2">7-Day Water Intake</h2>
      <div className="flex items-end h-32 border-b border-gray-300">
        {dailyIntake.map((intake, index) => {
          const barHeight = maxIntake > 0 ? (intake / maxIntake) * 100 : 0
          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className="bg-blue-500 w-6 mb-1"
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

const getDayLabel = (index: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[index]
}

export default WaterIntakeChart
