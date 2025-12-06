# backend/app/api/endpoints/predictions.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.ml.model import DefectPredictor  # Импортируем класс
from app.db.database import SessionLocal
from app.db import models
import pandas as pd
import os
from datetime import datetime

router = APIRouter()

# Создаем экземпляр предсказателя
predictor = DefectPredictor()

# Инициализируем модель
def init_predictor():
    """Инициализировать предсказатель при запуске"""
    try:
        predictor.load_model()
        print("ML модель успешно загружена")
    except Exception as e:
        print(f"Ошибка загрузки модели: {e}. Создаем новую модель...")
        predictor.create_default_model()
        print("Создана новая ML модель по умолчанию")

# Вызываем инициализацию
init_predictor()

# Модели данных для запросов
class PredictionRequest(BaseModel):
    param1: float = 0
    param2: float = 0
    param3: float = 0
    temperature: float = 20
    humidity: float = 60
    method: Optional[str] = None

class BatchPredictionRequest(BaseModel):
    items: List[PredictionRequest]

@router.post("/single")
def predict_single(request: PredictionRequest):
    """Предсказать критичность для одного набора параметров"""
    try:
        # Конвертируем в dict для модели
        features = {
            'param1': request.param1,
            'param2': request.param2,
            'param3': request.param3,
            'temperature': request.temperature,
            'humidity': request.humidity
        }
        
        # Получаем предсказание
        result = predictor.predict(features)
        
        # Добавляем рекомендации
        recommendations = {
            'normal': 'Обслуживание по плану',
            'medium': 'Требуется дополнительный контроль',
            'high': 'Необходимо срочное обследование'
        }
        
        result['recommendation'] = recommendations.get(result['prediction'], 'Требуется анализ')
        result['timestamp'] = datetime.now().isoformat()
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка предсказания: {str(e)}")

@router.post("/batch")
def predict_batch(request: BatchPredictionRequest):
    """Предсказать для нескольких наборов параметров"""
    try:
        results = []
        for i, item in enumerate(request.items):
            features = {
                'param1': item.param1,
                'param2': item.param2,
                'param3': item.param3,
                'temperature': item.temperature,
                'humidity': item.humidity
            }
            
            prediction = predictor.predict(features)
            prediction['item_id'] = i
            prediction['method'] = item.method
            
            results.append(prediction)
        
        # Статистика по батчу
        predictions_count = {
            'normal': sum(1 for r in results if r['prediction'] == 'normal'),
            'medium': sum(1 for r in results if r['prediction'] == 'medium'),
            'high': sum(1 for r in results if r['prediction'] == 'high')
        }
        
        return {
            'results': results,
            'summary': {
                'total_items': len(results),
                'predictions_distribution': predictions_count,
                'highest_risk_count': predictions_count['high']
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка batch предсказания: {str(e)}")

@router.post("/train")
def train_model():
    """Переобучить модель на текущих данных"""
    db = SessionLocal()
    try:
        # Получаем все диагностики с метками
        diagnostics = db.query(models.Diagnostic).filter(
            models.Diagnostic.ml_label.isnot(None)
        ).all()
        
        if len(diagnostics) < 10:
            # Используем синтетические данные если недостаточно реальных
            predictor.create_default_model()
            return {
                'status': 'info',
                'message': 'Создана модель по умолчанию на синтетических данных (недостаточно реальных данных)',
                'timestamp': datetime.now().isoformat()
            }
        
        # Конвертируем в DataFrame
        data = []
        for diag in diagnostics:
            data.append({
                'param1': diag.param1 or 0,
                'param2': diag.param2 or 0,
                'param3': diag.param3 or 0,
                'temperature': diag.temperature or 20,
                'humidity': diag.humidity or 60,
                'ml_label': diag.ml_label.value if diag.ml_label else 'normal'
            })
        
        df = pd.DataFrame(data)
        
        # Обучаем модель
        accuracy = predictor.train_from_dataframe(df)
        
        return {
            'status': 'success',
            'accuracy': round(accuracy, 3),
            'training_samples': len(df),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обучения модели: {str(e)}")
    finally:
        db.close()

@router.get("/model-info")
def get_model_info():
    """Информация о текущей модели"""
    try:
        model_info = {
            'model_type': predictor.model.__class__.__name__ if hasattr(predictor, 'model') and predictor.model else 'Not loaded',
            'features_used': ['param1', 'param2', 'param3', 'temperature', 'humidity'],
            'target_labels': ['normal', 'medium', 'high'],
            'model_exists': os.path.exists(predictor.model_path) if hasattr(predictor, 'model_path') else False,
            'scaler_exists': os.path.exists(predictor.scaler_path) if hasattr(predictor, 'scaler_path') else False
        }
        
        if hasattr(predictor, 'model_path') and os.path.exists(predictor.model_path):
            model_info['last_trained'] = datetime.fromtimestamp(
                os.path.getmtime(predictor.model_path)
            ).isoformat()
        
        return model_info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка получения информации: {str(e)}")