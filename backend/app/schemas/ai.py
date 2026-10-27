"""Warrantify - AI Extraction Schemas"""
from datetime import date
from pydantic import BaseModel, Field


class InvoiceExtractionResponse(BaseModel):
    name: str = Field(..., description="Extracted or predicted product name")
    category: str = Field("other", description="smartphone, laptop, tv_audio, washing_machine, etc.")
    brand: str | None = None
    model: str | None = None
    color_variant: str | None = None

    identifier_type: str = "none"
    identifier_value: str | None = None
    identifier_value_2: str | None = None

    purchase_date: date | None = None
    purchase_price: float | None = None
    payment_method: str | None = None

    merchant_name: str | None = None
    merchant_type: str | None = "online"
    invoice_number: str | None = None
    seller_gstin: str | None = None

    warranty_months: int | None = 12
    box_accessories: list[str] = []

    # Trust & Verification indicators (core product tenet)
    confidence_score: float = Field(0.9, ge=0.0, le=1.0)
    uncertain_fields: list[str] = Field(default_factory=list, description="Fields that the AI wasn't 100% sure about")
    raw_summary: str | None = None

    # Stored upload path so the user can save the device AND attach this invoice in one click
    temp_stored_filename: str | None = None
    file_url: str | None = None
