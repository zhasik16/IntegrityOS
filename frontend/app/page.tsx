'use client';

import { useEffect, useState } from 'react';
import { BarChart3, AlertTriangle, CheckCircle, Wrench, Brain } from 'lucide-react';
import StatsCards from './components/dashboard/StatsCards';
import MethodChart from './components/dashboard/MethodChart';
import RiskChart from './components/dashboard/RiskChart';
import { api } from '@/lib/api';
import { DashboardStats } from '@/lib/types';

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [mlForm, setMlForm] = useState({
    quality_grade: 'удовлетворительно' as 'удовлетворительно' | 'допустимо' | 'требует_мер' | 'недопустимо',
    param1: 0,
    param2: 0,
    param3: 0,
    defect_found: false,
  });
  const [prediction, setPrediction] = useState<{ label: string; probability: number } | null>(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const result = await api.predictCriticality(mlForm);
      setPrediction(result);
    } catch (error) {
      console.error('Error predicting:', error);
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{ color: '#6b7280' }}>Загрузка данных...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '256px' }}>
        <div style={{ color: '#ef4444' }}>Ошибка загрузки данных</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p style={{ color: '#6b7280' }}>Обзор состояния магистральных трубопроводов</p>
        </div>
        <div className="flex items-center space-x-2" style={{ color: '#2563eb' }}>
          <BarChart3 size={24} />
          <span className="font-semibold">Real-time monitoring</span>
        </div>
      </div>

      {/* Карточки статистики */}
      <StatsCards stats={stats} />

      {/* Графики и ML форма */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '1.5rem' }}>
        <div className="space-y-6">
          {/* Графики */}
          <div className="charts-grid">
            <MethodChart data={stats.methods_distribution} />
            <RiskChart data={stats.criticality_distribution} />
          </div>

          {/* Топ рисков */}
          <div className="card">
            <h2 className="card-title flex items-center">
              <AlertTriangle style={{ marginRight: '0.5rem', color: '#ef4444' }} size={20} />
              Топ-5 объектов с высоким риском
            </h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Объект</th>
                    <th>Трубопровод</th>
                    <th>Уровень риска</th>
                    <th>Последний дефект</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_risks.map((risk, index) => (
                    <tr key={risk.object_id}>
                      <td>
                        <div className="font-semibold">{risk.object_name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>ID: {risk.object_id}</div>
                      </td>
                      <td>
                        <span className="badge badge-blue">MT-0{index + 1}</span>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${
                                risk.risk_score > 80 ? 'progress-fill-high' :
                                risk.risk_score > 60 ? 'progress-fill-medium' : 'progress-fill-low'
                              }`}
                              style={{ width: `${risk.risk_score}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 font-semibold">{risk.risk_score}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {risk.last_defect}
                      </td>
                      <td>
                        {risk.risk_score > 80 ? (
                          <span className="flex items-center" style={{ color: '#ef4444' }}>
                            <AlertTriangle size={16} style={{ marginRight: '0.25rem' }} />
                            Критический
                          </span>
                        ) : risk.risk_score > 60 ? (
                          <span className="flex items-center" style={{ color: '#f59e0b' }}>
                            <AlertTriangle size={16} style={{ marginRight: '0.25rem' }} />
                            Средний
                          </span>
                        ) : (
                          <span className="flex items-center" style={{ color: '#10b981' }}>
                            <CheckCircle size={16} style={{ marginRight: '0.25rem' }} />
                            Нормальный
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ML форма */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title flex items-center">
              <Brain style={{ marginRight: '0.5rem' }} size={20} />
              ML Классификация
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 500,
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>
                  Оценка качества
                </label>
                <select
                  value={mlForm.quality_grade}
                  onChange={(e) => setMlForm({...mlForm, quality_grade: e.target.value as any})}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="удовлетворительно">Удовлетворительно</option>
                  <option value="допустимо">Допустимо</option>
                  <option value="требует_мер">Требует мер</option>
                  <option value="недопустимо">Недопустимо</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 500,
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>
                  Параметр 1 (глубина, мм)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={mlForm.param1}
                  onChange={(e) => setMlForm({...mlForm, param1: parseFloat(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  placeholder="0.0"
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 500,
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>
                  Параметр 2 (длина, мм)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="500"
                  value={mlForm.param2}
                  onChange={(e) => setMlForm({...mlForm, param2: parseFloat(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  placeholder="0.0"
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 500,
                  marginBottom: '0.5rem',
                  color: '#111827'
                }}>
                  Параметр 3 (ширина, мм)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={mlForm.param3}
                  onChange={(e) => setMlForm({...mlForm, param3: parseFloat(e.target.value) || 0})}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  placeholder="0.0"
                />
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem',
                border: '1px solid #e5e7eb'
              }}>
                <input
                  type="checkbox"
                  id="defect-found"
                  checked={mlForm.defect_found}
                  onChange={(e) => setMlForm({...mlForm, defect_found: e.target.checked})}
                  style={{ 
                    width: '1rem',
                    height: '1rem',
                    cursor: 'pointer'
                  }}
                />
                <label 
                  htmlFor="defect-found"
                  style={{ 
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#111827',
                    cursor: 'pointer'
                  }}
                >
                  Дефект обнаружен
                </label>
              </div>

              <button
                onClick={handlePredict}
                disabled={predicting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: predicting ? '#9ca3af' : '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: predicting ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {predicting ? (
                  <>
                    <div style={{ 
                      width: '16px', 
                      height: '16px', 
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Анализ...
                  </>
                ) : (
                  <>
                    <Brain size={16} />
                    Классифицировать
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Результат предсказания */}
          {prediction && (
            <div className="card">
              <h3 className="card-title">Результат анализа</h3>
              <div style={{ 
                padding: '1.5rem',
                backgroundColor: prediction.label === 'high' ? '#fef2f2' : 
                               prediction.label === 'medium' ? '#fffbeb' : '#f0fdf4',
                border: '1px solid',
                borderColor: prediction.label === 'high' ? '#fee2e2' : 
                            prediction.label === 'medium' ? '#fef3c7' : '#d1fae5',
                borderRadius: '0.5rem',
                marginTop: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  {prediction.label === 'high' ? (
                    <AlertTriangle size={24} style={{ color: '#ef4444' }} />
                  ) : prediction.label === 'medium' ? (
                    <AlertTriangle size={24} style={{ color: '#f59e0b' }} />
                  ) : (
                    <CheckCircle size={24} style={{ color: '#10b981' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>
                      {prediction.label === 'high' ? 'Высокий риск' :
                       prediction.label === 'medium' ? 'Средний риск' : 'Нормальный'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Вероятность: {(prediction.probability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <div 
                    style={{ 
                      width: `${prediction.probability * 100}%`, 
                      height: '100%',
                      backgroundColor: prediction.label === 'high' ? '#ef4444' : 
                                     prediction.label === 'medium' ? '#f59e0b' : '#10b981',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {prediction.label === 'high' 
                    ? 'Требуется срочное вмешательство и внеплановый ремонт.'
                    : prediction.label === 'medium'
                    ? 'Рекомендуется плановый ремонт в ближайшее время.'
                    : 'Объект в нормальном состоянии. Плановое обследование по графику.'}
                </div>

                <div style={{ 
                  marginTop: '1rem',
                  padding: '0.75rem',
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Использованные параметры:</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>Оценка: {mlForm.quality_grade}</div>
                    <div>Параметр 1: {mlForm.param1}мм</div>
                    <div>Параметр 2: {mlForm.param2}мм</div>
                    <div>Параметр 3: {mlForm.param3}мм</div>
                    <div>Дефект: {mlForm.defect_found ? 'Да' : 'Нет'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}