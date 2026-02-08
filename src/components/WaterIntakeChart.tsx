import React from 'react';

interface WaterIntakeChartProps {
  data: number[]; // Array representing water intake for the last 7 days
}

const WaterIntakeChart: React.FC<WaterIntakeChartProps> = ({ data }) => {
  const maxIntake = Math.max(...data, 0); // Ensure maxIntake is at least 0
  const barHeights = data.map(intake => (maxIntake > 0 ? (intake / maxIntake) * 100 : 0));
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      <div className="flex justify-between items-end h-32">
        {barHeights.map((height, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className="bg-blue-500 w-6 rounded-md transition-all duration-300"
              style={{ height: `${height}%` }}
            ></div>
            <div className="text-xs mt-1">{days[index]}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WaterIntakeChart;
