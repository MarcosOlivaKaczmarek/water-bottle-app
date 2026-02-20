import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface HistoricalDataPoint {
  timestamp: string
  quantity_ml: number
}

const HistoricalData = () => {
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([])
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  useEffect(() => {
    // Fetch historical data from the backend API
    const fetchHistoricalData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/water-intake/historical?range=${timeRange}`)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const data = await response.json()
        setHistoricalData(data)
      } catch (error) {
        console.error('Failed to fetch historical data:', error)
      }
    }

    fetchHistoricalData()
  }, [timeRange])

  // Format the data for Recharts
  const formattedData = historicalData.map((item) => ({
    time: new Date(item.timestamp).toLocaleDateString(),
    intake: item.quantity_ml,
  }))

  return (
    <div className="rounded-md bg-white p-6 shadow-md">
      <h2 className="text-lg font-semibold mb-4">Historical Water Intake</h2>

      <div className="mb-4">
        <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700">Time Range:</label>
        <select
          id="timeRange"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as 'daily' | 'weekly' | 'monthly')}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {formattedData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="intake" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>No data available for the selected time range.</p>
      )}
    </div>
  )
}

export default HistoricalData