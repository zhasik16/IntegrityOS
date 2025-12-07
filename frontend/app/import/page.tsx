'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'objects' | 'diagnostics'>('objects');
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImportStatus('uploading');
    
    // Имитация загрузки
    setTimeout(() => {
      setImportStatus('success');
      setImportResult({
        imported: 125,
        errors: [
          'Строка 45: Неверный формат даты',
          'Строка 78: Отсутствует обязательное поле object_id'
        ]
      });
    }, 2000);
  };

  const downloadTemplate = (type: 'objects' | 'diagnostics') => {
    const templateContent = type === 'objects' 
      ? 'object_id,object_name,object_type,pipeline_id,lat,lon,year,material\n1,Пример объекта,crane,MT-01,51.16,71.43,1985,Ст3'
      : 'diag_id,object_id,method,date,temperature,humidity,illumination,defect_found,defect_description,quality_grade,param1,param2,param3,ml_label\n1,1,VIK,2023-05-10,15.5,65.2,1200.0,true,Коррозия металла,требует_мер,2.5,10.2,0.0,high';
    
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${type}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold">Импорт данных</h1>
        <p className="text-secondary">Загрузка CSV файлов с данными объектов и диагностик</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Левая панель - загрузка */}
        <div className="card">
          <h3 className="card-title flex items-center">
            <Upload style={{ marginRight: '0.5rem' }} size={20} />
            Загрузка файла
          </h3>

          <div className="space-y-6">
            {/* Выбор типа файла */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 500,
                marginBottom: '0.5rem'
              }}>
                Тип данных
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={fileType === 'objects'}
                    onChange={() => setFileType('objects')}
                  />
                  <span>Объекты (Objects.csv)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    checked={fileType === 'diagnostics'}
                    onChange={() => setFileType('diagnostics')}
                  />
                  <span>Диагностики (Diagnostics.csv)</span>
                </label>
              </div>
            </div>

            {/* Загрузка файла */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 500,
                marginBottom: '0.5rem'
              }}>
                Выберите файл
              </label>
              <div
                style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '0.5rem',
                  padding: '2rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  backgroundColor: file ? '#f0f9ff' : '#f9fafb'
                }}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                
                {file ? (
                  <>
                    <FileText size={48} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{file.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {(file.size / 1024).toFixed(2)} KB
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      Перетащите файл или нажмите для выбора
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Поддерживаются CSV и XLSX файлы
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Кнопка импорта */}
            <button
              onClick={handleImport}
              disabled={!file || importStatus === 'uploading'}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: !file || importStatus === 'uploading' ? '#9ca3af' : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: !file || importStatus === 'uploading' ? 'not-allowed' : 'pointer'
              }}
            >
              {importStatus === 'uploading' ? 'Импорт...' : 'Начать импорт'}
            </button>

            {/* Шаблоны */}
            <div>
              <div style={{ 
                fontSize: '0.875rem', 
                fontWeight: 500,
                marginBottom: '0.5rem'
              }}>
                Шаблоны файлов
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => downloadTemplate('objects')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  <Download size={16} />
                  Objects.csv
                </button>
                <button
                  onClick={() => downloadTemplate('diagnostics')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  <Download size={16} />
                  Diagnostics.csv
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Правая панель - результат */}
        <div className="card">
          <h3 className="card-title">Результат импорта</h3>

          {importStatus === 'idle' && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#6b7280'
            }}>
              <FileText size={48} style={{ marginBottom: '1rem', color: '#9ca3af' }} />
              <div>Загрузите файл для начала импорта</div>
            </div>
          )}

          {importStatus === 'uploading' && (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                border: '3px solid #e5e7eb',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Импорт данных...</div>
              <div style={{ color: '#6b7280' }}>Пожалуйста, подождите</div>
            </div>
          )}

          {importStatus === 'success' && importResult && (
            <div className="space-y-6">
              <div style={{
                padding: '1.5rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #d1fae5',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <CheckCircle style={{ color: '#10b981' }} size={24} />
                  <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>Импорт успешно завершен</div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#065f46' }}>
                  Успешно импортировано {importResult.imported} записей
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <AlertCircle style={{ color: '#f59e0b' }} size={20} />
                    <div style={{ fontWeight: 600 }}>Обнаружены ошибки</div>
                  </div>
                  <div style={{ 
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {importResult.errors.map((error, index) => (
                      <div key={index} style={{ 
                        padding: '0.5rem',
                        borderBottom: index < importResult.errors.length - 1 ? '1px solid #fef3c7' : 'none',
                        fontSize: '0.875rem'
                      }}>
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Рекомендуемые действия:</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}>
                    Просмотреть импортированные данные
                  </button>
                  <button style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}>
                    Создать отчет
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Инструкция */}
      <div className="card">
        <h3 className="card-title">Требования к файлам</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#2563eb' }}>
              Objects.csv - Объекты контроля
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              <div style={{ marginBottom: '0.25rem' }}>• object_id: Уникальный идентификатор (число)</div>
              <div style={{ marginBottom: '0.25rem' }}>• object_name: Название оборудования</div>
              <div style={{ marginBottom: '0.25rem' }}>• object_type: crane / compressor / pipeline_section</div>
              <div style={{ marginBottom: '0.25rem' }}>• pipeline_id: MT-01 / MT-02 / MT-03</div>
              <div style={{ marginBottom: '0.25rem' }}>• lat, lon: Географические координаты</div>
              <div style={{ marginBottom: '0.25rem' }}>• year: Год ввода в эксплуатацию</div>
              <div>• material: Марка стали или материала</div>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#2563eb' }}>
              Diagnostics.csv - Результаты диагностик
            </div>
            <div style={{ fontSize: '0.875sub', color: '#6b7280' }}>
              <div style={{ marginBottom: '0.25rem' }}>• diag_id: Уникальный идентификатор</div>
              <div style={{ marginBottom: '0.25rem' }}>• object_id: Ссылка на объект</div>
              <div style={{ marginBottom: '0.25rem' }}>• method: Метод контроля (VIK, PVK, MFL, etc.)</div>
              <div style={{ marginBottom: '0.25rem' }}>• date: Дата обследования</div>
              <div style={{ marginBottom: '0.25rem' }}>• defect_found: Наличие дефекта (true/false)</div>
              <div style={{ marginBottom: '0.25rem' }}>• quality_grade: Оценка качества</div>
              <div>• param1-3: Технические параметры</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}