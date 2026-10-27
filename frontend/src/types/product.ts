export type ProductCategory =
  | "smartphone"
  | "laptop"
  | "tablet"
  | "tv_audio"
  | "refrigerator"
  | "washing_machine"
  | "ac"
  | "microwave"
  | "kitchen_appliance"
  | "personal_care"
  | "wearable"
  | "gaming"
  | "other";

export type IdentifierType = "serial_number" | "imei" | "product_key" | "none";

export type MerchantType =
  | "online"
  | "large_format_offline"
  | "local_retailer"
  | "brand_direct";

export type PaymentMethod =
  | "upi"
  | "credit_card"
  | "debit_card"
  | "net_banking"
  | "emi"
  | "cash"
  | "wallet"
  | "other";

// Warranty Types:
// 1. primary: Manufacturer's Warranty
// 2. extended: Extended Warranty (Croma ZipCare, AppleCare+, Reliance resQ, Servify, etc.)
// 3. component: Additional Warranty (10-Yr Motor/Compressor, replaced battery, panel, etc.)
export type WarrantyType = "primary" | "extended" | "component";

export type WarrantyStatus = "active" | "expiring_soon" | "expired" | "unknown";

export interface Warranty {
  id: string;
  product_id?: string;
  warranty_type: WarrantyType;
  label: string;
  provider?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status: WarrantyStatus;
  policy_number?: string | null;
  coverage_details?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Attachment {
  id: string;
  product_id?: string;
  file_type: string;
  original_filename: string;
  storage_path: string;
  file_url?: string;
  mime_type: string;
  file_size_bytes: number;
  uploaded_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: ProductCategory;
  brand?: string | null;
  model?: string | null;
  color_variant?: string | null;
  identifier_type: IdentifierType;
  identifier_value?: string | null;
  identifier_value_2?: string | null;
  purchase_date?: string | null;
  purchase_price?: number | null;
  payment_method?: PaymentMethod | null;
  merchant_name?: string | null;
  merchant_type?: MerchantType | null;
  invoice_number?: string | null;
  seller_gstin?: string | null;
  box_contents?: string | null;
  box_condition_verified: boolean;
  notes?: string | null;
  warranties: Warranty[];
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export function getWarrantyDisplayName(type: WarrantyType): string {
  switch (type) {
    case "primary":
      return "Manufacturer's Warranty";
    case "extended":
      return "Extended Warranty";
    case "component":
      return "Additional Warranty";
    default:
      return "Warranty";
  }
}
