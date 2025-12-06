from fastapi import APIRouter
from app.api.endpoints import (
    objects,
    diagnostics,
    upload,
    dashboard,
    predictions,
    map
)

api_router = APIRouter()

api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(objects.router, prefix="/objects", tags=["objects"])
api_router.include_router(diagnostics.router, prefix="/diagnostics", tags=["diagnostics"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(predictions.router, prefix="/predict", tags=["predictions"])
api_router.include_router(map.router, prefix="/map", tags=["map"])