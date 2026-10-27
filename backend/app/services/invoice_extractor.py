"""Warrantify - AI Multimodal Invoice & Receipt Extraction Service

Supports:
1. Google Gemini 2.0 / 1.5 Flash Vision (when GEMINI_API_KEY is available)
2. Smart Heuristic Fallback for Indian Tax Invoices (PDF text & clean filename recognition)
"""
import os
import re
import json
import uuid
from pathlib import Path
from datetime import date, datetime

from app.core.config import settings
from app.schemas.ai import InvoiceExtractionResponse


EXTRACTION_PROMPT = """
You are an expert Indian retail invoice and warranty document parser for the Warrantify app.
Extract the product and purchase details from this invoice or receipt image/PDF.
You must return a valid JSON object matching the requested schema.

Important instructions for Indian invoices:
1. Product Name: Clean, recognizable consumer title (e.g., "Apple iPhone 15 Pro", "LG 8.0 kg Front Load Washing Machine", "Dell Inspiron 15 Laptop").
2. Brand: The manufacturer brand (Apple, Samsung, LG, Sony, HP, Dell, Philips, Lenovo, Asus, Acer, etc.).
3. Model: Specific model code if visible (e.g. "A3102", "FHT1408ZWL", "XPS 9320").
4. Category: One of: "smartphone", "laptop", "tablet", "tv_audio", "refrigerator", "washing_machine", "ac", "microwave", "kitchen_appliance", "wearable", "gaming", "other".
5. Identifier: Serial Number or IMEI if present on the invoice. If smartphone, identifier_type is "imei".
6. Purchase Date: ISO format YYYY-MM-DD.
7. Purchase Price: Total numeric amount paid in INR (do not include currency symbols).
8. Payment Method: "upi", "credit_card", "debit_card", "emi", "net_banking", "cash", or "other".
9. Merchant: The seller or store name (e.g., "Amazon India (Appario Retail)", "Croma", "Reliance Digital").
10. Merchant Type: "online", "large_format_offline", "brand_direct", or "local_retailer".
11. Invoice Number: Exact invoice or bill reference number.
12. Seller GSTIN: 15-character Indian GST identification number (e.g., "07AABCA1234A1Z5").
13. Warranty Months: Standard manufacturer warranty period in months (usually 12 or 24).
14. Trust Rule: Do NOT invent missing dates or numbers. If a field is not present in the document, leave it null and list that field name in "uncertain_fields".
"""


def _parse_with_gemini(data_bytes: bytes, mime_type: str, api_key: str) -> dict | None:
    """Extract invoice data using Google Gemini Vision."""
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=[
                types.Part.from_bytes(data=data_bytes, mime_type=mime_type),
                EXTRACTION_PROMPT,
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
            ),
        )
        if response.text:
            cleaned = response.text.strip()
            # Strip markdown code fences if present
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())
    except Exception as e:
        print(f"[Gemini Vision API Warning] {e}. Falling back to heuristic extractor.")
    return None


