from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

# Создаем приложение FastAPI
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутер API
app.include_router(api_router, prefix="/api")

# Корневой эндпоинт
@app.get("/")
async def root():
    return {
        "message": "IntegrityOS API",
        "version": settings.app_version,
        "docs": "/api/docs",
        "endpoints": {
            "objects": "/api/objects",
            "diagnostics": "/api/diagnostics",
            "import": "/api/import",
            "dashboard": "/api/dashboard",
            "map": "/api/map",
            "ml": "/api/ml/predict",
            "reports": "/api/reports/generate"
        }
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}