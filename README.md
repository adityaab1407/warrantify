# Warrantify (वॉरंटीफ़ाई) 🛡️
> **Everything you own, completely organized.**
> An intelligent ownership hub and tri-warranty tracker designed for everyday consumers in India.

---

## 🌟 Key Features

1. **The 3 Named Warranties (No generic "tiers")**:
   - **Manufacturer's Warranty**: Standard 1–2 year comprehensive brand coverage direct from Apple, Samsung, LG, Sony, etc.
   - **Extended Warranty**: Third-party or retailer protection plans (e.g. Croma ZipCare, AppleCare+, Reliance resQ, Samsung Care+, Servify, Flipkart Protect).
   - **Additional Warranty**: Dedicated part & component coverage (e.g. 10-Year Inverter Compressor/Motor on home appliances, 90-day replaced battery/screen warranty).

2. **Official Service-Center Ready Dossier**:
   - Generates an instant handover sheet for official service centers (Samsung Care, Apple BKC/Saket, LG Direct, Voltas, Croma).
   - **1-Click Copy**: IMEI 1, IMEI 2 (Dual SIM), Serial Number, Invoice Number, and Seller 15-character GSTIN.
   - **Box & Accessories Checklist**: Verifies preserved original packaging, cables, adapters, transit bolts, and accessories.
   - **Proof of Purchase**: Records merchant name, store type (Online, Large-Format Offline, Local Retailer, Brand Direct), amount, and payment mode (UPI, Credit Card, EMI).

3. **2026 Modular, Vibrant UI**:
   - Bright consumer-tech aesthetic with soft ambient glows, rounded-3xl cards, and fluid filters.
   - Real-time search by product name, brand, model, IMEI, serial number, invoice, or seller.
   - Category filtering with micro-badges (Smartphones, Laptops, Appliances, TV & Audio, Kitchen).
   - Instant 30-day expiry countdown alerts.

---

## 🛠️ Tech Architecture

```
warrantify/
├── frontend/             # Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Lucide Icons
│   ├── src/app/          # Main ownership hub, analytics, filter strip
│   ├── src/components/   # Product cards, Service Dossier modal, Add Device Dialog
│   └── src/lib/          # API fetchers with automatic /api/* rewrite proxy to backend
├── backend/              # Python FastAPI, SQLAlchemy 2.0, Pydantic v2
│   ├── app/models/       # Relational schema (Product, Warranty, Attachment)
│   ├── app/api/v1/       # REST CRUD & file upload endpoints
│   ├── app/seed.py       # Seed script with realistic Indian consumer electronics
│   └── uploads/          # Local storage for receipts/invoices
├── docs/                 # Strategic blueprint, scoping docs, decisions
├── dev.sh                # Single-command launcher for SteamOS / Linux dev
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Launch Dev Servers (Single Command)
Run the automated dev launcher from the repository root:
```bash
./dev.sh
```
This will automatically:
- Load Node.js LTS via NVM
- Activate `.warrantify_venv`
- Start FastAPI backend at `http://127.0.0.1:8000` (with live reload)
- Start Next.js frontend at `http://localhost:3000`
- Handle clean shutdown of both processes on `Ctrl + C`

### 2. Seeding Sample Data
To populate the hub with realistic sample Indian devices (iPhone 15 Pro, LG DirectDrive Washing Machine, Sony Bravia 55", MacBook Air M2, Philips Airfryer):
```bash
source .warrantify_venv/bin/activate
python3 -m app.seed   # (run from backend/ directory)
```

---

## 📋 API Health & Docs
- **FastAPI Interactive Docs**: `http://127.0.0.1:8000/docs`
- **Health Check Endpoint**: `http://127.0.0.1:8000/api/v1/health`
- **Products API**: `http://127.0.0.1:8000/api/v1/products`
