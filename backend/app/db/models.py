from sqlalchemy import Column, Integer, String, Float, Boolean, Date, Enum
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class ObjectType(enum.Enum):
    CRANE = "crane"
    COMPRESSOR = "compressor"
    PIPELINE_SECTION = "pipeline_section"

class MethodType(enum.Enum):
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

class QualityGrade(enum.Enum):
    SATISFACTORY = "удовлетворительно"
    ACCEPTABLE = "допустимо"
    REQUIRES_ACTION = "требует_мер"
    UNACCEPTABLE = "недопустимо"

class MLLabel(enum.Enum):
    NORMAL = "normal"
    MEDIUM = "medium"
    HIGH = "high"

class Object(Base):
    __tablename__ = "objects"
    
    object_id = Column(Integer, primary_key=True, index=True)
    object_name = Column(String, nullable=False)
    object_type = Column(Enum(ObjectType), nullable=False)
    pipeline_id = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    year = Column(Integer, nullable=False)
    material = Column(String, nullable=False)

class Diagnostic(Base):
    __tablename__ = "diagnostics"
    
    diag_id = Column(Integer, primary_key=True, index=True)
    object_id = Column(Integer, nullable=False)
    method = Column(Enum(MethodType), nullable=False)
    date = Column(Date, nullable=False)
    temperature = Column(Float)
    humidity = Column(Float)
    illumination = Column(Float)
    defect_found = Column(Boolean, default=False)
    defect_description = Column(String)
    quality_grade = Column(Enum(QualityGrade), nullable=False)
    param1 = Column(Float)
    param2 = Column(Float)
    param3 = Column(Float)
    ml_label = Column(Enum(MLLabel))