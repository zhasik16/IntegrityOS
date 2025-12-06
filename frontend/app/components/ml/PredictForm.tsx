'use client';

import { useState } from 'react';
import { Brain, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { api } from '@/lib/api';

export default function PredictForm() {
  const [formData, setFormData] = useState({
    quality_grade: 'удовлетворительно' as 'удовлетворительно' | 'допустимо' | 'требует_мер' | 'недопустимо',
    param1: 0,
    param2: 0,
    param3: 0,
    defect_found: false,
  });
  
  const [prediction, setPrediction] = useState<{ label: string; probability: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await api.predictCriticality(formData);
      setPrediction(result);
    } catch (error) {
      console.error('Error predicting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="card-title flex items-center">
        <Brain style={{ marginRight: '0.5rem' }} size={20} />
        ML Классификация критичности
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
            Оценка качества
          </label>
          <select
            value={formData.quality_grade}
            onChange={(e) => setFormData({...formData, quality_grade: e.target.value as any})}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          >
            <option value="удовлетворительно">Удовлетворительно</option>
            <option value="допустимо">Допустимо</option>
            <option value="требует_мер">Требует мер</option>
            <option value="недопустимо">Недопустимо</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
            Параметр 1 (глубина/толщина, мм)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.param1}
            onChange={(e) => setFormData({...formData, param1: parseFloat(e.target.value)})}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
            Параметр 2 (длина, мм)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.param2}
            onChange={(e) => setFormData({...formData, param2: parseFloat(e.target.value)})}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '0.875sub'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={formData.defect_found}
              onChange={(e) => setFormData({...formData, defect_found: e.target.checked})}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Дефект обнаружен</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#9ca3af' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Анализ...' : 'Классифицировать'}
        </button>
      </form>

      {prediction && (
        <div style={{ 
          marginTop: '1.5rem',
          padding: '1.5rem',
          backgroundColor: prediction.label === 'high' ? '#fef2f2' : 
                         prediction.label === 'medium' ? '#fffbeb' : '#f0fdf4',
          border: '1px solid',
          borderColor: prediction.label === 'high' ? '#fee2e2' : 
                      prediction.label === 'medium' ? '#fef3c7' : '#d1fae5',
          borderRadius: '0.5rem'
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
            overflow: 'hidden'
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

          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
            {prediction.label === 'high' 
              ? 'Требуется срочное вмешательство и внеплановый ремонт.'
              : prediction.label === 'medium'
              ? 'Рекомендуется плановый ремонт в ближайшее время.'
              : 'Объект в нормальном состоянии. Плановое обследование по графику.'}
          </div>
        </div>
      )}
    </div>
  );
}