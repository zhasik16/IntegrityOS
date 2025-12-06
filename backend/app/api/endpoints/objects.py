from fastapi import APIRouter, Query, HTTPException
from app.db.database import SessionLocal
from app.db import crud
from typing import Optional

router = APIRouter()

@router.get("/")
def get_objects(
    object_type: Optional[str] = None,
    pipeline_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    db = SessionLocal()
    try:
        objects = crud.ObjectCRUD.get_objects(
            db, 
            skip=skip, 
            limit=limit,
            object_type=object_type,
            pipeline_id=pipeline_id
        )
        return [
            {
                "object_id": obj.object_id,
                "object_name": obj.object_name,
                "object_type": obj.object_type.value,
                "pipeline_id": obj.pipeline_id,
                "lat": obj.lat,
                "lon": obj.lon,
                "year": obj.year,
                "material": obj.material
            }
            for obj in objects
        ]
    finally:
        db.close()

@router.get("/{object_id}")
def get_object(object_id: int):
    db = SessionLocal()
    try:
        obj = crud.ObjectCRUD.get_object(db, object_id)
        if not obj:
            raise HTTPException(status_code=404, detail="Object not found")
        
        # Получаем диагностики для этого объекта
        diagnostics = crud.DiagnosticCRUD.get_diagnostics(
            db, object_id=object_id, limit=10
        )
        
        return {
            "object_id": obj.object_id,
            "object_name": obj.object_name,
            "object_type": obj.object_type.value,
            "pipeline_id": obj.pipeline_id,
            "coordinates": {"lat": obj.lat, "lon": obj.lon},
            "year": obj.year,
            "material": obj.material,
            "diagnostics": [
                {
                    "diag_id": diag.diag_id,
                    "date": diag.date.isoformat(),
                    "method": diag.method.value,
                    "defect_found": diag.defect_found,
                    "quality_grade": diag.quality_grade.value,
                    "ml_label": diag.ml_label.value if diag.ml_label else None
                }
                for diag in diagnostics
            ]
        }
    finally:
        db.close()