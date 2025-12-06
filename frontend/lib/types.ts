// frontend/lib/types.ts
export interface PipelineObject {
  object_id: number;
  object_name: string;
  object_type: 'crane' | 'compressor' | 'pipeline_section';
  pipeline_id: string;
  lat: number;
  lon: number;
  year: number;
  material: string;
  diagnostics?: Diagnostic[];
}

export interface Diagnostic {
  diag_id: number;
  object_id: number;
  method: string;
  date: string;
  temperature: number;
  humidity: number;
  illumination: number;
  defect_found: boolean;
  defect_description: string;
  quality_grade: string;
  param1: number;
  param2: number;
  param3: number;
  ml_label: 'normal' | 'medium' | 'high';
}

export interface MapPoint {
  id: number;
  name: string;
  type: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  pipeline_id: string;
  criticality: 'normal' | 'medium' | 'high';
  has_defect: boolean;
}

export interface DashboardStats {
  total_objects: number;
  total_inspections: number;
  total_defects: number;
  defect_rate: number;
  methods_distribution: Array<{
    method: string;
    count: number;
  }>;
  criticality_distribution: Array<{
    label: string;
    count: number;
  }>;
  monthly_data: Array<{
    month: string;
    total_inspections: number;
    defects_found: number;
  }>;
  top_risks: Array<{
    object_id: number;
    object_name: string;
    risk_score: number;
    last_defect: string;
  }>;
}

export interface FilterOptions {
  object_type?: string;
  pipeline_id?: string;
  skip?: number;
  limit?: number;
}