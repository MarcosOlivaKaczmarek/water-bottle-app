import React, { useState } from 'react';
import './App.css';
import ProgressBar from './components/ProgressBar';

function App() {
  const [counter, setCounter] = useState(0);

  const increment = () => {
    if (counter < 8) {
      setCounter(counter + 1);
    }
  };

  const decrement = () => {
    if (counter > 0) {
      setCounter(counter - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Water Bottle App</h1>
      <ProgressBar current={counter} max={8} />
      <div className="mt-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          onClick={increment}
        >
          Increment
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={decrement}
        >
          Decrement
        </button>
      </div>
      <p className="mt-4">Glasses Drunk: {counter}</p>
    </div>
  );
}

export default App;
