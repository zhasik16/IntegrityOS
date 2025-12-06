import { 
  PipelineObject, 
  Diagnostic, 
  MapPoint, 
  DashboardStats,
  FilterOptions 
} from './types';
import { 
  mockObjects, 
  mockDiagnostics, 
  mockMapPoints, 
  mockDashboardStats 
} from './mockData';

// Пока используем mock данные, потом заменим на реальные API вызовы
export const api = {
  // Получить все объекты
  getObjects: async (filters?: FilterOptions): Promise<PipelineObject[]> => {
    // Здесь будет фильтрация
    return mockObjects;
  },

  // Получить объект по ID
  getObject: async (id: number): Promise<PipelineObject | null> => {
    return mockObjects.find(obj => obj.object_id === id) || null;
  },

  // Получить диагностики объекта
  getObjectDiagnostics: async (objectId: number): Promise<Diagnostic[]> => {
    return mockDiagnostics.filter(d => d.object_id === objectId);
  },

  // Получить данные для карты
  getMapData: async (): Promise<MapPoint[]> => {
    return mockMapPoints;
  },

  // Получить статистику для дашборда
  getDashboardStats: async (): Promise<DashboardStats> => {
    return mockDashboardStats;
  },

  // Импорт CSV
  importCSV: async (file: File, type: 'objects' | 'diagnostics'): Promise<{success: boolean, count: number}> => {
    console.log(`Importing ${type} file:`, file.name);
    // Здесь будет реальная загрузка
    return { success: true, count: 10 };
  },

  // Получить отчет
  generateReport: async (type: 'html' | 'pdf'): Promise<Blob> => {
    const content = `<h1>IntegrityOS Report</h1><p>Generated at ${new Date().toISOString()}</p>`;
    return new Blob([content], { type: type === 'pdf' ? 'application/pdf' : 'text/html' });
  },

  // ML классификация
  predictCriticality: async (diagnosticData: Partial<Diagnostic>): Promise<{label: string, probability: number}> => {
    // Простая rule-based логика
    if (diagnosticData.quality_grade === 'недопустимо') {
      return { label: 'high', probability: 0.9 };
    } else if (diagnosticData.quality_grade === 'требует_мер') {
      return { label: 'medium', probability: 0.7 };
    } else {
      return { label: 'normal', probability: 0.8 };
    }
  }
};