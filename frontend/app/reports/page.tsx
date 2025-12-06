'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, Filter, Printer, Eye, BarChart3, AlertTriangle } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'summary' | 'defects' | 'critical' | 'custom'>('summary');
  const [dateRange, setDateRange] = useState({ start: '2023-01-01', end: '2024-01-15' });
  const [format, setFormat] = useState<'html' | 'pdf'>('html');
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  const reportTemplates = [
    {
      id: 'summary',
      title: 'Сводный отчет',
      description: 'Общая статистика по всем обследованиям',
      icon: <BarChart3 size={20} />,
      color: '#3b82f6'
    },
    {
      id: 'defects',
      title: 'Отчет по дефектам',
      description: 'Детальный анализ обнаруженных дефектов',
      icon: <AlertTriangle size={20} />,
      color: '#ef4444'
    },
    {
      id: 'critical',
      title: 'Критические объекты',
      description: 'Список объектов с высоким уровнем риска',
      icon: <AlertTriangle size={20} />,
      color: '#f59e0b'
    },
    {
      id: 'custom',
      title: 'Пользовательский отчет',
      description: 'Настройте параметры отчета самостоятельно',
      icon: <Filter size={20} />,
      color: '#8b5cf6'
    }
  ];

  const generateReport = async () => {
    setGenerating(true);
    
    // Имитация генерации отчета
    setTimeout(() => {
      const mockReport = `
        <div style="padding: 2rem; font-family: Arial, sans-serif;">
          <h1 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 0.5rem;">
            Отчет IntegrityOS
          </h1>
          
          <div style="margin: 2rem 0; padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
            <div style="color: #64748b; font-size: 0.9rem;">Период: ${dateRange.start} - ${dateRange.end}</div>
            <div style="color: #64748b; font-size: 0.9rem;">Тип отчета: ${reportTemplates.find(r => r.id === reportType)?.title}</div>
            <div style="color: #64748b; font-size: 0.9rem;">Сгенерирован: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <h2 style="color: #334155;">Статистика</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0;">
            <div style="padding: 1rem; background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="font-size: 0.9rem; color: #64748b;">Всего объектов</div>
              <div style="font-size: 2rem; font-weight: bold; color: #3b82f6;">142</div>
            </div>
            <div style="padding: 1rem; background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="font-size: 0.9rem; color: #64748b;">Обследований</div>
              <div style="font-size: 2rem; font-weight: bold; color: #10b981;">856</div>
            </div>
            <div style="padding: 1rem; background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="font-size: 0.9rem; color: #64748b;">Дефектов</div>
              <div style="font-size: 2rem; font-weight: bold; color: #ef4444;">45</div>
            </div>
          </div>
          
          <h2 style="color: #334155; margin-top: 2rem;">Топ-5 критических объектов</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 0.75rem; text-align: left; border: 1px solid #cbd5e1;">Объект</th>
                <th style="padding: 0.75rem; text-align: left; border: 1px solid #cbd5e1;">Трубопровод</th>
                <th style="padding: 0.75rem; text-align: left; border: 1px solid #cbd5e1;">Уровень риска</th>
                <th style="padding: 0.75rem; text-align: left; border: 1px solid #cbd5e1;">Последний дефект</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 0.75rem; border: 1px solid #cbd5e1;">Турбокомпрессор ТВ-80-1</td>
                <td style="padding: 0.75rem; border: 1px solid #cbd5e1;">MT-02</td>
                <td style="padding: 0.75rem; border: 1px solid #cbd5e1; color: #ef4444; font-weight: bold;">95%</td>
                <td style="padding: 0.75rem; border: 1px solid #cbd5e1;">2023-07-20</td>
              </tr>
              <tr>
                <td style="padding: 0.75rem; border: 1px solid #cbd5e1;">Кран подвесной</td>
                <td style="padding: 0.75rem; border: 1px solid #cbd5e1;">MT-02</td>
                <td style="padding: 0.75rem; border: 1px solid #cbd5e1; color: #ef4444; font-weight: bold;">85%</td>
                <td style="padding: 0.75rem; border: 1px solid #cbd5e1;">2023-05-10</td>
              </tr>
              <tr>
                <td style="padding: 0.75rem; border: 1px solid #cbd5e1;">Участок трубопровода №1</td>
                <td style="padding: 0.75rem; border: 1px solid #cbd5e1;">MT-01</td>
                <td style="padding: 0.75rem; border: 1px solid #cbd5e1; color: #f59e0b; font-weight: bold;">65%</td>
                <td style="padding: 0.75rem; border: 1px solid #cbd5e1;">2023-08-05</td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #cbd5e1; color: #64748b; font-size: 0.9rem;">
            Отчет сгенерирован системой IntegrityOS. Все данные являются синтетическими и используются для демонстрации.
          </div>
        </div>
      `;
      setGeneratedReport(mockReport);
      setGenerating(false);
    }, 2000);
  };

  const downloadReport = () => {
    if (!generatedReport) return;
    
    if (format === 'html') {
      const blob = new Blob([generatedReport], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportType}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Для PDF нужно было бы использовать библиотеку, но для хакатона просто сообщение
      alert('PDF генерация требует дополнительных библиотек. В MVP используется HTML экспорт.');
    }
  };

  const recentReports = [
    { id: 1, name: 'Сводный отчет за 2023 год', date: '2024-01-10', type: 'summary', size: '2.4 MB' },
    { id: 2, name: 'Дефекты трубопровода MT-02', date: '2024-01-05', type: 'defects', size: '1.8 MB' },
    { id: 3, name: 'Критические объекты Q4 2023', date: '2023-12-28', type: 'critical', size: '3.1 MB' },
    { id: 4, name: 'Пользовательский отчет', date: '2023-12-15', type: 'custom', size: '4.2 MB' },
  ];

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold">Отчеты</h1>
        <p className="text-secondary">Генерация и управление отчетами в формате HTML/PDF</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Левая часть - генерация отчетов */}
        <div className="space-y-6">
          {/* Выбор шаблона */}
          <div className="card">
            <h3 className="card-title flex items-center">
              <FileText style={{ marginRight: '0.5rem' }} size={20} />
              Выбор типа отчета
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {reportTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setReportType(template.id as any)}
                  style={{
                    padding: '1.5rem',
                    border: `2px solid ${reportType === template.id ? template.color : '#e5e7eb'}`,
                    borderRadius: '0.5rem',
                    backgroundColor: reportType === template.id ? `${template.color}10` : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ color: template.color }}>
                      {template.icon}
                    </div>
                    <div style={{ fontWeight: 600, color: '#111827' }}>
                      {template.title}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {template.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Настройки отчета */}
          <div className="card">
            <h3 className="card-title flex items-center">
              <Filter style={{ marginRight: '0.5rem' }} size={20} />
              Настройки отчета
            </h3>

            <div className="space-y-4">
              {/* Дата */}
              <div>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.875rem', 
                  fontWeight: 500,
                  marginBottom: '0.5rem'
                }}>
                  <Calendar size={16} />
                  Период отчета
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                  <span style={{ display: 'flex', alignItems: 'center' }}>—</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              {/* Формат */}
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: 500,
                  marginBottom: '0.5rem'
                }}>
                  Формат экспорта
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={format === 'html'}
                      onChange={() => setFormat('html')}
                    />
                    <span>HTML (веб-страница)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      checked={format === 'pdf'}
                      onChange={() => setFormat('pdf')}
                    />
                    <span>PDF (документ)</span>
                  </label>
                </div>
              </div>

              {/* Дополнительные опции */}
              {reportType === 'custom' && (
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: 500,
                    marginBottom: '0.5rem'
                  }}>
                    Дополнительные параметры
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" defaultChecked />
                      <span style={{ fontSize: '0.875rem' }}>Включать статистику по методам</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" defaultChecked />
                      <span style={{ fontSize: '0.875rem' }}>Включать карту объектов</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input type="checkbox" />
                      <span style={{ fontSize: '0.875rem' }}>Включать рекомендации по ремонту</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Генерация */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="card-title">Генерация отчета</h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Нажмите кнопку для создания отчета
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={generateReport}
                  disabled={generating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: generating ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: generating ? 'not-allowed' : 'pointer'
                  }}
                >
                  {generating ? (
                    <>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Генерация...
                    </>
                  ) : (
                    <>
                      <FileText size={16} />
                      Сгенерировать отчет
                    </>
                  )}
                </button>
                
                {generatedReport && (
                  <button
                    onClick={downloadReport}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={16} />
                    Скачать {format.toUpperCase()}
                  </button>
                )}
              </div>
            </div>

            {/* Предпросмотр */}
            {generatedReport && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  <Eye size={20} />
                  <div style={{ fontWeight: 600 }}>Предпросмотр отчета</div>
                </div>
                <div
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    backgroundColor: '#f9fafb',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}
                  dangerouslySetInnerHTML={{ __html: generatedReport }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Правая часть - история отчетов */}
        <div className="space-y-6">
          {/* История отчетов */}
          <div className="card">
            <h3 className="card-title">Недавние отчеты</h3>
            
            <div className="space-y-4">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    backgroundColor: '#f9fafb'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{report.name}</div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        <span>{report.date}</span>
                        <span>•</span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        title="Скачать"
                        style={{
                          padding: '0.375rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          background: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Download size={14} />
                      </button>
                      <button
                        title="Распечатать"
                        style={{
                          padding: '0.375rem',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.375rem',
                          background: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Printer size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.125rem 0.5rem',
                      backgroundColor: report.type === 'summary' ? '#dbeafe' : 
                                     report.type === 'defects' ? '#fee2e2' :
                                     report.type === 'critical' ? '#fef3c7' : '#f3e8ff',
                      color: report.type === 'summary' ? '#1e40af' : 
                            report.type === 'defects' ? '#991b1b' :
                            report.type === 'critical' ? '#92400e' : '#5b21b6',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}>
                      {report.type === 'summary' ? 'Сводный' :
                       report.type === 'defects' ? 'Дефекты' :
                       report.type === 'critical' ? 'Критический' : 'Пользовательский'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Быстрые действия */}
          <div className="card">
            <h3 className="card-title">Быстрые действия</h3>
            
            <div className="space-y-3">
              <button style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#dbeafe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1e40af'
                }}>
                  <BarChart3 size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Еженедельный отчет</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Автоматическая генерация</div>
                </div>
              </button>

              <button style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444'
                }}>
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Критические дефекты</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Отчет для руководства</div>
                </div>
              </button>

              <button style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                background: 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#f59e0b'
                }}>
                  <Calendar size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Плановые проверки</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>График на месяц</div>
                </div>
              </button>
            </div>
          </div>

          {/* Статистика отчетов */}
          <div className="card">
            <h3 className="card-title">Статистика</h3>
            
            <div className="space-y-4">
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Всего отчетов
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>24</div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>HTML</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>18</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>PDF</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>6</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}