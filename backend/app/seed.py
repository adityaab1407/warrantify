"""Seed script to populate Warrantify SQLite database with realistic Indian consumer products."""
from datetime import date, datetime, timedelta
import json

from app.core.database import SessionLocal, engine, Base
from app.models.product import (
    Product, Warranty, ProductCategory, IdentifierType,
    MerchantType, PaymentMethod, WarrantyType, WarrantyStatus
)


def compute_status(end_date: date | None) -> str:
    if not end_date:
        return WarrantyStatus.UNKNOWN.value
    today = date.today()
    if end_date < today:
        return WarrantyStatus.EXPIRED.value
    if (end_date - today).days <= 30:
        return WarrantyStatus.EXPIRING_SOON.value
    return WarrantyStatus.ACTIVE.value


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    existing = db.query(Product).first()
    if existing:
        print("Database already has records, skipping seed.")
        db.close()
        return

    today = date.today()

    sample_products = [
        {
            "product": Product(
                name="Apple iPhone 15 Pro (128GB, Blue Titanium)",
                category=ProductCategory.SMARTPHONE.value,
                brand="Apple",
                model="A3102",
                color_variant="Blue Titanium",
                identifier_type=IdentifierType.IMEI.value,
                identifier_value="354892091823901",
                identifier_value_2="354892091823902",
                purchase_date=today - timedelta(days=280),
                purchase_price=129900.0,
                payment_method=PaymentMethod.CREDIT_CARD.value,
                merchant_name="Amazon India (Appario Retail)",
                merchant_type=MerchantType.ONLINE.value,
                invoice_number="DEL4-8849201",
                seller_gstin="07AABCA1234A1Z5",
                box_contents=json.dumps(["Original Retail Box", "USB-C to C Braided Cable (1m)", "SIM Ejector Pin", "Apple Stickers"]),
                box_condition_verified=True,
                notes="Purchased during Great Indian Festival sale. Tempered glass & Spigen case applied from day 1.",
            ),
            "warranties": [
                Warranty(
                    warranty_type=WarrantyType.PRIMARY.value,
                    label="Apple 1-Year Limited Warranty",
                    provider="Apple India Pvt Ltd",
                    start_date=today - timedelta(days=280),
                    end_date=today + timedelta(days=85),
                    status=compute_status(today + timedelta(days=85)),
                    policy_number="APL-IN-99210",
                    coverage_details="Comprehensive hardware coverage and 90-day complimentary technical support.",
                ),
                Warranty(
                    warranty_type=WarrantyType.EXTENDED.value,
                    label="AppleCare+ with Accidental Damage",
                    provider="Apple / AIG India",
                    start_date=today - timedelta(days=280),
                    end_date=today + timedelta(days=450),
                    status=compute_status(today + timedelta(days=450)),
                    policy_number="AC-IND-8841920",
                    coverage_details="Unlimited incidents of accidental damage protection (screen repair at ₹2,500 deductible).",
                ),
                Warranty(
                    warranty_type=WarrantyType.COMPONENT.value,
                    label="Official Battery Replacement Warranty",
                    provider="Apple Authorized Service Provider (BKC)",
                    start_date=today - timedelta(days=60),
                    end_date=today + timedelta(days=30),
                    status=compute_status(today + timedelta(days=30)),
                    policy_number="SRV-BKC-33102",
                    coverage_details="90-day replacement parts warranty on genuine battery module.",
                ),
            ],
        },
        {
            "product": Product(
                name="LG 8.0 kg 5 Star Inverter AI Direct Drive Front Load Washing Machine",
                category=ProductCategory.WASHING_MACHINE.value,
                brand="LG",
                model="FHT1408ZWL",
                color_variant="Luxury Silver",
                identifier_type=IdentifierType.SERIAL_NUMBER.value,
                identifier_value="LG-WM-FHT1408-2024-9182",
                purchase_date=today - timedelta(days=320),
                purchase_price=38990.0,
                payment_method=PaymentMethod.UPI.value,
                merchant_name="Croma (Phoenix Mall, Mumbai)",
                merchant_type=MerchantType.LARGE_FORMAT_OFFLINE.value,
                invoice_number="CR-MUM-2024-9102",
                seller_gstin="27AAACT2727Q1ZW",
                box_contents=json.dumps(["Inlet Hose", "Drain Hose", "Transit Bolt Spanner", "Anti-Rat Bottom Plate", "Manual"]),
                box_condition_verified=True,
                notes="Free installation completed by LG technician. Demo recorded.",
            ),
            "warranties": [
                Warranty(
                    warranty_type=WarrantyType.PRIMARY.value,
                    label="LG 2-Year Comprehensive Brand Warranty",
                    provider="LG Electronics India",
                    start_date=today - timedelta(days=320),
                    end_date=today + timedelta(days=410),
                    status=compute_status(today + timedelta(days=410)),
                    policy_number="LG-COMP-772910",
                    coverage_details="Full machine parts and technician labor coverage against manufacturing defects.",
                ),
                Warranty(
                    warranty_type=WarrantyType.EXTENDED.value,
                    label="Croma ZipCare Protect Advanced",
                    provider="Croma / Infiniti Retail Ltd",
                    start_date=today + timedelta(days=411),
                    end_date=today + timedelta(days=1141),
                    status=compute_status(today + timedelta(days=1141)),
                    policy_number="ZIP-CR-WM-99401",
                    coverage_details="2-year extended warranty post manufacturer expiry with zero depreciation on parts.",
                ),
                Warranty(
                    warranty_type=WarrantyType.COMPONENT.value,
                    label="10-Year Direct Drive Motor Warranty",
                    provider="LG Electronics India",
                    start_date=today - timedelta(days=320),
                    end_date=today + timedelta(days=3330),
                    status=compute_status(today + timedelta(days=3330)),
                    policy_number="LG-MOTOR-INV-10Y",
                    coverage_details="Covers inverter DD motor stator, rotor, and drive mechanism against electrical/mechanical failure.",
                ),
            ],
        },
        {
            "product": Product(
                name="Sony Bravia 55\" 4K Ultra HD Smart Google TV",
                category=ProductCategory.TV_AUDIO.value,
                brand="Sony",
                model="KD-55X74L",
                color_variant="Black",
                identifier_type=IdentifierType.SERIAL_NUMBER.value,
                identifier_value="SNY-55X74L-882049",
                purchase_date=today - timedelta(days=350),
                purchase_price=57990.0,
                payment_method=PaymentMethod.CREDIT_CARD.value,
                merchant_name="Reliance Digital",
                merchant_type=MerchantType.LARGE_FORMAT_OFFLINE.value,
                invoice_number="RD-BLR-004812",
                seller_gstin="29AAACR7055K1Z8",
                box_contents=json.dumps(["Tabletop Stand", "Smart Voice Remote", "AAA Batteries", "Power Cord", "Wall Bracket"]),
                box_condition_verified=True,
                notes="Wall mounted by Reliance resQ team. Wall bracket included free in box.",
            ),
            "warranties": [
                Warranty(
                    warranty_type=WarrantyType.PRIMARY.value,
                    label="Sony 1-Year Comprehensive Warranty",
                    provider="Sony India Pvt Ltd",
                    start_date=today - timedelta(days=350),
                    end_date=today + timedelta(days=15),  # Expiring soon (<30 days)
                    status=compute_status(today + timedelta(days=15)),
                    policy_number="SNY-W-9912",
                    coverage_details="Complete parts and on-site technician service across India.",
                ),
                Warranty(
                    warranty_type=WarrantyType.COMPONENT.value,
                    label="2-Year Display Panel Warranty",
                    provider="Sony India Pvt Ltd",
                    start_date=today - timedelta(days=350),
                    end_date=today + timedelta(days=380),
                    status=compute_status(today + timedelta(days=380)),
                    policy_number="SNY-PNL-2Y",
                    coverage_details="Special extended panel warranty on 4K LCD matrix against line defects / dead pixels.",
                ),
            ],
        },
        {
            "product": Product(
                name="Apple MacBook Air 13\" (M2 Chip, 8GB, 256GB SSD)",
                category=ProductCategory.LAPTOP.value,
                brand="Apple",
                model="A2681",
                color_variant="Midnight",
                identifier_type=IdentifierType.SERIAL_NUMBER.value,
                identifier_value="C02G901KMD6M",
                purchase_date=today - timedelta(days=780),
                purchase_price=94900.0,
                payment_method=PaymentMethod.NET_BANKING.value,
                merchant_name="Maple Authorized Apple Reseller",
                merchant_type=MerchantType.BRAND_DIRECT.value,
                invoice_number="MPL-BND-44129",
                seller_gstin="27AABCM8291P1ZK",
                box_contents=json.dumps(["30W USB-C Power Adapter", "USB-C to MagSafe 3 Cable (Midnight 2m)", "Apple Stickers"]),
                box_condition_verified=True,
                notes="Used for college and dev work. Battery health at 92%.",
            ),
            "warranties": [
                Warranty(
                    warranty_type=WarrantyType.PRIMARY.value,
                    label="Apple 1-Year Limited Warranty",
                    provider="Apple India Pvt Ltd",
                    start_date=today - timedelta(days=780),
                    end_date=today - timedelta(days=415),  # Expired
                    status=compute_status(today - timedelta(days=415)),
                    policy_number="APL-MAC-2681",
                    coverage_details="Standard 1-year hardware warranty against defects.",
                ),
                Warranty(
                    warranty_type=WarrantyType.EXTENDED.value,
                    label="Maple Extended Care Plan (1 Year)",
                    provider="Maple Reseller Services",
                    start_date=today - timedelta(days=415),
                    end_date=today - timedelta(days=50),  # Expired
                    status=compute_status(today - timedelta(days=50)),
                    policy_number="MPL-EXT-44210",
                    coverage_details="1 additional year coverage on motherboard and display.",
                ),
            ],
        },
        {
            "product": Product(
                name="Philips Daily Collection Air Fryer (4.1L)",
                category=ProductCategory.KITCHEN_APPLIANCE.value,
                brand="Philips",
                model="HD9216/80",
                color_variant="White & Grey",
                identifier_type=IdentifierType.SERIAL_NUMBER.value,
                identifier_value="PH-AF-HD9216-9921",
                purchase_date=today - timedelta(days=45),
                purchase_price=6499.0,
                payment_method=PaymentMethod.UPI.value,
                merchant_name="Amazon India",
                merchant_type=MerchantType.ONLINE.value,
                invoice_number="DEL8-220194",
                seller_gstin="07AABCA1234A1Z5",
                box_contents=json.dumps(["Airfryer Base Unit", "QuickClean Fry Basket", "Recipe Book", "Quick Start Guide"]),
                box_condition_verified=True,
                notes="Registered on Philips MyPhilips portal for warranty confirmation.",
            ),
            "warranties": [
                Warranty(
                    warranty_type=WarrantyType.PRIMARY.value,
                    label="Philips 2-Year Worldwide Guarantee",
                    provider="Philips Domestic Appliances India",
                    start_date=today - timedelta(days=45),
                    end_date=today + timedelta(days=685),
                    status=compute_status(today + timedelta(days=685)),
                    policy_number="PH-WW-99120",
                    coverage_details="Covers heating coil, thermostat, and fan motor against defects.",
                ),
            ],
        },
    ]

    for item in sample_products:
        prod = item["product"]
        for w in item["warranties"]:
            prod.warranties.append(w)
        db.add(prod)

    db.commit()
    print(f"Successfully seeded {len(sample_products)} sample products with tri-warranty records!")
    db.close()


if __name__ == "__main__":
    seed()

