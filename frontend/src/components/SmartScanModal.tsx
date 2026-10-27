"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Product, ProductCategory, IdentifierType, MerchantType, PaymentMethod } from "@/types/product";
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Hash,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Eye,
} from "lucide-react";

interface ExtractedData {
  name: string;
  category: ProductCategory;
  brand: string | null;
  model: string | null;
  color_variant: string | null;
  identifier_type: IdentifierType;
  identifier_value: string | null;
  identifier_value_2: string | null;
  purchase_date: string | null;
  purchase_price: number | null;
  payment_method: PaymentMethod | null;
  merchant_name: string | null;
  merchant_type: MerchantType | null;
  invoice_number: string | null;
  seller_gstin: string | null;
  warranty_months: number | null;
  box_accessories: string[];
  confidence_score: number;
  uncertain_fields: string[];
  raw_summary: string | null;
  temp_stored_filename: string | null;
  file_url: string | null;
}

interface SmartScanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmProduct: (productData: Partial<Product>, storedFilename?: string) => Promise<void>;
}

export function SmartScanModal({
  open,
  onOpenChange,
  onConfirmProduct,
}: SmartScanModalProps) {
  const [step, setStep] = useState<"upload" | "scanning" | "review">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [saving, setSaving] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const saveGeminiKey = async () => {
    if (!apiKeyInput.trim()) return;
    try {
      const res = await fetch("/api/v1/ai/configure-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gemini_api_key: apiKeyInput.trim() }),
      });
      if (res.ok) {
        setKeySaved(true);
        setTimeout(() => setShowKeyConfig(false), 1500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetState = () => {
    setStep("upload");
    setFile(null);
    setPreviewUrl(null);
    setExtracted(null);
    setSaving(false);
  };

  const handleFileSelected = async (selectedFile: File) => {
    setFile(selectedFile);
    if (selectedFile.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }

    setStep("scanning");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/v1/ai/extract-invoice", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data: ExtractedData = await res.json();
      setExtracted(data);
      setStep("review");
    } catch (err: any) {
      console.error("AI Scan failed", err);
      alert("Scan failed. You can register the product manually.");
      setStep("upload");
    }
  };

  const handleSave = async () => {
    if (!extracted) return;
    setSaving(true);
    try {
      const pDate = extracted.purchase_date ? new Date(extracted.purchase_date) : new Date();
      const mfgEnd = new Date(pDate);
      mfgEnd.setMonth(mfgEnd.getMonth() + (extracted.warranty_months || 12));

      const warranties = [
        {
          warranty_type: "primary" as const,
          label: `${extracted.brand || "Manufacturer"} Standard Warranty`,
          provider: extracted.brand ? `${extracted.brand} Authorized Service` : "Manufacturer",
          start_date: extracted.purchase_date || new Date().toISOString().split("T")[0],
          end_date: mfgEnd.toISOString().split("T")[0],
          status: "active" as const,
        },
      ];

      await onConfirmProduct(
        {
          name: extracted.name,
          category: extracted.category,
          brand: extracted.brand,
          model: extracted.model,
          color_variant: extracted.color_variant,
          identifier_type: extracted.identifier_type,
          identifier_value: extracted.identifier_value,
          identifier_value_2: extracted.identifier_value_2,
          purchase_date: extracted.purchase_date,
          purchase_price: extracted.purchase_price,
          payment_method: extracted.payment_method,
          merchant_name: extracted.merchant_name,
          merchant_type: extracted.merchant_type,
          invoice_number: extracted.invoice_number,
          seller_gstin: extracted.seller_gstin,
          box_contents: JSON.stringify(extracted.box_accessories || ["Original Box", "Cable"]),
          box_condition_verified: true,
          warranties: warranties as any,
        },
        extracted.temp_stored_filename || undefined
      );

      onOpenChange(false);
      resetState();
    } catch (err) {
      console.error(err);
      alert("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  const isFieldUncertain = (field: string) => {
    return extracted?.uncertain_fields?.includes(field);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
        if (!val) resetState();
      }}
    >
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl p-6 font-sans">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              AI Multimodal Receipt Scanner
            </span>
            <span className="text-xs text-zinc-400 font-medium">Milestone 2</span>
          </div>
          <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-white">
            Smart Invoice Ingestion
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Upload any Indian purchase receipt or GST tax invoice (Amazon, Flipkart, Croma, Reliance, Apple, etc.) to auto-populate your ownership records.
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: UPLOAD DROPZONE */}
        {step === "upload" && (
          <div className="py-8 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer rounded-3xl border-2 border-dashed border-indigo-300 dark:border-indigo-900/60 hover:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 p-10 text-center transition-all flex flex-col items-center justify-center space-y-3"
            >
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="h-8 w-8 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-base font-bold text-zinc-900 dark:text-white">
                  Click to upload invoice or drag &amp; drop
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Supports PDF tax invoices, JPEG photos, PNG screenshots (up to 15MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 text-xs text-zinc-500">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Private &amp; Secure:</strong> Invoices are stored in your local folder.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
              >
                {showKeyConfig ? "Hide API Key" : "⚡ Connect Gemini API Key"}
              </button>
            </div>

            {showKeyConfig && (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-zinc-900 border border-indigo-200 dark:border-indigo-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    Google Gemini 2.0 Flash Vision Key
                  </span>
                  {keySaved && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Saved!
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Enables 100% automated OCR from photo scans, extracting serial numbers, prices, and GSTINs.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy..."
                    className="rounded-xl h-9 text-xs bg-white dark:bg-zinc-800"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={saveGeminiKey}
                    className="h-9 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                  >
                    Save Key
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SCANNING ANIMATION */}
        {step === "scanning" && (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/25 animate-pulse">
                <Sparkles className="h-10 w-10 animate-spin" />
              </div>
              <div className="absolute -inset-2 bg-indigo-500/20 rounded-3xl blur-md animate-ping pointer-events-none" />
            </div>
            <div>
              <h3 className="font-black text-lg text-zinc-900 dark:text-white">
                Reading Invoice &amp; Verifying Fields...
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Extracting merchant GSTIN, invoice number, purchase date, IMEI/serials, and warranty duration.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === "review" && extracted && (
          <div className="space-y-5 pt-3">
            {/* Confidence & Review Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-300/40 dark:border-emerald-900/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Extraction Completed ({(extracted.confidence_score * 100).toFixed(0)}% Confidence)
                  </h4>
                  <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                    Please review the extracted details below before saving to Warrantify.
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white border-0">Review Ready</Badge>
            </div>

            {/* If any field is uncertain */}
            {extracted.uncertain_fields && extracted.uncertain_fields.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-300/50 dark:border-amber-900/40 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Attention:</strong> Some fields ({extracted.uncertain_fields.join(", ")}) were missing or faint on the invoice. You can edit them below.
                </span>
              </div>
            )}

            {/* Extracted Fields Form / Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold">Product Name</Label>
                <Input
                  value={extracted.name}
                  onChange={(e) => setExtracted({ ...extracted, name: e.target.value })}
                  className="rounded-xl h-10 text-sm font-semibold"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Brand</Label>
                <Input
                  value={extracted.brand || ""}
                  onChange={(e) => setExtracted({ ...extracted, brand: e.target.value })}
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">
                  {extracted.identifier_type === "imei" ? "IMEI Number" : "Serial Number"}
                  {isFieldUncertain("identifier_value") && (
                    <span className="text-amber-500 text-[10px] ml-1.5 font-normal">(unconfirmed)</span>
                  )}
                </Label>
                <Input
                  value={extracted.identifier_value || ""}
                  placeholder="Enter serial or IMEI if found on device/box"
                  onChange={(e) => setExtracted({ ...extracted, identifier_value: e.target.value })}
                  className="rounded-xl h-10 text-sm font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Category</Label>
                <select
                  value={extracted.category}
                  onChange={(e) => setExtracted({ ...extracted, category: e.target.value as ProductCategory })}
                  className="w-full h-10 text-xs rounded-xl border border-input bg-transparent px-3 py-1 shadow-sm font-medium"
                >
                  <option value="smartphone">Smartphone</option>
                  <option value="laptop">Laptop / PC</option>
                  <option value="tablet">Tablet / iPad</option>
                  <option value="tv_audio">TV &amp; Audio</option>
                  <option value="washing_machine">Washing Machine</option>
                  <option value="refrigerator">Refrigerator</option>
                  <option value="ac">Air Conditioner</option>
                  <option value="kitchen_appliance">Kitchen Appliance</option>
                  <option value="wearable">Smartwatch / Wearable</option>
                  <option value="gaming">Gaming Console</option>
                  <option value="other">Other Device</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Merchant Name</Label>
                <Input
                  value={extracted.merchant_name || ""}
                  onChange={(e) => setExtracted({ ...extracted, merchant_name: e.target.value })}
                  className="rounded-xl h-10 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">
                  Seller GSTIN
                  {isFieldUncertain("seller_gstin") && (
                    <span className="text-amber-500 text-[10px] ml-1.5 font-normal">(unconfirmed)</span>
                  )}
                </Label>
                <Input
                  value={extracted.seller_gstin || ""}
                  placeholder="15-character GSTIN"
                  onChange={(e) => setExtracted({ ...extracted, seller_gstin: e.target.value })}
                  className="rounded-xl h-10 text-sm font-mono uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Invoice Number</Label>
                <Input
                  value={extracted.invoice_number || ""}
                  onChange={(e) => setExtracted({ ...extracted, invoice_number: e.target.value })}
                  className="rounded-xl h-10 text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Purchase Date</Label>
                  <Input
                    type="date"
                    value={extracted.purchase_date || ""}
                    onChange={(e) => setExtracted({ ...extracted, purchase_date: e.target.value })}
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">Amount (₹)</Label>
                  <Input
                    type="number"
                    value={extracted.purchase_price || ""}
                    onChange={(e) => setExtracted({ ...extracted, purchase_price: parseFloat(e.target.value) || null })}
                    className="rounded-xl h-10 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Standard Warranty Prediction */}
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-blue-950 dark:text-blue-200">
                  Manufacturer&apos;s Warranty: {extracted.warranty_months || 12} Months
                </span>
              </div>
              <span className="text-blue-700 dark:text-blue-300 font-medium">Standard Brand Coverage</span>
            </div>
          </div>
        )}

        <DialogFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl h-10 px-4 text-xs font-semibold"
          >
            Cancel
          </Button>

          {step === "review" && (
            <Button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-xl h-10 px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 gap-2"
            >
              <span>{saving ? "Saving Device..." : "Confirm & Save to Warrantify"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
