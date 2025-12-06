# backend/app/ml/model.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import pickle
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class DefectPredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = os.path.join(os.path.dirname(__file__), "defect_model.pkl")
        self.scaler_path = os.path.join(os.path.dirname(__file__), "scaler.pkl")
        
        # Создаем директорию если не существует
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        
    def train_from_dataframe(self, df: pd.DataFrame):
        """Обучить модель на DataFrame"""
        try:
            # Подготовка признаков
            features = ['param1', 'param2', 'param3', 'temperature', 'humidity']
            
            # Проверяем наличие всех признаков
            for feature in features:
                if feature not in df.columns:
                    df[feature] = 0
            
            X = df[features].fillna(0).values
            
            # Целевая переменная (ml_label)
            label_map = {'normal': 0, 'medium': 1, 'high': 2}
            if 'ml_label' not in df.columns:
                raise ValueError("DataFrame должен содержать столбец 'ml_label'")
            
            y = df['ml_label'].map(label_map).fillna(0).astype(int).values
            
            # Масштабирование
            X_scaled = self.scaler.fit_transform(X)
            
            # Обучение модели
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                min_samples_split=5,
                min_samples_leaf=2
            )
            self.model.fit(X_scaled, y)
            
            # Сохранение модели и скейлера
            self.save_model()
            
            accuracy = self.model.score(X_scaled, y)
            logger.info(f"Модель обучена. Точность: {accuracy:.3f}, Образцов: {len(df)}")
            
            return accuracy
            
        except Exception as e:
            logger.error(f"Ошибка обучения модели: {e}")
            raise
    
    def predict(self, features: dict) -> dict:
        """Предсказать критичность на основе признаков"""
        try:
            if self.model is None:
                self.load_model()
            
            if self.model is None:
                # Если модель все еще не загружена, создаем по умолчанию
                self.create_default_model()
            
            # Подготовка входных данных
            input_features = np.array([
                features.get('param1', 0),
                features.get('param2', 0),
                features.get('param3', 0),
                features.get('temperature', 20),
                features.get('humidity', 60)
            ]).reshape(1, -1)
            
            # Масштабирование
            input_scaled = self.scaler.transform(input_features)
            
            # Предсказание
            prediction = self.model.predict(input_scaled)[0]
            probabilities = self.model.predict_proba(input_scaled)[0]
            
            # Маппинг обратно в метки
            label_map_reverse = {0: 'normal', 1: 'medium', 2: 'high'}
            
            return {
                "prediction": label_map_reverse.get(prediction, 'normal'),
                "probabilities": {
                    "normal": float(probabilities[0]),
                    "medium": float(probabilities[1]) if len(probabilities) > 1 else 0,
                    "high": float(probabilities[2]) if len(probabilities) > 2 else 0
                },
                "features_used": features
            }
            
        except Exception as e:
            logger.error(f"Ошибка предсказания: {e}")
            # Возвращаем дефолтное предсказание при ошибке
            return {
                "prediction": "normal",
                "probabilities": {"normal": 1.0, "medium": 0.0, "high": 0.0},
                "features_used": features,
                "error": str(e)
            }
    
    def save_model(self):
        """Сохранить модель и скейлер"""
        try:
            with open(self.model_path, 'wb') as f:
                pickle.dump(self.model, f)
            with open(self.scaler_path, 'wb') as f:
                pickle.dump(self.scaler, f)
            logger.info(f"Модель сохранена: {self.model_path}")
        except Exception as e:
            logger.error(f"Ошибка сохранения модели: {e}")
    
    def load_model(self):
        """Загрузить модель и скейлер"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                with open(self.model_path, 'rb') as f:
                    self.model = pickle.load(f)
                with open(self.scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                logger.info("Модель успешно загружена")
            else:
                logger.warning("Файлы модели не найдены. Создадим новую модель.")
                self.create_default_model()
        except Exception as e:
            logger.error(f"Ошибка загрузки модели: {e}")
            self.create_default_model()
    
    def create_default_model(self):
        """Создать модель по умолчанию на синтетических данных"""
        try:
            logger.info("Создание модели по умолчанию на синтетических данных...")
            
            # Создаем синтетические данные
            np.random.seed(42)
            n_samples = 500
            
            data = {
                'param1': np.random.uniform(0, 20, n_samples),
                'param2': np.random.uniform(0, 30, n_samples),
                'param3': np.random.uniform(0, 5, n_samples),
                'temperature': np.random.uniform(10, 30, n_samples),
                'humidity': np.random.uniform(40, 80, n_samples)
            }
            
            # Простое правило для генерации меток
            risk_scores = (
                data['param1'] * 0.3 +
                data['param2'] * 0.2 +
                data['param3'] * 0.5 +
                (data['temperature'] - 20) * 0.1 +
                (data['humidity'] - 60) * 0.05
            )
            
            labels = []
            for score in risk_scores:
                if score < 5:
                    labels.append('normal')
                elif score < 12:
                    labels.append('medium')
                else:
                    labels.append('high')
            
            data['ml_label'] = labels
            df = pd.DataFrame(data)
            
            # Обучаем модель
            accuracy = self.train_from_dataframe(df)
            logger.info(f"Модель по умолчанию создана. Точность на синтетических данных: {accuracy:.3f}")
            
        except Exception as e:
            logger.error(f"Ошибка создания модели по умолчанию: {e}")
            # Создаем простейшую модель в крайнем случае
            self.model = RandomForestClassifier(
                n_estimators=10,
                random_state=42
            )
            X = np.array([[0, 0, 0, 20, 60]])
            y = np.array([0])
            self.model.fit(X, y)
            self.save_model()