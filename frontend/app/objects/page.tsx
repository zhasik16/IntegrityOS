'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { PipelineObject } from '@/lib/types';
import { api } from '@/lib/api';

export default function ObjectsPage() {
  const [objects, setObjects] = useState<PipelineObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'object_id' | 'year' | 'object_name'>('object_id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPipeline, setSelectedPipeline] = useState<string>('all');

  useEffect(() => {
    loadObjects();
  }, []);

  const loadObjects = async () => {
    try {
      const data = await api.getObjects();
      setObjects(data);
    } catch (error) {
      console.error('Error loading objects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и сортировка
  const filteredObjects = objects
    .filter(obj => {
      if (searchTerm && !obj.object_name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (selectedType !== 'all' && obj.object_type !== selectedType) {
        return false;
      }
      if (selectedPipeline !== 'all' && obj.pipeline_id !== selectedPipeline) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  const objectTypes = ['all', 'crane', 'compressor', 'pipeline_section'];
  const pipelines = ['all', 'MT-01', 'MT-02', 'MT-03'];

  const handleSort = (field: 'object_id' | 'year' | 'object_name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'crane': return 'Кран';
      case 'compressor': return 'Компрессор';
      case 'pipeline_section': return 'Участок трубопровода';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ color: '#6b7280' }}>Загрузка объектов...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold">Объекты контроля</h1>
        <p className="text-secondary">Список всего оборудования и участков трубопроводов</p>
      </div>

      {/* Панель управления */}
      <div className="card">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
              {/* Поиск */}
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={20} style={{ 
                  position: 'absolute', 
                  left: '0.75rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#9ca3af'
                }} />
                <input
                  type="text"
                  placeholder="Поиск по названию объекта..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Фильтры */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    minWidth: '150px'
                  }}
                >
                  {objectTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'Все типы' : getTypeDisplay(type)}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedPipeline}
                  onChange={(e) => setSelectedPipeline(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    minWidth: '120px'
                  }}
                >
                  {pipelines.map(pipeline => (
                    <option key={pipeline} value={pipeline}>
                      {pipeline === 'all' ? 'Все трубопроводы' : pipeline}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Кнопки */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}>
                <Filter size={16} />
                <span>Фильтры</span>
              </button>

              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}>
                <Download size={16} />
                <span>Экспорт</span>
              </button>
            </div>
          </div>

          {/* Статистика фильтров */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            <div>
              Найдено объектов: <span style={{ fontWeight: 600, color: '#111827' }}>{filteredObjects.length}</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div>
                Всего: <span style={{ fontWeight: 600 }}>{objects.length}</span>
              </div>
              <div>
                Краны: <span style={{ fontWeight: 600 }}>{objects.filter(o => o.object_type === 'crane').length}</span>
              </div>
              <div>
                Компрессоры: <span style={{ fontWeight: 600 }}>{objects.filter(o => o.object_type === 'compressor').length}</span>
              </div>
              <div>
                Участки: <span style={{ fontWeight: 600 }}>{objects.filter(o => o.object_type === 'pipeline_section').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Таблица объектов */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>
                  <button
                    onClick={() => handleSort('object_id')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ID
                    {sortField === 'object_id' && (
                      sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </button>
                </th>
                <th>
                  <button
                    onClick={() => handleSort('object_name')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Название объекта
                    {sortField === 'object_name' && (
                      sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </button>
                </th>
                <th>Тип</th>
                <th>Трубопровод</th>
                <th>
                  <button
                    onClick={() => handleSort('year')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Год ввода
                    {sortField === 'year' && (
                      sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </button>
                </th>
                <th>Материал</th>
                <th>Координаты</th>
                <th style={{ width: '100px' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredObjects.map((obj) => (
                <tr key={obj.object_id}>
                  <td style={{ fontWeight: 600 }}>{obj.object_id}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{obj.object_name}</div>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: obj.object_type === 'crane' ? '#dbeafe' : 
                                     obj.object_type === 'compressor' ? '#fce7f3' : '#d1fae5',
                      color: obj.object_type === 'crane' ? '#1e40af' : 
                            obj.object_type === 'compressor' ? '#9d174d' : '#065f46'
                    }}>
                      {getTypeDisplay(obj.object_type)}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}>
                      {obj.pipeline_id}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{obj.year}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {(new Date().getFullYear() - obj.year)} лет в эксплуатации
                    </div>
                  </td>
                  <td>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {obj.lat.toFixed(4)}, {obj.lon.toFixed(4)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        title="Просмотр"
                        style={{
                          padding: '0.375rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        title="История обследований"
                        style={{
                          padding: '0.375rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Filter size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredObjects.length === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#6b7280'
            }}>
              Объекты не найдены. Попробуйте изменить параметры поиска.
            </div>
          )}
        </div>

        {/* Пагинация */}
        {filteredObjects.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '1rem',
            borderTop: '1px solid #e5e7eb',
            marginTop: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Показано 1-{Math.min(10, filteredObjects.length)} из {filteredObjects.length} объектов
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  background: '#f3f4f6',
                  color: '#9ca3af',
                  cursor: 'not-allowed',
                  fontSize: '0.875rem'
                }}
              >
                Назад
              </button>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                1
              </button>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                2
              </button>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  background: '#2563eb',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Вперед
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Быстрая статистика */}
      <div className="card">
        <h3 className="card-title">Статистика по материалам</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {Array.from(new Set(objects.map(o => o.material))).map(material => {
            const count = objects.filter(o => o.material === material).length;
            return (
              <div key={material} style={{
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  {material}
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'baseline',
                  gap: '0.5rem'
                }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{count}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    объектов ({(count / objects.length * 100).toFixed(1)}%)
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}