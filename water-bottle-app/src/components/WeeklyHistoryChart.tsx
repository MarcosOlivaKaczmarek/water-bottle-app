import React, { useEffect, useState } from 'react';

interface DailyIntake {
  date: string;
  glasses: number;
}

const WeeklyHistoryChart: React.FC = () => {
  const [weeklyData, setWeeklyData] = useState<DailyIntake[]>([]);

  useEffect(() => {
    const today = new Date();
    const lastSevenDays: DailyIntake[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const storedData = localStorage.getItem(dateString);
      const glasses = storedData ? parseInt(storedData, 10) : 0;
      lastSevenDays.push({ date: dateString, glasses: glasses });
    }

    setWeeklyData(lastSevenDays);
  }, []);

  const maxGlasses = Math.max(...weeklyData.map((day) => day.glasses), 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-2">Weekly Water Intake</h2>
      <div className="flex items-end h-32">
        {weeklyData.map((day) => {
          const barHeight = (day.glasses / maxGlasses) * 100;
          const dayName = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

          return (
            <div key={day.date} className="flex flex-col items-center">
              <div
                className="bg-blue-500 w-6 rounded-md mb-1"
                style={{ height: `${barHeight}%` }}
              ></div>
              <span className="text-xs text-gray-600">{dayName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyHistoryChart;
