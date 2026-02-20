import React, { useState, useEffect } from 'react'

interface GoalSettingProps {
  onGoalSet: (goal: number) => void
  initialGoal?: number
}

const GoalSetting: React.FC<GoalSettingProps> = ({ onGoalSet, initialGoal = 2000 }) => {
  const [goal, setGoal] = useState(initialGoal)
  const [recommendedIntake, setRecommendedIntake] = useState(2000)

  useEffect(() => {
    // Placeholder for calculating recommended intake based on user data (e.g., weight, activity level)
    // In a real application, this would involve fetching user data and applying a formula.
    // For now, we'll just use a fixed value.
    setRecommendedIntake(2000)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value)) {
      setGoal(value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGoalSet(goal)
  }

  return (
    <div className="rounded-md bg-white p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Set Your Daily Goal</h2>
      <p className="text-sm text-gray-600 mb-2">
        Recommended intake: {recommendedIntake} ml
      </p>
      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <input
          type="number"
          id="goal"
          className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          value={goal}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Set Goal
        </button>
      </form>
    </div>
  )
}

export default GoalSetting
