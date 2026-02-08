import React, { useState, useEffect } from 'react';
import ProgressBar from './ProgressBar';
import WaterIntakeChart from './WaterIntakeChart';

interface LocalStorageData {
  count: number;
  history: number[];
}

const WaterIntakeCounter: React.FC = () => {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>(Array(7).fill(0));
  const dailyGoal = 8;

  useEffect(() => {
    const storedData = localStorage.getItem('waterIntakeData');
    if (storedData) {
      try {
        const parsedData: LocalStorageData = JSON.parse(storedData);
        setCount(parsedData.count);
        setHistory(parsedData.history);
      } catch (error) {
        console.error('Error parsing stored data:', error);
        // Handle the error, possibly by resetting to default values
        setCount(0);
        setHistory(Array(7).fill(0));
      }
    } else {
      // Initialize history with some default data or leave as all zeros
      const initialHistory = Array(7).fill(0);
      setHistory(initialHistory);
    }
  }, []);

  useEffect(() => {
    try {
      const dataToStore: LocalStorageData = {
        count: count,
        history: history,
      };
      localStorage.setItem('waterIntakeData', JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      // Fallback mechanism: in-memory storage
      // In a real app, you might want to use a more robust fallback
      // like a cookie or a server-side database.
      // For this example, we'll just log the error.
    }
  }, [count, history]);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    if (count > 0) {
      setCount(count - 1);
    }
  };

  // Function to update the daily history
  const updateHistory = () => {
    const newHistory = [...history];
    newHistory.pop(); // Remove the oldest day
    newHistory.unshift(count); // Add the current day's count to the beginning
    setHistory(newHistory);
    setCount(0);
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
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={updateHistory}
      >
        Update Day
      </button>
      <WaterIntakeChart data={history} />
    </div>
  );
};

export default WaterIntakeCounter;
