import React from 'react'
import WaterIntakeCounter from './components/WaterIntakeCounter'
import { WaterIntakeProvider } from './context/WaterIntakeContext'
import SevenDayWaterIntakeChart from './components/SevenDayWaterIntakeChart'
import ProgressBar from './components/ProgressBar'
import Counter from './components/Counter'

function App() {
  return (
    <WaterIntakeProvider>
      <div className="flex min-h-screen flex-col items-center justify-start bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl space-y-8">
          <div>
            <h1 className="text-center text-3xl font-extrabold text-gray-900">
              Water Intake Tracker
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Track your daily water consumption and stay hydrated!
            </p>
          </div>

          <div className="rounded-md bg-white p-6 shadow-md">
            <ProgressBar />
            <Counter />
          </div>

          <div className="rounded-md bg-white p-6 shadow-md">
            <SevenDayWaterIntakeChart dailyIntake={[1, 2, 3, 4, 5, 6, 7]} />
          </div>
        </div>
      </div>
    </WaterIntakeProvider>
  )
}

export default App
