export type PropertyType = "ADU" | "Single-family home" | "Remodel" | "Multi-family" | "Commercial";
export type LocationZone = "Downtown SF" | "Mission" | "Sunset" | "Richmond" | "SoMa" | "Marina" | "Other";
export type Quality = "Basic" | "Standard" | "Premium" | "Luxury";
export type Complexity = "Low" | "Medium" | "High";
export type SiteAccess = "Easy" | "Moderate" | "Difficult";
export type Urgency = "Flexible" | "Normal" | "Fast-track";

export interface ProjectInput {
  id: string;
  name: string;
  propertyType: PropertyType;
  zone: LocationZone;
  sqft: number;
  floors: number;
  quality: Quality;
  structural: Complexity;
  permit: Complexity;
  siteAccess: SiteAccess;
  solarReady: boolean;
  greenMaterials: boolean;
  efficientWindows: boolean;
  smartHome: boolean;
  startDate: string;
  urgency: Urgency;
  createdAt: number;
}

export const QUALITY_RATE: Record<Quality, number> = {
  Basic: 350, Standard: 500, Premium: 750, Luxury: 1000,
};
export const ZONE_MULT: Record<LocationZone, number> = {
  "Downtown SF": 1.25, Mission: 1.15, Sunset: 1.08, Richmond: 1.07,
  SoMa: 1.2, Marina: 1.22, Other: 1.0,
};
const STRUCT_MULT: Record<Complexity, number> = { Low: 1.0, Medium: 1.12, High: 1.25 };
const PERMIT_PCT: Record<Complexity, number> = { Low: 0.04, Medium: 0.08, High: 0.14 };
const SITE_MULT: Record<SiteAccess, number> = { Easy: 1.0, Moderate: 1.08, Difficult: 1.18 };

export interface Estimate {
  baseCost: number;
  locationAdjusted: number;
  structuralAdjusted: number;
  siteAdjusted: number;
  permitCost: number;
  sustainabilityCost: number;
  subtotal: number;
  contingency: number;
  finalCost: number;
  costPerSqft: number;
  laborEstimate: number;
  materialEstimate: number;
  finishingEstimate: number;
  timelineMonths: number;
  riskScore: number;
  confidence: number;
  breakdown: { name: string; value: number; color: string }[];
}

export function calculate(p: ProjectInput): Estimate {
  const baseCost = p.sqft * QUALITY_RATE[p.quality];
  const locationAdjusted = baseCost * ZONE_MULT[p.zone];
  const structuralAdjusted = locationAdjusted * STRUCT_MULT[p.structural];
  const siteAdjusted = structuralAdjusted * SITE_MULT[p.siteAccess];
  const permitCost = siteAdjusted * PERMIT_PCT[p.permit];

  let sustainabilityCost = 0;
  if (p.solarReady) sustainabilityCost += 18000;
  if (p.efficientWindows) sustainabilityCost += 25000;
  if (p.smartHome) sustainabilityCost += 30000;
  if (p.greenMaterials) sustainabilityCost += siteAdjusted * 0.06;

  const subtotal = siteAdjusted + permitCost + sustainabilityCost;
  const contingency = subtotal * 0.12;
  const finalCost = subtotal + contingency;
  const costPerSqft = finalCost / Math.max(p.sqft, 1);

  const laborEstimate = siteAdjusted * 0.42;
  const materialEstimate = siteAdjusted * 0.38;
  const finishingEstimate = siteAdjusted * 0.2;

  // Timeline
  let months = Math.max(3, p.sqft / 350);
  if (p.floors > 1) months *= 1 + (p.floors - 1) * 0.12;
  if (p.structural === "Medium") months *= 1.1;
  if (p.structural === "High") months *= 1.25;
  if (p.permit === "Medium") months += 1;
  if (p.permit === "High") months += 2;
  if (p.urgency === "Fast-track") months *= 0.78;
  if (p.urgency === "Flexible") months *= 1.1;
  const timelineMonths = Math.round(months * 10) / 10;

  // Risk score
  let risk = 18;
  risk += { Low: 0, Medium: 12, High: 22 }[p.structural];
  risk += { Low: 0, Medium: 10, High: 20 }[p.permit];
  risk += { Easy: 0, Moderate: 8, Difficult: 16 }[p.siteAccess];
  if (p.urgency === "Fast-track") risk += 12;
  if (p.sqft > 4000) risk += 6;
  if (p.floors > 2) risk += 5;
  risk = Math.min(100, Math.max(5, Math.round(risk)));
  const confidence = Math.max(40, 100 - risk);

  const breakdown = [
    { name: "Labor", value: Math.round(laborEstimate), color: "oklch(0.78 0.18 195)" },
    { name: "Materials", value: Math.round(materialEstimate), color: "oklch(0.68 0.22 310)" },
    { name: "Finishing", value: Math.round(finishingEstimate), color: "oklch(0.82 0.17 90)" },
    { name: "Permits", value: Math.round(permitCost), color: "oklch(0.72 0.2 25)" },
    { name: "Sustainability", value: Math.round(sustainabilityCost), color: "oklch(0.7 0.18 145)" },
    { name: "Contingency", value: Math.round(contingency), color: "oklch(0.6 0.05 260)" },
  ].filter((b) => b.value > 0);

  return {
    baseCost, locationAdjusted, structuralAdjusted, siteAdjusted, permitCost,
    sustainabilityCost, subtotal, contingency, finalCost, costPerSqft,
    laborEstimate, materialEstimate, finishingEstimate,
    timelineMonths, riskScore: risk, confidence, breakdown,
  };
}

export const defaultProject = (): ProjectInput => ({
  id: crypto.randomUUID(),
  name: "New SF Residence",
  propertyType: "Single-family home",
  zone: "Mission",
  sqft: 2200,
  floors: 2,
  quality: "Premium",
  structural: "Medium",
  permit: "Medium",
  siteAccess: "Moderate",
  solarReady: true,
  greenMaterials: false,
  efficientWindows: true,
  smartHome: false,
  startDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  urgency: "Normal",
  createdAt: Date.now(),
});

const CURRENT_KEY = "buildscope:current";
const SAVED_KEY = "buildscope:saved";

export function loadCurrent(): ProjectInput | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function saveCurrent(p: ProjectInput) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CURRENT_KEY, JSON.stringify(p));
}
export function loadSaved(): ProjectInput[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
export function saveProject(p: ProjectInput) {
  if (typeof window === "undefined") return;
  const all = loadSaved();
  const idx = all.findIndex((x) => x.id === p.id);
  if (idx >= 0) all[idx] = p; else all.unshift(p);
  localStorage.setItem(SAVED_KEY, JSON.stringify(all.slice(0, 20)));
}
export function deleteProject(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVED_KEY, JSON.stringify(loadSaved().filter((x) => x.id !== id)));
}

export function formatUSD(n: number, compact = false): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(n);
}