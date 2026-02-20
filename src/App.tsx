import React from 'react'
import WaterIntakeCounter from './components/WaterIntakeCounter'
import { WaterIntakeProvider } from './context/WaterIntakeContext'
import SevenDayWaterIntakeChart from './components/SevenDayWaterIntakeChart'
import ProgressBar from './components/ProgressBar'
import Counter from './components/Counter'
import AuthPage from './pages/AuthPage'
import GoalSetting from './components/GoalSetting'
import WaterLogging from './components/WaterLogging'
import CircularProgressChart from './components/CircularProgressChart'
import ReminderSetup from './components/ReminderSetup'
import HistoricalData from './components/HistoricalData'
import WaterBottleProfiles from './components/WaterBottleProfiles'

function App() {
  const handleGoalSet = (goal: number) => {
    // Implement logic to save the goal to the backend or local storage
    console.log('Goal set to:', goal)
  }

  const handleLogWater = (amount: number) => {
    // Implement logic to save the water intake to the backend or local storage
    console.log('Water intake logged:', amount)
  }

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
            <GoalSetting onGoalSet={handleGoalSet} />
          </div>

          <div className="rounded-md bg-white p-6 shadow-md">
            <WaterLogging onLogWater={handleLogWater} />
          </div>

          <div className="rounded-md bg-white p-6 shadow-md">
            <ProgressBar />
            <Counter />
          </div>

          <div className="rounded-md bg-white p-6 shadow-md">
            <SevenDayWaterIntakeChart dailyIntake={[1, 2, 3, 4, 5, 6, 7]} />
          </div>
          <div className="rounded-md bg-white p-6 shadow-md">
            <CircularProgressChart />
          </div>
          <div className="rounded-md bg-white p-6 shadow-md">
            <ReminderSetup />
          </div>
          <div className="rounded-md bg-white p-6 shadow-md">
            <HistoricalData />
          </div>
          <div className="rounded-md bg-white p-6 shadow-md">
            <WaterBottleProfiles />
          </div>
          <AuthPage />
        </div>
      </div>
      <footer className="bg-gray-200 text-center py-4 text-sm text-gray-500 mt-auto w-full">
        Version 1.2.0 - © 2026
      </footer>
    </WaterIntakeProvider>
  )
}

export default App
