"""Warrantify - SQLAlchemy Models

Tri-Warranty System:
  1. Primary Warranty   – Manufacturer's standard comprehensive warranty.
  2. Extended Warranty   – Third-party / retailer plans (Croma Maple, AppleCare+, Amazon Protect, etc.).
  3. Component Warranty  – Individual part warranties (battery replacement, compressor, motor, screen, etc.).

Service-Center-Ready Fields:
  All fields that Indian authorized service centers (Samsung, LG, Apple, Voltas, etc.)
  typically require to initiate warranty service are captured on the Product model.
"""
import uuid
import enum
from datetime import date, datetime

from sqlalchemy import (
    String, Text, Float, Integer, Date, DateTime, Enum, ForeignKey, Boolean,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ─── Enums ──────────────────────────────────────────────────────────────────────

class ProductCategory(str, enum.Enum):
    SMARTPHONE = "smartphone"
    LAPTOP = "laptop"
    TABLET = "tablet"
    TV_AUDIO = "tv_audio"
    REFRIGERATOR = "refrigerator"
    WASHING_MACHINE = "washing_machine"
    AC = "ac"
    MICROWAVE = "microwave"
    KITCHEN_APPLIANCE = "kitchen_appliance"
    PERSONAL_CARE = "personal_care"
    WEARABLE = "wearable"
    GAMING = "gaming"
    OTHER = "other"


class IdentifierType(str, enum.Enum):
    SERIAL_NUMBER = "serial_number"
    IMEI = "imei"
    PRODUCT_KEY = "product_key"  # Windows license keys, software products
    NONE = "none"


class MerchantType(str, enum.Enum):
    ONLINE = "online"
    LARGE_FORMAT_OFFLINE = "large_format_offline"  # Croma, Reliance Digital, Vijay Sales
    LOCAL_RETAILER = "local_retailer"
    BRAND_DIRECT = "brand_direct"  # Apple Store, Samsung exclusive, etc.


class PaymentMethod(str, enum.Enum):
    UPI = "upi"
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    NET_BANKING = "net_banking"
    EMI = "emi"
    CASH = "cash"
    WALLET = "wallet"  # Paytm, PhonePe wallet
    OTHER = "other"


class WarrantyStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRING_SOON = "expiring_soon"  # <30 days remaining
    EXPIRED = "expired"
    UNKNOWN = "unknown"  # Unverified / missing dates


class WarrantyType(str, enum.Enum):
    PRIMARY = "primary"  # Manufacturer warranty
    EXTENDED = "extended"  # Third-party: Croma Maple, AppleCare+, Amazon Protect, etc.
    COMPONENT = "component"  # Part-level: battery, compressor, motor, screen, etc.


class AttachmentType(str, enum.Enum):
    INVOICE = "invoice"
    WARRANTY_CARD = "warranty_card"
    EXTENDED_WARRANTY_DOC = "extended_warranty_doc"
    MANUAL = "manual"
    PRODUCT_PHOTO = "product_photo"
    BOX_PHOTO = "box_photo"
    SERVICE_REPORT = "service_report"
    OTHER = "other"


# ─── Helper ─────────────────────────────────────────────────────────────────────

def _uuid() -> str:
    return str(uuid.uuid4())


# ─── Product ────────────────────────────────────────────────────────────────────

class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(128), index=True, default="default_user")

    # ── Basic product info ───────────────────────────────────────────────────
    name: Mapped[str] = mapped_column(String(255))
    category: Mapped[str] = mapped_column(Enum(ProductCategory), default=ProductCategory.OTHER)
    brand: Mapped[str | None] = mapped_column(String(128))
    model: Mapped[str | None] = mapped_column(String(255))
    color_variant: Mapped[str | None] = mapped_column(String(128))

    # ── Identifiers (service-center-critical) ────────────────────────────────
    identifier_type: Mapped[str] = mapped_column(Enum(IdentifierType), default=IdentifierType.NONE)
    identifier_value: Mapped[str | None] = mapped_column(String(255))
    identifier_value_2: Mapped[str | None] = mapped_column(String(255))  # Dual-SIM IMEI2

    # ── Purchase & merchant info ─────────────────────────────────────────────
    purchase_date: Mapped[date | None] = mapped_column(Date)
    purchase_price: Mapped[float | None] = mapped_column(Float)
    payment_method: Mapped[str | None] = mapped_column(Enum(PaymentMethod))
    merchant_name: Mapped[str | None] = mapped_column(String(255))
    merchant_type: Mapped[str | None] = mapped_column(Enum(MerchantType))
    invoice_number: Mapped[str | None] = mapped_column(String(255))
    seller_gstin: Mapped[str | None] = mapped_column(String(15))  # 15-char Indian GSTIN

    # ── Box contents & condition (service center checklist) ──────────────────
    box_contents: Mapped[str | None] = mapped_column(Text)  # JSON list: ["charger","cable","manual","earphones"]
    box_condition_verified: Mapped[bool] = mapped_column(Boolean, default=False)

    # ── Notes ────────────────────────────────────────────────────────────────
    notes: Mapped[str | None] = mapped_column(Text)

    # ── Timestamps ───────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ── Relationships ────────────────────────────────────────────────────────
    warranties: Mapped[list["Warranty"]] = relationship(back_populates="product", cascade="all, delete-orphan")
    attachments: Mapped[list["Attachment"]] = relationship(back_populates="product", cascade="all, delete-orphan")


# ─── Warranty (Tri-Warranty System) ─────────────────────────────────────────────

class Warranty(Base):
    """
    Each product can have multiple warranty records:
    - PRIMARY: Manufacturer's standard warranty (e.g., 1-year comprehensive).
    - EXTENDED: Third-party plans (Croma Maple, AppleCare+, Amazon Protect / Servify,
                Flipkart Protect, Samsung Care+, OnePlus Red Cable Care, etc.).
    - COMPONENT: Part-level warranties (10-year inverter compressor, replaced battery
                 warranty, screen replacement warranty, motor warranty, etc.).
    """
    __tablename__ = "warranties"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))

    warranty_type: Mapped[str] = mapped_column(Enum(WarrantyType))
    label: Mapped[str] = mapped_column(String(255))  # e.g., "Manufacturer Warranty", "Croma Maple", "Inverter Compressor"
    provider: Mapped[str | None] = mapped_column(String(255))  # e.g., "Samsung", "Croma", "Servify"

    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)

    status: Mapped[str] = mapped_column(Enum(WarrantyStatus), default=WarrantyStatus.UNKNOWN)

    # Extended warranty specifics
    policy_number: Mapped[str | None] = mapped_column(String(255))
    coverage_details: Mapped[str | None] = mapped_column(Text)  # What's covered / excluded

    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ── Relationship ─────────────────────────────────────────────────────────
    product: Mapped["Product"] = relationship(back_populates="warranties")


# ─── Attachment ─────────────────────────────────────────────────────────────────

class Attachment(Base):
    __tablename__ = "attachments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))

    file_type: Mapped[str] = mapped_column(Enum(AttachmentType))
    original_filename: Mapped[str] = mapped_column(String(512))
    storage_path: Mapped[str] = mapped_column(String(1024))
    mime_type: Mapped[str] = mapped_column(String(128))
    file_size_bytes: Mapped[int] = mapped_column(Integer)

    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # ── Relationship ─────────────────────────────────────────────────────────
    product: Mapped["Product"] = relationship(back_populates="attachments")
