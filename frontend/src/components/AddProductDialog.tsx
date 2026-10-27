"use client";

import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product, ProductCategory, IdentifierType, MerchantType, PaymentMethod } from "@/types/product";
import { ShieldCheck, Sparkles, Wrench, Package, Hash, FileText } from "lucide-react";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (newProduct: Partial<Product>) => Promise<void>;
}

export function AddProductDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddProductDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
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

  const [boxAccessories, setBoxAccessories] = useState("Original Box, Charger, Cable");
  const [boxVerified, setBoxVerified] = useState(true);

  // 1. Manufacturer's Warranty
  const [hasManufacturerWarranty, setHasManufacturerWarranty] = useState(true);
  const [mfgMonths, setMfgMonths] = useState("12");
  const [mfgProvider, setMfgProvider] = useState("");

  // 2. Extended Warranty (e.g. Croma ZipCare, AppleCare+, Reliance resQ, Samsung Care+)
  const [hasExtendedWarranty, setHasExtendedWarranty] = useState(false);
  const [extendedProvider, setExtendedProvider] = useState("Croma ZipCare Protect");
  const [extendedPolicyNo, setExtendedPolicyNo] = useState("");
  const [extendedMonths, setExtendedMonths] = useState("24");

  // 3. Additional Warranty (e.g. 10-Yr Motor, Compressor, Replaced Battery, Screen Panel)
  const [hasAdditionalWarranty, setHasAdditionalWarranty] = useState(false);
  const [additionalLabel, setAdditionalLabel] = useState("10-Year Inverter Compressor / Motor");
  const [additionalYears, setAdditionalYears] = useState("10");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const pDate = purchaseDate ? new Date(purchaseDate) : new Date();

      const warranties: {
        warranty_type: "primary" | "extended" | "component";
        label: string;
        provider: string;
        start_date: string;
        end_date: string;
        status: "active" | "expiring_soon" | "expired" | "unknown";
        policy_number?: string;
      }[] = [];

      // 1. Manufacturer's Warranty
      if (hasManufacturerWarranty) {
        const mfgEnd = new Date(pDate);
        mfgEnd.setMonth(mfgEnd.getMonth() + parseInt(mfgMonths || "12", 10));
        warranties.push({
          warranty_type: "primary",
          label: `${brand || "Manufacturer"} Standard Warranty`,
          provider: mfgProvider || (brand ? `${brand} Authorized Service` : "Manufacturer"),
          start_date: purchaseDate || new Date().toISOString().split("T")[0],
          end_date: mfgEnd.toISOString().split("T")[0],
          status: "active",
        });
      }

      // 2. Extended Warranty
      if (hasExtendedWarranty) {
        const extEnd = new Date(pDate);
        extEnd.setMonth(extEnd.getMonth() + parseInt(extendedMonths || "24", 10));
        warranties.push({
          warranty_type: "extended",
          label: extendedProvider || "Extended Care Plan",
          provider: extendedProvider || "Third-party Care Provider",
          start_date: purchaseDate || new Date().toISOString().split("T")[0],
          end_date: extEnd.toISOString().split("T")[0],
          status: "active",
          policy_number: extendedPolicyNo || undefined,
        });
      }

      // 3. Additional Warranty
      if (hasAdditionalWarranty) {
        const addEnd = new Date(pDate);
        addEnd.setFullYear(addEnd.getFullYear() + parseInt(additionalYears || "10", 10));
        warranties.push({
          warranty_type: "component",
          label: additionalLabel || "Additional Component Coverage",
          provider: brand ? `${brand} Component Warranty` : "Brand Component Service",
          start_date: purchaseDate || new Date().toISOString().split("T")[0],
          end_date: addEnd.toISOString().split("T")[0],
          status: "active",
        });
      }

      const accessoriesList = boxAccessories
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await onSuccess({
        name,
        category,
        brand,
        model,
        color_variant: colorVariant || undefined,
        identifier_type: identifierType,
        identifier_value: identifierValue || undefined,
        identifier_value_2: identifierValue2 || undefined,
        purchase_date: purchaseDate || undefined,
        purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
        payment_method: paymentMethod,
        merchant_name: merchantName || undefined,
        merchant_type: merchantType,
        invoice_number: invoiceNumber || undefined,
        seller_gstin: sellerGstin || undefined,
        box_contents: JSON.stringify(accessoriesList),
        box_condition_verified: boxVerified,
        warranties: warranties as any,
      });

      onOpenChange(false);
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Failed to save product. Check backend connection.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName("");
    setBrand("");
    setModel("");
    setColorVariant("");
    setIdentifierValue("");
    setIdentifierValue2("");
    setPurchaseDate("");
    setPurchasePrice("");
    setMerchantName("");
    setInvoiceNumber("");
    setSellerGstin("");
    setHasExtendedWarranty(false);
    setHasAdditionalWarranty(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto sm:rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl p-6 font-sans">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
            Register New Device
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-500">
            Save invoice details, hardware serials, and configure Manufacturer, Extended, or Additional warranties.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 w-full h-11 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl">
              <TabsTrigger value="basic" className="rounded-xl text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm">
                Device
              </TabsTrigger>
              <TabsTrigger value="identifiers" className="rounded-xl text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm">
                Identifiers
              </TabsTrigger>
              <TabsTrigger value="purchase" className="rounded-xl text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm">
                Purchase
              </TabsTrigger>
              <TabsTrigger value="warranties" className="rounded-xl text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm">
                Warranties
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Device Basics */}
            <TabsContent value="basic" className="space-y-3.5 pt-3">
              <div className="space-y-1">
                <Label htmlFor="prodName" className="text-xs font-bold">Device Name *</Label>
                <Input
                  id="prodName"
                  placeholder="e.g. Apple iPhone 15 Pro, LG 8kg DirectDrive, Sony Bravia 55"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl h-10 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="category" className="text-xs font-bold">Category</Label>
                  <select
                    id="category"
                    className="w-full h-10 text-xs rounded-xl border border-input bg-transparent px-3 py-1 shadow-sm font-medium focus:ring-2 focus:ring-indigo-500"
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value as ProductCategory;
                      setCategory(cat);
                      if (cat === "smartphone" || cat === "tablet") {
                        setIdentifierType("imei");
                      } else {
                        setIdentifierType("serial_number");
                      }
                    }}
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
                  <Label htmlFor="brand" className="text-xs font-bold">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="e.g. Apple, Samsung, LG, Sony"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="rounded-xl h-10 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="model" className="text-xs font-bold">Model / Number</Label>
                  <Input
                    id="model"
                    placeholder="e.g. A3102, FHT1408ZWL"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="rounded-xl h-10 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="color" className="text-xs font-bold">Color / Variant</Label>
                  <Input
                    id="color"
                    placeholder="e.g. Midnight, Titanium Blue"
                    value={colorVariant}
                    onChange={(e) => setColorVariant(e.target.value)}
                    className="rounded-xl h-10 text-sm"
                  />
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Hardware Identifiers */}
            <TabsContent value="identifiers" className="space-y-3.5 pt-3">
              <div className="space-y-1">
                <Label htmlFor="idType" className="text-xs font-bold">Identifier Type</Label>
                <select
                  id="idType"
                  className="w-full h-10 text-xs rounded-xl border border-input bg-transparent px-3 py-1 shadow-sm font-medium"
                  value={identifierType}
                  onChange={(e) => setIdentifierType(e.target.value as IdentifierType)}
                >
                  <option value="imei">IMEI (Smartphones &amp; Cellular)</option>
                  <option value="serial_number">Serial Number (Laptops, Appliances, TVs)</option>
                  <option value="product_key">Product License Key (Software / Windows)</option>
                  <option value="none">None / Unlisted</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="idVal1" className="text-xs font-bold">
                  {identifierType === "imei" ? "IMEI 1 (Primary 15 digits)" : "Serial Number / License Key"}
                </Label>
                <Input
                  id="idVal1"
                  placeholder={identifierType === "imei" ? "e.g. 354892091823901" : "From device back panel or box"}
                  value={identifierValue}
                  onChange={(e) => setIdentifierValue(e.target.value)}
                  className="rounded-xl h-10 text-sm font-mono"
                />
              </div>

              {identifierType === "imei" && (
                <div className="space-y-1">
                  <Label htmlFor="idVal2" className="text-xs font-bold">IMEI 2 (Dual SIM / eSIM)</Label>
                  <Input
                    id="idVal2"
                    placeholder="e.g. 354892091823902"
                    value={identifierValue2}
                    onChange={(e) => setIdentifierValue2(e.target.value)}
                    className="rounded-xl h-10 text-sm font-mono"
                  />
                </div>
              )}

              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
                <Label className="text-xs font-bold flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-indigo-500" />
                  Box Packaging &amp; Included Accessories
                </Label>
                <Input
                  placeholder="e.g. Retail Box, 67W Charger, Braided Cable, Rat Plate"
                  value={boxAccessories}
                  onChange={(e) => setBoxAccessories(e.target.value)}
                  className="rounded-xl h-9 text-xs"
                />
                <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={boxVerified}
                    onChange={(e) => setBoxVerified(e.target.checked)}
                    className="rounded text-indigo-600 h-4 w-4"
                  />
                  <span className="font-medium">Original packaging box preserved in good condition</span>
                </label>
              </div>
            </TabsContent>

            {/* TAB 3: Purchase & Invoices */}
            <TabsContent value="purchase" className="space-y-3.5 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="pDate" className="text-xs font-bold">Purchase Date</Label>
                  <Input
                    id="pDate"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="rounded-xl h-10 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pPrice" className="text-xs font-bold">Amount Paid (₹)</Label>
                  <Input
                    id="pPrice"
                    type="number"
                    placeholder="e.g. 48990"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="rounded-xl h-10 text-sm font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="merchant" className="text-xs font-bold">Merchant / Seller</Label>
                  <Input
                    id="merchant"
                    placeholder="e.g. Amazon India, Croma Phoenix"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="rounded-xl h-10 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="merchantType" className="text-xs font-bold">Store Type</Label>
                  <select
                    id="merchantType"
                    className="w-full h-10 text-xs rounded-xl border border-input bg-transparent px-3 py-1 shadow-sm font-medium"
                    value={merchantType}
                    onChange={(e) => setMerchantType(e.target.value as MerchantType)}
                  >
                    <option value="online">Online (Amazon, Flipkart, etc.)</option>
                    <option value="large_format_offline">Offline Chain (Croma, Reliance Digital, Vijay Sales)</option>
                    <option value="brand_direct">Brand Direct Store (Apple Store, Samsung)</option>
                    <option value="local_retailer">Local Authorized Dealer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="invNo" className="text-xs font-bold">Invoice Number</Label>
                  <Input
                    id="invNo"
                    placeholder="e.g. DEL4-8849201"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="rounded-xl h-10 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="gstin" className="text-xs font-bold">Seller GSTIN</Label>
                  <Input
                    id="gstin"
                    placeholder="15-character GSTIN"
                    value={sellerGstin}
                    onChange={(e) => setSellerGstin(e.target.value)}
                    className="rounded-xl h-10 text-sm font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="payMethod" className="text-xs font-bold">Payment Method</Label>
                <select
                  id="payMethod"
                  className="w-full h-10 text-xs rounded-xl border border-input bg-transparent px-3 py-1 shadow-sm font-medium"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value="upi">UPI (GPay, PhonePe, Paytm)</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="emi">No-Cost / Bank EMI</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="net_banking">Net Banking</option>
                  <option value="cash">Cash</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </TabsContent>

            {/* TAB 4: The 3 Named Warranties (Manufacturer, Extended, Additional) */}
            <TabsContent value="warranties" className="space-y-4 pt-3">
              {/* 1. Manufacturer's Warranty */}
              <div className="p-4 bg-blue-50/70 dark:bg-blue-950/25 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200">
                        Manufacturer&apos;s Warranty
                      </h4>
                      <p className="text-[10px] text-blue-700 dark:text-blue-400">
                        Standard brand comprehensive coverage
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasManufacturerWarranty}
                    onChange={(e) => setHasManufacturerWarranty(e.target.checked)}
                    className="rounded text-blue-600 h-4 w-4 cursor-pointer"
                  />
                </div>

                {hasManufacturerWarranty && (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <Label className="text-[11px] font-medium">Duration</Label>
                      <select
                        className="w-full h-9 text-xs rounded-xl border border-input bg-white dark:bg-zinc-900 px-2 font-medium"
                        value={mfgMonths}
                        onChange={(e) => setMfgMonths(e.target.value)}
                      >
                        <option value="6">6 Months</option>
                        <option value="12">1 Year (12 Months)</option>
                        <option value="24">2 Years (24 Months)</option>
                        <option value="36">3 Years (36 Months)</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium">Provider</Label>
                      <Input
                        placeholder={brand ? `${brand} India` : "Manufacturer"}
                        className="h-9 text-xs bg-white dark:bg-zinc-900 rounded-xl"
                        value={mfgProvider}
                        onChange={(e) => setMfgProvider(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Extended Warranty */}
              <div className="p-4 bg-purple-50/70 dark:bg-purple-950/25 rounded-2xl border border-purple-200/80 dark:border-purple-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-950 dark:text-purple-200">
                        Extended Warranty
                      </h4>
                      <p className="text-[10px] text-purple-700 dark:text-purple-400">
                        Third-party or retailer plan (Croma ZipCare, AppleCare+, Reliance resQ, Servify)
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasExtendedWarranty}
                    onChange={(e) => setHasExtendedWarranty(e.target.checked)}
                    className="rounded text-purple-600 h-4 w-4 cursor-pointer"
                  />
                </div>

                {hasExtendedWarranty && (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <Label className="text-[11px] font-medium">Plan Name / Provider</Label>
                        <Input
                          placeholder="e.g. Croma ZipCare, AppleCare+"
                          className="h-9 text-xs bg-white dark:bg-zinc-900 rounded-xl"
                          value={extendedProvider}
                          onChange={(e) => setExtendedProvider(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-[11px] font-medium">Policy / Certificate No</Label>
                        <Input
                          placeholder="e.g. ZIP-CR-99120"
                          className="h-9 text-xs bg-white dark:bg-zinc-900 rounded-xl font-mono"
                          value={extendedPolicyNo}
                          onChange={(e) => setExtendedPolicyNo(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium">Total Extended Duration</Label>
                      <select
                        className="w-full h-9 text-xs rounded-xl border border-input bg-white dark:bg-zinc-900 px-2 font-medium"
                        value={extendedMonths}
                        onChange={(e) => setExtendedMonths(e.target.value)}
                      >
                        <option value="12">1 Year Extra (12 Months)</option>
                        <option value="24">2 Years Extra (24 Months)</option>
                        <option value="36">3 Years Extra (36 Months)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Additional Warranty */}
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/25 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                      <Wrench className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-950 dark:text-amber-200">
                        Additional Warranty
                      </h4>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">
                        Specific component coverage (10-Yr Motor, Compressor, Replaced Battery, Screen Panel)
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasAdditionalWarranty}
                    onChange={(e) => setHasAdditionalWarranty(e.target.checked)}
                    className="rounded text-amber-600 h-4 w-4 cursor-pointer"
                  />
                </div>

                {hasAdditionalWarranty && (
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div>
                      <Label className="text-[11px] font-medium">Part Covered</Label>
                      <Input
                        value={additionalLabel}
                        onChange={(e) => setAdditionalLabel(e.target.value)}
                        placeholder="e.g. 10-Yr Motor, Battery"
                        className="h-9 text-xs bg-white dark:bg-zinc-900 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium">Duration</Label>
                      <select
                        className="w-full h-9 text-xs rounded-xl border border-input bg-white dark:bg-zinc-900 px-2 font-medium"
                        value={additionalYears}
                        onChange={(e) => setAdditionalYears(e.target.value)}
                      >
                        <option value="1">1 Year Parts</option>
                        <option value="2">2 Years Parts</option>
                        <option value="5">5 Years (Compressor)</option>
                        <option value="10">10 Years (Inverter Motor/Compressor)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-10 px-4 text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving || !name.trim()}
              className="rounded-xl h-10 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20"
            >
              {saving ? "Saving Device..." : "Save to Warrantify"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
