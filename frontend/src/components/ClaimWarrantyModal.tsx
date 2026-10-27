"use client";

import React, { useState, useRef, useMemo } from "react";
import { Product, Attachment, getWarrantyDisplayName } from "@/types/product";
import { uploadAttachment, deleteAttachment } from "@/lib/api";
import { getBrandSupportInfo } from "@/lib/supportDirectory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  Mail,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Upload,
  Download,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Info,
  HelpCircle,
  Paperclip,
  Wrench,
  Package,
} from "lucide-react";

interface ClaimWarrantyModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated?: (updated: Product) => void;
}

export function ClaimWarrantyModal({
  product,
  open,
  onOpenChange,
  onProductUpdated,
}: ClaimWarrantyModalProps) {
  const [activeView, setActiveView] = useState<"claim" | "checklist" | "documents">("claim");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileType, setFileType] = useState("invoice");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Claim Drafter States
  const [selectedIssue, setSelectedIssue] = useState<string>("");
  const [customProblem, setCustomProblem] = useState<string>("");

  // Interactive Checklist States
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    invoice: true,
    serial: true,
    accessories: true,
    condition: true,
  });

  const supportInfo = useMemo(() => {
    if (!product) return null;
    return getBrandSupportInfo(product.brand, product.merchant_name);
  }, [product]);

  if (!product) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedChecksCount = Object.values(checkedItems).filter(Boolean).length;

  // Active warranty summary
  const primaryWarranty = product.warranties.find((w) => w.warranty_type === "primary");
  const extendedWarranty = product.warranties.find((w) => w.warranty_type === "extended");
  const componentWarranty = product.warranties.find((w) => w.warranty_type === "component");

  const effectiveWarranty = extendedWarranty || primaryWarranty || componentWarranty;

  // Generate support message draft
  const problemStatement = customProblem.trim()
    ? customProblem.trim()
    : selectedIssue || "Hardware malfunction requiring diagnosis under warranty.";

  const draftSubject = `Warranty Claim Request: ${product.brand || "Device"} ${product.name} [Serial: ${product.identifier_value || "N/A"}]`;

  const draftBody = `Dear ${supportInfo?.brand || product.brand || "Customer Care"} Team,

I am writing to formally request warranty service support for my registered product.

DEVICE SPECIFICATIONS & PURCHASE DETAILS:
- Product: ${product.name}
- Brand / Model: ${product.brand || "N/A"} - ${product.model || "N/A"}
- ${product.identifier_type === "imei" ? "IMEI Number" : "Serial Number"}: ${product.identifier_value || "N/A"}
- Purchase Date: ${product.purchase_date || "N/A"}
- Invoice Number: ${product.invoice_number || "N/A"}
- Seller / Store: ${product.merchant_name || "N/A"} (GSTIN: ${product.seller_gstin || "N/A"})
- Active Warranty: ${effectiveWarranty ? getWarrantyDisplayName(effectiveWarranty.warranty_type) : "Standard Warranty"} (Valid until: ${effectiveWarranty?.end_date || "N/A"})

ISSUE DESCRIPTION:
${problemStatement}

CLAIM READINESS VERIFICATION:
- Proof of Purchase (Tax Invoice): Preserved and ready for verification
- Serial Number on Unit: Intact and matching invoice
- Physical Condition: Standard usage without unauthorized repair or liquid ingress
- Box & Packaging: ${product.box_condition_verified ? "Available with standard accessories" : "Device available"}

Please inform me of the nearest authorized service center or arrange an on-site technician visit / RMA pickup at your earliest convenience.

Kind regards,
Owner of ${product.name}
Contact Reference: Generated via Warrantify Hub`;

  const mailtoUrl = supportInfo?.email
    ? `mailto:${supportInfo.email}?subject=${encodeURIComponent(draftSubject)}&body=${encodeURIComponent(draftBody)}`
    : `mailto:?subject=${encodeURIComponent(draftSubject)}&body=${encodeURIComponent(draftBody)}`;

  const whatsappUrl = supportInfo?.whatsapp
    ? `https://wa.me/${supportInfo.whatsapp}?text=${encodeURIComponent(draftBody)}`
    : undefined;

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
    if (!confirm("Delete this document?")) return;
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl p-6 bg-white dark:bg-zinc-950 font-sans">
        {/* Modal Header */}
        <DialogHeader className="space-y-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60">
              <ShieldAlert className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Claim Warranty &amp; Support Hub
            </span>
            <div className="flex items-center gap-2">
              {effectiveWarranty && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  effectiveWarranty.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                }`}>
                  <Clock className="h-3 w-3" />
                  {effectiveWarranty.status === "active" ? "Under Active Warranty" : "Expiring Soon"}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                {product.name}
              </DialogTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                {product.brand || "Brand"} · {product.model || product.category.replace("_", " ")}
                {product.identifier_value && (
                  <span className="ml-2 inline-flex items-center gap-1 font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-[11px]">
                    {product.identifier_type.toUpperCase()}: {product.identifier_value}
                    <button
                      onClick={() => copyToClipboard(product.identifier_value!, "id")}
                      className="ml-1 hover:text-indigo-600"
                      title="Copy serial"
                    >
                      {copiedKey === "id" ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </span>
                )}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl mt-1">
          <button
            onClick={() => setActiveView("claim")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeView === "claim"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Draft Claim Message &amp; Contacts</span>
          </button>

          <button
            onClick={() => setActiveView("checklist")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeView === "checklist"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Claim Checklist ({completedChecksCount}/4)</span>
          </button>

          <button
            onClick={() => setActiveView("documents")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeView === "documents"
                ? "bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Paperclip className="h-3.5 w-3.5" />
            <span>Invoices &amp; Proofs ({product.attachments?.length || 0})</span>
          </button>
        </div>

        {/* VIEW 1: DRAFT CLAIM & CONTACTS */}
        {activeView === "claim" && (
          <div className="space-y-5 pt-2">
            {/* Direct Official Contact Channels */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-purple-50/50 dark:from-zinc-900 dark:via-indigo-950/20 dark:to-zinc-900 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100/80 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md shadow-indigo-500/20">
                    {supportInfo?.brand.slice(0, 2).toUpperCase() || "SC"}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-zinc-900 dark:text-white">
                      Official {supportInfo?.brand || product.brand} Support
                    </h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {supportInfo?.serviceHours || "Authorized Warranty Service Support"}
                    </p>
                  </div>
                </div>

                {supportInfo?.portalUrl && (
                  <a
                    href={supportInfo.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Portal</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Action Buttons: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3">
                <a
                  href={`tel:${supportInfo?.tollFree || "18001000000"}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <PhoneCall className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                        Toll-Free Call
                      </span>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono">
                        {supportInfo?.tollFreeDisplay || "1800 100 0000"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-emerald-500 transition-colors" />
                </a>

                <a
                  href={mailtoUrl}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
                        Official Support Email
                      </span>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white truncate max-w-[170px] block">
                        {supportInfo?.email || "support@brand.com"}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-indigo-500 transition-colors" />
                </a>
              </div>
            </div>

            {/* Smart Support Message Drafter */}
            <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    AI Warranty Message Drafter
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Select your exact issue to formulate a formal claim letter with invoice and serial proofs.
                  </p>
                </div>
              </div>

              {/* Quick Problem Selector Chips */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-500">Common Issues:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(supportInfo?.commonIssues || []).map((issue, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedIssue(issue);
                        setCustomProblem(issue);
                      }}
                      className={`text-[11px] px-3 py-1.5 rounded-xl font-medium transition-all ${
                        selectedIssue === issue
                          ? "bg-indigo-600 text-white shadow-sm font-bold"
                          : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400"
                      }`}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Problem Textarea */}
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-zinc-500">
                  Or describe what is happening in your own words:
                </label>
                <Textarea
                  value={customProblem}
                  onChange={(e) => setCustomProblem(e.target.value)}
                  placeholder="e.g., Device screen started flickering with horizontal green lines after powering on. Battery drains within 20 minutes."
                  className="rounded-xl text-xs min-h-[70px] bg-white dark:bg-zinc-800"
                />
              </div>

              {/* Formatted Preview Box */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                    Generated Claim Letter (Ready to Send):
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2.5 rounded-lg text-xs font-bold gap-1"
                      onClick={() => copyToClipboard(draftBody, "draft")}
                    >
                      {copiedKey === "draft" ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </Button>

                    <a
                      href={mailtoUrl}
                      className="inline-flex items-center gap-1 h-7 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
                    >
                      <Mail className="h-3 w-3" />
                      <span>Open in Email</span>
                    </a>

                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 h-7 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800 text-[11px] font-mono text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                  {draftBody}
                </div>
              </div>
            </div>

            {/* Quick Summary of Active Policies */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 block">
                Active Warranty Coverage for this Claim
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.warranties.map((w, idx) => (
                  <div
                    key={w.id || idx}
                    className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 block">
                        {getWarrantyDisplayName(w.warranty_type)}
                      </span>
                      <span className="text-xs font-bold text-zinc-900 dark:text-white">
                        {w.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        Valid till: {w.end_date || "N/A"}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {w.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: CLAIM READINESS CHECKLIST */}
        {activeView === "checklist" && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-300/40 dark:border-emerald-900/40 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200">
                  Pre-Service Inspection Checklist
                </h4>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Service centers in India require these 4 items to honor warranty repairs without denial.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white">
                {completedChecksCount}/4 Ready
              </span>
            </div>

            <div className="space-y-2.5">
              {/* Check 1 */}
              <div
                onClick={() => toggleCheck("invoice")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  checkedItems.invoice
                    ? "bg-white dark:bg-zinc-800/80 border-emerald-300/80 dark:border-emerald-700/60 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-60"
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md ${checkedItems.invoice ? "bg-emerald-600 text-white" : "border border-zinc-300 text-transparent"}`}>
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      1. Official GST Tax Invoice or Purchase Receipt
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Invoice #{product.invoice_number || "Recorded"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Authorized centers (Apple, Samsung, Croma, LG) strictly require the invoice to verify purchase date and GST identification.
                  </p>
                </div>
              </div>

              {/* Check 2 */}
              <div
                onClick={() => toggleCheck("serial")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  checkedItems.serial
                    ? "bg-white dark:bg-zinc-800/80 border-emerald-300/80 dark:border-emerald-700/60 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-60"
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md ${checkedItems.serial ? "bg-emerald-600 text-white" : "border border-zinc-300 text-transparent"}`}>
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      2. Hardware Serial Number / IMEI Matches Invoice
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {product.identifier_value || "Verified"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Ensure the serial label on the back/bottom of your device or in software settings is readable and matches the invoice.
                  </p>
                </div>
              </div>

              {/* Check 3 */}
              <div
                onClick={() => toggleCheck("accessories")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  checkedItems.accessories
                    ? "bg-white dark:bg-zinc-800/80 border-emerald-300/80 dark:border-emerald-700/60 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-60"
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md ${checkedItems.accessories ? "bg-emerald-600 text-white" : "border border-zinc-300 text-transparent"}`}>
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      3. Original Retail Box &amp; Mandatory Accessories
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {product.box_condition_verified ? "Box Verified" : "Accessories"}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    If device replacement or DOA (Dead on Arrival) exchange is claimed, the original packaging, power adapter, and cables are required.
                  </p>
                </div>
              </div>

              {/* Check 4 */}
              <div
                onClick={() => toggleCheck("condition")}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  checkedItems.condition
                    ? "bg-white dark:bg-zinc-800/80 border-emerald-300/80 dark:border-emerald-700/60 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-60"
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-md ${checkedItems.condition ? "bg-emerald-600 text-white" : "border border-zinc-300 text-transparent"}`}>
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      4. Unit Inspection: No Liquid Damage or Third-Party Tampering
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      Policy Compliant
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Standard manufacturer warranty does not cover water corrosion or unauthorized opening. Confirm the Liquid Contact Indicator (LCI) is white/silver.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: INVOICES & PROOFS */}
        {activeView === "documents" && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                  Attached Invoices &amp; Warranty Proofs
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Uploaded bills and warranty cards attached to this unit.
                </p>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
              />

              <Button
                size="sm"
                className="rounded-xl h-8 px-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{uploading ? "Uploading..." : "Attach Document"}</span>
              </Button>
            </div>

            {/* List of attachments */}
            {product.attachments && product.attachments.length > 0 ? (
              <div className="space-y-2">
                {product.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white truncate block">
                          {att.original_filename || "Document"}
                        </span>
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                          {att.file_type} {att.file_size_bytes ? `· ${Math.round(att.file_size_bytes / 1024)} KB` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={att.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 h-8 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-indigo-600 transition-colors shadow-sm"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View</span>
                      </a>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-zinc-400 hover:text-rose-600 rounded-xl"
                        onClick={() => handleDeleteAttachment(att.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <FileText className="h-8 w-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  No invoices attached yet
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Click &apos;Attach Document&apos; to store your PDF or image bill for easy access during warranty claims.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
