from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import Object, Diagnostic, ObjectType, MethodType, QualityGrade, MLLabel
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

def map_object_type(obj_type: str) -> ObjectType:
    mapping = {
        "crane": ObjectType.CRANE,
        "compressor": ObjectType.COMPRESSOR,
        "pipeline_section": ObjectType.PIPELINE_SECTION
    }
    return mapping.get(obj_type.lower(), ObjectType.PIPELINE_SECTION)

def map_method(method: str) -> MethodType:
    try:
        return MethodType(method)
    except:
        return MethodType.VIK

def map_quality_grade(grade: str) -> QualityGrade:
    mapping = {
        "удовлетворительно": QualityGrade.SATISFACTORY,
        "допустимо": QualityGrade.ACCEPTABLE,
        "требует_мер": QualityGrade.REQUIRES_ACTION,
        "недопустимо": QualityGrade.UNACCEPTABLE
    }
    return mapping.get(grade, QualityGrade.SATISFACTORY)

def map_ml_label(label: str) -> MLLabel:
    mapping = {
        "normal": MLLabel.NORMAL,
        "medium": MLLabel.MEDIUM,
        "high": MLLabel.HIGH
    }
    return mapping.get(label.lower(), MLLabel.NORMAL)

@router.post("/")
async def upload_csv(file: UploadFile = File(...)):
    db = SessionLocal()
    try:
        # Читаем файл
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        records_processed = 0
        
        if "object_id" in df.columns and "object_name" in df.columns:
            # Это файл объектов
            for _, row in df.iterrows():
                obj = Object(
                    object_id=int(row['object_id']),
                    object_name=row['object_name'],
                    object_type=map_object_type(row['object_type']),
                    pipeline_id=row['pipeline_id'],
                    lat=float(row['lat']),
                    lon=float(row['lon']),
                    year=int(row['year']),
                    material=row['material']
                )
                db.merge(obj)  # merge вместо add для обновления существующих
                records_processed += 1
                
        elif "diag_id" in df.columns and "object_id" in df.columns:
            # Это файл диагностик
            for _, row in df.iterrows():
                # Преобразуем дату
                date_obj = None
                if pd.notna(row.get('date')):
                    try:
                        date_obj = datetime.strptime(str(row['date']), '%Y-%m-%d').date()
                    except:
                        date_obj = datetime.now().date()
                
                diagnostic = Diagnostic(
                    diag_id=int(row['diag_id']),
                    object_id=int(row['object_id']),
                    method=map_method(row['method']),
                    date=date_obj,
                    temperature=float(row.get('temperature', 0)),
                    humidity=float(row.get('humidity', 0)),
                    illumination=float(row.get('illumination', 0)),
                    defect_found=bool(row.get('defect_found', False)),
                    defect_description=str(row.get('defect_description', '')),
                    quality_grade=map_quality_grade(row.get('quality_grade', 'удовлетворительно')),
                    param1=float(row.get('param1', 0)),
                    param2=float(row.get('param2', 0)),
                    param3=float(row.get('param3', 0)),
                    ml_label=map_ml_label(row.get('ml_label', 'normal'))
                )
                db.merge(diagnostic)
                records_processed += 1
        
        db.commit()
        return {
            "filename": file.filename,
            "rows_processed": records_processed,
            "message": "Данные успешно загружены"
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка загрузки CSV: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Ошибка обработки файла: {str(e)}")
    finally:
        db.close()

@router.post("/bulk")
async def upload_bulk(files: list[UploadFile] = File(...)):
    results = []
    for file in files:
        try:
            result = await upload_csv(file)
            results.append({
                "filename": file.filename,
                "success": True,
                "message": result["message"]
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })
    return {"results": results}