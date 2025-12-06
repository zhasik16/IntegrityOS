'use client';

import React from 'react';

interface MethodChartProps {
  data: Record<string, number>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B'];

const MethodChart = ({ data }: MethodChartProps) => {
  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([name, value], index) => ({
      name,
      value,
      color: COLORS[index % COLORS.length],
      percentage: (value / Object.values(data).reduce((a, b) => a + b, 0)) * 100
    }));

  if (chartData.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">Распределение по методам контроля</h3>
        <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280' }}>Нет данных для отображения</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card-title">Распределение по методам контроля</h3>
      <div className="chart-container">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.5rem',
          height: '100%',
          justifyContent: 'center'
        }}>
          {chartData.map((item, index) => (
            <div key={index} style={{ marginBottom: '0.75rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '0.25rem' 
              }}>
                <span style={{ fontWeight: 500 }}>{item.name}</span>
                <span style={{ fontWeight: 600, color: item.color }}>
                  {item.value} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${item.percentage}%`,
                  height: '100%',
                  backgroundColor: item.color,
                  borderRadius: '4px'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MethodChart;