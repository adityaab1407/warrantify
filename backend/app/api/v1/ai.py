"""Warrantify - AI Ingestion & Extraction API endpoints"""
import os
from fastapi import APIRouter, UploadFile, File, Header, HTTPException
from pydantic import BaseModel
from app.core.config import settings
from app.schemas.ai import InvoiceExtractionResponse
from app.services.invoice_extractor import extract_invoice_data

router = APIRouter(prefix="/ai", tags=["ai"])


class GeminiConfigRequest(BaseModel):
    gemini_api_key: str


@router.get("/status")
async def get_ai_status():
    """Check if Gemini Vision is configured via environment variable or settings."""
    has_key = bool(os.getenv("GEMINI_API_KEY") or getattr(settings, "GEMINI_API_KEY", None))
    return {
        "gemini_configured": has_key,
        "model": "gemini-2.0-flash",
        "features": [
            "Multimodal Indian GST Invoice Parsing",
            "Automatic Brand & Model Identification",
            "Serial Number / IMEI Extraction",
            "Warranty Period Detection",
        ],
    }


@router.post("/configure-key")
async def configure_gemini_key(payload: GeminiConfigRequest):
    """Save Gemini API key to environment and .env file."""
    key = payload.gemini_api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="API key cannot be empty.")

    os.environ["GEMINI_API_KEY"] = key
    env_path = settings.BASE_DIR.parent / ".env"
    with open(env_path, "a") as f:
        f.write(f"\nGEMINI_API_KEY={key}\n")

    return {"status": "success", "message": "Gemini API key configured successfully."}


@router.post("/extract-invoice", response_model=InvoiceExtractionResponse)
async def extract_invoice(
    file: UploadFile = File(...),
    x_gemini_api_key: str | None = Header(None),
):
    """
    Extract product name, brand, model, purchase date, price, merchant,
    GSTIN, and serial/IMEI from an invoice photo or PDF.
    """
    if file.content_type not in settings.ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Please upload JPEG, PNG, WEBP, or PDF.",
        )

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit.",
        )

    result = extract_invoice_data(
        data_bytes=contents,
        filename=file.filename or "invoice.jpg",
        mime_type=file.content_type or "image/jpeg",
        client_api_key=x_gemini_api_key,
    )
    return result
