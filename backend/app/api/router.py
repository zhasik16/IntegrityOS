from fastapi import APIRouter
from app.api.endpoints import (
    objects,      # если есть файл objects.py
    diagnostics,  # если есть файл diagnostics.py
    upload,       # если есть файл upload.py
    dashboard,    # если есть файл dashboard.py
    predictions   # если есть файл predictions.py
)

api_router = APIRouter()

# Подключаем роутеры
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(objects.router, prefix="/objects", tags=["objects"])
api_router.include_router(diagnostics.router, prefix="/diagnostics", tags=["diagnostics"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(predictions.router, prefix="/predict", tags=["predictions"])