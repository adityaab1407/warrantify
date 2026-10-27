"""Warrantify - Product CRUD API endpoints"""
import uuid
import os
from pathlib import Path
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.core.database import get_db
from app.core.config import settings
from app.models.product import (
    Product, Warranty, Attachment, WarrantyStatus, WarrantyType, AttachmentType,
)
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
    WarrantyCreate, WarrantyUpdate, WarrantyResponse,
    AttachmentResponse,
)

router = APIRouter(prefix="/products", tags=["products"])


# ─── Helpers ─────────────────────────────────────────────────────────────────────

def _compute_warranty_status(end_date: date | None) -> WarrantyStatus:
    """Compute warranty status from end date."""
    if end_date is None:
        return WarrantyStatus.UNKNOWN
    today = date.today()
    if end_date < today:
        return WarrantyStatus.EXPIRED
    days_remaining = (end_date - today).days
    if days_remaining <= 30:
        return WarrantyStatus.EXPIRING_SOON
    return WarrantyStatus.ACTIVE


def _enrich_product(product: Product) -> Product:
    """Calculate dynamic fields like warranty status and attachment URLs."""
    for w in product.warranties:
        w.status = _compute_warranty_status(w.end_date).value
    for att in product.attachments:
        filename = Path(att.storage_path).name
        att.file_url = f"/uploads/{filename}"
    return product


def _get_product_or_404(product_id: str, db: Session) -> Product:
    product = (
        db.query(Product)
        .options(joinedload(Product.warranties), joinedload(Product.attachments))
        .filter(Product.id == product_id, Product.user_id == settings.DEFAULT_USER_ID)
        .first()
    )
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# ─── CRUD ────────────────────────────────────────────────────────────────────────

