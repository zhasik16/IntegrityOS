'use client';

import React from 'react';

interface RiskChartProps {
  data: Record<string, number>;
}

const RiskChart = ({ data }: RiskChartProps) => {
  const chartData = [
    { name: 'Нормальный', value: data.normal || 0, color: '#10B981' },
    { name: 'Средний', value: data.medium || 0, color: '#F59E0B' },
    { name: 'Высокий', value: data.high || 0, color: '#EF4444' },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card">
      <h3 className="card-title">Распределение по критичности</h3>
      <div className="chart-container">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          height: '100%',
          justifyContent: 'center'
        }}>
          {chartData.map((item, index) => (
            <div key={index}>
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
                  {item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
                </span>
              </div>
              <div style={{
                width: '100%',
                height: '12px',
                backgroundColor: '#e5e7eb',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: item.color,
                  borderRadius: '6px'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem',
        marginTop: '1rem'
      }}>
        {chartData.map((item) => (
          <div key={item.name} style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              color: item.color 
            }}>
              {item.value}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskChart;