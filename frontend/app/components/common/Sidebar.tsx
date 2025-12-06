'use client';

import { useState } from 'react';
import { Filter, Calendar, AlertCircle, Layers, Wrench } from 'lucide-react';

const Sidebar = () => {
  const [filters, setFilters] = useState({
    dateRange: ['2023-01-01', '2024-01-01'],
    methods: [] as string[],
    objectTypes: [] as string[],
    hasDefects: false,
  });

  const methodOptions = ['VIK', 'PVK', 'MPK', 'UZK', 'RGK', 'TVK', 'VIBRO', 'MFL', 'TFI', 'GEO', 'UTWM'];
  const objectTypeOptions = ['crane', 'compressor', 'pipeline_section'];

  return (
    <aside className="sidebar">
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        paddingRight: '0.5rem'
      }}>
        <div style={{ flex: 1 }}>
          <div className="sidebar-section">
            <h3 className="sidebar-title" style={{ marginBottom: '1rem' }}>
              <Filter className="sidebar-icon" />
              Фильтры
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Дата */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#111827'
                }}>
                  <Calendar size={16} />
                  <span>Дата обследования</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="date"
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                    value={filters.dateRange[0]}
                    onChange={(e) => setFilters({...filters, dateRange: [e.target.value, filters.dateRange[1]]})}
                  />
                  <input
                    type="date"
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                    value={filters.dateRange[1]}
                    onChange={(e) => setFilters({...filters, dateRange: [filters.dateRange[0], e.target.value]})}
                  />
                </div>
              </div>

              {/* Методы контроля */}
              <div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: 500,
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  Методы контроля
                </div>
                <div style={{ 
                  maxHeight: '150px', 
                  overflowY: 'auto',
                  padding: '0.5rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {methodOptions.map(method => (
                      <label 
                        key={method} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          padding: '0.25rem 0'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={filters.methods.includes(method)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({...filters, methods: [...filters.methods, method]});
                            } else {
                              setFilters({...filters, methods: filters.methods.filter(m => m !== method)});
                            }
                          }}
                          style={{ 
                            marginRight: '0.5rem',
                            width: '1rem',
                            height: '1rem',
                            cursor: 'pointer'
                          }}
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Типы объектов */}
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#111827'
                }}>
                  <Layers size={16} />
                  <span>Типы объектов</span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.375rem',
                  padding: '0.5rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb'
                }}>
                  {objectTypeOptions.map(type => (
                    <label 
                      key={type} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.objectTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({...filters, objectTypes: [...filters.objectTypes, type]});
                          } else {
                            setFilters({...filters, objectTypes: filters.objectTypes.filter(t => t !== type)});
                          }
                        }}
                        style={{ 
                          marginRight: '0.5rem',
                          width: '1rem',
                          height: '1rem',
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{ textTransform: 'capitalize' }}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Только с дефектами */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem',
                border: '1px solid #e5e7eb'
              }}>
                <input
                  type="checkbox"
                  checked={filters.hasDefects}
                  onChange={(e) => setFilters({...filters, hasDefects: e.target.checked})}
                  style={{ 
                    marginRight: '0.5rem',
                    width: '1rem',
                    height: '1rem',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#111827'
                }}>
                  <AlertCircle size={16} />
                  <span>Только с дефектами</span>
                </div>
              </div>

              {/* Кнопка применения */}
              <button style={{ 
                width: '100%', 
                backgroundColor: '#2563eb', 
                color: 'white', 
                padding: '0.75rem', 
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                boxSizing: 'border-box'
              }}>
                Применить фильтры
              </button>
            </div>
          </div>
        </div>

        {/* Статистика */}
        <div className="sidebar-section" style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
          <h4 className="sidebar-title" style={{ marginBottom: '1rem' }}>
            <Wrench className="sidebar-icon" />
            Быстрая статистика
          </h4>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Всего объектов:</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>25</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Обследований:</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111827' }}>142</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Дефектов:</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ef4444' }}>18</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Критических:</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#ef4444' }}>5</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;