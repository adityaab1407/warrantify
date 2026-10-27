"""Warrantify Backend - Core Configuration"""
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    APP_NAME: str = "Warrantify"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./warrantify.db"

    # File uploads
    UPLOAD_DIR: Path = Path(__file__).parent.parent.parent / "uploads"
    MAX_UPLOAD_SIZE_MB: int = 15
    ALLOWED_MIME_TYPES: list[str] = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
    ]

    # Default user for local dev (no auth)
    DEFAULT_USER_ID: str = "default_user"

    # AI & Vision (Milestone 2)
    GEMINI_API_KEY: str | None = None

    class Config:
        env_file = [".env", "../.env"]


settings = Settings()

# Ensure upload directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
