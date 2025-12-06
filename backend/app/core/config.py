from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Настройки приложения
    app_name: str = "IntegrityOS API"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # Настройки базы данных
    database_url: str = "sqlite:///./integrity.db"
    
    # Настройки CORS
    cors_origins: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]
    
    # Настройки файлов
    upload_dir: str = "./uploads"
    max_upload_size: int = 50 * 1024 * 1024  # 50 MB
    
    # Настройки ML
    ml_model_path: str = "./ml_models/model.pkl"
    
    # JWT (опционально)
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Создаем экземпляр настроек
settings = Settings()