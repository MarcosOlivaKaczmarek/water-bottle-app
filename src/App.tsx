import React from 'react'
import WaterIntakeCounter from './components/WaterIntakeCounter'
import { WaterIntakeProvider } from './context/WaterIntakeContext'
import WaterIntakeChart from './components/WaterIntakeChart'
import ProgressBar from './components/ProgressBar'

function App() {
  return (
    <WaterIntakeProvider>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 py-2">
        <main className="container flex w-full max-w-md flex-col items-center px-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Water Intake Tracker</h1>
          <ProgressBar />
          <WaterIntakeCounter />
          <WaterIntakeChart />
        </main>
      </div>
    </WaterIntakeProvider>
  )
}

export default App
