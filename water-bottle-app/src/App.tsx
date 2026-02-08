import React, { useState, useEffect } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';

function App() {
  const [glassCount, setGlassCount] = useState<number>(() => {
    const storedCount = localStorage.getItem('glassCount');
    return storedCount ? parseInt(storedCount, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('glassCount', glassCount.toString());
  }, [glassCount]);

  const increment = () => {
    setGlassCount(glassCount + 1);
  };

  const decrement = () => {
    if (glassCount > 0) {
      setGlassCount(glassCount - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Water Bottle App</h1>
      <div className="flex items-center space-x-4">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={decrement}
          aria-label="Decrement water glass count"
        >
          <MinusIcon className="h-5 w-5" />
        </button>
        <span className="text-5xl font-bold">{glassCount}</span>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={increment}
          aria-label="Increment water glass count"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default App;
