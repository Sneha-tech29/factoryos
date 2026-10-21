"""FactoryOS Core Configuration & Application Settings."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "FactoryOS Backend"
    APP_ENV: str = "development"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & Tenancy
    SECRET_KEY: str = "dev-secret-key-factoryos-change-in-production"
    DEFAULT_FACTORY_ID: str = "fac_sample_01"
    
    # Redis configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
