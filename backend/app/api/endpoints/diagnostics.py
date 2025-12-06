from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from app.db import crud, session
from app import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Diagnostic])
def get_diagnostics(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    object_id: Optional[int] = None,
    method: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    defect_found: Optional[bool] = None,
    db: Session = Depends(session.get_db)
):
    """Получить список диагностик с фильтрацией"""
    diagnostics = crud.DiagnosticCRUD.get_diagnostics(
        db=db,
        skip=skip,
        limit=limit,
        object_id=object_id,
        method=method,
        start_date=start_date,
        end_date=end_date,
        defect_found=defect_found
    )
    return diagnostics

@router.get("/{diag_id}", response_model=schemas.Diagnostic)
def get_diagnostic(diag_id: int, db: Session = Depends(session.get_db)):
    """Получить диагностику по ID"""
    db_diagnostic = crud.DiagnosticCRUD.get_diagnostic(db, diag_id)
    if db_diagnostic is None:
        raise HTTPException(status_code=404, detail="Diagnostic not found")
    return db_diagnostic

@router.post("/", response_model=schemas.Diagnostic)
def create_diagnostic(diag: schemas.DiagnosticCreate, db: Session = Depends(session.get_db)):
    """Создать новую диагностику"""
    return crud.DiagnosticCRUD.create_diagnostic(db, diag.dict())