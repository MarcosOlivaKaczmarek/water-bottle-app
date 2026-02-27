import React, { useState, useEffect } from 'react'
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
import SettingsPage from './pages/SettingsPage'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'

function App() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleGoalSet = (goal: number) => {
    // Implement logic to save the goal to the backend or local storage
    console.log('Goal set to:', goal)
  }

  const handleLogWater = (amount: number) => {
    // Implement logic to save the water intake to the backend or local storage
    console.log('Water intake logged:', amount)
  }

  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50) // Vibrate for 50ms
    }
  }

  return (
    <WaterIntakeProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 to-green-50 py-6 sm:py-12">
          <div className="relative py-3 sm:max-w-xl sm:mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-green-300 shadow-lg transform skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
            <div className="relative px-4 py-10 bg-white shadow-lg rounded-3xl sm:p-20">
              <div className="max-w-md mx-auto">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 text-center">
                    Water Intake Tracker
                  </h1>
                </div>

                <nav className="mt-6 space-x-4 text-center">
                  <Link to="/" className="text-blue-500 hover:text-blue-700 transition-colors duration-300">Home</Link>
                  <Link to="/settings"
                    className="text-blue-500 hover:text-blue-700 transition-colors duration-300">Settings</Link>
                </nav>

                <div className="divide-y divide-gray-200">
                  <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                    <Routes>
                      <Route
                        path="/"
                        element={(
                          <>
                            <div className="rounded-md bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                              <GoalSetting onGoalSet={handleGoalSet} />
                            </div>

                            <div className="rounded-md bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                              <WaterLogging onLogWater={handleLogWater} />
                            </div>

                            <div className="rounded-md bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                              <ProgressBar />
                              <Counter onClick={triggerHapticFeedback} />
                            </div>

                            <div className="rounded-md bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                              <SevenDayWaterIntakeChart dailyIntake={[1, 2, 3, 4, 5, 6, 7]} />
                            </div>
                            <div className="rounded-md bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                              <CircularProgressChart />
                            </div>
                            <div className="rounded-md bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                              <ReminderSetup />
                            </div>
                            <div className="rounded-md bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                              <HistoricalData />
                            </div>
                            <div className="rounded-md bg-white p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                              <WaterBottleProfiles />
                            </div>
                            <AuthPage />
                          </>
                        )}
                      />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/login" element={<LoginPage />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer className="mt-8 text-center text-gray-500">
            <p className="text-sm">Version 1.2.0 - © 2026</p>
          </footer>
        </div>
      </Router>
    </WaterIntakeProvider>
  )
}

export default App
