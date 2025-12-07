// frontend/lib/types.ts

// Основные типы объектов
export type ObjectType = 
  | 'crane'           // Кран
  | 'compressor'      // Компрессор
  | 'pipeline_section' // Участок трубопровода
  | 'valve'           // Задвижка
  | 'pump'           // Насос
  | 'tank'           // Резервуар
  | 'flange'         // Фланец
  | 'sensor'         // Датчик
  | 'measurement_point' // Измерительная точка
  | 'welding_point'  // Сварной шов
  | 'bend'           // Отвод/колено
  | 'reducer'        // Переходник
  | 'support'        // Опора
  | 'inspection_hatch' // Люк для обследования
  | 'drain_point'    // Дренажная точка
  | 'vent_point';    // Вентиляционная точка

export type CriticalityLevel = 
  | 'normal'         // Нормальный
  | 'low'            // Низкий
  | 'medium'         // Средний
  | 'high'           // Высокий
  | 'critical';      // Критический

export type InspectionMethod = 
  | 'ultrasonic'     // Ультразвуковой контроль
  | 'radiographic'   // Радиографический контроль
  | 'visual'         // Визуальный контроль
  | 'acoustic_emission' // Акустическая эмиссия
  | 'thermographic'  // Тепловизионный контроль
  | 'vibration'      // Вибродиагностика
  | 'magnetic'       // Магнитопорошковый контроль
  | 'penetrant'      // Капиллярный контроль
  | 'eddy_current'   // Вихретоковый контроль
  | 'laser_scanning' // Лазерное сканирование
  | 'pressure_test'; // Испытание давлением

export type MaterialType =
  | 'steel'          // Сталь
  | 'carbon_steel'   // Углеродистая сталь
  | 'stainless_steel' // Нержавеющая сталь
  | 'alloy_steel'    // Легированная сталь
  | 'cast_iron'      // Чугун
  | 'copper'         // Медь
  | 'aluminum'       // Алюминий
  | 'pvc'           // ПВХ
  | 'pe'            // Полиэтилен
  | 'fiberglass'    // Стеклопластик
  | 'composite';     // Композит

export type DefectType =
  | 'corrosion'      // Коррозия
  | 'crack'          // Трещина
  | 'dent'           // Вмятина
  | 'scratch'        // Царапина
  | 'wear'           // Износ
  | 'erosion'        // Эрозия
  | 'deformation'    // Деформация
  | 'leak'           // Утечка
  | 'loosening'      // Ослабление крепления
  | 'misalignment'   // Перекос
  | 'vibration_excess' // Повышенная вибрация
  | 'temperature_excess' // Повышенная температура
  | 'pressure_drop'  // Падение давления
  | 'coating_damage' // Повреждение покрытия
  | 'weld_defect';   // Дефект сварки

// Основные интерфейсы
export interface PipelineObject {
  object_id: number;
  object_name: string;
  object_type: ObjectType;
  pipeline_id: string;
  lat: number;
  lon: number;
  elevation?: number;          // Высота над уровнем моря (м)
  year: number;
  material: MaterialType;
  diameter?: number;          // Диаметр (мм)
  wall_thickness?: number;    // Толщина стенки (мм)
  pressure_rating?: number;   // Рабочее давление (МПа)
  temperature_rating?: number; // Рабочая температура (°C)
  manufacturer?: string;      // Производитель
  serial_number?: string;     // Серийный номер
  installation_date?: string; // Дата установки
  last_maintenance?: string;  // Последнее ТО
  next_inspection?: string;   // Следующая проверка
  status: 'operational' | 'maintenance' | 'repaired' | 'out_of_service';
  criticality: CriticalityLevel;
  has_defect: boolean;
  last_inspection?: string;
  metadata?: Record<string, any>; // Дополнительные метаданные
}

export interface Diagnostic {
  diag_id: number;
  object_id: number;
  method: InspectionMethod;
  date: string;
  inspector?: string;          // ФИО инспектора
  inspector_company?: string;  // Компания инспектора
  temperature: number;         // Температура воздуха (°C)
  humidity: number;            // Влажность (%)
  illumination: number;        // Освещенность (люкс)
  weather_conditions?: string; // Погодные условия
  defect_found: boolean;
  defect_type?: DefectType;    // Тип дефекта
  defect_location?: string;    // Локализация дефекта
  defect_description: string;
  defect_size?: number;        // Размер дефекта (мм)
  defect_depth?: number;       // Глубина дефекта (мм)
  repair_recommendation?: string; // Рекомендации по ремонту
  repair_priority?: 'low' | 'medium' | 'high' | 'immediate';
  estimated_repair_cost?: number; // Ориентировочная стоимость ремонта
  quality_grade: 'A' | 'B' | 'C' | 'D'; // Категория качества
  param1: number;              // Параметр 1 (зависит от метода)
  param2: number;              // Параметр 2
  param3: number;              // Параметр 3
  ml_label: CriticalityLevel;  // Предсказание ML
  ml_confidence?: number;      // Уверенность ML модели (0-1)
  images?: string[];           // Ссылки на фотографии
  documents?: string[];        // Ссылки на документы
  notes?: string;              // Примечания
}

