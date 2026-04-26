import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function CurvesChart({ curves }) {
  if (!curves || curves.length === 0) return null;

  const formatPercent = (value) => {
    return `${(value * 100).toFixed(4)}%`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 border border-border-color rounded-lg py-3 px-4 shadow-lg">
          <p className="m-0 mb-2 font-semibold text-text-primary">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="my-1 text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatPercent(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-8 bg-card-bg rounded-xl shadow-md p-6">
      <h2 className="m-0 mb-4 text-2xl text-text-primary">Yield Curves</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={curves} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="every 24"
          />
          <YAxis
            tickFormatter={(value) => `${(value * 100).toFixed(2)}%`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="eur1d"
            stroke="#2563eb"
            name="EUR1D (Discount)"
            dot={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="eur6m"
            stroke="#dc2626"
            name="EUR6M (Forward)"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CurvesChart;
