from pydantic import BaseModel, Field, validator
from datetime import date, datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from decimal import Decimal

# Enums для Pydantic
class ObjectType(str, Enum):
    CRANE = "crane"
    COMPRESSOR = "compressor"
    PIPELINE_SECTION = "pipeline_section"

class MethodType(str, Enum):
    VIK = "VIK"
    PVK = "PVK"
    MPK = "MPK"
    UZK = "UZK"
    RGK = "RGK"
    TVK = "TVK"
    VIBRO = "VIBRO"
    MFL = "MFL"
    TFI = "TFI"
    GEO = "GEO"
    UTWM = "UTWM"

class QualityGrade(str, Enum):
    SATISFACTORY = "удовлетворительно"
    ACCEPTABLE = "допустимо"
    REQUIRES_ACTION = "требует_мер"
    UNACCEPTABLE = "недопустимо"

class MLLabel(str, Enum):
    NORMAL = "normal"
    MEDIUM = "medium"
    HIGH = "high"

# Базовые схемы
class ObjectBase(BaseModel):
    object_name: str
    object_type: ObjectType
    pipeline_id: str
    lat: float = Field(ge=40.0, le=55.0)  # границы Казахстана
    lon: float = Field(ge=46.0, le=88.0)
    year: int = Field(ge=1900, le=datetime.now().year)
    material: str

class ObjectCreate(ObjectBase):
    pass

class Object(ObjectBase):
    object_id: int
    
    class Config:
        from_attributes = True

class DiagnosticBase(BaseModel):
    object_id: int
    method: MethodType
    date: date
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    illumination: Optional[float] = None
    defect_found: bool = False
    defect_description: Optional[str] = None
    quality_grade: Optional[QualityGrade] = None
    param1: Optional[float] = None
    param2: Optional[float] = None
    param3: Optional[float] = None
    ml_label: Optional[MLLabel] = None

class DiagnosticCreate(DiagnosticBase):
    pass

class Diagnostic(DiagnosticBase):
    diag_id: int
    
    class Config:
        from_attributes = True

# Схемы для ответов API
class ImportResponse(BaseModel):
    message: str
    imported_objects: int = 0
    imported_diagnostics: int = 0
    errors: List[str] = []

class MapPoint(BaseModel):
    object_id: int
    object_name: str
    lat: float
    lon: float
    object_type: ObjectType
    has_defects: bool
    criticality: Optional[MLLabel] = None
    last_inspection: Optional[date] = None

class DashboardStats(BaseModel):
    total_objects: int
    total_diagnostics: int
    defects_count: int
    methods_distribution: Dict[MethodType, int]
    criticality_distribution: Dict[MLLabel, int]
    top_risks: List[Dict[str, Any]]
    inspections_by_year: Dict[str, int]

class MLRequest(BaseModel):
    quality_grade: Optional[QualityGrade] = None
    param1: Optional[float] = None
    param2: Optional[float] = None
    param3: Optional[float] = None
    defect_found: bool = False

class MLResponse(BaseModel):
    label: MLLabel
    probability: float
    recommendation: str

class ReportRequest(BaseModel):
    report_type: str = "summary"
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    format: str = "html"
    include_map: bool = False
    include_stats: bool = True