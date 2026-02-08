import React from 'react';
import { useWaterIntake } from '../contexts/WaterIntakeContext';
import { getDayOfWeek } from '../utils/dateUtils';

interface BarChartProps {
  data: number[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const maxValue = Math.max(...data, 1);

  return (
    <div className="flex items-end h-32 space-x-2">
      {data.map((value, index) => {
        const barHeight = (value / maxValue) * 100;
        return (
          <div key={index} className="flex flex-col items-center">
            <div
              className="bg-blue-500 w-6 rounded-md"
              style={{ height: `${barHeight}%` }}
            ></div>
            <span className="text-xs text-gray-500">{new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</span>
          </div>
        );
      })}
    </div>
  );
};

const WaterIntakeChart = () => {
  const { waterIntakeHistory } = useWaterIntake();

  // Get the last 7 days
  const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    return dateString;
  });

  // Prepare the data for the chart
  const chartData = lastSevenDays.map(date => waterIntakeHistory[date] || 0);

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold mb-2">Water Intake - Last 7 Days</h2>
      <BarChart data={chartData} />
    </div>
  );
};

export default WaterIntakeChart;