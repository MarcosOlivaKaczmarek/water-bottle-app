import Counter from './components/Counter'
import ProgressBar from './components/ProgressBar'
import WaterIntakeChart from './components/WaterIntakeChart'
import { WaterIntakeProvider } from './context/WaterIntakeContext'

function App() {
  return (
    <WaterIntakeProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Water Bottle App</h1>
        <p>Welcome to the water intake tracking app!</p>
        <Counter />
        <ProgressBar />
        <WaterIntakeChart />
      </div>
    </WaterIntakeProvider>
  )
}

export default App