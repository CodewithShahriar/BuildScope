import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useProject } from "@/hooks/useProject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { calculate, formatUSD, saveProject,
  type Quality, type Complexity, type SiteAccess, type Urgency,
  type PropertyType, type LocationZone } from "@/lib/buildscope";
import { cn } from "@/lib/utils";
import { Check, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/wizard")({
  head: () => ({ meta: [{ title: "Project Wizard — BuildScope SF" }, { name: "description", content: "Enter project details and generate a live San Francisco construction estimate." }] }),
  component: WizardPage,
});

const STEPS = ["Basics", "Quality", "Cost Factors", "Timeline"] as const;

function WizardPage() {
  const { project, update, setProject } = useProject();
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();
  const estimate = useMemo(() => calculate(project), [project]);

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const generate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1100));
    saveProject(project);
    setProject({ ...project, createdAt: Date.now() });
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.3 }, colors: ["#7adbe6", "#c79bff", "#ffd166"] });
    toast.success("Estimate ready", { description: formatUSD(estimate.finalCost) });
    navigate({ to: "/dashboard" });
  };

  return (
    <AppShell title="New Estimate">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          {/* Stepper */}
          <div className="flex items-center gap-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <button onClick={() => setStep(i)}
                  className={cn("size-8 rounded-full grid place-items-center text-xs border transition-all",
                    i < step && "bg-primary text-primary-foreground border-primary",
                    i === step && "bg-gradient-primary text-primary-foreground border-transparent glow",
                    i > step && "border-border text-muted-foreground")}>
                  {i < step ? <Check className="size-4" /> : i + 1}
                </button>
                <div className="flex-1">
                  <div className={cn("text-xs", i === step ? "text-foreground" : "text-muted-foreground")}>{s}</div>
                  <div className="h-0.5 bg-border rounded mt-2 overflow-hidden">
                    <motion.div className="h-full bg-gradient-primary"
                      animate={{ width: i <= step ? "100%" : "0%" }} transition={{ duration: 0.4 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl glass glow-border p-6 md:p-8 min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div key={step}
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="space-y-6">
                {step === 0 && (
                  <>
                    <SectionTitle title="Project basics" subtitle="Tell us about what you're building." />
                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="Project name">
                        <Input value={project.name} onChange={(e) => update("name", e.target.value)} />
                      </Field>
                      <Field label="Property type">
                        <Select value={project.propertyType} onValueChange={(v) => update("propertyType", v as PropertyType)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(["ADU","Single-family home","Remodel","Multi-family","Commercial"] as PropertyType[]).map(p => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Location zone">
                        <Select value={project.zone} onValueChange={(v) => update("zone", v as LocationZone)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(["Downtown SF","Mission","Sunset","Richmond","SoMa","Marina","Other"] as LocationZone[]).map(z => (
                              <SelectItem key={z} value={z}>{z}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Number of floors">
                        <Input type="number" min={1} max={6} value={project.floors}
                          onChange={(e) => update("floors", Math.max(1, Number(e.target.value)))} />
                      </Field>
                      <Field label={`Total square footage · ${project.sqft.toLocaleString()} sqft`} full>
                        <Slider min={400} max={8000} step={50} value={[project.sqft]}
                          onValueChange={([v]) => update("sqft", v)} />
                      </Field>
                    </div>
                  </>
                )}
                {step === 1 && (
                  <>
                    <SectionTitle title="Build quality" subtitle="Pick a finish tier — this is your biggest cost lever." />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(["Basic","Standard","Premium","Luxury"] as Quality[]).map((q) => {
                        const active = project.quality === q;
                        const rate = { Basic: 350, Standard: 500, Premium: 750, Luxury: 1000 }[q];
                        return (
                          <button key={q} onClick={() => update("quality", q)}
                            className={cn("p-5 rounded-xl border text-left transition-all relative overflow-hidden",
                              active
                                ? "border-primary bg-secondary/60 glow"
                                : "border-border hover:border-primary/40 bg-secondary/20")}>
                            <div className="text-sm font-medium">{q}</div>
                            <div className="text-2xl font-semibold mt-2">${rate}<span className="text-xs text-muted-foreground">/sqft</span></div>
                            {active && <div className="absolute inset-0 bg-gradient-primary opacity-10 pointer-events-none" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                {step === 2 && (
                  <>
                    <SectionTitle title="Cost factors" subtitle="Site, structure, and sustainability impact." />
                    <div className="grid md:grid-cols-3 gap-4">
                      <SegField label="Structural complexity" value={project.structural}
                        options={["Low","Medium","High"] as Complexity[]}
                        onChange={(v) => update("structural", v)} />
                      <SegField label="Permit complexity" value={project.permit}
                        options={["Low","Medium","High"] as Complexity[]}
                        onChange={(v) => update("permit", v)} />
                      <SegField label="Site access" value={project.siteAccess}
                        options={["Easy","Moderate","Difficult"] as SiteAccess[]}
                        onChange={(v) => update("siteAccess", v)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Sustainability & smart features</Label>
                      <div className="grid md:grid-cols-2 gap-3">
                        <ToggleRow label="Solar ready" desc="+$18,000" checked={project.solarReady} onChange={(v) => update("solarReady", v)} />
                        <ToggleRow label="Green materials" desc="+6% on adjusted cost" checked={project.greenMaterials} onChange={(v) => update("greenMaterials", v)} />
                        <ToggleRow label="Energy efficient windows" desc="+$25,000" checked={project.efficientWindows} onChange={(v) => update("efficientWindows", v)} />
                        <ToggleRow label="Smart home" desc="+$30,000" checked={project.smartHome} onChange={(v) => update("smartHome", v)} />
                      </div>
                    </div>
                  </>
                )}
                {step === 3 && (
                  <>
                    <SectionTitle title="Timeline" subtitle="When you start and how aggressively you build." />
                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="Desired start date">
                        <Input type="date" value={project.startDate} onChange={(e) => update("startDate", e.target.value)} />
                      </Field>
                      <SegField label="Urgency" value={project.urgency}
                        options={["Flexible","Normal","Fast-track"] as Urgency[]}
                        onChange={(v) => update("urgency", v)} />
                    </div>
                    <div className="rounded-xl bg-secondary/40 p-5">
                      <div className="text-xs text-muted-foreground">Projected timeline</div>
                      <div className="text-3xl font-semibold mt-1">{estimate.timelineMonths} <span className="text-base text-muted-foreground">months</span></div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/60">
              <Button variant="ghost" onClick={prev} disabled={step === 0}>
                <ArrowLeft className="size-4" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next} className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow">
                  Next <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button onClick={generate} disabled={generating}
                  className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow">
                  {generating ? "Generating…" : <>Generate estimate <Sparkles className="size-4" /></>}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Live preview */}
        <aside className="lg:sticky lg:top-6 h-fit space-y-4">
          <div className="rounded-2xl glass glow-border p-6">
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">Live estimate</div>
            <motion.div key={Math.round(estimate.finalCost)}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-semibold mt-2 text-gradient">
              {formatUSD(estimate.finalCost, true)}
            </motion.div>
            <div className="text-sm text-muted-foreground mt-1">{formatUSD(estimate.costPerSqft)}/sqft · {estimate.timelineMonths} mo</div>
            <div className="mt-4 space-y-2">
              <Row label="Base" value={formatUSD(estimate.baseCost, true)} />
              <Row label="Location adj." value={formatUSD(estimate.locationAdjusted - estimate.baseCost, true)} />
              <Row label="Permits" value={formatUSD(estimate.permitCost, true)} />
              <Row label="Sustainability" value={formatUSD(estimate.sustainabilityCost, true)} />
              <Row label="Contingency (12%)" value={formatUSD(estimate.contingency, true)} />
            </div>
          </div>
          <div className="rounded-2xl glass p-5">
            <div className="text-xs text-muted-foreground">Risk score</div>
            <div className="flex items-end gap-2 mt-1">
              <div className="text-3xl font-semibold">{estimate.riskScore}</div>
              <div className="text-xs text-muted-foreground mb-1">/100</div>
            </div>
            <div className="h-2 mt-3 rounded-full bg-secondary overflow-hidden">
              <motion.div className="h-full bg-gradient-primary"
                animate={{ width: `${estimate.riskScore}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}
function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("space-y-2", full && "md:col-span-2")}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
function SegField<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly T[]; onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex p-1 rounded-lg bg-secondary/50 border border-border">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)}
            className={cn("flex-1 text-xs py-2 rounded-md transition-all",
              value === o ? "bg-gradient-primary text-primary-foreground glow" : "text-muted-foreground hover:text-foreground")}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
function ToggleRow({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border hover:border-primary/30 transition">
      <div>
        <div className="text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  );
}