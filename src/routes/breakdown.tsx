import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { useProject } from "@/hooks/useProject";
import { calculate, formatUSD, type ProjectInput } from "@/lib/buildscope";

export const Route = createFileRoute("/breakdown")({
  head: () => ({ meta: [{ title: "Cost Breakdown — BuildScope SF" }, { name: "description", content: "Detailed line-item breakdown of your San Francisco construction estimate." }] }),
  component: BreakdownPage,
});

function featuresLine(p: ProjectInput) {
  const f: string[] = [];
  if (p.solarReady) f.push("Solar");
  if (p.greenMaterials) f.push("Green materials");
  if (p.efficientWindows) f.push("Eff. windows");
  if (p.smartHome) f.push("Smart home");
  return f.length ? f.join(" · ") : "None selected";
}

function BreakdownPage() {
  const { project } = useProject();
  const e = useMemo(() => calculate(project), [project]);

  const rows = [
    { name: "Base construction", value: e.baseCost, note: `${project.sqft.toLocaleString()} sqft × ${project.quality}` },
    { name: "Location adjustment", value: e.locationAdjusted - e.baseCost, note: project.zone },
    { name: "Structural complexity", value: e.structuralAdjusted - e.locationAdjusted, note: project.structural },
    { name: "Site access", value: e.siteAdjusted - e.structuralAdjusted, note: project.siteAccess },
    { name: "Permits", value: e.permitCost, note: `${project.permit} complexity` },
    { name: "Sustainability upgrades", value: e.sustainabilityCost, note: featuresLine(project) },
    { name: "Contingency", value: e.contingency, note: "12% of subtotal" },
  ];

  return (
    <AppShell title="Cost Breakdown">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="rounded-2xl glass glow-border overflow-hidden">
          <div className="p-6 border-b border-border/60 flex justify-between items-end">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Itemized</div>
              <h2 className="text-2xl font-semibold mt-1">{project.name}</h2>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Final estimate</div>
              <div className="text-3xl font-semibold text-gradient">{formatUSD(e.finalCost, true)}</div>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left p-4">Line item</th>
                <th className="text-left p-4">Detail</th>
                <th className="text-right p-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <motion.tr key={r.name}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="border-t border-border/40 hover:bg-secondary/20 transition">
                  <td className="p-4 font-medium">{r.name}</td>
                  <td className="p-4 text-muted-foreground text-xs">{r.note}</td>
                  <td className="p-4 text-right tabular-nums">{formatUSD(r.value)}</td>
                </motion.tr>
              ))}
              <tr className="border-t border-border bg-secondary/30">
                <td className="p-4 font-semibold" colSpan={2}>Final estimated project cost</td>
                <td className="p-4 text-right text-lg font-semibold text-gradient tabular-nums">{formatUSD(e.finalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl glass p-5">
            <div className="text-xs text-muted-foreground">Labor</div>
            <div className="text-2xl font-semibold">{formatUSD(e.laborEstimate, true)}</div>
          </div>
          <div className="rounded-2xl glass p-5">
            <div className="text-xs text-muted-foreground">Materials</div>
            <div className="text-2xl font-semibold">{formatUSD(e.materialEstimate, true)}</div>
          </div>
          <div className="rounded-2xl glass p-5">
            <div className="text-xs text-muted-foreground">Finishing</div>
            <div className="text-2xl font-semibold">{formatUSD(e.finishingEstimate, true)}</div>
          </div>
          <div className="rounded-2xl glass p-5">
            <div className="text-xs text-muted-foreground">Cost / sqft</div>
            <div className="text-2xl font-semibold">{formatUSD(e.costPerSqft)}</div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}