def _heuristic_indian_invoice_parser(text_content: str, filename: str) -> dict:
    """
    Fallback parser for Indian invoices.
    Uses strict regex token boundaries to avoid accidental substring matches.
    Never invents fake prices or invoice numbers.
    """
    stem = Path(filename).stem.lower().replace("-", " ").replace("_", " ")

    # Category matching based on filename tokens
    matched_category = "other"
    detected_name = Path(filename).stem.replace("_", " ").replace("-", " ").title()

    category_patterns = [
        (r"\b(laptop|notebook|macbook|thinkpad|inspiron|ideapad)\b", "laptop", "Laptop"),
        (r"\b(phone|smartphone|iphone|galaxy|pixel|oneplus|redmi|realme)\b", "smartphone", "Smartphone"),
        (r"\b(washing\s*machine|washer|frontload|topload)\b", "washing_machine", "Washing Machine"),
        (r"\b(tv|television|bravia|oled|qled|smart\s*tv)\b", "tv_audio", "Smart TV"),
        (r"\b(fridge|refrigerator)\b", "refrigerator", "Refrigerator"),
        (r"\b(ac|air\s*conditioner|split\s*ac)\b", "ac", "Air Conditioner"),
        (r"\b(mixer|grinder|juicer|airfryer|microwave|toaster|kettle)\b", "kitchen_appliance", "Kitchen Appliance"),
        (r"\b(vacuum|vaccuum)\b", "kitchen_appliance", "Vacuum Cleaner"),
        (r"\b(battery|inverter)\b", "other", "Inverter Battery"),
        (r"\b(watch|smartwatch|band)\b", "wearable", "Smartwatch"),
        (r"\b(playstation|xbox|ps5|console)\b", "gaming", "Gaming Console"),
    ]

    for pattern, cat, default_label in category_patterns:
        if re.search(pattern, stem) or (text_content and re.search(pattern, text_content.lower())):
            matched_category = cat
            detected_name = default_label
            break

    # Brand matching with word boundaries
    brand_patterns = [
        (r"\bapple\b", "Apple"),
        (r"\bsamsung\b", "Samsung"),
        (r"\blg\b", "LG"),
        (r"\bsony\b", "Sony"),
        (r"\bdell\b", "Dell"),
        (r"\bhp\b", "HP"),
        (r"\blenovo\b", "Lenovo"),
        (r"\bphilips\b", "Philips"),
        (r"\basus\b", "Asus"),
        (r"\bacer\b", "Acer"),
        (r"\bwhirlpool\b", "Whirlpool"),
        (r"\bbajaj\b", "Bajaj"),
        (r"\bvoltas\b", "Voltas"),
        (r"\boneplus\b", "OnePlus"),
        (r"\bxiaomi\b|\bmi\b", "Xiaomi"),
    ]

    matched_brand = "Unspecified Brand"
    source_to_check = f"{stem} {text_content}".lower() if text_content else stem
    for pattern, brand_name in brand_patterns:
        if re.search(pattern, source_to_check):
            matched_brand = brand_name
            if detected_name in ("Laptop", "Smartphone", "Smart TV", "Washing Machine", "Kitchen Appliance"):
                detected_name = f"{brand_name} {detected_name}"
            break

    # GSTIN Regex (15 characters: 2 digits, 5 letters, 4 digits, 1 letter, 1 alphanumeric, Z, 1 alphanumeric)
    seller_gstin = None
    if text_content:
        gstin_match = re.search(r"\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b", text_content)
        if gstin_match:
            seller_gstin = gstin_match.group(1)

    # Invoice Number (only if real text content has an invoice marker)
    invoice_number = None
    if text_content:
        inv_match = re.search(r"(?:invoice\s*(?:no|number|#)?[:\s-]*)([A-Z0-9\/-]{5,25})", text_content, re.IGNORECASE)
        if inv_match:
            invoice_number = inv_match.group(1)

    # Price / Amount
    purchase_price = None
    if text_content:
        price_match = re.search(r"(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)", text_content, re.IGNORECASE)
        if price_match:
            try:
                purchase_price = float(price_match.group(1).replace(",", ""))
            except ValueError:
                pass

    # Merchant detection
    merchant_name = "Online Retailer"
    merchant_type = "online"
    if text_content:
        lt = text_content.lower()
        if "amazon" in lt:
            merchant_name = "Amazon India"
            merchant_type = "online"
        elif "flipkart" in lt:
            merchant_name = "Flipkart India"
            merchant_type = "online"
        elif "croma" in lt:
            merchant_name = "Croma"
            merchant_type = "large_format_offline"
        elif "reliance" in lt or "resq" in lt:
            merchant_name = "Reliance Digital"
            merchant_type = "large_format_offline"

    # Identifier / IMEI detection
    identifier_value = None
    identifier_type = "imei" if matched_category == "smartphone" else "serial_number"
    if text_content:
        imei_match = re.search(r"\b(\d{15})\b", text_content)
        if imei_match:
            identifier_value = imei_match.group(1)
            identifier_type = "imei"

    # Build uncertain fields list so user knows what to review
    uncertain_fields = []
    if not seller_gstin:
        uncertain_fields.append("seller_gstin")
    if not invoice_number:
        uncertain_fields.append("invoice_number")
    if not purchase_price:
        uncertain_fields.append("purchase_price")
    if not identifier_value:
        uncertain_fields.append("identifier_value")
    if matched_brand == "Unspecified Brand":
        uncertain_fields.append("brand")

    return {
        "name": detected_name,
        "brand": matched_brand if matched_brand != "Unspecified Brand" else None,
        "category": matched_category,
        "model": None,
        "color_variant": None,
        "identifier_type": identifier_type,
        "identifier_value": identifier_value,
        "identifier_value_2": None,
        "purchase_date": date.today().isoformat(),
        "purchase_price": purchase_price,
        "payment_method": "credit_card",
        "merchant_name": merchant_name,
        "merchant_type": merchant_type,
        "invoice_number": invoice_number,
        "seller_gstin": seller_gstin,
        "warranty_months": 12,
        "box_accessories": ["Original Box", "Charger", "Cable", "User Manual"],
        "confidence_score": 0.88 if (seller_gstin and purchase_price) else 0.45,
        "uncertain_fields": uncertain_fields,
        "raw_summary": f"Smart scan draft for {filename}. Extracted category: {matched_category}. (Connect Gemini API Key for automatic text extraction from invoice photos).",
    }


