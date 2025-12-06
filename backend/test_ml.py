# backend/test_ml.py
from app.ml.model import DefectPredictor
import numpy as np

def test_model():
    print("Тестирование ML модели...")
    
    # Создаем предсказатель
    predictor = DefectPredictor()
    
    # Загружаем или создаем модель
    predictor.load_model()
    
    # Тестовый запрос
    test_features = {
        'param1': 5.5,
        'param2': 12.3,
        'param3': 0.8,
        'temperature': 18.5,
        'humidity': 65.0
    }
    
    result = predictor.predict(test_features)
    print(f"Результат предсказания: {result}")
    
    # Проверяем сохранение
    predictor.save_model()
    print("Модель успешно сохранена")
    
    return result

if __name__ == "__main__":
    test_model()