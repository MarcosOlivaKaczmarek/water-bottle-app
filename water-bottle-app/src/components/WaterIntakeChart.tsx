import React from 'react';
import { useWaterIntake } from '../context/WaterIntakeContext';
import { getDayOfWeek } from '../utils/dateUtils';

const WaterIntakeChart = () => {
  const { waterIntakeHistory } = useWaterIntake();

  const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const data = lastSevenDays.map((date) => {
    const dateString = date.toISOString().split('T')[0];
    return waterIntakeHistory[dateString] || 0;
  });

  const maxIntake = Math.max(...data);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2">Last 7 Days</h2>
      <div className="flex items-end h-32">
        {data.map((intake, index) => {
          const barHeight = maxIntake === 0 ? 0 : (intake / maxIntake) * 100;
          const dayOfWeek = getDayOfWeek(lastSevenDays[index]);

          return (
            <div key={index} className="flex flex-col items-center">
              <div
                className="bg-blue-500 w-6 rounded-md mb-1"
                style={{ height: `${barHeight}%` }}
              ></div>
              <span className="text-xs text-gray-600">{dayOfWeek}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WaterIntakeChart;
