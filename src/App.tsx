import ProgressBar from './components/ProgressBar'
import WaterIntakeChart from './components/WaterIntakeChart'
import Counter from './components/Counter'

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Water Bottle App
        </h1>
        <Counter />
        <ProgressBar />
        <WaterIntakeChart />
      </div>
    </div>
  )
}

export default App