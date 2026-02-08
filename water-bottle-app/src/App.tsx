import React, { useState } from 'react';
import ProgressBar from './components/ProgressBar';

function App() {
  const [glasses, setGlasses] = useState(0);

  const addGlass = () => {
    if (glasses < 8) {
      setGlasses(glasses + 1);
    }
  };

  const removeGlass = () => {
    if (glasses > 0) {
      setGlasses(glasses - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Water Bottle App</h1>
      <ProgressBar progress={glasses} />
      <p className="mt-2">{glasses} / 8 Glasses</p>
      <div className="flex mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={addGlass}
        >
          Add Glass
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={removeGlass}
        >
          Remove Glass
        </button>
      </div>
    </div>
  );
}

export default App;