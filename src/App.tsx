import ProgressBar from './components/ProgressBar'
import useWaterIntake from './hooks/useWaterIntake'
import { useState } from 'react'

function App() {
  const { progress, addWater, resetWater, weeklyIntake } = useWaterIntake()
  const [waterToAdd, setWaterToAdd] = useState(1)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Water Bottle App</h1>
      <p>Welcome to the water intake tracking app!</p>
      <ProgressBar progress={progress} />
      <div>
        <label htmlFor="waterToAdd">Water to Add (glasses):</label>
        <input
          type="number"
          id="waterToAdd"
          value={waterToAdd}
          onChange={(e) => setWaterToAdd(parseInt(e.target.value))}
        />
        <button onClick={() => addWater(waterToAdd)}>Add Water</button>
        <button onClick={resetWater}>Reset Water</button>
      </div>
      <div>
        <h2>Weekly Intake</h2>
        <ul>
          {weeklyIntake.map((intake, index) => (
            <li key={index}>Day {index + 1}: {intake}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App