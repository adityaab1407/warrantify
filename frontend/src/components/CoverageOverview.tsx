"use client";

import React from "react";
import { Product } from "@/types/product";
import {
  ShieldCheck,
  Clock,
  Sparkles,
  IndianRupee,
  Layers,
  Wrench,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CoverageOverviewProps {
  products: Product[];
}

export function CoverageOverview({ products }: CoverageOverviewProps) {
  const totalValue = products.reduce((acc, p) => acc + (p.purchase_price || 0), 0);

  let manufacturerCount = 0;
  let extendedCount = 0;
  let additionalCount = 0;
  let activeCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;

  products.forEach((p) => {
    p.warranties.forEach((w) => {
      if (w.warranty_type === "primary") manufacturerCount++;
      else if (w.warranty_type === "extended") extendedCount++;
      else if (w.warranty_type === "component") additionalCount++;

      if (w.status === "active") activeCount++;
      else if (w.status === "expiring_soon") expiringSoonCount++;
      else if (w.status === "expired") expiredCount++;
    });
  });

  return (
    <div className="space-y-4 mb-8">
      {/* Expiring Soon Alert Banner (if any) */}
      {expiringSoonCount > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300/40 dark:border-amber-700/40 p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
              <Clock className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                Action Required: {expiringSoonCount} {expiringSoonCount === 1 ? "warranty is" : "warranties are"} expiring in the next 30 days
              </h4>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Check eligible renewal options or inspect device health before coverage lapses.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 text-xs font-semibold">
            Expiring Soon
          </span>
        </div>
      )}

      {/* 4 Catchy 2026 Metric Hero Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Asset Value */}
        <div className="relative group overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/5 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-800/80 dark:text-emerald-400">
              Portfolio Value
            </span>
            <div className="h-9 w-9 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              ₹{totalValue.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">{products.length} registered items</span>
              <span>under management</span>
            </p>
          </div>
        </div>

        {/* Card 2: Manufacturer's Warranties */}
        <div className="relative group overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-blue-500/10 via-white to-indigo-500/5 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-blue-800/80 dark:text-blue-400">
              Manufacturer&apos;s
            </span>
            <div className="h-9 w-9 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-blue-600 dark:text-blue-400">
              {manufacturerCount}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Official brand standard warranties
            </p>
          </div>
        </div>

        {/* Card 3: Extended Warranties */}
        <div className="relative group overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-purple-500/10 via-white to-pink-500/5 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-purple-950/20 border border-purple-200/50 dark:border-purple-900/30 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-purple-800/80 dark:text-purple-400">
              Extended Care
            </span>
            <div className="h-9 w-9 rounded-2xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-purple-600 dark:text-purple-400">
              {extendedCount}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Croma ZipCare, AppleCare+, resQ
            </p>
          </div>
        </div>

        {/* Card 4: Additional Warranties */}
        <div className="relative group overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-amber-500/10 via-white to-orange-500/5 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider uppercase text-amber-800/80 dark:text-amber-400">
              Additional Parts
            </span>
            <div className="h-9 w-9 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Wrench className="h-5 w-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-amber-600 dark:text-amber-400">
              {additionalCount}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Motor, compressor, battery &amp; panels
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

