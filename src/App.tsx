import ProgressBar from './components/ProgressBar'
import WaterIntakeChart from './components/WaterIntakeChart'

function App() {
  const progress = 5 // Example: 5 glasses of water

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Water Bottle App</h1>
      <p>Welcome to the water intake tracking app!</p>
      <ProgressBar progress={progress} />
      <WaterIntakeChart />
    </div>
  )
}

export default App
