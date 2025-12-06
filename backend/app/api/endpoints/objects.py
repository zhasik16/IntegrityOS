from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db import crud, session, models
from app import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Object])
def get_objects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    object_type: Optional[str] = None,
    pipeline_id: Optional[str] = None,
    db: Session = Depends(session.get_db)
):
    """Получить список объектов с фильтрацией"""
    objects = crud.ObjectCRUD.get_objects(
        db=db,
        skip=skip,
        limit=limit,
        object_type=object_type,
        pipeline_id=pipeline_id
    )
    return objects

@router.get("/{object_id}", response_model=schemas.Object)
def get_object(object_id: int, db: Session = Depends(session.get_db)):
    """Получить объект по ID"""
    db_object = crud.ObjectCRUD.get_object(db, object_id)
    if db_object is None:
        raise HTTPException(status_code=404, detail="Object not found")
    return db_object

@router.get("/{object_id}/diagnostics", response_model=List[schemas.Diagnostic])
def get_object_diagnostics(object_id: int, db: Session = Depends(session.get_db)):
    """Получить все диагностики для объекта"""
    # Проверяем существует ли объект
    object_exists = crud.ObjectCRUD.get_object(db, object_id)
    if not object_exists:
        raise HTTPException(status_code=404, detail="Object not found")
    
    diagnostics = crud.DiagnosticCRUD.get_diagnostics(
        db=db,
        object_id=object_id
    )
    
    return diagnostics

@router.post("/", response_model=schemas.Object)
def create_object(obj: schemas.ObjectCreate, db: Session = Depends(session.get_db)):
    """Создать новый объект"""
    return crud.ObjectCRUD.create_object(db, obj.dict())

@router.put("/{object_id}", response_model=schemas.Object)
def update_object(
    object_id: int, 
    obj: schemas.ObjectCreate, 
    db: Session = Depends(session.get_db)
):
    """Обновить объект"""
    db_object = crud.ObjectCRUD.update_object(db, object_id, obj.dict())
    if db_object is None:
        raise HTTPException(status_code=404, detail="Object not found")
    return db_object

@router.delete("/{object_id}")
def delete_object(object_id: int, db: Session = Depends(session.get_db)):
    """Удалить объект"""
    success = crud.ObjectCRUD.delete_object(db, object_id)
    if not success:
        raise HTTPException(status_code=404, detail="Object not found")
    return {"message": "Object deleted successfully"}