import React, { useState } from 'react';
import ProgressBar from './ProgressBar';

const WaterIntakeCounter: React.FC = () => {
  const [count, setCount] = useState(0);
  const dailyGoal = 8;

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    if (count > 0) {
      setCount(count - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <ProgressBar progress={count} goal={dailyGoal} />
      <div className="flex items-center justify-center space-x-4">
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={decrement}
        >
          -
        </button>
        <span className="text-2xl">{count}</span>
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={increment}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default WaterIntakeCounter;
