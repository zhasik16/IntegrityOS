import { PipelineObject, Diagnostic, MapPoint, DashboardStats } from './types';

// Mock данные объектов (из ТЗ)
export const mockObjects: PipelineObject[] = [
  {
    object_id: 1,
    object_name: "Кран подвесной",
    object_type: "crane",
    pipeline_id: "MT-02",
    lat: 52.96,
    lon: 63.12,
    year: 1961,
    material: "Ст3"
  },
  {
    object_id: 2,
    object_name: "Турбокомпрессор ТВ-80-1",
    object_type: "compressor",
    pipeline_id: "MT-02",
    lat: 49.80,
    lon: 73.10,
    year: 1999,
    material: "09Г2С"
  },
  {
    object_id: 3,
    object_name: "Участок трубопровода №1",
    object_type: "pipeline_section",
    pipeline_id: "MT-01",
    lat: 51.16,
    lon: 71.43,
    year: 1985,
    material: "X70"
  },
  {
    object_id: 4,
    object_name: "Насосная станция",
    object_type: "compressor",
    pipeline_id: "MT-03",
    lat: 43.25,
    lon: 76.95,
    year: 2005,
    material: "09Г2С"
  },
  {
    object_id: 5,
    object_name: "Кран шаровый",
    object_type: "crane",
    pipeline_id: "MT-01",
    lat: 50.42,
    lon: 80.62,
    year: 1978,
    material: "Ст3"
  }
];

// Mock данные диагностик
export const mockDiagnostics: Diagnostic[] = [
  {
    diag_id: 1,
    object_id: 1,
    method: "VIK",
    date: "2023-05-10",
    temperature: 15.5,
    humidity: 65.2,
    illumination: 1200.0,
    defect_found: true,
    defect_description: "Коррозия металла",
    quality_grade: "требует_мер",
    param1: 2.5,
    param2: 10.2,
    param3: 0.0,
    ml_label: "high"
  },
  {
    diag_id: 2,
    object_id: 1,
    method: "PVK",
    date: "2023-06-15",
    temperature: 18.2,
    humidity: 70.1,
    illumination: 1500.0,
    defect_found: false,
    quality_grade: "удовлетворительно",
    ml_label: "normal"
  },
  {
    diag_id: 3,
    object_id: 2,
    method: "MFL",
    date: "2023-07-20",
    temperature: 20.1,
    humidity: 55.3,
    illumination: 1800.0,
    defect_found: true,
    defect_description: "Трещина на корпусе",
    quality_grade: "недопустимо",
    param1: 8.5,
    param2: 15.3,
    param3: 2.1,
    ml_label: "high"
  },
  {
    diag_id: 4,
    object_id: 3,
    method: "UTWM",
    date: "2023-08-05",
    temperature: 22.5,
    humidity: 60.8,
    illumination: 2000.0,
    defect_found: true,
    defect_description: "Утоньшение стенки",
    quality_grade: "допустимо",
    param1: 1.2,
    param2: 5.6,
    param3: 0.3,
    ml_label: "medium"
  },
  {
    diag_id: 5,
    object_id: 4,
    method: "VIBRO",
    date: "2023-09-12",
    temperature: 19.8,
    humidity: 58.9,
    illumination: 1700.0,
    defect_found: false,
    quality_grade: "удовлетворительно",
    ml_label: "normal"
  }
];

// Mock данные для карты
export const mockMapPoints: MapPoint[] = mockObjects.map(obj => {
  const objDiagnostics = mockDiagnostics.filter(d => d.object_id === obj.object_id);
  const hasDefects = objDiagnostics.some(d => d.defect_found);
  const lastDiagnostic = objDiagnostics.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
  
  return {
    object_id: obj.object_id,
    object_name: obj.object_name,
    lat: obj.lat,
    lon: obj.lon,
    object_type: obj.object_type,
    has_defects: hasDefects,
    criticality: lastDiagnostic?.ml_label,
    last_inspection: lastDiagnostic?.date
  };
});

// Mock данные для дашборда
export const mockDashboardStats: DashboardStats = {
  total_objects: mockObjects.length,
  total_diagnostics: mockDiagnostics.length,
  defects_count: mockDiagnostics.filter(d => d.defect_found).length,
  methods_distribution: {
    VIK: 1, PVK: 1, MPK: 0, UZK: 0, RGK: 0,
    TVK: 0, VIBRO: 1, MFL: 1, TFI: 0, GEO: 0, UTWM: 1
  },
  criticality_distribution: {
    normal: 2,
    medium: 1,
    high: 2
  },
  top_risks: [
    { object_id: 2, object_name: "Турбокомпрессор ТВ-80-1", risk_score: 95, last_defect: "2023-07-20" },
    { object_id: 1, object_name: "Кран подвесной", risk_score: 85, last_defect: "2023-05-10" },
    { object_id: 3, object_name: "Участок трубопровода №1", risk_score: 65, last_defect: "2023-08-05" }
  ],
  inspections_by_year: {
    "2023": 5,
    "2022": 12,
    "2021": 8,
    "2020": 15
  }
};