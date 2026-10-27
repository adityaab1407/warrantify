"use client";

import React, { useState, useEffect } from "react";
import { Product, ProductCategory } from "@/types/product";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  checkBackendHealth,
} from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";
import { CoverageOverview } from "@/components/CoverageOverview";
import { ProductCard } from "@/components/ProductCard";
import { ClaimWarrantyModal } from "@/components/ClaimWarrantyModal";
import { AddProductDialog } from "@/components/AddProductDialog";
import { EditProductDialog } from "@/components/EditProductDialog";
import { SmartScanModal } from "@/components/SmartScanModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Sparkles,
  RefreshCw,
  PlusCircle,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [activeDocketProduct, setActiveDocketProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const health = await checkBackendHealth();
      setBackendOnline(health !== null);

      const res = await fetchProducts();
      setProducts(res.products || []);
    } catch (err) {
      console.warn("Could not reach backend API:", err);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (payload: Partial<Product>) => {
    const created = await createProduct(payload);
    setProducts((prev) => [created, ...prev]);
  };

  const handleConfirmScannedProduct = async (
    payload: Partial<Product>,
    storedFilename?: string
  ) => {
    const fullPayload: any = {
      ...payload,
      initial_attachment_filename: storedFilename,
      initial_attachment_original_name: storedFilename
        ? "Scanned_Invoice." + storedFilename.split(".").pop()
        : "Scanned_Invoice.jpg",
    };
    const created = await createProduct(fullPayload);
    setProducts((prev) => [created, ...prev]);
  };

  const handleUpdate = async (id: string, payload: Partial<Product>) => {
    const updated = await updateProduct(id, payload);
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    if (activeDocketProduct && activeDocketProduct.id === id) {
      setActiveDocketProduct(updated);
    }
  };

  const handleProductUpdated = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (activeDocketProduct && activeDocketProduct.id === updated.id) {
      setActiveDocketProduct(updated);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete item.");
    }
  };

  // Filter products by search, category, and warranty status
  const filteredProducts = products.filter((p) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.model && p.model.toLowerCase().includes(q)) ||
        (p.invoice_number && p.invoice_number.toLowerCase().includes(q)) ||
        (p.identifier_value && p.identifier_value.toLowerCase().includes(q)) ||
        (p.merchant_name && p.merchant_name.toLowerCase().includes(q));
      if (!matches) return false;
    }

    // Category
    if (selectedCategory !== "all") {
      if (selectedCategory === "appliances") {
        if (!["washing_machine", "refrigerator", "ac"].includes(p.category)) return false;
      } else if (p.category !== selectedCategory) {
        return false;
      }
    }

    // Status (checks across all warranties)
    if (selectedStatus !== "all") {
      const hasStatus = p.warranties.some((w) => w.status === selectedStatus);
      if (!hasStatus) return false;
    }

    return true;
  });

  const categories = [
    { id: "all", label: "All Items", icon: "✨" },
    { id: "smartphone", label: "Smartphones", icon: "📱" },
    { id: "laptop", label: "Laptops / PCs", icon: "💻" },
    { id: "appliances", label: "Appliances", icon: "🌀" },
    { id: "tv_audio", label: "TV & Audio", icon: "📺" },
    { id: "kitchen_appliance", label: "Kitchen", icon: "🍳" },
  ];

  const statuses = [
    { id: "all", label: "All Statuses" },
    { id: "active", label: "Active Only" },
    { id: "expiring_soon", label: "Expiring Soon (<30d)" },
    { id: "expired", label: "Expired" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 flex flex-col">
      <AppHeader
        onAddClick={() => setAddDialogOpen(true)}
        onScanClick={() => setScanModalOpen(true)}
        backendOnline={backendOnline}
        totalProducts={products.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Banner with Modern 2026 Vibes */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl shadow-indigo-500/15 mb-8">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/20">
                <ShieldCheck className="h-3.5 w-3.5" />
                Comprehensive Warranty Protection
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Everything you own, completely organized.
              </h1>
              <p className="text-sm text-indigo-100 leading-relaxed">
                Track <strong>Manufacturer&apos;s</strong>, <strong>Extended</strong>, and <strong>Additional</strong> warranties alongside invoices and official service dossiers.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setScanModalOpen(true)}
                className="h-11 px-5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 font-extrabold text-xs sm:text-sm backdrop-blur-md gap-2 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="h-4 w-4 text-white" />
                <span>Smart Scan Invoice</span>
              </Button>

              <Button
                onClick={() => setAddDialogOpen(true)}
                className="h-11 px-5 rounded-2xl bg-white text-indigo-900 hover:bg-zinc-100 font-extrabold text-xs sm:text-sm shadow-lg shadow-black/10 gap-2 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <PlusCircle className="h-4 w-4 text-indigo-600" />
                <span>Register Device</span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={loadData}
                className="h-11 w-11 rounded-2xl bg-white/10 hover:bg-white/20 border-white/20 text-white"
                title="Sync from database"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Catchy 2026 Metric Cards */}
        <CoverageOverview products={products} />

        {/* Search & Dynamic Filter Strip */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-500" />
            <Input
              type="text"
              placeholder="Search by product name, brand, model, IMEI, serial number, invoice, or seller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl text-sm font-medium bg-zinc-50/80 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            {/* Category Chips with emojis */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    selectedCategory === c.id
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md shadow-zinc-900/10 scale-105"
                      : "bg-zinc-100/90 text-zinc-600 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 self-start lg:self-auto">
              {statuses.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStatus(s.id)}
                  className={`text-xs px-3 py-1 rounded-xl font-bold transition-all ${
                    selectedStatus === s.id
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-zinc-400 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
              Loading your items &amp; warranties...
            </p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDocket={(p) => setActiveDocketProduct(p)}
                onEdit={(p) => setEditingProduct(p)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="h-14 w-14 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500 shadow-sm">
              <Sparkles className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-zinc-900 dark:text-white">
                No products match your criteria
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1">
                {searchQuery || selectedCategory !== "all" || selectedStatus !== "all"
                  ? "Try resetting your search query or switching category filters."
                  : "Start organizing your devices by registering your first purchase."}
              </p>
            </div>
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="mt-2 h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 text-xs shadow-md shadow-indigo-600/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Register First Product</span>
            </Button>
          </div>
        )}
      </main>

      {/* Modern 2026 Footer */}
      <footer className="border-t border-zinc-200/60 dark:border-zinc-800/80 py-8 text-center text-xs text-zinc-400 bg-white/50 dark:bg-zinc-950/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">
            Warrantify · Everything you own, under control.
          </span>
          <span className="text-zinc-400">
            Manufacturer&apos;s · Extended · Additional Warranty Architecture
          </span>
        </div>
      </footer>

      {/* Official Claim Warranty & Support Hub Modal */}
      <ClaimWarrantyModal
        product={activeDocketProduct}
        open={activeDocketProduct !== null}
        onOpenChange={(open) => {
          if (!open) setActiveDocketProduct(null);
        }}
        onProductUpdated={handleProductUpdated}
      />

      {/* Add Product Dialog */}
      <AddProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={handleCreate}
      />

      {/* Edit Product Dialog */}
      <EditProductDialog
        product={editingProduct}
        open={editingProduct !== null}
        onOpenChange={(open) => {
          if (!open) setEditingProduct(null);
        }}
        onSuccess={handleUpdate}
      />

      {/* Smart AI Invoice Scan Modal */}
      <SmartScanModal
        open={scanModalOpen}
        onOpenChange={setScanModalOpen}
        onConfirmProduct={handleConfirmScannedProduct}
      />
    </div>
  );
}
