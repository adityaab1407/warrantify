"use client";

import React from "react";
import { ShieldCheck, Plus, Sparkles, Smartphone, Laptop, Tv, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  onAddClick: () => void;
  onScanClick: () => void;
  backendOnline: boolean | null;
  totalProducts: number;
}

export function AppHeader({ onAddClick, onScanClick, backendOnline, totalProducts }: AppHeaderProps) {
  return (
    <header className="border-b border-zinc-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-30 dark:border-zinc-800/80 dark:bg-zinc-950/70 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-2xl blur-sm opacity-60 group-hover:opacity-90 transition duration-300" />
            <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="h-6 w-6 stroke-[2.3]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-800 dark:from-white dark:via-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent">
                Warrantify
              </span>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                Hub 2026
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:flex items-center gap-1.5 mt-0.5">
              <span>Smart ownership, invoices &amp; warranty management</span>
              <span className="inline-block h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{totalProducts} active items</span>
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {backendOnline !== null && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100/70 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-xs">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  backendOnline ? "bg-emerald-500 shadow-sm shadow-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span className="font-medium text-zinc-600 dark:text-zinc-400">
                {backendOnline ? "FastAPI Sync Active" : "Local Mode"}
              </span>
            </div>
          )}

          <Button
            variant="outline"
            onClick={onScanClick}
            className="h-10 px-3.5 rounded-xl border-indigo-200/80 dark:border-indigo-900/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 font-bold gap-1.5 text-xs sm:text-sm tracking-wide hidden sm:inline-flex"
          >
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <span>Smart Scan</span>
          </Button>

          <Button
            onClick={onAddClick}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 font-semibold gap-2 text-xs sm:text-sm tracking-wide transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

