from fastapi import APIRouter, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, case
from typing import Dict, Any, List
from app.db.database import SessionLocal
from app.db import models, crud
from datetime import date, datetime, timedelta

router = APIRouter()

@router.get("/")
def get_dashboard_summary():
    """Основная статистика для дашборда"""
    db = SessionLocal()
    try:
        # Общая статистика
        total_objects = db.query(func.count(models.Object.object_id)).scalar()
        total_inspections = db.query(func.count(models.Diagnostic.diag_id)).scalar()
        total_defects = db.query(func.count(models.Diagnostic.diag_id)).filter(
            models.Diagnostic.defect_found == True
        ).scalar()
        
        # Распределение по методам диагностики
        methods_query = db.query(
            models.Diagnostic.method,
            func.count(models.Diagnostic.diag_id).label('count')
        ).group_by(models.Diagnostic.method).all()
        
        methods_distribution = [
            {"method": method.value, "count": count}
            for method, count in methods_query
        ]
        
        # Распределение по критичности
        criticality_query = db.query(
            models.Diagnostic.ml_label,
            func.count(models.Diagnostic.diag_id).label('count')
        ).filter(models.Diagnostic.ml_label.isnot(None)).group_by(
            models.Diagnostic.ml_label
        ).all()
        
        criticality_distribution = [
            {"label": label.value if label else "unknown", "count": count}
            for label, count in criticality_query
        ]
        
        # Динамика диагностик по месяцам (последние 6 месяцев)
        six_months_ago = datetime.now() - timedelta(days=180)
        
        monthly_stats = db.query(
            func.strftime('%Y-%m', models.Diagnostic.date).label('month'),
            func.count(models.Diagnostic.diag_id).label('total'),
            func.count(case((models.Diagnostic.defect_found == True, 1))).label('defects')
        ).filter(
            models.Diagnostic.date >= six_months_ago
        ).group_by(
            'month'
        ).order_by('month').all()
        
        monthly_data = [
            {
                "month": month,
                "total_inspections": total,
                "defects_found": defects
            }
            for month, total, defects in monthly_stats
        ]
        
        # Топ объектов по риску (через CRUD)
        top_risks = crud.DiagnosticCRUD.get_top_risks(db, limit=5)
        
        # Распределение по типам объектов
        object_types_query = db.query(
            models.Object.object_type,
            func.count(models.Object.object_id).label('count')
        ).group_by(models.Object.object_type).all()
        
        object_types_distribution = [
            {"type": obj_type.value, "count": count}
            for obj_type, count in object_types_query
        ]
        
        # Статистика по трубопроводам
        pipelines_stats = db.query(
            models.Object.pipeline_id,
            func.count(models.Object.object_id).label('objects_count'),
            func.count(case((models.Diagnostic.defect_found == True, 1))).label('defects_count')
        ).join(
            models.Diagnostic, 
            models.Object.object_id == models.Diagnostic.object_id,
            isouter=True
        ).group_by(models.Object.pipeline_id).all()
        
        pipelines_data = [
            {
                "pipeline_id": pipeline_id,
                "objects_count": objects_count,
                "defects_count": defects_count or 0
            }
            for pipeline_id, objects_count, defects_count in pipelines_stats
        ]
        
        return {
            "summary": {
                "total_objects": total_objects,
                "total_inspections": total_inspections,
                "total_defects": total_defects,
                "defect_rate": round((total_defects / total_inspections * 100) if total_inspections > 0 else 0, 1)
            },
            "distributions": {
                "methods": methods_distribution,
                "criticality": criticality_distribution,
                "object_types": object_types_distribution
            },
            "time_series": {
                "monthly_inspections": monthly_data
            },
            "pipeline_stats": pipelines_data,
            "top_risks": top_risks
        }
        
    finally:
        db.close()

@router.get("/defects-by-method")
def get_defects_by_method():
    """Дефекты по методам диагностики"""
    db = SessionLocal()
    try:
        results = db.query(
            models.Diagnostic.method,
            func.count(models.Diagnostic.diag_id).label('total'),
            func.count(case((models.Diagnostic.defect_found == True, 1))).label('defects')
        ).group_by(models.Diagnostic.method).all()
        
        return [
            {
                "method": method.value,
                "total_inspections": total,
                "defects_count": defects,
                "defect_rate": round((defects / total * 100) if total > 0 else 0, 1)
            }
            for method, total, defects in results
        ]
    finally:
        db.close()

@router.get("/defects-by-year")
def get_defects_by_year(year_from: int = 2018, year_to: int = 2023):
    """Дефекты по годам эксплуатации объектов"""
    db = SessionLocal()
    try:
        results = db.query(
            models.Object.year,
            func.count(models.Diagnostic.diag_id).label('total'),
            func.count(case((models.Diagnostic.defect_found == True, 1))).label('defects')
        ).join(
            models.Diagnostic,
            models.Object.object_id == models.Diagnostic.object_id
        ).filter(
            models.Object.year.between(year_from, year_to)
        ).group_by(models.Object.year).order_by(models.Object.year).all()
        
        return [
            {
                "year": year,
                "total_inspections": total,
                "defects_count": defects,
                "defect_rate": round((defects / total * 100) if total > 0 else 0, 1)
            }
            for year, total, defects in results
        ]
    finally:
        db.close()

@router.get("/quality-stats")
def get_quality_stats():
    """Статистика по качественным оценкам"""
    db = SessionLocal()
    try:
        results = db.query(
            models.Diagnostic.quality_grade,
            func.count(models.Diagnostic.diag_id).label('count')
        ).group_by(models.Diagnostic.quality_grade).all()
        
        total = sum(count for _, count in results)
        
        return {
            "distribution": [
                {
                    "grade": grade.value,
                    "count": count,
                    "percentage": round((count / total * 100) if total > 0 else 0, 1)
                }
                for grade, count in results
            ],
            "total": total
        }
    finally:
        db.close()