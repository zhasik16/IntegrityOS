from app.db.models import Base, Object, Diagnostic, ObjectType, MethodType, QualityGrade, MLLabel
from app.db.database import engine, SessionLocal
from datetime import date

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
        existing_objects = db.query(Object).count()
        if existing_objects > 0:
            print("База данных уже содержит данные. Пропускаем заполнение.")
            return
        
        print("Заполнение базы тестовыми данными...")
        
        # Создаем объекты
        sample_objects = [
            Object(
                object_id=1,
                object_name="Кран подвесной",
                object_type=ObjectType.CRANE,
                pipeline_id="MT-02",
                lat=52.96,
                lon=63.12,
                year=1961,
                material="Ст3"
            ),
            Object(
                object_id=2,
                object_name="Турбокомпрессор ТВ-80-1",
                object_type=ObjectType.COMPRESSOR,
                pipeline_id="MT-02",
                lat=49.80,
                lon=73.10,
                year=1999,
                material="09Г2С"
            ),
            Object(
                object_id=3,
                object_name="Участок трубопровода №1",
                object_type=ObjectType.PIPELINE_SECTION,
                pipeline_id="MT-01",
                lat=51.16,
                lon=71.43,
                year=1985,
                material="X70"
            ),
            Object(
                object_id=4,
                object_name="Компрессорная станция №1",
                object_type=ObjectType.COMPRESSOR,
                pipeline_id="MT-03",
                lat=50.45,
                lon=69.15,
                year=2005,
                material="09Г2С"
            ),
            Object(
                object_id=5,
                object_name="Задвижка DN300",
                object_type=ObjectType.CRANE,
                pipeline_id="MT-01",
                lat=51.80,
                lon=71.90,
                year=1990,
                material="Ст20"
            ),
        ]
        
        for obj in sample_objects:
            db.add(obj)
        
        # Создаем диагностики
        sample_diagnostics = [
            Diagnostic(
                diag_id=1,
                object_id=1,
                method=MethodType.VIK,
                date=date(2023, 5, 10),
                temperature=15.5,
                humidity=65.2,
                illumination=1200.0,
                defect_found=True,
                defect_description="Коррозия металла",
                quality_grade=QualityGrade.REQUIRES_ACTION,
                param1=2.5,
                param2=10.2,
                param3=0.0,
                ml_label=MLLabel.HIGH
            ),
            Diagnostic(
                diag_id=2,
                object_id=2,
                method=MethodType.MFL,
                date=date(2023, 7, 20),
                temperature=20.1,
                humidity=55.3,
                illumination=1800.0,
                defect_found=True,
                defect_description="Трещина на корпусе",
                quality_grade=QualityGrade.UNACCEPTABLE,
                param1=8.5,
                param2=15.3,
                param3=2.1,
                ml_label=MLLabel.HIGH
            ),
            Diagnostic(
                diag_id=3,
                object_id=3,
                method=MethodType.UTWM,
                date=date(2023, 8, 5),
                temperature=22.5,
                humidity=60.8,
                illumination=2000.0,
                defect_found=True,
                defect_description="Утоньшение стенки",
                quality_grade=QualityGrade.ACCEPTABLE,
                param1=1.2,
                param2=5.6,
                param3=0.3,
                ml_label=MLLabel.MEDIUM
            ),
            Diagnostic(
                diag_id=4,
                object_id=4,
                method=MethodType.PVK,
                date=date(2023, 9, 12),
                temperature=19.0,
                humidity=62.0,
                illumination=1100.0,
                defect_found=False,
                defect_description="",
                quality_grade=QualityGrade.SATISFACTORY,
                param1=0.0,
                param2=0.0,
                param3=0.0,
                ml_label=MLLabel.NORMAL
            ),
            Diagnostic(
                diag_id=5,
                object_id=5,
                method=MethodType.RGK,
                date=date(2022, 5, 15),
                temperature=16.0,
                humidity=68.0,
                illumination=900.0,
                defect_found=False,
                defect_description="",
                quality_grade=QualityGrade.SATISFACTORY,
                param1=0.0,
                param2=0.0,
                param3=0.0,
                ml_label=MLLabel.NORMAL
            ),
            Diagnostic(
                diag_id=6,
                object_id=1,
                method=MethodType.VIBRO,
                date=date(2022, 6, 20),
                temperature=18.5,
                humidity=70.0,
                illumination=1500.0,
                defect_found=True,
                defect_description="Вибрация выше нормы",
                quality_grade=QualityGrade.REQUIRES_ACTION,
                param1=5.2,
                param2=8.7,
                param3=1.3,
                ml_label=MLLabel.MEDIUM
            ),
        ]
        
        for diag in sample_diagnostics:
            db.add(diag)
        
        db.commit()
        print("Тестовые данные успешно добавлены!")
        print(f"  - Объектов: {len(sample_objects)}")
        print(f"  - Диагностик: {len(sample_diagnostics)}")
        
    except Exception as e:
        db.rollback()
        print(f"Ошибка при заполнении данными: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_sample_data()