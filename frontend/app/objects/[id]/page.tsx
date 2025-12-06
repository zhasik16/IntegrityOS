'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Calendar, MapPin, ToolCase, AlertTriangle, 
  CheckCircle, BarChart3, History, Download, Edit 
} from 'lucide-react';
import { PipelineObject, Diagnostic } from '@/lib/types';
import { api } from '@/lib/api';

export default function ObjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const objectId = parseInt(params.id as string);
  
  const [object, setObject] = useState<PipelineObject | null>(null);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'diagnostics' | 'history'>('info');

  useEffect(() => {
    loadObjectData();
  }, [objectId]);

  const loadObjectData = async () => {
    try {
      const [objData, diagData] = await Promise.all([
        api.getObject(objectId),
        api.getObjectDiagnostics(objectId)
      ]);
      
      setObject(objData);
      setDiagnostics(diagData || []);
    } catch (error) {
      console.error('Error loading object data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{ color: '#6b7280' }}>Загрузка данных объекта...</div>
      </div>
    );
  }

  if (!object) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Объект не найден
        </div>
        <button
          onClick={() => router.push('/objects')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} />
          Вернуться к списку
        </button>
      </div>
    );
  }

  const getTypeDisplay = (type: string) => {
    switch (type) {
      case 'crane': return 'Кран';
      case 'compressor': return 'Компрессор';
      case 'pipeline_section': return 'Участок трубопровода';
      default: return type;
    }
  };

  const lastDiagnostic = diagnostics.length > 0 
    ? diagnostics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const hasDefects = diagnostics.some(d => d.defect_found);
  const defectCount = diagnostics.filter(d => d.defect_found).length;

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div>
        <button
          onClick={() => router.push('/objects')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f3f4f6',
            border: '1px solid #e5e7eb',
            borderRadius: '0.375rem',
            marginBottom: '1rem',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          <ArrowLeft size={16} />
          Назад к списку
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="text-2xl font-bold">{object.object_name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                padding: '0.25rem 0.75rem',
                backgroundColor: object.object_type === 'crane' ? '#dbeafe' : 
                               object.object_type === 'compressor' ? '#fce7f3' : '#d1fae5',
                color: object.object_type === 'crane' ? '#1e40af' : 
                      object.object_type === 'compressor' ? '#9d174d' : '#065f46',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                {getTypeDisplay(object.object_type)}
              </div>
              <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                padding: '0.25rem 0.75rem',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                {object.pipeline_id}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280' }}>
                <MapPin size={16} />
                <span style={{ fontSize: '0.875rem' }}>ID: {object.object_id}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <Edit size={16} />
              Редактировать
            </button>
            <button
              style={{
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
              }}
            >
              <Download size={16} />
              Экспорт данных
            </button>
          </div>
        </div>
      </div>

      {/* Основная информация */}
      <div className="card">
        <div style={{ 
          display: 'flex', 
          gap: '1.5rem',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '1.5rem',
          paddingBottom: '1rem'
        }}>
          <button
            onClick={() => setActiveTab('info')}
            style={{
              padding: '0.5rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'info' ? '2px solid #2563eb' : 'none',
              color: activeTab === 'info' ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === 'info' ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Информация
          </button>
          <button
            onClick={() => setActiveTab('diagnostics')}
            style={{
              padding: '0.5rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'diagnostics' ? '2px solid #2563eb' : 'none',
              color: activeTab === 'diagnostics' ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === 'diagnostics' ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.875sub'
            }}
          >
            Обследования ({diagnostics.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.5rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid #2563eb' : 'none',
              color: activeTab === 'history' ? '#2563eb' : '#6b7280',
              fontWeight: activeTab === 'history' ? 600 : 400,
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            История
          </button>
        </div>

        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Статус */}
            <div style={{ 
              padding: '1.5rem',
              backgroundColor: lastDiagnostic?.ml_label === 'high' ? '#fef2f2' : 
                             lastDiagnostic?.ml_label === 'medium' ? '#fffbeb' : '#f0fdf4',
              border: '1px solid',
              borderColor: lastDiagnostic?.ml_label === 'high' ? '#fee2e2' : 
                          lastDiagnostic?.ml_label === 'medium' ? '#fef3c7' : '#d1fae5',
              borderRadius: '0.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {lastDiagnostic?.ml_label === 'high' ? (
                      <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                    ) : lastDiagnostic?.ml_label === 'medium' ? (
                      <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
                    ) : (
                      <CheckCircle size={24} style={{ color: '#10b981' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                        {lastDiagnostic?.ml_label === 'high' ? 'Высокий риск' :
                         lastDiagnostic?.ml_label === 'medium' ? 'Средний риск' : 'Нормальное состояние'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {lastDiagnostic 
                          ? `Последнее обследование: ${lastDiagnostic.date}`
                          : 'Нет данных об обследованиях'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '1rem',
                    marginTop: '1rem'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Всего обследований</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{diagnostics.length}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Обнаружено дефектов</div>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 700,
                        color: hasDefects ? '#ef4444' : '#111827'
                      }}>
                        {defectCount}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Возраст объекта</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {new Date().getFullYear() - object.year} лет
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  style={{
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
                  }}
                >
                  <ToolCase size={16} />
                  Запланировать обследование
                </button>
              </div>
            </div>

            {/* Детальная информация */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1.5rem'
            }}>
              <div>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1.125rem' }}>
                  Основные параметры
                </h3>
                <div className="space-y-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280' }}>Идентификатор:</span>
                    <span style={{ fontWeight: 500 }}>{object.object_id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280' }}>Трубопровод:</span>
                    <span style={{ fontWeight: 500 }}>{object.pipeline_id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280' }}>Год ввода:</span>
                    <span style={{ fontWeight: 500 }}>{object.year}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280' }}>Материал:</span>
                    <span style={{ fontWeight: 500 }}>{object.material}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '1.125rem' }}>
                  Географические данные
                </h3>
                <div className="space-y-4">
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280' }}>Широта:</span>
                    <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{object.lat}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ color: '#6b7280' }}>Долгота:</span>
                    <span style={{ fontWeight: 500, fontFamily: 'monospace' }}>{object.lon}</span>
                  </div>
                  <div style={{ 
                    height: '150px', 
                    backgroundColor: '#f0f9ff',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '1rem'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <MapPin size={32} style={{ color: '#3b82f6', marginBottom: '0.5rem' }} />
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Карта расположения объекта
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div>
            {diagnostics.length > 0 ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Дата</th>
                      <th>Метод</th>
                      <th>Результат</th>
                      <th>Оценка</th>
                      <th>Дефекты</th>
                      <th>Критичность</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnostics.map((diag) => (
                      <tr key={diag.diag_id}>
                        <td>{diag.date}</td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {diag.method}
                          </span>
                        </td>
                        <td>
                          {diag.defect_found ? (
                            <span style={{ color: '#ef4444', fontWeight: 600 }}>Дефекты обнаружены</span>
                          ) : (
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Без дефектов</span>
                          )}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: diag.quality_grade === 'недопустимо' ? '#fee2e2' :
                                          diag.quality_grade === 'требует_мер' ? '#fef3c7' :
                                          diag.quality_grade === 'допустимо' ? '#fef3c7' : '#d1fae5',
                            color: diag.quality_grade === 'недопустимо' ? '#991b1b' :
                                  diag.quality_grade === 'требует_мер' ? '#92400e' :
                                  diag.quality_grade === 'допустимо' ? '#92400e' : '#065f46'
                          }}>
                            {diag.quality_grade}
                          </span>
                        </td>
                        <td>
                          {diag.defect_description || '—'}
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            backgroundColor: diag.ml_label === 'high' ? '#fee2e2' :
                                          diag.ml_label === 'medium' ? '#fef3c7' : '#d1fae5',
                            color: diag.ml_label === 'high' ? '#991b1b' :
                                  diag.ml_label === 'medium' ? '#92400e' : '#065f46'
                          }}>
                            {diag.ml_label}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <BarChart3 size={48} style={{ marginBottom: '1rem', color: '#9ca3af' }} />
                <div>Нет данных об обследованиях</div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div style={{ 
              padding: '1.5rem',
              backgroundColor: '#f9fafb',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <History size={20} />
                <div style={{ fontWeight: 600 }}>История изменений</div>
              </div>
              
              <div className="space-y-4">
                <div style={{ 
                  padding: '1rem',
                  borderLeft: '3px solid #3b82f6',
                  backgroundColor: 'white'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Последнее обследование</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {lastDiagnostic ? `${lastDiagnostic.date} - ${lastDiagnostic.method}` : 'Нет данных'}
                  </div>
                </div>
                
                <div style={{ 
                  padding: '1rem',
                  borderLeft: '3px solid #10b981',
                  backgroundColor: 'white'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Ввод в эксплуатацию</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {object.year} год
                  </div>
                </div>
                
                <div style={{ 
                  padding: '1rem',
                  borderLeft: '3px solid #f59e0b',
                  backgroundColor: 'white'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Первое обследование</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {diagnostics.length > 0 
                      ? `${diagnostics[diagnostics.length - 1].date} - ${diagnostics[diagnostics.length - 1].method}`
                      : 'Нет данных'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Рекомендации</h3>
              <div style={{ 
                padding: '1.5rem',
                backgroundColor: lastDiagnostic?.ml_label === 'high' ? '#fef2f2' : '#fffbeb',
                borderRadius: '0.5rem',
                border: `1px solid ${lastDiagnostic?.ml_label === 'high' ? '#fee2e2' : '#fef3c7'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <AlertTriangle size={20} style={{ 
                    color: lastDiagnostic?.ml_label === 'high' ? '#ef4444' : '#f59e0b',
                    flexShrink: 0
                  }} />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                      {lastDiagnostic?.ml_label === 'high' 
                        ? 'Требуется срочное вмешательство' 
                        : 'Рекомендуется плановое обследование'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {lastDiagnostic?.ml_label === 'high'
                        ? 'Объект имеет высокий уровень риска. Рекомендуется проведение внепланового ремонта.'
                        : 'Рекомендуется проведение следующего обследования в течение 6 месяцев.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}