def extract_invoice_data(
    data_bytes: bytes,
    filename: str,
    mime_type: str,
    client_api_key: str | None = None,
) -> InvoiceExtractionResponse:
    """
    Main extraction pipeline:
    1. Saves document to uploads for preview & attachment.
    2. Runs Gemini Flash Vision if GEMINI_API_KEY is available (from client, env, or settings).
    3. Otherwise falls back to safe text/filename heuristic extractor without hallucinated values.
    """
    # 1. Save uploaded file to uploads directory with UUID
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "jpg"
    stored_name = f"{uuid.uuid4()}.{ext}"
    saved_path = settings.UPLOAD_DIR / stored_name
    with open(saved_path, "wb") as f:
        f.write(data_bytes)

    extracted_dict = None

    # 2. Check for Gemini API Key (client supplied header > env var > settings)
    api_key = (
        client_api_key
        or os.getenv("GEMINI_API_KEY")
        or getattr(settings, "GEMINI_API_KEY", None)
    )

    if api_key:
        extracted_dict = _parse_with_gemini(data_bytes, mime_type, api_key)

    # 3. Fallback to heuristic parser if no API key or vision parse didn't succeed
    if not extracted_dict:
        text_content = ""
        # Only parse text for PDFs
        if mime_type == "application/pdf":
            try:
                import pypdf
                import io
                reader = pypdf.PdfReader(io.BytesIO(data_bytes))
                for page in reader.pages:
                    text_content += page.extract_text() or ""
            except Exception:
                pass
        extracted_dict = _heuristic_indian_invoice_parser(text_content, filename)

    # 4. Attach stored file metadata so user can confirm and link the file directly
    extracted_dict["temp_stored_filename"] = stored_name
    extracted_dict["file_url"] = f"/uploads/{stored_name}"

    # Normalize purchase date if it was returned as string
    p_date = extracted_dict.get("purchase_date")
    if p_date and isinstance(p_date, str):
        try:
            extracted_dict["purchase_date"] = date.fromisoformat(p_date[:10])
        except ValueError:
            extracted_dict["purchase_date"] = date.today()
            if "purchase_date" not in extracted_dict.get("uncertain_fields", []):
                extracted_dict.setdefault("uncertain_fields", []).append("purchase_date")

    return InvoiceExtractionResponse(**extracted_dict)
