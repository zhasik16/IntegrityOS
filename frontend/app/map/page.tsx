'use client';

import { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, CheckCircle, Filter, Maximize2, Navigation, List } from 'lucide-react';

// Mock данные (координаты в пределах Казахстана)
const mockMapPoints = [
  { 
    id: 1, 
    name: "Кран подвесной", 
    lat: 51.1694, // Астана
    lon: 71.4491, 
    type: "crane" as const, 
    criticality: "high" as const,
    pipeline: "MT-02",
    lastInspection: "2023-05-10",
    material: "Ст3",
    year: 1961
  },
  { 
    id: 2, 
    name: "Турбокомпрессор ТВ-80-1", 
    lat: 43.2567, // Алматы
    lon: 76.9286, 
    type: "compressor" as const, 
    criticality: "high" as const,
    pipeline: "MT-02",
    lastInspection: "2023-07-20",
    material: "09Г2С",
    year: 1999
  },
  { 
    id: 3, 
    name: "Участок трубопровода №1", 
    lat: 49.9485, // Караганда
    lon: 73.1040, 
    type: "pipeline_section" as const, 
    criticality: "medium" as const,
    pipeline: "MT-01",
    lastInspection: "2023-08-05",
    material: "X70",
    year: 1985
  },
  { 
    id: 4, 
    name: "Насосная станция", 
    lat: 50.3000, // Павлодар
    lon: 76.9500, 
    type: "compressor" as const, 
    criticality: "normal" as const,
    pipeline: "MT-03",
    lastInspection: "2023-09-12",
    material: "09Г2С",
    year: 2005
  },
  { 
    id: 5, 
    name: "Кран шаровый", 
    lat: 52.3000, // Костанай
    lon: 76.9200, 
    type: "crane" as const, 
    criticality: "normal" as const,
    pipeline: "MT-01",
    lastInspection: "2023-06-15",
    material: "Ст3",
    year: 1978
  },
  { 
    id: 6, 
    name: "Компрессорная станция №2", 
    lat: 47.5000, // Семей
    lon: 80.2500, 
    type: "compressor" as const, 
    criticality: "medium" as const,
    pipeline: "MT-03",
    lastInspection: "2023-10-20",
    material: "09Г2С",
    year: 2010
  },
  { 
    id: 7, 
    name: "Участок трубопровода №3", 
    lat: 44.8500, // Шымкент
    lon: 65.5000, 
    type: "pipeline_section" as const, 
    criticality: "normal" as const,
    pipeline: "MT-01",
    lastInspection: "2023-11-05",
    material: "X70",
    year: 1995
  },
];

const getTypeDisplay = (type: string) => {
  switch (type) {
    case 'crane': return 'Кран';
    case 'compressor': return 'Компрессор';
    case 'pipeline_section': return 'Участок трубопровода';
    default: return type;
  }
};

const getCriticalityDisplay = (criticality: string) => {
  switch (criticality) {
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'normal': return 'Нормальный';
    default: return criticality;
  }
};