@router.get("", response_model=ProductListResponse)
def list_products(
    search: str | None = Query(None, description="Search by name, brand, model, or invoice number"),
    category: str | None = Query(None),
    warranty_status: str | None = Query(None, description="Filter by warranty status across any warranty"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List all products with optional filters."""
    query = (
        db.query(Product)
        .options(joinedload(Product.warranties), joinedload(Product.attachments))
        .filter(Product.user_id == settings.DEFAULT_USER_ID)
    )

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.brand.ilike(search_term),
                Product.model.ilike(search_term),
                Product.invoice_number.ilike(search_term),
                Product.merchant_name.ilike(search_term),
            )
        )

    if category:
        query = query.filter(Product.category == category)

    # Get total before pagination
    total = query.count()

    products = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).unique().all()

    # Recompute warranty statuses & attachment URLs
    for product in products:
        _enrich_product(product)

    return ProductListResponse(products=products, total=total)


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
):
    """Create a product with optional inline warranties and optional scanned invoice attachment."""
    product = Product(
        user_id=settings.DEFAULT_USER_ID,
        **data.model_dump(exclude={"warranties", "initial_attachment_filename", "initial_attachment_original_name"}),
    )

    for w_data in data.warranties:
        warranty = Warranty(
            **w_data.model_dump(),
            status=_compute_warranty_status(w_data.end_date).value,
        )
        product.warranties.append(warranty)

    if data.initial_attachment_filename:
        file_path = settings.UPLOAD_DIR / data.initial_attachment_filename
        if file_path.exists():
            size_bytes = file_path.stat().st_size
            ext = file_path.suffix.lstrip(".").lower()
            mime = "application/pdf" if ext == "pdf" else f"image/{ext}" if ext in ("jpg", "jpeg", "png", "webp") else "application/octet-stream"
            att = Attachment(
                product_id=product.id,
                file_type="invoice",
                original_filename=data.initial_attachment_original_name or "Scanned_Invoice." + ext,
                storage_path=str(file_path),
                mime_type=mime,
                file_size_bytes=size_bytes,
            )
            product.attachments.append(att)

    db.add(product)
    db.commit()
    db.refresh(product)
    return _enrich_product(product)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    """Get a single product with all warranties and attachments."""
    product = _get_product_or_404(product_id, db)
    return _enrich_product(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    data: ProductUpdate,
    db: Session = Depends(get_db),
):
    """Partially update product fields."""
    product = _get_product_or_404(product_id, db)
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return _enrich_product(product)


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    """Delete a product and all related warranties and attachments."""
    product = _get_product_or_404(product_id, db)
    db.delete(product)
    db.commit()


# ─── Warranty sub-routes ─────────────────────────────────────────────────────────

@router.post("/{product_id}/warranties", response_model=WarrantyResponse, status_code=201)
def add_warranty(
    product_id: str,
    data: WarrantyCreate,
    db: Session = Depends(get_db),
):
    """Add a warranty record (primary, extended, or component) to a product."""
    _get_product_or_404(product_id, db)
    warranty = Warranty(
        product_id=product_id,
        **data.model_dump(),
        status=_compute_warranty_status(data.end_date).value,
    )
    db.add(warranty)
    db.commit()
    db.refresh(warranty)
    return warranty


@router.put("/{product_id}/warranties/{warranty_id}", response_model=WarrantyResponse)
def update_warranty(
    product_id: str,
    warranty_id: str,
    data: WarrantyUpdate,
    db: Session = Depends(get_db),
):
    """Update a specific warranty record."""
    _get_product_or_404(product_id, db)
    warranty = db.query(Warranty).filter(Warranty.id == warranty_id, Warranty.product_id == product_id).first()
    if not warranty:
        raise HTTPException(status_code=404, detail="Warranty not found")
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(warranty, field, value)
    warranty.status = _compute_warranty_status(warranty.end_date).value
    db.commit()
    db.refresh(warranty)
    return warranty


@router.delete("/{product_id}/warranties/{warranty_id}", status_code=204)
def delete_warranty(
    product_id: str,
    warranty_id: str,
    db: Session = Depends(get_db),
):
    """Delete a specific warranty record."""
    warranty = db.query(Warranty).filter(Warranty.id == warranty_id, Warranty.product_id == product_id).first()
    if not warranty:
        raise HTTPException(status_code=404, detail="Warranty not found")
    db.delete(warranty)
    db.commit()


# ─── Attachment upload ───────────────────────────────────────────────────────────

@router.post("/{product_id}/attachments", response_model=AttachmentResponse, status_code=201)
async def upload_attachment(
    product_id: str,
    file: UploadFile = File(...),
    file_type: str = Form(default="invoice"),
    db: Session = Depends(get_db),
):
    """Upload a file (invoice, warranty card, manual, photo, etc.) to a product."""
    _get_product_or_404(product_id, db)

    # Validate MIME type
    if file.content_type not in settings.ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{file.content_type}' not allowed. Accepted: {settings.ALLOWED_MIME_TYPES}",
        )

    # Read and check size
    contents = await file.read()
    size_bytes = len(contents)
    if size_bytes > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB limit")

    # Save to disk with UUID filename
    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "bin"
    stored_name = f"{uuid.uuid4()}.{ext}"
    file_path = settings.UPLOAD_DIR / stored_name
    with open(file_path, "wb") as f:
        f.write(contents)

    attachment = Attachment(
        product_id=product_id,
        file_type=file_type,
        original_filename=file.filename or "unknown",
        storage_path=str(file_path),
        mime_type=file.content_type or "application/octet-stream",
        file_size_bytes=size_bytes,
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    attachment.file_url = f"/uploads/{stored_name}"
    return attachment


@router.delete("/{product_id}/attachments/{attachment_id}", status_code=204)
def delete_attachment(
    product_id: str,
    attachment_id: str,
    db: Session = Depends(get_db),
):
    """Delete a specific attachment and remove its file from disk."""
    _get_product_or_404(product_id, db)
    attachment = (
        db.query(Attachment)
        .filter(Attachment.id == attachment_id, Attachment.product_id == product_id)
        .first()
    )
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")

    if os.path.exists(attachment.storage_path):
        try:
            os.remove(attachment.storage_path)
        except OSError:
            pass

    db.delete(attachment)
    db.commit()
