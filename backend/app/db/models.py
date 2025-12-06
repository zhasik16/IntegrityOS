from sqlalchemy import Column, Integer, String, Float, Boolean, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
import enum
from datetime import date

Base = declarative_base()

# Enums из ТЗ
class ObjectType(str, enum.Enum):
    CRANE = "crane"
    COMPRESSOR = "compressor"
    PIPELINE_SECTION = "pipeline_section"

class MethodType(str, enum.Enum):
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

class QualityGrade(str, enum.Enum):
    SATISFACTORY = "удовлетворительно"
    ACCEPTABLE = "допустимо"
    REQUIRES_ACTION = "требует_мер"
    UNACCEPTABLE = "недопустимо"

class MLLabel(str, enum.Enum):
    NORMAL = "normal"
    MEDIUM = "medium"
    HIGH = "high"

# Таблица объектов (Objects.csv)
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
    
    # Связь с диагностиками
    diagnostics = relationship("Diagnostic", back_populates="object")

# Таблица диагностик (Diagnostics.csv)
class Diagnostic(Base):
    __tablename__ = "diagnostics"
    
    diag_id = Column(Integer, primary_key=True, index=True)
    object_id = Column(Integer, ForeignKey("objects.object_id"), nullable=False)
    method = Column(Enum(MethodType), nullable=False)
    date = Column(Date, nullable=False)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    illumination = Column(Float, nullable=True)
    defect_found = Column(Boolean, default=False)
    defect_description = Column(String, nullable=True)
    quality_grade = Column(Enum(QualityGrade), nullable=True)
    param1 = Column(Float, nullable=True)
    param2 = Column(Float, nullable=True)
    param3 = Column(Float, nullable=True)
    ml_label = Column(Enum(MLLabel), nullable=True)
    
    # Связь с объектом
    object = relationship("Object", back_populates="diagnostics")