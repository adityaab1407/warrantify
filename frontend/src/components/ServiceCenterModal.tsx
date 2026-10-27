"use client";

import React, { useState, useRef } from "react";
import { Product, Attachment, getWarrantyDisplayName } from "@/types/product";
import { uploadAttachment, deleteAttachment } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  Building2,
  Calendar,
  CreditCard,
  Package,
  FileText,
  Hash,
  Sparkles,
  ShieldCheck,
  Wrench,
  CheckCircle2,
  QrCode,
  Share2,
  Upload,
  Download,
  Trash2,
  ExternalLink,
  File,
} from "lucide-react";

interface ServiceCenterModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated?: (updated: Product) => void;
}

export function ServiceCenterModal({
  product,
  open,
  onOpenChange,
  onProductUpdated,
}: ServiceCenterModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState("invoice");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!product) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploading(true);
    try {
      const newAttachment = await uploadAttachment(product.id, file, fileType);
      const updatedProduct: Product = {
        ...product,
        attachments: [...(product.attachments || []), newAttachment],
      };
      if (onProductUpdated) onProductUpdated(updatedProduct);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error(err);
      alert(`Upload failed: ${err.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!confirm("Remove this document?")) return;
    try {
      await deleteAttachment(product.id, attachmentId);
      const updatedProduct: Product = {
        ...product,
        attachments: (product.attachments || []).filter((a) => a.id !== attachmentId),
      };
      if (onProductUpdated) onProductUpdated(updatedProduct);
    } catch (err) {
      console.error(err);
      alert("Failed to delete attachment.");
    }
  };

  const boxItems: string[] = product.box_contents
    ? (() => {
        try {
          return JSON.parse(product.box_contents);
        } catch {
          return [];
        }
      })()
    : [];

  const copyAllSummary = () => {
    const summary = `
WARRANTIFY AUTHORIZED SERVICE DOSSIER
=====================================
Device: ${product.name}
Brand / Model: ${product.brand || "N/A"} - ${product.model || "N/A"} (${product.color_variant || "Standard"})
${product.identifier_type === "imei" ? "IMEI 1 (Primary)" : product.identifier_type.toUpperCase()}: ${product.identifier_value || "N/A"}
${product.identifier_value_2 ? `IMEI 2 (Dual SIM): ${product.identifier_value_2}\n` : ""}
PURCHASE & GST VERIFICATION
---------------------------
Invoice No: ${product.invoice_number || "N/A"}
Seller GSTIN: ${product.seller_gstin || "N/A"}
Merchant: ${product.merchant_name || "N/A"} (${product.merchant_type?.replace("_", " ").toUpperCase() || "N/A"})
Purchase Date: ${product.purchase_date || "N/A"}
Price Paid: ₹${product.purchase_price?.toLocaleString("en-IN") || "N/A"}
Payment Method: ${product.payment_method?.toUpperCase() || "N/A"}

PHYSICAL BOX & ACCESSORIES HANDOVER
-----------------------------------
Original Box Preserved: ${product.box_condition_verified ? "YES (Verified)" : "NO"}
Included Items: ${boxItems.join(", ") || "Device only"}

WARRANTY POLICIES
-----------------
${product.warranties
  .map(
    (w) =>
      `• [${getWarrantyDisplayName(w.warranty_type).toUpperCase()}] ${w.label}
  Provider: ${w.provider || "N/A"} | Valid Till: ${w.end_date || "N/A"} | Status: ${w.status.toUpperCase()}
  ${w.policy_number ? `Policy No: ${w.policy_number}` : ""}`
  )
  .join("\n")}
    `.trim();

    copyToClipboard(summary, "all");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto sm:rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl p-6">
        <DialogHeader className="space-y-1.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
              <ShieldCheck className="h-3.5 w-3.5" />
              Service Center Dossier
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Ref: {product.id.slice(0, 8)}
            </span>
          </div>
          <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-white">
            {product.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Official handover data for Apple Care, Samsung Service, LG Direct, Croma ZipCare, and authorized service centers across India.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-3">
          {/* Quick Copy Action Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-200/50 dark:border-indigo-900/40 flex items-center justify-between gap-3 shadow-sm">
            <div>
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 block">
                Official Claim Dossier Ready
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Copy all required service numbers with a single click.
              </span>
            </div>
            <Button
              size="sm"
              className="h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-indigo-500/20"
              onClick={copyAllSummary}
            >
              {copiedKey === "all" ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300" />
                  Copied Full Dossier
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Dossier
                </>
              )}
            </Button>
          </div>

          {/* Section 1: Device Identifiers */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5 text-blue-500" />
              Hardware Identifiers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                    {product.identifier_type === "imei" ? "IMEI 1 (Primary)" : product.identifier_type.replace("_", " ")}
                  </span>
                  <p className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {product.identifier_value || "Not recorded"}
                  </p>
                </div>
                {product.identifier_value && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-800"
                    onClick={() => copyToClipboard(product.identifier_value!, "id1")}
                  >
                    {copiedKey === "id1" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>

              {product.identifier_value_2 && (
                <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">
                      IMEI 2 (Dual SIM / eSIM)
                    </span>
                    <p className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                      {product.identifier_value_2}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-800"
                    onClick={() => copyToClipboard(product.identifier_value_2!, "id2")}
                  >
                    {copiedKey === "id2" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Invoice & GST Proof */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-indigo-500" />
              Invoice &amp; Indian GST Verification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Invoice Number</span>
                  <p className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                    {product.invoice_number || "Not recorded"}
                  </p>
                </div>
                {product.invoice_number && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-800"
                    onClick={() => copyToClipboard(product.invoice_number!, "inv")}
                  >
                    {copiedKey === "inv" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>

              <div className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Seller GSTIN</span>
                  <p className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 uppercase">
                    {product.seller_gstin || "Not recorded"}
                  </p>
                </div>
                {product.seller_gstin && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-xl text-zinc-400 hover:text-zinc-800"
                    onClick={() => copyToClipboard(product.seller_gstin!, "gst")}
                  >
                    {copiedKey === "gst" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
              <div className="p-3 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-xl">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Merchant</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate block mt-0.5">
                  {product.merchant_name || "N/A"}
                </span>
              </div>
              <div className="p-3 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-xl">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Purchase Date</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mt-0.5">
                  {product.purchase_date || "N/A"}
                </span>
              </div>
              <div className="p-3 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-xl">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Amount Paid</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 block mt-0.5">
                  {product.purchase_price ? `₹${product.purchase_price.toLocaleString("en-IN")}` : "N/A"}
                </span>
              </div>
              <div className="p-3 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-xl">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Payment Mode</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase block mt-0.5">
                  {product.payment_method || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: The 3 Named Warranties */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Registered Warranties ({product.warranties.length})
            </h4>

            <div className="space-y-2">
              {product.warranties.map((w, idx) => (
                <div
                  key={w.id || idx}
                  className="p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          w.warranty_type === "primary"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : w.warranty_type === "extended"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {getWarrantyDisplayName(w.warranty_type)}
                      </span>
                      <span className="font-bold text-sm text-zinc-900 dark:text-white">
                        {w.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Provider: <strong className="text-zinc-700 dark:text-zinc-300">{w.provider || "Official"}</strong>
                      {w.policy_number && ` · Policy: ${w.policy_number}`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-100 dark:border-zinc-800">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-zinc-400 block uppercase font-bold">Valid Until</span>
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {w.end_date || "Unknown"}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        w.status === "active"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : w.status === "expiring_soon"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {w.status === "expiring_soon" ? "Expiring Soon" : w.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Box Accessories & Handover Checklist */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-purple-500" />
              Box &amp; Handover Accessories Checklist
            </h4>
            <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-600 dark:text-zinc-400 font-medium">Original Retail Packaging:</span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    product.box_condition_verified
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {product.box_condition_verified ? "Preserved (Verified)" : "Missing / Box Discarded"}
                </span>
              </div>

              {boxItems.length > 0 && (
                <div>
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1.5">
                    Items to Hand In with Unit:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {boxItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center text-xs px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium shadow-xs"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 5: Invoices & Attached Documents */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-500" />
                Attached Invoices &amp; Warranty Cards ({product.attachments?.length || 0})
              </h4>
            </div>

            {/* List of current attachments */}
            {product.attachments && product.attachments.length > 0 ? (
              <div className="space-y-2">
                {product.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <File className="h-4 w-4" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate block">
                          {att.original_filename}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                          <span className="uppercase font-semibold text-indigo-600 dark:text-indigo-400">
                            {att.file_type}
                          </span>
                          <span>•</span>
                          <span>{(att.file_size_bytes / 1024).toFixed(0)} KB</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {att.file_url && (
                        <a
                          href={att.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 px-2.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 inline-flex items-center gap-1"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>View</span>
                        </a>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        onClick={() => handleDeleteAttachment(att.id)}
                        title="Delete attachment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">No invoice or warranty card files attached yet.</p>
            )}

            {/* Quick Upload Box */}
            <div className="p-3.5 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="h-8 text-xs rounded-xl border border-input bg-white dark:bg-zinc-900 px-2 font-medium"
                >
                  <option value="invoice">Invoice / Receipt</option>
                  <option value="warranty_card">Warranty Card</option>
                  <option value="extended_warranty_doc">Extended Care Policy</option>
                  <option value="service_report">Service Report</option>
                  <option value="manual">User Manual</option>
                </select>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id={`file-upload-${product.id}`}
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={uploading}
                className="h-8 rounded-xl text-xs font-bold gap-1.5 w-full sm:w-auto"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5 text-blue-500" />
                <span>{uploading ? "Uploading..." : "Attach Document"}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
