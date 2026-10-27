"""Warrantify - Pydantic v2 Schemas for API request/response validation"""
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict


# ─── Warranty Schemas ────────────────────────────────────────────────────────────

class WarrantyBase(BaseModel):
    warranty_type: str = Field(..., description="primary | extended | component")
    label: str = Field(..., description="Human label, e.g. 'Manufacturer Warranty', 'Croma Maple', 'Inverter Compressor'")
    provider: str | None = Field(None, description="e.g. 'Samsung', 'Croma / Servify', 'Apple'")
    start_date: date | None = None
    end_date: date | None = None
    policy_number: str | None = None
    coverage_details: str | None = None
    notes: str | None = None


class WarrantyCreate(WarrantyBase):
    pass


class WarrantyUpdate(BaseModel):
    warranty_type: str | None = None
    label: str | None = None
    provider: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    policy_number: str | None = None
    coverage_details: str | None = None
    notes: str | None = None


class WarrantyResponse(WarrantyBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    status: str
    created_at: datetime
    updated_at: datetime


# ─── Attachment Schemas ──────────────────────────────────────────────────────────

class AttachmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    product_id: str
    file_type: str
    original_filename: str
    storage_path: str
    file_url: str | None = None
    mime_type: str
    file_size_bytes: int
    uploaded_at: datetime


# ─── Product Schemas ─────────────────────────────────────────────────────────────

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str = "other"
    brand: str | None = None
    model: str | None = None
    color_variant: str | None = None

    # Identifiers
    identifier_type: str = "none"
    identifier_value: str | None = None
    identifier_value_2: str | None = None  # Dual-SIM IMEI2

    # Purchase & merchant
    purchase_date: date | None = None
    purchase_price: float | None = None
    payment_method: str | None = None
    merchant_name: str | None = None
    merchant_type: str | None = None
    invoice_number: str | None = None
    seller_gstin: str | None = None

    # Box contents & condition
    box_contents: str | None = None  # JSON string list
    box_condition_verified: bool = False

    notes: str | None = None


class ProductCreate(ProductBase):
    """Create a product with optional inline warranties and optional initial attachment."""
    warranties: list[WarrantyCreate] = []
    initial_attachment_filename: str | None = None
    initial_attachment_original_name: str | None = None


class ProductUpdate(BaseModel):
    """All fields optional for partial updates."""
    name: str | None = None
    category: str | None = None
    brand: str | None = None
    model: str | None = None
    color_variant: str | None = None
    identifier_type: str | None = None
    identifier_value: str | None = None
    identifier_value_2: str | None = None
    purchase_date: date | None = None
    purchase_price: float | None = None
    payment_method: str | None = None
    merchant_name: str | None = None
    merchant_type: str | None = None
    invoice_number: str | None = None
    seller_gstin: str | None = None
    box_contents: str | None = None
    box_condition_verified: bool | None = None
    notes: str | None = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    warranties: list[WarrantyResponse] = []
    attachments: list[AttachmentResponse] = []
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    """Paginated product list."""
    products: list[ProductResponse]
    total: int


# ─── Health ──────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = "healthy"
    app: str
    version: str
