"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, ProductCategory, IdentifierType, MerchantType, PaymentMethod } from "@/types/product";
import {
  Laptop,
  Smartphone,
  Hash,
  Receipt,
  Building2,
  Calendar,
  CreditCard,
  Save,
  Check,
  Package,
  Layers,
  Sparkles,
} from "lucide-react";

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (id: string, updated: Partial<Product>) => Promise<void>;
}

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onSuccess,
}: EditProductDialogProps) {
  const [activeTab, setActiveTab] = useState<"device" | "identifiers" | "purchase">("device");
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProductCategory>("smartphone");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [colorVariant, setColorVariant] = useState("");

  const [identifierType, setIdentifierType] = useState<IdentifierType>("imei");
  const [identifierValue, setIdentifierValue] = useState("");
  const [identifierValue2, setIdentifierValue2] = useState("");

  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [merchantName, setMerchantName] = useState("");
  const [merchantType, setMerchantType] = useState<MerchantType>("online");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [sellerGstin, setSellerGstin] = useState("");

  const [boxAccessories, setBoxAccessories] = useState("");
  const [boxVerified, setBoxVerified] = useState(true);

  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setCategory(product.category || "smartphone");
      setBrand(product.brand || "");
      setModel(product.model || "");
      setColorVariant(product.color_variant || "");
      setIdentifierType(product.identifier_type || "imei");
      setIdentifierValue(product.identifier_value || "");
      setIdentifierValue2(product.identifier_value_2 || "");
      setPurchaseDate(product.purchase_date || "");
      setPurchasePrice(product.purchase_price ? String(product.purchase_price) : "");
      setPaymentMethod(product.payment_method || "upi");
      setMerchantName(product.merchant_name || "");
      setMerchantType(product.merchant_type || "online");
      setInvoiceNumber(product.invoice_number || "");
      setSellerGstin(product.seller_gstin || "");
      setBoxVerified(product.box_condition_verified ?? true);

      if (product.box_contents) {
        try {
          const list = JSON.parse(product.box_contents);
          setBoxAccessories(Array.isArray(list) ? list.join(", ") : "");
        } catch {
          setBoxAccessories(product.box_contents);
        }
      } else {
        setBoxAccessories("");
      }
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const accessoriesList = boxAccessories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await onSuccess(product.id, {
        name,
        category,
        brand: brand || null,
        model: model || null,
        color_variant: colorVariant || null,
        identifier_type: identifierType,
        identifier_value: identifierValue || null,
        identifier_value_2: identifierValue2 || null,
        purchase_date: purchaseDate || null,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
        payment_method: paymentMethod,
        merchant_name: merchantName || null,
        merchant_type: merchantType,
        invoice_number: invoiceNumber || null,
        seller_gstin: sellerGstin || null,
        box_contents: JSON.stringify(accessoriesList),
        box_condition_verified: boxVerified,
      });

      onOpenChange(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update product details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl p-6 bg-white dark:bg-zinc-950 font-sans">
        <DialogHeader className="space-y-1 pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              Product Configuration
            </span>
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white pt-1">
            Edit Device Details
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Update hardware serials, GST numbers, purchase invoices, and box contents.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {/* Modern Segmented Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
            <button
              type="button"
              onClick={() => setActiveTab("device")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "device"
                  ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Device Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("identifiers")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "identifiers"
                  ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Hash className="h-3.5 w-3.5" />
              <span>Identifiers &amp; Box</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("purchase")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === "purchase"
                  ? "bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Purchase &amp; GST</span>
            </button>
          </div>

          {/* TAB 1: DEVICE PROFILE */}
          {activeTab === "device" && (
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="editName" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Product / Device Name *
                </Label>
                <Input
                  id="editName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-11 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  placeholder="e.g. Apple MacBook Air 13-inch (M2)"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="editCategory" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Category
                  </Label>
                  <select
                    id="editCategory"
                    className="w-full h-11 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 shadow-sm font-medium text-zinc-800 dark:text-zinc-200 outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  >
                    <option value="laptop">Laptop / PC</option>
                    <option value="smartphone">Smartphone</option>
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

                <div className="space-y-1.5">
                  <Label htmlFor="editBrand" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Manufacturer / Brand
                  </Label>
                  <Input
                    id="editBrand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="rounded-xl h-11 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    placeholder="e.g. Apple, Dell, Samsung"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="editModel" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Model Number
                  </Label>
                  <Input
                    id="editModel"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="rounded-xl h-11 text-sm font-mono bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    placeholder="e.g. A2681 / XPS-9320"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editColor" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Color / Finish
                  </Label>
                  <Input
                    id="editColor"
                    value={colorVariant}
                    onChange={(e) => setColorVariant(e.target.value)}
                    className="rounded-xl h-11 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    placeholder="e.g. Space Gray, Midnight"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IDENTIFIERS & BOX */}
          {activeTab === "identifiers" && (
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="editIdType" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Identifier Type
                </Label>
                <select
                  id="editIdType"
                  className="w-full h-11 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 shadow-sm font-medium text-zinc-800 dark:text-zinc-200 outline-none"
                  value={identifierType}
                  onChange={(e) => setIdentifierType(e.target.value as IdentifierType)}
                >
                  <option value="serial_number">Serial Number (Laptops, Appliances, TVs)</option>
                  <option value="imei">IMEI (Smartphones &amp; Cellular)</option>
                  <option value="product_key">Product License Key (Software / Windows)</option>
                  <option value="none">None / Unlisted</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editId1" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {identifierType === "imei" ? "IMEI 1 (Primary)" : "Serial Number"}
                </Label>
                <Input
                  id="editId1"
                  value={identifierValue}
                  onChange={(e) => setIdentifierValue(e.target.value)}
                  className="rounded-xl h-11 text-sm font-mono bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  placeholder="e.g. C02G412NMD6T"
                />
              </div>

              {identifierType === "imei" && (
                <div className="space-y-1.5">
                  <Label htmlFor="editId2" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    IMEI 2 (Dual SIM / eSIM)
                  </Label>
                  <Input
                    id="editId2"
                    value={identifierValue2}
                    onChange={(e) => setIdentifierValue2(e.target.value)}
                    className="rounded-xl h-11 text-sm font-mono bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    placeholder="e.g. 358941029481923"
                  />
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <Label htmlFor="editBox" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Included Box Contents &amp; Accessories (Comma-separated)
                </Label>
                <Input
                  id="editBox"
                  value={boxAccessories}
                  onChange={(e) => setBoxAccessories(e.target.value)}
                  className="rounded-xl h-11 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  placeholder="e.g. Original Box, 67W Charger, USB-C Cable, User Manual"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="boxVerified"
                  checked={boxVerified}
                  onChange={(e) => setBoxVerified(e.target.checked)}
                  className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
                />
                <Label htmlFor="boxVerified" className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  Original retail packaging preserved in good condition (increases warranty exchange acceptance)
                </Label>
              </div>
            </div>
          )}

          {/* TAB 3: PURCHASE & GST */}
          {activeTab === "purchase" && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="editPDate" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Purchase Date
                  </Label>
                  <Input
                    id="editPDate"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="rounded-xl h-11 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editPrice" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Amount Paid (₹)
                  </Label>
                  <Input
                    id="editPrice"
                    type="number"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="rounded-xl h-11 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-mono"
                    placeholder="e.g. 84990"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="editMerchant" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Seller / Store Name
                  </Label>
                  <Input
                    id="editMerchant"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="rounded-xl h-11 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    placeholder="e.g. Croma, Amazon India, Apple Store"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editStoreType" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Store Channel
                  </Label>
                  <select
                    id="editStoreType"
                    className="w-full h-11 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 shadow-sm font-medium text-zinc-800 dark:text-zinc-200 outline-none"
                    value={merchantType}
                    onChange={(e) => setMerchantType(e.target.value as MerchantType)}
                  >
                    <option value="online">Online (Amazon, Flipkart)</option>
                    <option value="large_format_offline">Large Format Store (Croma, Reliance, Vijay Sales)</option>
                    <option value="brand_direct">Brand Exclusive Store (Apple Store, Samsung Experience)</option>
                    <option value="local_retailer">Local Authorized Dealer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="editInvoiceNo" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Invoice / Receipt Number
                  </Label>
                  <Input
                    id="editInvoiceNo"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="rounded-xl h-11 text-sm font-mono bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    placeholder="e.g. CR-DEL-2024-9102"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="editGstin" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Seller GSTIN (15 Digits)
                  </Label>
                  <Input
                    id="editGstin"
                    value={sellerGstin}
                    onChange={(e) => setSellerGstin(e.target.value)}
                    className="rounded-xl h-11 text-sm font-mono uppercase bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    placeholder="e.g. 07AAAAA0000A1Z5"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editPayMethod" className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Payment Method
                </Label>
                <select
                  id="editPayMethod"
                  className="w-full h-11 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 shadow-sm font-medium text-zinc-800 dark:text-zinc-200 outline-none"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="emi">No-Cost EMI / Consumer Loan</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="cash">Cash Receipt</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl h-10 px-5 text-xs font-bold"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-10 px-6 text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-md gap-2"
              disabled={saving}
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