export interface MapPoint {
  id: number;
  name: string;
  type: ObjectType;
  coordinates: {
    lat: number;
    lon: number;
  };
  pipeline_id: string;
  criticality: CriticalityLevel;
  has_defect: boolean;
  last_inspection?: string;
  status?: 'operational' | 'maintenance' | 'repaired' | 'out_of_service';
  elevation?: number;
  diameter?: number;
  pressure_rating?: number;
  temperature_rating?: number;
}

export interface Pipeline {
  pipeline_id: string;
  name: string;
  description?: string;
  start_point: { lat: number; lon: number };
  end_point: { lat: number; lon: number };
  total_length: number;        // Общая длина (км)
  diameter: number;           // Диаметр (мм)
  material: MaterialType;
  construction_year: number;
  pressure_rating: number;    // Рабочее давление (МПа)
  temperature_rating: number; // Рабочая температура (°C)
  operational_status: 'active' | 'inactive' | 'under_maintenance' | 'planned';
  owner?: string;            // Владелец
  operator?: string;         // Оператор
  last_inspection: string;
  next_inspection: string;
  total_objects: number;
  objects_with_defects: number;
  risk_score: number;        // Общий риск (0-100)
  segments?: PipelineSegment[];
}

export interface PipelineSegment {
  segment_id: number;
  pipeline_id: string;
  segment_number: number;
  start_point: { lat: number; lon: number };
  end_point: { lat: number; lon: number };
  length: number;           // Длина сегмента (м)
  diameter: number;         // Диаметр (мм)
  material: MaterialType;
  depth?: number;          // Глубина залегания (м)
  protective_coating?: string; // Защитное покрытие
  cathodic_protection?: boolean; // Катодная защита
  terrain_type?: string;   // Тип местности
  criticality: CriticalityLevel;
  objects: number[];       // ID объектов на сегменте
}

export interface DashboardStats {
  // Общая статистика
  total_objects: number;
  total_pipelines: number;
  total_inspections: number;
  total_defects: number;
  defect_rate: number;            // Процент объектов с дефектами
  critical_defects: number;       // Критические дефекты
  
  // Распределения
  methods_distribution: Array<{
    method: InspectionMethod;
    count: number;
    percentage: number;
  }>;
  
  criticality_distribution: Array<{
    level: CriticalityLevel;
    count: number;
    percentage: number;
  }>;
  
  object_type_distribution: Array<{
    type: ObjectType;
    count: number;
    percentage: number;
  }>;
  
  defect_type_distribution: Array<{
    type: DefectType;
    count: number;
    percentage: number;
  }>;
  
  // Временные данные
  monthly_data: Array<{
    month: string;                // ГГГГ-ММ
    total_inspections: number;
    defects_found: number;
    critical_defects: number;
    avg_risk_score: number;
  }>;
  
  // Топ рисков
  top_risks: Array<{
    object_id: number;
    object_name: string;
    object_type: ObjectType;
    pipeline_id: string;
    risk_score: number;          // Оценка риска (0-100)
    last_defect: string;
    defect_type?: DefectType;
    repair_priority?: string;
  }>;
  
  // Эффективность проверок
  inspection_efficiency: {
    avg_inspection_time: number;   // Среднее время проверки (мин)
    avg_defect_detection_rate: number; // Процент обнаружения дефектов
    avg_repair_time: number;       // Среднее время ремонта (дни)
  };
  
  // Статус объектов
  object_status_distribution: {
    operational: number;
    maintenance: number;
    repaired: number;
    out_of_service: number;
  };
  
  // Планирование
  upcoming_inspections: Array<{
    object_id: number;
    object_name: string;
    inspection_date: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  
  overdue_inspections: Array<{
    object_id: number;
    object_name: string;
    due_date: string;
    days_overdue: number;
  }>;
}

export interface InspectionPlan {
  plan_id: number;
  name: string;
  description?: string;
  pipeline_ids: string[];
  object_types: ObjectType[];
  inspection_method: InspectionMethod;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  assigned_to?: string;           // ФИО ответственного
  created_by: string;
  created_at: string;
  updated_at: string;
  inspections?: PlannedInspection[];
}

export interface PlannedInspection {
  inspection_id: number;
  plan_id: number;
  object_id: number;
  scheduled_date: string;
  actual_date?: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  inspector?: string;
  notes?: string;
  result?: Diagnostic;
}

export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'inspector' | 'viewer' | 'manager';
  company?: string;
  phone?: string;
  avatar_url?: string;
  permissions: string[];
  last_login?: string;
  is_active: boolean;
}

