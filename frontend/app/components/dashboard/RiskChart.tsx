// frontend/app/components/dashboard/RiskChart.tsx
'use client';

import React from 'react';

interface RiskChartProps {
  data: Array<{
    label: string;
    count: number;
  }>;
}

const RISK_COLORS: Record<string, string> = {
  high: '#FF6B6B',
  medium: '#FFBB28',
  normal: '#00C49F'
};

const RISK_LABELS: Record<string, string> = {
  high: 'Высокий риск',
  medium: 'Средний риск',
  normal: 'Нормальный'
};

const RiskChart = ({ data }: RiskChartProps) => {
  // Если data undefined или не массив, используем пустой массив
  const chartData = Array.isArray(data) 
    ? data
        .filter(item => item && item.count > 0)
        .map(item => ({
          label: item.label,
          name: RISK_LABELS[item.label] || item.label,
          value: item.count || 0,
          color: RISK_COLORS[item.label] || '#6b7280',
          percentage: (item.count / data.reduce((total, curr) => total + (curr?.count || 0), 0)) * 100
        }))
    : [];

  if (chartData.length === 0) {
    return (
      <div className="card">
        <h3 className="card-title">Распределение по критичности</h3>
        <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: '#6b7280' }}>Нет данных для отображения</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="card-title">Распределение по критичности</h3>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.color
                  }}></div>
                  <span style={{ fontWeight: 500 }}>{item.name}</span>
                </div>
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

export default RiskChart;