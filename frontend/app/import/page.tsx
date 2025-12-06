'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, XCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'objects' | 'diagnostics'>('objects');
  const [importStatus, setImportStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported: number;
    errors: string[];
    filename?: string;
    message?: string;
  } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Проверяем расширение файла
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (ext !== 'csv' && ext !== 'xlsx') {
        alert('Пожалуйста, выберите CSV или XLSX файл');
        return;
      }
      setFile(selectedFile);
      setImportStatus('idle');
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImportStatus('uploading');
    setImportResult(null);
    
    try {
      console.log('Начинаем импорт файла:', file.name, 'тип:', fileType);
      
      // Используем реальный API
      const result = await api.importCSV(file, fileType);
      console.log('Результат импорта:', result);
      
      setImportResult({
        success: true,
        imported: result.count || 0,
        errors: [],
        filename: file.name,
        message: result.message || 'Файл успешно импортирован'
      });
      setImportStatus('success');
      
    } catch (error: any) {
      console.error('Ошибка импорта:', error);
      
      setImportResult({
        success: false,
        imported: 0,
        errors: [error.message || 'Неизвестная ошибка при импорте'],
        filename: file.name,
        message: 'Ошибка при импорте файла'
      });
      setImportStatus('error');
    }
  };

  const downloadTemplate = (type: 'objects' | 'diagnostics') => {
    const templateContent = type === 'objects' 
      ? `object_id,object_name,object_type,pipeline_id,lat,lon,year,material
1,"Кран подвесной",crane,MT-02,52.96,63.12,1961,"Ст3"
2,"Турбокомпрессор ТВ-80-1",compressor,MT-02,49.80,73.10,1999,"09Г2С"
3,"Участок трубопровода №1",pipeline_section,MT-01,51.16,71.43,1985,"X70"
4,"Компрессорная станция №1",compressor,MT-03,50.45,69.15,2005,"09Г2С"
5,"Задвижка DN300",crane,MT-01,51.80,71.90,1990,"Ст20"`
      : `diag_id,object_id,method,date,temperature,humidity,illumination,defect_found,defect_description,quality_grade,param1,param2,param3,ml_label
1,1,VIK,2023-05-10,15.5,65.2,1200.0,true,"Коррозия металла",требует_мер,2.5,10.2,0.0,high
2,2,MFL,2023-07-20,20.1,55.3,1800.0,true,"Трещина на корпусе",недопустимо,8.5,15.3,2.1,high
3,3,UTWM,2023-08-05,22.5,60.8,2000.0,true,"Утоньшение стенки",допустимо,1.2,5.6,0.3,medium
4,4,PVK,2023-09-12,19.0,62.0,1100.0,false,"",удовлетворительно,0.0,0.0,0.0,normal
5,5,RGK,2022-05-15,16.0,68.0,900.0,false,"",удовлетворительно,0.0,0.0,0.0,normal
6,1,VIBRO,2022-06-20,18.5,70.0,1500.0,true,"Вибрация выше нормы",требует_мер,5.2,8.7,1.3,medium`;
    
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `integrity_${type}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFile = () => {
    setFile(null);
    setImportStatus('idle');
    setImportResult(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Импорт данных</h1>
        <p className="text-gray-600 mt-1">Загрузка CSV файлов с данными объектов и диагностик</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Левая панель - загрузка */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="mr-2 text-blue-500" size={20} />
            Загрузка файла
          </h3>

          <div className="space-y-6">
            {/* Выбор типа файла */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип данных
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="fileType"
                    checked={fileType === 'objects'}
                    onChange={() => setFileType('objects')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Объекты (Objects.csv)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="fileType"
                    checked={fileType === 'diagnostics'}
                    onChange={() => setFileType('diagnostics')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Диагностики (Diagnostics.csv)</span>
                </label>
              </div>
            </div>

            {/* Загрузка файла */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Выберите файл
              </label>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors duration-200
                  ${file 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                  }
                `}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                {file ? (
                  <div className="space-y-3">
                    <FileText className="mx-auto text-blue-500" size={48} />
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900 truncate">{file.name}</div>
                      <div className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB • {file.name.split('.').pop()?.toUpperCase()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <XCircle size={16} />
                      Удалить файл
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="mx-auto text-gray-400" size={48} />
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-700">
                        Перетащите файл или нажмите для выбора
                      </div>
                      <div className="text-sm text-gray-500">
                        Поддерживаются CSV и XLSX файлы
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Кнопка импорта */}
            <button
              onClick={handleImport}
              disabled={!file || importStatus === 'uploading'}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold
                transition-colors duration-200
                ${!file || importStatus === 'uploading'
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              {importStatus === 'uploading' ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Идет импорт...
                </div>
              ) : (
                'Начать импорт'
              )}
            </button>

            {/* Шаблоны */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Шаблоны файлов
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadTemplate('objects')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={16} className="text-gray-600" />
                  <span className="text-sm font-medium">Objects.csv</span>
                </button>
                <button
                  onClick={() => downloadTemplate('diagnostics')}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download size={16} className="text-gray-600" />
                  <span className="text-sm font-medium">Diagnostics.csv</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Правая панель - результат */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Результат импорта</h3>

          {importStatus === 'idle' && !importResult && (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500">Загрузите файл для начала импорта</p>
              <p className="text-sm text-gray-400 mt-2">Данные будут загружены в систему IntegrityOS</p>
            </div>
          )}

          {importStatus === 'uploading' && (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <div className="font-semibold text-gray-700 mb-2">Импорт данных...</div>
              <div className="text-gray-500">Пожалуйста, подождите</div>
              <div className="text-sm text-gray-400 mt-2">Файл: {file?.name}</div>
            </div>
          )}

          {(importStatus === 'success' || importStatus === 'error') && importResult && (
            <div className="space-y-6">
              {/* Статус импорта */}
              <div className={`
                p-4 rounded-lg border
                ${importResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
                }
              `}>
                <div className="flex items-start gap-3">
                  {importResult.success ? (
                    <CheckCircle className="text-green-500 mt-0.5" size={24} />
                  ) : (
                    <AlertCircle className="text-red-500 mt-0.5" size={24} />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {importResult.success ? 'Импорт успешно завершен' : 'Ошибка импорта'}
                    </div>
                    <div className={`text-sm mt-1 ${importResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {importResult.message}
                    </div>
                    {importResult.filename && (
                      <div className="text-sm text-gray-600 mt-1">
                        Файл: <span className="font-medium">{importResult.filename}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Статистика */}
              {importResult.success && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{importResult.imported}</div>
                    <div className="text-sm text-blue-700 font-medium">записей импортировано</div>
                  </div>
                </div>
              )}

              {/* Ошибки */}
              {importResult.errors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="text-orange-500" size={20} />
                    <div className="font-semibold text-gray-900">Обнаружены ошибки</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto">
                      {importResult.errors.map((error, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 border-b border-orange-100 last:border-b-0 text-sm"
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Действия после импорта */}
              <div>
                <div className="font-semibold text-gray-900 mb-3">Дальнейшие действия:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => window.location.href = '/objects'}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium text-sm transition-colors"
                  >
                    Просмотреть объекты
                  </button>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-medium text-sm transition-colors"
                  >
                    Обновить дашборд
                  </button>
                  {importResult.success && (
                    <button
                      onClick={clearFile}
                      className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg font-medium text-sm transition-colors"
                    >
                      Импортировать еще
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Инструкция */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Требования к файлам</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
              <FileText size={18} />
              Objects.csv - Объекты контроля
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">object_id:</span> Уникальный идентификатор (число)</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">object_name:</span> Название оборудования</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">object_type:</span> crane / compressor / pipeline_section</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">pipeline_id:</span> MT-01 / MT-02 / MT-03</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">lat, lon:</span> Географические координаты</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">year:</span> Год ввода в эксплуатацию</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">material:</span> Марка стали или материала</div>
              </div>
            </div>
          </div>
          <div>
            <div className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
              <FileText size={18} />
              Diagnostics.csv - Результаты диагностик
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">diag_id:</span> Уникальный идентификатор</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">object_id:</span> Ссылка на объект</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">method:</span> VIK, PVK, MFL, UTWM, etc.</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">date:</span> Дата в формате ГГГГ-ММ-ДД</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">defect_found:</span> true или false</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">quality_grade:</span> удовлетворительно/допустимо/требует_мер/недопустимо</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-blue-500">•</div>
                <div><span className="font-medium">param1-3:</span> Технические параметры (числа)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}