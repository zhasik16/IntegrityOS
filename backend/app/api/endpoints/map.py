# backend/app/api/endpoints/map.py
from fastapi import APIRouter, Query
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db.models import Object, Diagnostic, MLLabel  # Изменено Inspection на Diagnostic
from typing import Optional, List

router = APIRouter()

@router.get("/data")
def get_map_data(
    pipeline_id: Optional[str] = None,
    method: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    criticality: Optional[str] = None  # normal, medium, high
):
    db = SessionLocal()
    try:
        # Базовый запрос объектов
        query = db.query(Object)
        
        if pipeline_id:
            query = query.filter(Object.pipeline_id == pipeline_id)
        
        objects = query.all()
        
        # Для каждого объекта получаем последнюю диагностику
        map_features = []
        for obj in objects:
            # Запрос диагностик для объекта
            diag_query = db.query(Diagnostic).filter(Diagnostic.object_id == obj.object_id)
            
            if method:
                diag_query = diag_query.filter(Diagnostic.method == method)
            if date_from:
                diag_query = diag_query.filter(Diagnostic.date >= date_from)
            if date_to:
                diag_query = diag_query.filter(Diagnostic.date <= date_to)
            if criticality:
                diag_query = diag_query.filter(Diagnostic.ml_label == MLLabel(criticality))
            
            latest_diag = diag_query.order_by(Diagnostic.date.desc()).first()
            
            if latest_diag:
                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [obj.lon, obj.lat]
                    },
                    "properties": {
                        "object_id": obj.object_id,  # Исправлено с id на object_id
                        "name": obj.object_name,  # Исправлено с name на object_name
                        "type": obj.object_type.value,  # Исправлено с type на object_type
                        "pipeline_id": obj.pipeline_id,
                        "latest_inspection": {
                            "date": latest_diag.date.isoformat() if latest_diag.date else None,
                            "method": latest_diag.method.value,
                            "defect_found": latest_diag.defect_found,
                            "criticality": latest_diag.ml_label.value if latest_diag.ml_label else None,
                            "quality": latest_diag.quality_grade.value if latest_diag.quality_grade else None
                        }
                    }
                }
                map_features.append(feature)
        
        return {
            "type": "FeatureCollection",
            "features": map_features
        }
        
    finally:
        db.close()

@router.get("/pipelines")
def get_pipelines_geojson():
    """Возвращает линии трубопроводов (упрощенно)"""
    # Координаты для демонстрации (можно загружать из файла)
    pipelines = {
        "MT-01": [
            [71.0, 51.0],
            [71.5, 51.2],
            [72.0, 51.3],
            [72.5, 51.5]
        ],
        "MT-02": [
            [63.0, 52.0],
            [63.5, 52.2],
            [64.0, 52.4],
            [64.5, 52.6]
        ],
        "MT-03": [
            [69.0, 50.0],
            [69.5, 50.3],
            [70.0, 50.5],
            [70.5, 50.8]
        ]
    }
    
    features = []
    for pipeline_id, coords in pipelines.items():
        feature = {
            "type": "Feature",
            "properties": {
                "id": pipeline_id,
                "name": f"Магистраль {pipeline_id.split('-')[1]}"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": coords
            }
        }
        features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/clusters")
def get_map_clusters():
    """Возвращает данные для кластеризации на карте"""
    db = SessionLocal()
    try:
        # Получаем все объекты с их последней диагностикой
        objects_with_diagnostics = db.query(
            Object.object_id,
            Object.object_name,
            Object.object_type,
            Object.pipeline_id,
            Object.lat,
            Object.lon,
            Diagnostic.ml_label,
            Diagnostic.defect_found
        ).join(
            Diagnostic,
            Object.object_id == Diagnostic.object_id
        ).distinct(Object.object_id).all()
        
        clusters = []
        for obj in objects_with_diagnostics:
            # Определяем цвет маркера на основе критичности
            color = "#4CAF50"  # green - нормальный
            if obj.ml_label:
                if obj.ml_label == MLLabel.HIGH:
                    color = "#F44336"  # red - высокий риск
                elif obj.ml_label == MLLabel.MEDIUM:
                    color = "#FF9800"  # orange - средний риск
            
            clusters.append({
                "id": obj.object_id,
                "name": obj.object_name,
                "type": obj.object_type.value,
                "pipeline_id": obj.pipeline_id,
                "coordinates": [obj.lon, obj.lat],
                "criticality": obj.ml_label.value if obj.ml_label else "normal",
                "color": color,
                "has_defect": obj.defect_found or False
            })
        
        return {
            "clusters": clusters,
            "total": len(clusters)
        }
        
    finally:
        db.close()