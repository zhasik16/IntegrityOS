from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
from datetime import date, datetime
from app.db import models

# CRUD для объектов
class ObjectCRUD:
    @staticmethod
    def get_object(db: Session, object_id: int):
        return db.query(models.Object).filter(models.Object.object_id == object_id).first()
    
    @staticmethod
    def get_objects(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        object_type: Optional[str] = None,
        pipeline_id: Optional[str] = None
    ):
        query = db.query(models.Object)
        
        if object_type:
            query = query.filter(models.Object.object_type == object_type)
        if pipeline_id:
            query = query.filter(models.Object.pipeline_id == pipeline_id)
            
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def create_object(db: Session, obj_data: dict):
        db_obj = models.Object(**obj_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    @staticmethod
    def update_object(db: Session, object_id: int, obj_data: dict):
        db_obj = db.query(models.Object).filter(models.Object.object_id == object_id).first()
        if db_obj:
            for key, value in obj_data.items():
                setattr(db_obj, key, value)
            db.commit()
            db.refresh(db_obj)
        return db_obj
    
    @staticmethod
    def delete_object(db: Session, object_id: int):
        db_obj = db.query(models.Object).filter(models.Object.object_id == object_id).first()
        if db_obj:
            db.delete(db_obj)
            db.commit()
        return db_obj

# CRUD для диагностик
class DiagnosticCRUD:
    @staticmethod
    def get_diagnostic(db: Session, diag_id: int):
        return db.query(models.Diagnostic).filter(models.Diagnostic.diag_id == diag_id).first()
    
    @staticmethod
    def get_diagnostics(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        object_id: Optional[int] = None,
        method: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        defect_found: Optional[bool] = None
    ):
        query = db.query(models.Diagnostic)
        
        if object_id:
            query = query.filter(models.Diagnostic.object_id == object_id)
        if method:
            query = query.filter(models.Diagnostic.method == method)
        if start_date:
            query = query.filter(models.Diagnostic.date >= start_date)
        if end_date:
            query = query.filter(models.Diagnostic.date <= end_date)
        if defect_found is not None:
            query = query.filter(models.Diagnostic.defect_found == defect_found)
            
        return query.order_by(desc(models.Diagnostic.date)).offset(skip).limit(limit).all()
    
    @staticmethod
    def create_diagnostic(db: Session, diag_data: dict):
        db_diag = models.Diagnostic(**diag_data)
        db.add(db_diag)
        db.commit()
        db.refresh(db_diag)
        return db_diag
    
    @staticmethod
    def get_diagnostics_stats(db: Session) -> Dict[str, Any]:
        """Получить статистику по диагностикам"""
        total_diagnostics = db.query(func.count(models.Diagnostic.diag_id)).scalar()
        total_defects = db.query(func.count(models.Diagnostic.diag_id)).filter(
            models.Diagnostic.defect_found == True
        ).scalar()
        
        # Распределение по методам
        methods_dist = db.query(
            models.Diagnostic.method,
            func.count(models.Diagnostic.diag_id)
        ).group_by(models.Diagnostic.method).all()
        
        # Распределение по критичности
        criticality_dist = db.query(
            models.Diagnostic.ml_label,
            func.count(models.Diagnostic.diag_id)
        ).filter(models.Diagnostic.ml_label.isnot(None)).group_by(
            models.Diagnostic.ml_label
        ).all()
        
        return {
            "total_diagnostics": total_diagnostics,
            "total_defects": total_defects,
            "methods_distribution": dict(methods_dist),
            "criticality_distribution": dict(criticality_dist)
        }
    
    @staticmethod
    def get_top_risks(db: Session, limit: int = 5) -> List[Dict[str, Any]]:
        """Получить топ объектов по риску"""
        # Здесь можно реализовать сложную логику расчета рисков
        # Для MVP используем простую логику на основе ml_label
        query = db.query(
            models.Object.object_id,
            models.Object.object_name,
            models.Diagnostic.ml_label,
            models.Diagnostic.date
        ).join(
            models.Diagnostic, 
            models.Object.object_id == models.Diagnostic.object_id
        ).filter(
            models.Diagnostic.ml_label.isnot(None)
        ).order_by(
            desc(models.Diagnostic.date)
        ).limit(limit)
        
        results = []
        for row in query.all():
            # Простой расчет риска на основе ml_label
            risk_score = {
                "normal": 30,
                "medium": 65,
                "high": 85
            }.get(row.ml_label.value if row.ml_label else "normal", 50)
            
            results.append({
                "object_id": row.object_id,
                "object_name": row.object_name,
                "risk_score": risk_score,
                "last_defect": row.date.isoformat() if row.date else None
            })
        
        return results