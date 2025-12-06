# backend/app/seed.py
from app.db.database import SessionLocal
from app.db.models import Pipeline, Object, Inspection, ObjectType, MethodType, QualityGrade, MLLabel
from datetime import date

def seed_database():
    db = SessionLocal()
    
    try:
        # Очистка таблиц
        db.query(Inspection).delete()
        db.query(Object).delete()
        db.query(Pipeline).delete()
        
        # Создаем трубопроводы
        pipelines = [
            Pipeline(id="MT-01", name="Магистраль 01"),
            Pipeline(id="MT-02", name="Магистраль 02"),
            Pipeline(id="MT-03", name="Магистраль 03"),
        ]
        db.add_all(pipelines)
        
        # Создаем объекты
        objects = [
            Object(
                id=1,
                name="Кран подвесной",
                type=ObjectType.CRANE,
                pipeline_id="MT-02",
                lat=52.96,
                lon=63.12,
                year=1961,
                material="Ст3"
            ),
            Object(
                id=2,
                name="Турбокомпрессор ТВ-80-1",
                type=ObjectType.COMPRESSOR,
                pipeline_id="MT-02",
                lat=49.80,
                lon=73.10,
                year=1999,
                material="09Г2С"
            ),
            Object(
                id=3,
                name="Участок трубопровода АБ",
                type=ObjectType.PIPELINE_SECTION,
                pipeline_id="MT-01",
                lat=51.16,
                lon=71.43,
                year=1985,
                material="X70"
            ),
        ]
        db.add_all(objects)
        
        # Создаем диагностики
        inspections = [
            Inspection(
                id=1,
                object_id=1,
                method=MethodType.VIK,
                date=date(2023, 5, 10),
                temperature=18.5,
                humidity=65.0,
                illumination=1200.0,
                defect_found=True,
                defect_description="Коррозия в верхней части",
                quality_grade=QualityGrade.REQUIRES_ACTION,
                param1=2.5,
                param2=15.0,
                param3=0.0,
                ml_label=MLLabel.MEDIUM
            ),
            Inspection(
                id=2,
                object_id=2,
                method=MethodType.VIBRO,
                date=date(2023, 6, 15),
                temperature=22.0,
                humidity=60.0,
                illumination=800.0,
                defect_found=False,
                defect_description="",
                quality_grade=QualityGrade.SATISFACTORY,
                param1=0.8,
                param2=0.0,
                param3=0.0,
                ml_label=MLLabel.NORMAL
            ),
            Inspection(
                id=3,
                object_id=3,
                method=MethodType.MFL,
                date=date(2023, 7, 20),
                temperature=25.0,
                humidity=55.0,
                illumination=1500.0,
                defect_found=True,
                defect_description="Потеря металла 15%",
                quality_grade=QualityGrade.UNACCEPTABLE,
                param1=15.0,
                param2=30.0,
                param3=2.0,
                ml_label=MLLabel.HIGH
            ),
        ]
        db.add_all(inspections)
        
        db.commit()
        print("База данных успешно заполнена тестовыми данными!")
        
    except Exception as e:
        db.rollback()
        print(f"Ошибка при заполнении базы: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()