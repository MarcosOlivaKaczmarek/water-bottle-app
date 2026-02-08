import React from 'react'
import WaterIntakeCounter from './components/WaterIntakeCounter'
import { WaterIntakeProvider } from './context/WaterIntakeContext'
import SevenDayWaterIntakeChart from './components/SevenDayWaterIntakeChart'

function App() {
  return (
    <WaterIntakeProvider>
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">Water Intake Tracker</h1>
        <WaterIntakeCounter />
        <SevenDayWaterIntakeChart dailyIntake={[1, 2, 3, 4, 5, 6, 7]} />
      </div>
    </WaterIntakeProvider>
  )
}

export default App
