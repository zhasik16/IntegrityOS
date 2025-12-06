// Убедимся, что все типы определены явно

// Типы из ТЗ
export type ObjectType = 'crane' | 'compressor' | 'pipeline_section';

export type MethodType = 
  | 'VIK' | 'PVK' | 'MPK' | 'UZK' | 'RGK' 
  | 'TVK' | 'VIBRO' | 'MFL' | 'TFI' | 'GEO' | 'UTWM';

export type QualityGrade = 
  | 'удовлетворительно' 
  | 'допустимо' 
  | 'требует_мер' 
  | 'недопустимо';

export type MLLabel = 'normal' | 'medium' | 'high';

// Объект контроля
export interface PipelineObject {
  object_id: number;
  object_name: string;
  object_type: ObjectType;
  pipeline_id: string;
  lat: number;
  lon: number;
  year: number;
  material: string;
}

// Результат диагностики
export interface Diagnostic {
  diag_id: number;
  object_id: number;
  method: MethodType;
  date: string;
  temperature?: number;
  humidity?: number;
  illumination?: number;
  defect_found: boolean;
  defect_description?: string;
  quality_grade?: QualityGrade;
  param1?: number;
  param2?: number;
  param3?: number;
  ml_label?: MLLabel;
}

// Для карты
export interface MapPoint {
  object_id: number;
  object_name: string;
  lat: number;
  lon: number;
  object_type: ObjectType;
  has_defects: boolean;
  criticality?: MLLabel;
  last_inspection?: string;
}

// Для дашборда
export interface DashboardStats {
  total_objects: number;
  total_diagnostics: number;
  defects_count: number;
  methods_distribution: Record<MethodType, number>;
  criticality_distribution: Record<MLLabel, number>;
  top_risks: Array<{
    object_id: number;
    object_name: string;
    risk_score: number;
    last_defect: string;
  }>;
  inspections_by_year: Record<string, number>;
}

// Для фильтров
export interface FilterOptions {
  dateRange?: [string, string];
  methods?: MethodType[];
  objectTypes?: ObjectType[];
  pipelineIds?: string[];
  hasDefects?: boolean;
  criticality?: MLLabel[];
}