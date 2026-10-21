"""FactoryOS Backend Application Entrypoint."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.errors import (
    FactoryOSError,
    factoryos_exception_handler,
    generic_http_exception_handler,
)
from app.api.v1.router import router as api_v1_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI Factory Intelligence & Decision Support System API (Indian MSME Printing Factories)",
)

# Cross-Origin Resource Sharing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(FactoryOSError, factoryos_exception_handler)
app.add_exception_handler(HTTPException, generic_http_exception_handler)

# Routers
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.VERSION,
        "service": "operational"
    }


@app.get("/ready", tags=["Health"])
def readiness_probe():
    return {
        "status": "ready",
        "database": "connected (sample mode)",
        "rate_limiter": "active"
    }
