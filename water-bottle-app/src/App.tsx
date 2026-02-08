import React from 'react';
import WaterIntake from './components/WaterIntake';
import WaterIntakeChart from './components/WaterIntakeChart';

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-semibold mb-4">Water Bottle App</h1>
      <WaterIntake />
      <WaterIntakeChart />
    </div>
  );
}

export default App;
