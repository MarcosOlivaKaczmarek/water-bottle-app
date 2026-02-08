import React from 'react'
import WaterIntakeCounter from './components/WaterIntakeCounter'

function App() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold mb-4">Water Intake Tracker</h1>
      <WaterIntakeCounter />
    </div>
  )
}

export default App