export interface Report {
  report_id: number;
  name: string;
  type: 'inspection' | 'defect' | 'maintenance' | 'analytics' | 'compliance';
  pipeline_ids: string[];
  period_start: string;
  period_end: string;
  generated_by: string;
  generated_at: string;
  file_url?: string;
  summary: string;
  statistics: {
    total_objects: number;
    inspected_objects: number;
    defects_found: number;
    critical_defects: number;
    defect_rate: number;
    avg_risk_score: number;
  };
  recommendations?: string[];
}

export interface FilterOptions {
  // Фильтры объектов
  object_type?: ObjectType | ObjectType[];
  pipeline_id?: string | string[];
  criticality?: CriticalityLevel | CriticalityLevel[];
  has_defect?: boolean;
  status?: string | string[];
  material?: MaterialType | MaterialType[];
  
  // Фильтры диагностики
  method?: InspectionMethod | InspectionMethod[];
  date_from?: string;
  date_to?: string;
  inspector?: string;
  defect_type?: DefectType | DefectType[];
  
  // Пагинация и сортировка
  skip?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  
  // Географические фильтры
  bounds?: {
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
  };
  
  // Поиск
  search?: string;
}

export interface RiskAssessment {
  assessment_id: number;
  object_id: number;
  assessment_date: string;
  assessed_by: string;
  
  // Факторы риска
  factors: {
    technical: {
      age: number;              // Возраст объекта (лет)
      corrosion_rate: number;   // Скорость коррозии (мм/год)
      stress_level: number;     // Уровень напряжений (МПа)
      fatigue: number;          // Усталостные повреждения
    };
    operational: {
      pressure_variance: number; // Колебания давления
      temperature_variance: number; // Колебания температуры
      flow_rate: number;        // Скорость потока
      operating_hours: number;  // Накопленные часы работы
    };
    environmental: {
      soil_corrosivity: number; // Коррозионная активность грунта
      seismic_risk: number;     // Сейсмический риск
      climate_impact: number;   // Климатическое воздействие
      proximity_to_population: number; // Близость к населению
    };
  };
  
  // Оценки
  scores: {
    technical_score: number;    // 0-100
    operational_score: number;  // 0-100
    environmental_score: number; // 0-100
    overall_risk_score: number; // 0-100
  };
  
  // Рекомендации
  recommendations: {
    immediate: string[];
    short_term: string[];
    long_term: string[];
  };
  
  // Следующая оценка
  next_assessment_date: string;
}

// Типы для форм и запросов
export interface CreateObjectDto {
  object_name: string;
  object_type: ObjectType;
  pipeline_id: string;
  lat: number;
  lon: number;
  elevation?: number;
  year: number;
  material: MaterialType;
  diameter?: number;
  wall_thickness?: number;
  pressure_rating?: number;
  temperature_rating?: number;
  manufacturer?: string;
  serial_number?: string;
  installation_date?: string;
}

export interface CreateDiagnosticDto {
  object_id: number;
  method: InspectionMethod;
  date: string;
  inspector?: string;
  temperature: number;
  humidity: number;
  illumination: number;
  defect_found: boolean;
  defect_type?: DefectType;
  defect_description: string;
  defect_size?: number;
  defect_depth?: number;
  quality_grade: 'A' | 'B' | 'C' | 'D';
  param1: number;
  param2: number;
  param3: number;
  ml_label?: CriticalityLevel;
  notes?: string;
}

export interface UpdateObjectDto {
  object_name?: string;
  status?: 'operational' | 'maintenance' | 'repaired' | 'out_of_service';
  criticality?: CriticalityLevel;
  last_maintenance?: string;
  next_inspection?: string;
  metadata?: Record<string, any>;
}

// Типы для API ответов
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

// Типы для карты
export interface MapBounds {
  min_lat: number;
  max_lat: number;
  min_lon: number;
  max_lon: number;
}

export interface MapLayer {
  id: string;
  name: string;
  type: 'tile' | 'vector' | 'wms';
  url: string;
  visible: boolean;
  opacity: number;
}

// Типы для уведомлений
export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  related_object_id?: number;
}

// Типы для экспорта
export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  include: string[];
  filters?: FilterOptions;
  filename?: string;
}