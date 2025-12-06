# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.db.models import Base
from app.db.database import engine  # Изменено с app.db.database
from init_db import seed_sample_data

# Создаем таблицы
Base.metadata.create_all(bind=engine)

# Заполняем тестовыми данными
seed_sample_data()

app = FastAPI(
    title="IntegrityOS API",
    description="API для системы мониторинга трубопроводов",
    version="1.0.0",
    redirect_slashes=False  # Добавляем для предотвращения 307 редиректов
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "IntegrityOS API",
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": [
            "/api/objects",
            "/api/diagnostics", 
            "/api/upload",
            "/api/dashboard",
            "/api/predict",
            "/api/map"
        ],
        "note": "Добавьте / в конце URL для endpoint'ов (например: /api/objects/)"
    }

@app.get("/health")
def health_check():
    """Health check endpoint для мониторинга"""
    return {
        "status": "healthy",
        "service": "IntegrityOS API",
        "timestamp": __import__("datetime").datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info"
    )