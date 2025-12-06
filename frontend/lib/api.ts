// frontend/lib/api.ts
import { 
  PipelineObject, 
  Diagnostic, 
  MapPoint, 
  DashboardStats,
  FilterOptions 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cuddly-space-funicular-g44jq6q57jr9h9jrx-8000.app.github.dev/api';

export const api = {
  // Получить все объекты
  getObjects: async (filters?: FilterOptions): Promise<PipelineObject[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.object_type) queryParams.append('object_type', filters.object_type);
      if (filters?.pipeline_id) queryParams.append('pipeline_id', filters.pipeline_id);
      if (filters?.skip) queryParams.append('skip', filters.skip.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      
      const response = await fetch(`${API_BASE_URL}/objects/?${queryParams}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching objects:', error);
      throw error;
    }
  },

  // Получить объект по ID
  getObject: async (id: number): Promise<PipelineObject | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/objects/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching object ${id}:`, error);
      throw error;
    }
  },

  // Получить диагностики объекта
  getObjectDiagnostics: async (objectId: number): Promise<Diagnostic[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/diagnostics/?object_id=${objectId}&limit=50`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error(`Error fetching diagnostics for object ${objectId}:`, error);
      throw error;
    }
  },

  // Получить данные для карты
  getMapData: async (filters?: {
    pipeline_id?: string;
    method?: string;
    criticality?: string;
  }): Promise<MapPoint[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.pipeline_id) queryParams.append('pipeline_id', filters.pipeline_id);
      if (filters?.method) queryParams.append('method', filters.method);
      if (filters?.criticality) queryParams.append('criticality', filters.criticality);
      
      const response = await fetch(`${API_BASE_URL}/map/data?${queryParams}`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data = await response.json();
      
      // Конвертируем GeoJSON features в MapPoint[]
      if (data.features && Array.isArray(data.features)) {
        return data.features.map((feature: any) => ({
          id: feature.properties.object_id,
          name: feature.properties.name,
          type: feature.properties.type,
          coordinates: {
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0]
          },
          pipeline_id: feature.properties.pipeline_id,
          criticality: feature.properties.latest_inspection?.criticality || 'normal',
          has_defect: feature.properties.latest_inspection?.defect_found || false
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching map data:', error);
      throw error;
    }
  },

  // Получить статистику для дашборда
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const apiData = await response.json();
      
      // Конвертируем API данные в формат DashboardStats
      return {
        total_objects: apiData.summary?.total_objects || 0,
        total_inspections: apiData.summary?.total_inspections || 0,
        total_defects: apiData.summary?.total_defects || 0,
        defect_rate: apiData.summary?.defect_rate || 0,
        methods_distribution: apiData.distributions?.methods || [],
        criticality_distribution: apiData.distributions?.criticality || [],
        monthly_data: apiData.time_series?.monthly_inspections || [],
        top_risks: apiData.top_risks || []
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Получить дополнительные статистики
  getDefectsByMethod: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/defects-by-method`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching defects by method:', error);
      throw error;
    }
  },

  getQualityStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/quality-stats`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching quality stats:', error);
      throw error;
    }
  },

  // Импорт CSV
  importCSV: async (file: File, type: 'objects' | 'diagnostics'): Promise<{success: boolean, count: number, message?: string}> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/upload/`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const result = await response.json();
      
      return {
        success: true,
        count: result.rows_processed || 0
      };
    } catch (error) {
      console.error('Error importing CSV:', error);
      throw error;
    }
  },

  // Получить отчет
  generateReport: async (type: 'html' | 'pdf'): Promise<Blob> => {
    try {
      // Пока простой отчет на основе данных API
      const [objects, stats] = await Promise.all([
        api.getObjects({ limit: 100 }),
        api.getDashboardStats()
      ]);
      
      const reportContent = `
        <h1>IntegrityOS Report</h1>
        <h2>Summary</h2>
        <p>Total Objects: ${stats.total_objects}</p>
        <p>Total Inspections: ${stats.total_inspections}</p>
        <p>Total Defects: ${stats.total_defects}</p>
        <p>Defect Rate: ${stats.defect_rate}%</p>
        <p>Generated at: ${new Date().toISOString()}</p>
      `;
      
      return new Blob([reportContent], { type: type === 'pdf' ? 'application/pdf' : 'text/html' });
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  // ML классификация
  predictCriticality: async (diagnosticData: Partial<Diagnostic>): Promise<{label: string, probability: number}> => {
    try {
      const response = await fetch(`${API_BASE_URL}/predict/single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          param1: diagnosticData.param1 || 0,
          param2: diagnosticData.param2 || 0,
          param3: diagnosticData.param3 || 0,
          temperature: diagnosticData.temperature || 20,
          humidity: diagnosticData.humidity || 60
        }),
      });
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const result = await response.json();
      
      return {
        label: result.prediction || 'normal',
        probability: result.probabilities?.[result.prediction] || 0.5
      };
    } catch (error) {
      console.error('Error predicting criticality:', error);
      // Fallback на rule-based если API не доступен
      if (diagnosticData.quality_grade === 'недопустимо') {
        return { label: 'high', probability: 0.9 };
      } else if (diagnosticData.quality_grade === 'требует_мер') {
        return { label: 'medium', probability: 0.7 };
      } else {
        return { label: 'normal', probability: 0.8 };
      }
    }
  },

  // Получить информацию о ML модели
  getModelInfo: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/predict/model-info`);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching model info:', error);
      throw error;
    }
  },

  // Обновить/обучить модель
  trainModel: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/predict/train`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error training model:', error);
      throw error;
    }
  }
};