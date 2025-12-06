from fastapi import APIRouter, Query, HTTPException
from app.db.database import SessionLocal
from app.db import crud
from typing import Optional
from datetime import date

router = APIRouter()

@router.get("/")
def get_diagnostics(
    object_id: Optional[int] = None,
    method: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    defect_found: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
):
    db = SessionLocal()
    try:
        diagnostics = crud.DiagnosticCRUD.get_diagnostics(
            db,
            skip=skip,
            limit=limit,
            object_id=object_id,
            method=method,
            start_date=start_date,
            end_date=end_date,
            defect_found=defect_found
        )
        
        return [
            {
                "diag_id": diag.diag_id,
                "object_id": diag.object_id,
                "method": diag.method.value,
                "date": diag.date.isoformat(),
                "temperature": diag.temperature,
                "humidity": diag.humidity,
                "illumination": diag.illumination,
                "defect_found": diag.defect_found,
                "defect_description": diag.defect_description,
                "quality_grade": diag.quality_grade.value,
                "param1": diag.param1,
                "param2": diag.param2,
                "param3": diag.param3,
                "ml_label": diag.ml_label.value if diag.ml_label else None
            }
            for diag in diagnostics
        ]
    finally:
        db.close()

@router.get("/stats")
def get_diagnostics_stats():
    db = SessionLocal()
    try:
        stats = crud.DiagnosticCRUD.get_diagnostics_stats(db)
        return stats
    finally:
        db.close()

@router.get("/top-risks")
def get_top_risks(limit: int = 5):
    db = SessionLocal()
    try:
        risks = crud.DiagnosticCRUD.get_top_risks(db, limit=limit)
        return risks
    finally:
        db.close()