export interface BrandSupportInfo {
  brand: string;
  tollFree: string;
  tollFreeDisplay: string;
  email: string;
  whatsapp?: string;
  whatsappDisplay?: string;
  portalUrl: string;
  serviceHours: string;
  commonIssues: string[];
}

export const BRAND_SUPPORT_DIRECTORY: Record<string, BrandSupportInfo> = {
  apple: {
    brand: "Apple India",
    tollFree: "0008001009009",
    tollFreeDisplay: "000800 100 9009 / 1800 4250 744",
    email: "support@apple.com",
    portalUrl: "https://support.apple.com/en-in",
    serviceHours: "Mon - Sun: 9:00 AM - 9:00 PM IST",
    commonIssues: [
      "Screen display flickering / green lines",
      "Battery health degraded / fast drain",
      "Face ID / Touch ID hardware fault",
      "Charging port or MagSafe connectivity",
      "Kernel panic / Mac startup loop",
      "Keyboard key sticking / unresponsive",
    ],
  },
  samsung: {
    brand: "Samsung India",
    tollFree: "180057267864",
    tollFreeDisplay: "1800 5 7267864 (1800 5 SAMSUNG)",
    email: "support.india@samsung.com",
    whatsapp: "91180057267864",
    whatsappDisplay: "1800 5 7267864",
    portalUrl: "https://www.samsung.com/in/support/",
    serviceHours: "24x7 Customer Care Support",
    commonIssues: [
      "AMOLED screen flickering / pink or green line",
      "Super Fast Charging not working",
      "Motherboard / spontaneous reboot loop",
      "Camera sensor autofocus jitter",
      "Washing machine drum vibration / error code",
      "Refrigerator compressor cooling drop",
    ],
  },
  lg: {
    brand: "LG Electronics India",
    tollFree: "18003159999",
    tollFreeDisplay: "1800 315 9999 / 1800 180 9999",
    email: "serviceindia@lge.com",
    whatsapp: "919711709999",
    whatsappDisplay: "+91 97117 09999",
    portalUrl: "https://www.lg.com/in/support",
    serviceHours: "Mon - Sat: 9:00 AM - 6:00 PM IST",
    commonIssues: [
      "Direct Drive Motor / error UE, OE, or IE",
      "Washing machine water drainage blockage",
      "OLED panel retention or horizontal lines",
      "Dual Inverter AC cooling gas leakage",
      "Compressor humming noise",
    ],
  },
  sony: {
    brand: "Sony India",
    tollFree: "18001037799",
    tollFreeDisplay: "1800 103 7799",
    email: "sonyindia.care@ap.sony.com",
    whatsapp: "919289517799",
    whatsappDisplay: "+91 92895 17799",
    portalUrl: "https://www.sony.co.in/electronics/support",
    serviceHours: "Mon - Sun: 9:00 AM - 7:30 PM IST",
    commonIssues: [
      "Bravia TV panel vertical lines / backlight failure",
      "Audio sync delay / eARC soundbar drop",
      "PlayStation disc drive or HDMI port fault",
      "Headphone ANC whistling or battery imbalance",
    ],
  },
  dell: {
    brand: "Dell Technologies India",
    tollFree: "18004254026",
    tollFreeDisplay: "1800 425 4026 / 1800 425 0088",
    email: "dell_support_india@dell.com",
    portalUrl: "https://www.dell.com/support/home/en-in",
    serviceHours: "Mon - Fri: 9:00 AM - 6:00 PM (ProSupport 24x7)",
    commonIssues: [
      "Display backlight bleeding / black screen on boot",
      "Battery not charging / AC adapter not recognized",
      "Thermal throttling / excessive fan noise",
      "Trackpad unresponsive or erratic cursor",
      "Motherboard BIOS post beep codes",
    ],
  },
  hp: {
    brand: "HP India (Hewlett-Packard)",
    tollFree: "18002587170",
    tollFreeDisplay: "1800 258 7170",
    email: "in.contact@hp.com",
    whatsapp: "912261014560",
    whatsappDisplay: "+91 22 6101 4560",
    portalUrl: "https://support.hp.com/in-en",
    serviceHours: "Mon - Sat: 9:00 AM - 7:00 PM IST",
    commonIssues: [
      "Laptop hinge cracking or stiff movement",
      "Battery swollen / 'Replace battery' warning",
      "Wi-Fi card disconnects frequently",
      "Blue screen of death (BSOD) crashing",
      "Keyboard keys unresponsive",
    ],
  },
  lenovo: {
    brand: "Lenovo India",
    tollFree: "18004197555",
    tollFreeDisplay: "1800 419 7555",
    email: "customercare@lenovo.com",
    whatsapp: "918067916666",
    whatsappDisplay: "+91 80 6791 6666",
    portalUrl: "https://pcsupport.lenovo.com/in/en",
    serviceHours: "Mon - Sat: 9:00 AM - 6:00 PM IST",
    commonIssues: [
      "Display panel ghost touch or flickering",
      "Charging port loose connection",
      "High temperature / fan speed maximum",
      "TrackPoint / touchpad freeze",
    ],
  },
  philips: {
    brand: "Philips Domestic Appliances India",
    tollFree: "18001022929",
    tollFreeDisplay: "1800 102 2929",
    email: "customercare.india@philips.com",
    portalUrl: "https://www.philips.co.in/c-w/support-home.html",
    serviceHours: "Mon - Sat: 9:00 AM - 6:00 PM IST",
    commonIssues: [
      "Airfryer heating coil not warming",
      "Mixer grinder motor overload trip / smoke smell",
      "Jar coupler worn out / blade jammed",
      "Timer dial broken or stuck",
    ],
  },
  croma: {
    brand: "Croma / ZipCare Assurance",
    tollFree: "18005727662",
    tollFreeDisplay: "1800 572 7662 (Toll Free)",
    email: "customersupport@croma.com",
    portalUrl: "https://www.croma.com/zipcare",
    serviceHours: "24x7 Customer Care Support",
    commonIssues: [
      "ZipCare Extended Warranty claim registration",
      "Authorized home visit technician booking",
      "Replacement / repair authorization",
    ],
  },
  reliance: {
    brand: "Reliance Digital / resQ Care",
    tollFree: "18008891055",
    tollFreeDisplay: "1800 889 1055",
    email: "reliancedigital@ril.com",
    portalUrl: "https://www.reliancedigital.in/resq",
    serviceHours: "Mon - Sun: 9:00 AM - 9:00 PM IST",
    commonIssues: [
      "resQ Extended Care plan activation",
      "In-home repair dispatch for appliances",
      "Screen replacement claim",
    ],
  },
  generic: {
    brand: "Authorized Service Center",
    tollFree: "18001000000",
    tollFreeDisplay: "National Consumer Helpline: 1915",
    email: "support@servicecenter.com",
    portalUrl: "https://consumerhelpline.gov.in",
    serviceHours: "Mon - Sat: 9:30 AM - 5:30 PM IST",
    commonIssues: [
      "Hardware component failure under standard warranty",
      "Defect arising from normal manufacturing tolerances",
      "Repair or replacement request under warranty terms",
    ],
  },
};

export function getBrandSupportInfo(brandName?: string | null, merchantName?: string | null): BrandSupportInfo {
  const brandKey = (brandName || "").toLowerCase().trim();
  const merchantKey = (merchantName || "").toLowerCase().trim();

  // 1. Direct brand match
  for (const [key, info] of Object.entries(BRAND_SUPPORT_DIRECTORY)) {
    if (brandKey.includes(key) && key !== "generic") {
      return info;
    }
  }

  // 2. Retailer extended plan match (Croma, Reliance)
  if (merchantKey.includes("croma") || merchantKey.includes("zipcare")) {
    return BRAND_SUPPORT_DIRECTORY.croma;
  }
  if (merchantKey.includes("reliance") || merchantKey.includes("resq")) {
    return BRAND_SUPPORT_DIRECTORY.reliance;
  }

  // 3. Fallback generic
  return {
    ...BRAND_SUPPORT_DIRECTORY.generic,
    brand: brandName ? `${brandName} Service` : "Authorized Service Center",
  };
}

