from app.db.models import Base
from app.db.session import engine
import pandas as pd
from datetime import datetime
from app.db import crud
from app.db.session import SessionLocal

def init_db():
    """Инициализировать базу данных"""
    print("Создание таблиц в базе данных...")
    Base.metadata.create_all(bind=engine)
    print("Таблицы созданы успешно!")

def seed_sample_data():
    """Заполнить базу тестовыми данными"""
    db = SessionLocal()
    
    try:
        # Проверяем, есть ли уже данные
        existing_objects = crud.ObjectCRUD.get_objects(db, limit=1)
        if existing_objects:
            print("База данных уже содержит данные. Пропускаем заполнение.")
            return
        
        print("Заполнение базы тестовыми данными...")
        
        # Примерные данные объектов
        sample_objects = [
            {
                "object_id": 1,
                "object_name": "Кран подвесной",
                "object_type": "crane",
                "pipeline_id": "MT-02",
                "lat": 52.96,
                "lon": 63.12,
                "year": 1961,
                "material": "Ст3"
            },
            {
                "object_id": 2,
                "object_name": "Турбокомпрессор ТВ-80-1",
                "object_type": "compressor",
                "pipeline_id": "MT-02",
                "lat": 49.80,
                "lon": 73.10,
                "year": 1999,
                "material": "09Г2С"
            },
            {
                "object_id": 3,
                "object_name": "Участок трубопровода №1",
                "object_type": "pipeline_section",
                "pipeline_id": "MT-01",
                "lat": 51.16,
                "lon": 71.43,
                "year": 1985,
                "material": "X70"
            }
        ]
        
        # Добавляем объекты
        for obj_data in sample_objects:
            crud.ObjectCRUD.create_object(db, obj_data)
        
        # Примерные данные диагностик
        sample_diagnostics = [
            {
                "object_id": 1,
                "method": "VIK",
                "date": datetime(2023, 5, 10).date(),
                "temperature": 15.5,
                "humidity": 65.2,
                "illumination": 1200.0,
                "defect_found": True,
                "defect_description": "Коррозия металла",
                "quality_grade": "требует_мер",
                "param1": 2.5,
                "param2": 10.2,
                "param3": 0.0,
                "ml_label": "high"
            },
            {
                "object_id": 2,
                "method": "MFL",
                "date": datetime(2023, 7, 20).date(),
                "temperature": 20.1,
                "humidity": 55.3,
                "illumination": 1800.0,
                "defect_found": True,
                "defect_description": "Трещина на корпусе",
                "quality_grade": "недопустимо",
                "param1": 8.5,
                "param2": 15.3,
                "param3": 2.1,
                "ml_label": "high"
            },
            {
                "object_id": 3,
                "method": "UTWM",
                "date": datetime(2023, 8, 5).date(),
                "temperature": 22.5,
                "humidity": 60.8,
                "illumination": 2000.0,
                "defect_found": True,
                "defect_description": "Утоньшение стенки",
                "quality_grade": "допустимо",
                "param1": 1.2,
                "param2": 5.6,
                "param3": 0.3,
                "ml_label": "medium"
            }
        ]
        
        # Добавляем диагностики
        for i, diag_data in enumerate(sample_diagnostics, 1):
            diag_data["diag_id"] = i
            crud.DiagnosticCRUD.create_diagnostic(db, diag_data)
        
        db.commit()
        print("Тестовые данные успешно добавлены!")
        
    except Exception as e:
        db.rollback()
        print(f"Ошибка при заполнении данными: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_sample_data()