export default function MapPage() {
  const [selectedPoint, setSelectedPoint] = useState<(typeof mockMapPoints)[0] | null>(null);
  const [filters, setFilters] = useState({
    showHighRisk: true,
    showMediumRisk: true,
    showNormal: true,
    showCranes: true,
    showCompressors: true,
    showPipelines: true,
  });
  const [mapView, setMapView] = useState<'mapnik' | 'hot'>('mapnik');
  const [mapUrl, setMapUrl] = useState('');

  // Фильтруем точки
  const filteredPoints = mockMapPoints.filter(point => {
    // Фильтр по критичности
    if (point.criticality === 'high' && !filters.showHighRisk) return false;
    if (point.criticality === 'medium' && !filters.showMediumRisk) return false;
    if (point.criticality === 'normal' && !filters.showNormal) return false;
    
    // Фильтр по типу объекта
    if (point.type === 'crane' && !filters.showCranes) return false;
    if (point.type === 'compressor' && !filters.showCompressors) return false;
    if (point.type === 'pipeline_section' && !filters.showPipelines) return false;
    
    return true;
  });

  // Генерируем URL карты с маркерами
  useEffect(() => {
    if (filteredPoints.length === 0) {
      // Если нет точек, показываем просто карту Казахстана
      const bbox = '46.0,40.0,88.0,55.0'; // Границы Казахстана
      setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=${mapView}&marker=48.0,68.0`);
      return;
    }

    // Создаем строку маркеров для OpenStreetMap
    // Формат: lat,lon,color,label|lat,lon,color,label
    const markers = filteredPoints.map(point => {
      let color = '';
      let label = '';
      
      switch (point.criticality) {
        case 'high':
          color = 'red';
          label = `H${point.id}`;
          break;
        case 'medium':
          color = 'orange';
          label = `M${point.id}`;
          break;
        case 'normal':
          color = 'green';
          label = `N${point.id}`;
          break;
      }
      
      return `${point.lat},${point.lon},${color}${label}`;
    }).join('|');

    // Центрируем карту по средней точке
    const avgLat = filteredPoints.reduce((sum, p) => sum + p.lat, 0) / filteredPoints.length;
    const avgLon = filteredPoints.reduce((sum, p) => sum + p.lon, 0) / filteredPoints.length;
    
    // Границы для отображения всех точек
    const minLat = Math.min(...filteredPoints.map(p => p.lat));
    const maxLat = Math.max(...filteredPoints.map(p => p.lat));
    const minLon = Math.min(...filteredPoints.map(p => p.lon));
    const maxLon = Math.max(...filteredPoints.map(p => p.lon));
    
    // Добавляем отступы
    const padding = 2;
    const bbox = `${minLon - padding},${minLat - padding},${maxLon + padding},${maxLat + padding}`;
    
    setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=${mapView}&marker=${markers}`);
  }, [filters, mapView, filteredPoints]);

  const openFullScreenMap = () => {
    if (filteredPoints.length > 0) {
      const markers = filteredPoints.map(p => `${p.lat},${p.lon}`).join('|');
      const url = `https://www.openstreetmap.org/?mlat=${filteredPoints[0].lat}&mlon=${filteredPoints[0].lon}&zoom=6&layers=${mapView}&markers=${markers}`;
      window.open(url, '_blank');
    } else {
      window.open('https://www.openstreetmap.org/#map=5/48.000/68.000', '_blank');
    }
  };

  const handleSelectPoint = (point: typeof mockMapPoints[0]) => {
    setSelectedPoint(point);
    // Прокручиваем к информации об объекте
    setTimeout(() => {
      const element = document.getElementById('object-info');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const resetFilters = () => {
    setFilters({
      showHighRisk: true,
      showMediumRisk: true,
      showNormal: true,
      showCranes: true,
      showCompressors: true,
      showPipelines: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold">Карта объектов</h1>
        <p className="text-secondary">Визуализация трубопроводов и объектов контроля в Казахстане</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
        {/* Карта */}
        <div className="card" style={{ height: '600px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ 
            position: 'absolute', 
            top: '1rem', 
            right: '1rem', 
            zIndex: 10,
            display: 'flex',
            gap: '0.5rem'
          }}>
            <button
              onClick={() => setMapView(mapView === 'mapnik' ? 'hot' : 'mapnik')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Navigation size={16} />
              {mapView === 'mapnik' ? 'Спутник' : 'Схема'}
            </button>
            <button
              onClick={openFullScreenMap}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Maximize2 size={16} />
              Полный экран
            </button>
          </div>

          {mapUrl ? (
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 'none', borderRadius: '0.5rem' }}
              title="Карта объектов IntegrityOS"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#f0f9ff',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  border: '3px solid #e5e7eb',
                  borderTopColor: '#2563eb',
                  borderRadius: '50%',
                  margin: '0 auto 1rem',
                  animation: 'spin 1s linear infinite'
                }} />
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Загрузка карты</div>
                <div style={{ color: '#6b7280' }}>Подготавливаем данные...</div>
              </div>
            </div>
          )}

          {/* Легенда */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '0.875rem',
            zIndex: 10,
            backdropFilter: 'blur(4px)',
            maxWidth: '200px'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Легенда маркеров</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  backgroundColor: '#ef4444',
                  border: '2px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  H
                </div>
                <span>Высокий риск</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  backgroundColor: '#f59e0b',
                  border: '2px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  M
                </div>
                <span>Средний риск</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981',
                  border: '2px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  N
                </div>
                <span>Нормальный</span>
              </div>
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280', 
              marginTop: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              Буква + цифра = ID объекта
            </div>
          </div>

          {/* Статистика */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '0.875rem',
            zIndex: 10,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Объекты на карте</div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Всего</div>
                <div style={{ fontWeight: 700, color: '#111827' }}>{filteredPoints.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Высокий риск</div>
                <div style={{ fontWeight: 700, color: '#ef4444' }}>
                  {filteredPoints.filter(p => p.criticality === 'high').length}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Средний риск</div>
                <div style={{ fontWeight: 700, color: '#f59e0b' }}>
                  {filteredPoints.filter(p => p.criticality === 'medium').length}
                </div>
              </div>
            </div>
          </div>

          {/* Инструкция */}
          {filteredPoints.length > 0 && !selectedPoint && (
            <div style={{
              position: 'absolute',
              top: '5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              fontSize: '0.875rem',
              zIndex: 10,
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fadeIn 0.5s'
            }}>
              <MapPin size={16} />
              <span>Используйте таблицу ниже для выбора объекта</span>
            </div>
          )}
        </div>

        {/* Правая панель - Фильтры */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title flex items-center">
              <Filter style={{ marginRight: '0.5rem' }} size={20} />
              Фильтры объектов
            </h3>
            <div className="space-y-4">
              {/* Фильтр по критичности */}
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Уровень критичности
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={filters.showHighRisk}
                      onChange={(e) => setFilters({...filters, showHighRisk: e.target.checked})}
                    />
                    <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                      Высокий риск ({mockMapPoints.filter(p => p.criticality === 'high').length})
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={filters.showMediumRisk}
                      onChange={(e) => setFilters({...filters, showMediumRisk: e.target.checked})}
                    />
                    <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                      Средний риск ({mockMapPoints.filter(p => p.criticality === 'medium').length})
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={filters.showNormal}
                      onChange={(e) => setFilters({...filters, showNormal: e.target.checked})}
                    />
                    <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      Нормальный ({mockMapPoints.filter(p => p.criticality === 'normal').length})
                    </span>
                  </label>
                </div>
              </div>

              {/* Фильтр по типу объекта */}
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                  Тип объекта
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={filters.showCranes}
                      onChange={(e) => setFilters({...filters, showCranes: e.target.checked})}
                    />
                    <span style={{ fontSize: '0.875rem' }}>
                      Краны ({mockMapPoints.filter(p => p.type === 'crane').length})
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={filters.showCompressors}
                      onChange={(e) => setFilters({...filters, showCompressors: e.target.checked})}
                    />
                    <span style={{ fontSize: '0.875rem' }}>
                      Компрессоры ({mockMapPoints.filter(p => p.type === 'compressor').length})
                    </span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={filters.showPipelines}
                      onChange={(e) => setFilters({...filters, showPipelines: e.target.checked})}
                    />
                    <span style={{ fontSize: '0.875rem' }}>
                      Участки трубопровода ({mockMapPoints.filter(p => p.type === 'pipeline_section').length})
                    </span>
                  </label>
                </div>
              </div>

              {/* Статистика фильтров */}
              <div style={{ 
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}>
                <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Статистика фильтров</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Всего объектов:</span>
                  <span style={{ fontWeight: 600 }}>{mockMapPoints.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Показано на карте:</span>
                  <span style={{ fontWeight: 600, color: '#2563eb' }}>{filteredPoints.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Скрыто:</span>
                  <span style={{ fontWeight: 600, color: '#6b7280' }}>{mockMapPoints.length - filteredPoints.length}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={resetFilters}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Сбросить все
                </button>
                <button 
                  onClick={() => setFilters({
                    showHighRisk: true,
                    showMediumRisk: false,
                    showNormal: false,
                    showCranes: true,
                    showCompressors: true,
                    showPipelines: true,
                  })}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: '#fef2f2',
                    color: '#991b1b',
                    border: '1px solid #fee2e2',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                  title="Показать только высокий риск"
                >
                  Только высокий риск
                </button>
              </div>
            </div>
          </div>

          {/* Информация о выбранном объекте */}
          <div id="object-info" className="card">
            <h3 className="card-title flex items-center">
              <MapPin style={{ marginRight: '0.5rem' }} size={20} />
              {selectedPoint ? selectedPoint.name : 'Информация об объекте'}
            </h3>
            
            {selectedPoint ? (
              <div className="space-y-4">
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.375rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Широта</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 500 }}>
                      {selectedPoint.lat.toFixed(4)}°
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Долгота</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 500 }}>
                      {selectedPoint.lon.toFixed(4)}°
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Основная информация
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                    <div>
                      <div style={{ color: '#6b7280' }}>Тип</div>
                      <div style={{ fontWeight: 500 }}>{getTypeDisplay(selectedPoint.type)}</div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280' }}>Трубопровод</div>
                      <div style={{ 
                        fontWeight: 500,
                        color: selectedPoint.pipeline === 'MT-01' ? '#1e40af' :
                              selectedPoint.pipeline === 'MT-02' ? '#991b1b' : '#065f46'
                      }}>
                        {selectedPoint.pipeline}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280' }}>Год ввода</div>
                      <div style={{ fontWeight: 500 }}>{selectedPoint.year}</div>
                    </div>
                    <div>
                      <div style={{ color: '#6b7280' }}>Материал</div>
                      <div style={{ fontWeight: 500 }}>{selectedPoint.material}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Состояние
                  </div>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    backgroundColor: selectedPoint.criticality === 'high' ? '#fee2e2' : 
                                   selectedPoint.criticality === 'medium' ? '#fef3c7' : '#d1fae5',
                    color: selectedPoint.criticality === 'high' ? '#991b1b' : 
                          selectedPoint.criticality === 'medium' ? '#92400e' : '#065f46'
                  }}>
                    {selectedPoint.criticality === 'high' ? (
                      <>
                        <AlertTriangle size={16} style={{ marginRight: '0.5rem' }} />
                        Высокий риск
                      </>
                    ) : selectedPoint.criticality === 'medium' ? (
                      <>
                        <AlertTriangle size={16} style={{ marginRight: '0.5rem' }} />
                        Средний риск
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
                        Нормальное состояние
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Последнее обследование:</div>
                  <div style={{ fontWeight: 500 }}>{selectedPoint.lastInspection}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <button 
                    onClick={() => window.open(`/objects/${selectedPoint.id}`, '_blank')}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Подробная информация
                  </button>
                  <button 
                    onClick={() => {
                      const url = `https://www.google.com/maps?q=${selectedPoint.lat},${selectedPoint.lon}`;
                      window.open(url, '_blank');
                    }}
                    style={{
                      padding: '0.5rem',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Открыть в Google Maps"
                  >
                    <Navigation size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <MapPin size={32} style={{ marginBottom: '1rem', color: '#9ca3af' }} />
                <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Объект не выбран</div>
                <div style={{ fontSize: '0.875rem' }}>
                  Выберите объект из таблицы ниже для просмотра информации
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Таблица объектов под картой */}
      <div className="card">
        <h3 className="card-title flex items-center">
          <List style={{ marginRight: '0.5rem' }} size={20} />
          Объекты на карте ({filteredPoints.length})
        </h3>
        
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', position: 'sticky', top: 0, zIndex: 1 }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Маркер</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Объект</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Тип</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Трубопровод</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Критичность</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Последняя проверка</th>
                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Действие</th>
              </tr>
            </thead>
            <tbody>
              {filteredPoints.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    Нет объектов, соответствующих фильтрам
                  </td>
                </tr>
              ) : (
                filteredPoints.map(point => (
                  <tr 
                    key={point.id} 
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: selectedPoint?.id === point.id ? '#f0f9ff' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: point.criticality === 'high' ? '#ef4444' : 
                                       point.criticality === 'medium' ? '#f59e0b' : '#10b981',
                        border: '2px solid white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {point.criticality === 'high' ? 'H' : point.criticality === 'medium' ? 'M' : 'N'}
                        {point.id}
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ fontWeight: 500 }}>{point.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>ID: {point.id}</div>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backgroundColor: point.type === 'crane' ? '#dbeafe' : 
                                       point.type === 'compressor' ? '#fce7f3' : '#d1fae5',
                        color: point.type === 'crane' ? '#1e40af' : 
                              point.type === 'compressor' ? '#9d174d' : '#065f46'
                      }}>
                        {getTypeDisplay(point.type)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}>
                        {point.pipeline}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: point.criticality === 'high' ? '#fee2e2' : 
                                       point.criticality === 'medium' ? '#fef3c7' : '#d1fae5',
                        color: point.criticality === 'high' ? '#991b1b' : 
                              point.criticality === 'medium' ? '#92400e' : '#065f46'
                      }}>
                        {getCriticalityDisplay(point.criticality)}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#6b7280' }}>
                      {point.lastInspection}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => handleSelectPoint(point)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: selectedPoint?.id === point.id ? '#2563eb' : '#f3f4f6',
                          color: selectedPoint?.id === point.id ? 'white' : '#374151',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {selectedPoint?.id === point.id ? 'Выбран' : 'Выбрать'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}