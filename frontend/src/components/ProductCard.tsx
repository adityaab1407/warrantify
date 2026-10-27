"use client";

import React, { useState } from "react";
import { Product, ProductCategory, Warranty, getWarrantyDisplayName } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Laptop,
  Tv,
  Refrigerator,
  Microwave,
  Watch,
  Gamepad,
  Sparkles,
  Layers,
  Copy,
  Check,
  Building2,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Paperclip,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Package,
  Wrench,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  onOpenDocket: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({
  product,
  onOpenDocket,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [copiedId, setCopiedId] = useState(false);

  const getCategoryTheme = (category: ProductCategory) => {
    switch (category) {
      case "smartphone":
      case "tablet":
        return {
          icon: <Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          bg: "bg-blue-500/10 border-blue-200/60 dark:border-blue-900/40",
          accent: "text-blue-600 dark:text-blue-400",
        };
      case "laptop":
        return {
          icon: <Laptop className="h-5 w-5 text-sky-600 dark:text-sky-400" />,
          bg: "bg-sky-500/10 border-sky-200/60 dark:border-sky-900/40",
          accent: "text-sky-600 dark:text-sky-400",
        };
      case "tv_audio":
        return {
          icon: <Tv className="h-5 w-5 text-violet-600 dark:text-violet-400" />,
          bg: "bg-violet-500/10 border-violet-200/60 dark:border-violet-900/40",
          accent: "text-violet-600 dark:text-violet-400",
        };
      case "refrigerator":
      case "washing_machine":
      case "ac":
        return {
          icon: <Refrigerator className="h-5 w-5 text-teal-600 dark:text-teal-400" />,
          bg: "bg-teal-500/10 border-teal-200/60 dark:border-teal-900/40",
          accent: "text-teal-600 dark:text-teal-400",
        };
      case "kitchen_appliance":
      case "microwave":
        return {
          icon: <Microwave className="h-5 w-5 text-amber-600 dark:text-amber-400" />,
          bg: "bg-amber-500/10 border-amber-200/60 dark:border-amber-900/40",
          accent: "text-amber-600 dark:text-amber-400",
        };
      default:
        return {
          icon: <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />,
          bg: "bg-purple-500/10 border-purple-200/60 dark:border-purple-900/40",
          accent: "text-purple-600 dark:text-purple-400",
        };
    }
  };

  const copyIdentifier = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.identifier_value) {
      navigator.clipboard.writeText(product.identifier_value);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const theme = getCategoryTheme(product.category);

  // Group warranties by their 3 types
  const manufacturerWarranty = product.warranties.find((w) => w.warranty_type === "primary");
  const extendedWarranty = product.warranties.find((w) => w.warranty_type === "extended");
  const additionalWarranties = product.warranties.filter((w) => w.warranty_type === "component");

  // Determine overall status
  const hasExpiringSoon = product.warranties.some((w) => w.status === "expiring_soon");
  const hasActive = product.warranties.some((w) => w.status === "active");

  const overallStatusBadge = () => {
    if (hasExpiringSoon) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60 animate-pulse">
          <Clock className="h-3.5 w-3.5" />
          Expiring Soon
        </span>
      );
    }
    if (hasActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          Covered
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-200/80 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        Expired
      </span>
    );
  };

  return (
    <div className="group relative rounded-3xl p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-indigo-300/80 dark:hover:border-indigo-800/80 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Accent Glow on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="space-y-4">
        {/* Header Row: Category Badge + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${theme.bg}`}>
              {theme.icon}
            </div>
            <div>
              <span className="text-[11px] font-extrabold tracking-wider uppercase text-zinc-400 block">
                {product.brand || "Device"}
              </span>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 font-mono">
                {product.model || product.category.replace("_", " ")}
              </span>
            </div>
          </div>
          <div>{overallStatusBadge()}</div>
        </div>

        {/* Product Title & Variant */}
        <div>
          <h3 className="font-bold text-base text-zinc-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {product.name}
          </h3>
          {product.color_variant && (
            <span className="text-xs font-medium text-zinc-400">Variant: {product.color_variant}</span>
          )}
        </div>

        {/* Hardware Identifier (IMEI or Serial) */}
        {product.identifier_value && (
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400 uppercase font-mono text-[10px] font-bold">
              <span>{product.identifier_type === "imei" ? "IMEI 1" : "SERIAL"}</span>
            </div>
            <button
              onClick={copyIdentifier}
              className="font-mono font-medium text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 hover:text-indigo-600 transition-colors"
              title="Copy to clipboard"
            >
              <span>{product.identifier_value}</span>
              {copiedId ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600" />
              )}
            </button>
          </div>
        )}

        {/* ─── Modular Tri-Warranty Cards ─────────────────────────────────────── */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-indigo-500" />
            <span>Warranty Protections</span>
          </div>

          <div className="space-y-1.5">
            {/* 1. Manufacturer's Warranty */}
            {manufacturerWarranty ? (
              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-blue-950 dark:text-blue-200 block text-[11px]">
                      Manufacturer&apos;s Warranty
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[170px] block">
                      {manufacturerWarranty.label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    manufacturerWarranty.status === "active"
                      ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
                      : manufacturerWarranty.status === "expiring_soon"
                      ? "text-amber-800 bg-amber-100 dark:bg-amber-950 dark:text-amber-300"
                      : "text-zinc-600 bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}>
                    {manufacturerWarranty.status === "expiring_soon"
                      ? "Expiring Soon"
                      : manufacturerWarranty.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    {manufacturerWarranty.end_date || "N/A"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-1.5 px-3">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span>No Manufacturer&apos;s Warranty recorded</span>
              </div>
            )}

            {/* 2. Extended Warranty */}
            {extendedWarranty && (
              <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-[10px]">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-purple-950 dark:text-purple-200 block text-[11px]">
                      Extended Warranty
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[170px] block">
                      {extendedWarranty.label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    extendedWarranty.status === "active"
                      ? "text-purple-700 bg-purple-100 dark:bg-purple-950 dark:text-purple-300"
                      : "text-zinc-600 bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}>
                    {extendedWarranty.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    {extendedWarranty.end_date || "N/A"}
                  </span>
                </div>
              </div>
            )}

            {/* 3. Additional Warranty (Component / Parts) */}
            {additionalWarranties.map((aw, idx) => (
              <div
                key={aw.id || idx}
                className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-[10px]">
                    <Wrench className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-950 dark:text-amber-200 block text-[11px]">
                      Additional Warranty
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[170px] block">
                      {aw.label}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300">
                    {aw.status.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    {aw.end_date || "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase & Invoice Snippet */}
        <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 truncate max-w-[160px]">
            <Building2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{product.merchant_name || "Merchant unlisted"}</span>
          </div>
          <div className="flex items-center gap-2">
            {product.attachments && product.attachments.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded-md">
                <Paperclip className="h-3 w-3" />
                {product.attachments.length}
              </span>
            )}
            <span className="font-bold text-zinc-900 dark:text-white">
              {product.purchase_price ? `₹${product.purchase_price.toLocaleString("en-IN")}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-4 mt-2 flex items-center justify-between gap-2 border-t border-zinc-100 dark:border-zinc-800/80">
        <Button
          size="sm"
          className="flex-1 h-9 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold gap-2 shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
          onClick={() => onOpenDocket(product)}
        >
          <ShieldAlert className="h-4 w-4 text-indigo-200" />
          <span>Claim Warranty</span>
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(product);
          }}
          title="Edit product details"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Remove ${product.name} from your list?`)) {
              onDelete(product.id);
            }
          }}
          title="Delete product"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
