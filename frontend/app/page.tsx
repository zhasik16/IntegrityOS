'use client';

import { useEffect, useState } from 'react';
import { BarChart3, AlertTriangle, CheckCircle, Wrench, Brain, RefreshCw } from 'lucide-react';
import StatsCards from './components/dashboard/StatsCards';
import MethodChart from './components/dashboard/MethodChart';
import RiskChart from './components/dashboard/RiskChart';
import { api } from '@/lib/api';
import { DashboardStats } from '@/lib/types';

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mlForm, setMlForm] = useState({
    quality_grade: 'удовлетворительно' as 'удовлетворительно' | 'допустимо' | 'требует_мер' | 'недопустимо',
    param1: 0,
    param2: 0,
    param3: 0,
    defect_found: false,
  });
  const [prediction, setPrediction] = useState<{ label: string; probability: number } | null>(null);
  const [predicting, setPredicting] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    setStats(null);
    try {
      console.log('Загрузка данных дашборда...');
      const data = await api.getDashboardStats();
      console.log('Данные получены:', data);
      setStats(data);
    } catch (error: any) {
      console.error('Ошибка загрузки данных дашборда:', error);
      setError(`Ошибка загрузки данных: ${error.message || 'Неизвестная ошибка'}`);
      
      // Заглушка для демонстрации, если API недоступен
      const fallbackData: DashboardStats = {
        total_objects: 5,
        total_inspections: 15,
        total_defects: 6,
        defect_rate: 40,
        methods_distribution: [
          { method: 'VIK', count: 4 },
          { method: 'MFL', count: 3 },
          { method: 'UTWM', count: 2 },
          { method: 'VIBRO', count: 3 },
          { method: 'PVK', count: 3 }
        ],
        criticality_distribution: [
          { label: 'normal', count: 6 },
          { label: 'medium', count: 5 },
          { label: 'high', count: 4 }
        ],
        monthly_data: [
          { month: '2023-10', total_inspections: 8, defects_found: 3 },
          { month: '2023-11', total_inspections: 7, defects_found: 3 }
        ],
        top_risks: [
          { object_id: 1, object_name: 'Кран подвесной', risk_score: 85, last_defect: '2023-10-15' },
          { object_id: 3, object_name: 'Участок трубопровода №1', risk_score: 72, last_defect: '2023-09-20' },
          { object_id: 2, object_name: 'Турбокомпрессор ТВ-80-1', risk_score: 65, last_defect: '2023-08-05' },
          { object_id: 4, object_name: 'Компрессорная станция №1', risk_score: 45, last_defect: '2023-07-12' },
          { object_id: 5, object_name: 'Задвижка DN300', risk_score: 30, last_defect: '2023-06-18' }
        ]
      };
      setStats(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handlePredict = async () => {
    setPredicting(true);
    setError(null);
    try {
      console.log('Отправка данных для классификации:', mlForm);
      const result = await api.predictCriticality(mlForm);
      console.log('Результат классификации:', result);
      setPrediction(result);
    } catch (error: any) {
      console.error('Ошибка ML классификации:', error);
      setError(`Ошибка ML: ${error.message || 'Неизвестная ошибка'}`);
      
      // Fallback на локальную логику если API недоступен
      if (mlForm.quality_grade === 'недопустимо') {
        setPrediction({ label: 'high', probability: 0.9 });
      } else if (mlForm.quality_grade === 'требует_мер') {
        setPrediction({ label: 'medium', probability: 0.7 });
      } else {
        setPrediction({ label: 'normal', probability: 0.8 });
      }
    } finally {
      setPredicting(false);
    }
  };

  // Стили для прогресс-бара и других элементов
  const styles = {
    spinner: {
      animation: 'spin 1s linear infinite'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      padding: '1.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
    },
    cardTitle: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#111827',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }
  };

  // Добавляем стили для анимации спиннера
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 className="text-blue-500" size={24} />
          </div>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-700">Загрузка данных дашборда</h2>
        <p className="mt-2 text-gray-500">Подключение к серверу...</p>
        <div className="mt-4 text-sm text-gray-400">
          <p>API: {process.env.NEXT_PUBLIC_API_URL || 'Не настроен'}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-2 text-blue-500 hover:text-blue-600"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Заголовок с возможностью перезагрузки */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IntegrityOS Dashboard</h1>
          <p className="text-gray-600 mt-1">Обзор состояния магистральных трубопроводов</p>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <AlertTriangle className="text-yellow-500" size={16} />
              <span className="text-yellow-600">{error}</span>
              <button 
                onClick={loadDashboardData}
                className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <RefreshCw size={14} />
                Обновить
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2 text-blue-600">
          <BarChart3 size={24} />
          <span className="font-semibold">Real-time monitoring</span>
          <button 
            onClick={loadDashboardData}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full"
            title="Обновить данные"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Карточки статистики */}
      {stats && <StatsCards stats={stats} />}

      {/* Графики и ML форма */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Левая колонка с графиками */}
        <div className="lg:col-span-2 space-y-6">
          {/* Графики */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                <Wrench className="text-blue-500" size={20} />
                Распределение по методам
              </h2>
              {stats && <MethodChart data={stats.methods_distribution} />}
            </div>
            
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                <AlertTriangle className="text-orange-500" size={20} />
                Распределение по рискам
              </h2>
              {stats && <RiskChart data={stats.criticality_distribution} />}
            </div>
          </div>

          {/* Топ рисков */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <AlertTriangle className="text-red-500" size={20} />
              Топ-5 объектов с высоким риском
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Объект
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Трубопровод
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Уровень риска
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Последний дефект
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats?.top_risks.map((risk, index) => {
                    const riskColor = risk.risk_score > 80 ? 'red' : 
                                     risk.risk_score > 60 ? 'orange' : 'green';
                    const statusText = risk.risk_score > 80 ? 'Критический' : 
                                      risk.risk_score > 60 ? 'Средний' : 'Нормальный';
                    
                    return (
                      <tr key={risk.object_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{risk.object_name}</div>
                          <div className="text-sm text-gray-500">ID: {risk.object_id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            MT-0{index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mr-3">
                              <div 
                                className={`h-2.5 rounded-full ${
                                  riskColor === 'red' ? 'bg-red-500' : 
                                  riskColor === 'orange' ? 'bg-orange-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(risk.risk_score, 100)}%` }}
                              ></div>
                            </div>
                            <span className="font-semibold">{risk.risk_score}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {risk.last_defect}
                        </td>
                        <td className="px-4 py-3">
                          <div className={`flex items-center ${
                            riskColor === 'red' ? 'text-red-600' : 
                            riskColor === 'orange' ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {riskColor === 'red' ? (
                              <AlertTriangle className="mr-1" size={16} />
                            ) : riskColor === 'orange' ? (
                              <AlertTriangle className="mr-1" size={16} />
                            ) : (
                              <CheckCircle className="mr-1" size={16} />
                            )}
                            {statusText}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Правая колонка с ML формой */}
        <div className="space-y-6">
          {/* ML форма */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>
              <Brain className="text-purple-500" size={20} />
              ML Классификация рисков
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Оценка качества
                </label>
                <select
                  value={mlForm.quality_grade}
                  onChange={(e) => setMlForm({...mlForm, quality_grade: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="удовлетворительно">Удовлетворительно</option>
                  <option value="допустимо">Допустимо</option>
                  <option value="требует_мер">Требует мер</option>
                  <option value="недопустимо">Недопустимо</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Параметр 1 (глубина, мм)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={mlForm.param1}
                  onChange={(e) => setMlForm({...mlForm, param1: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Параметр 2 (длина, мм)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="500"
                  value={mlForm.param2}
                  onChange={(e) => setMlForm({...mlForm, param2: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Параметр 3 (ширина, мм)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={mlForm.param3}
                  onChange={(e) => setMlForm({...mlForm, param3: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.0"
                />
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  type="checkbox"
                  id="defect-found"
                  checked={mlForm.defect_found}
                  onChange={(e) => setMlForm({...mlForm, defect_found: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label 
                  htmlFor="defect-found"
                  className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Дефект обнаружен
                </label>
              </div>

              <button
                onClick={handlePredict}
                disabled={predicting}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
              >
                {predicting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Анализ...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2" size={18} />
                    Классифицировать риск
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Результат предсказания */}
          {prediction && (
            <div style={styles.card}>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Результат анализа</h3>
              <div className={`p-4 rounded-lg border ${
                prediction.label === 'high' ? 'bg-red-50 border-red-100' : 
                prediction.label === 'medium' ? 'bg-orange-50 border-orange-100' : 
                'bg-green-50 border-green-100'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {prediction.label === 'high' ? (
                    <AlertTriangle className="text-red-500" size={28} />
                  ) : prediction.label === 'medium' ? (
                    <AlertTriangle className="text-orange-500" size={28} />
                  ) : (
                    <CheckCircle className="text-green-500" size={28} />
                  )}
                  <div>
                    <div className="font-bold text-lg">
                      {prediction.label === 'high' ? 'ВЫСОКИЙ РИСК' :
                       prediction.label === 'medium' ? 'СРЕДНИЙ РИСК' : 'НОРМАЛЬНЫЙ'}
                    </div>
                    <div className="text-sm text-gray-600">
                      Вероятность: {(prediction.probability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
                  <div 
                    className={`h-full ${
                      prediction.label === 'high' ? 'bg-red-500' : 
                      prediction.label === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${prediction.probability * 100}%` }}
                  />
                </div>

                <p className="text-sm text-gray-700 mb-4">
                  {prediction.label === 'high' 
                    ? '⚠️ Требуется срочное вмешательство и внеплановый ремонт. Необходимо остановить эксплуатацию объекта.'
                    : prediction.label === 'medium'
                    ? '⚠️ Рекомендуется плановый ремонт в ближайшее время. Требуется усиленный контроль.'
                    : '✅ Объект в нормальном состоянии. Плановое обследование по графику.'}
                </p>

                <div className="text-xs text-gray-500 bg-white/50 p-3 rounded">
                  <div className="font-medium mb-1">Использованные параметры:</div>
                  <div className="grid grid-cols-2 gap-1">
                    <div>Оценка: {mlForm.quality_grade}</div>
                    <div>Параметр 1: {mlForm.param1}мм</div>
                    <div>Параметр 2: {mlForm.param2}мм</div>
                    <div>Параметр 3: {mlForm.param3}мм</div>
                    <div>Дефект: {mlForm.defect_found ? 'Да' : 'Нет'}</div>
                    <div>Время: {new Date().toLocaleTimeString()}</div>
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