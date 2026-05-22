import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useProject } from "@/hooks/useProject";
import { calculate, formatUSD } from "@/lib/buildscope";
import { Button } from "@/components/ui/button";
import { Download, Building2 } from "lucide-react";

export const Route = createFileRoute("/report")({
  head: () => ({ meta: [{ title: "Project Report — BuildScope SF" }, { name: "description", content: "Polished report preview of your construction estimate." }] }),
  component: ReportPage,
});

function Card({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl p-5 border ${accent ? "border-primary/40 bg-primary/5" : "border-border bg-secondary/30"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">{title}</div>
      {children}
    </div>
  );
}

function ReportPage() {
  const { project } = useProject();
  const e = useMemo(() => calculate(project), [project]);

  const rows: [string, number][] = [
    ["Base construction", e.baseCost],
    ["Location adjustment", e.locationAdjusted - e.baseCost],
    ["Structural complexity", e.structuralAdjusted - e.locationAdjusted],
    ["Site access", e.siteAdjusted - e.structuralAdjusted],
    ["Permits", e.permitCost],
    ["Sustainability", e.sustainabilityCost],
    ["Contingency (12%)", e.contingency],
  ];

  return (
    <AppShell title="Report Preview">
      <div className="flex justify-between items-end mb-4">
        <div className="text-sm text-muted-foreground">A polished summary you can share with stakeholders.</div>
        <Button onClick={() => toast.success("Report queued (demo)", { description: "PDF export is mocked in this frontend demo." })}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow">
          <Download className="size-4" /> Download Report
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl glass glow-border p-10 md:p-14 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-border/60 pb-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-primary grid place-items-center glow">
              <Building2 className="size-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold tracking-tight">BuildScope SF</div>
              <div className="text-xs text-muted-foreground">Construction Estimate · {new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">Report #{project.id.slice(0, 8).toUpperCase()}</div>
        </div>

        <div className="mt-8">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Project</div>
          <h2 className="text-4xl font-semibold tracking-tight mt-1">{project.name}</h2>
          <div className="text-sm text-muted-foreground mt-2">
            {project.propertyType} · {project.zone} · {project.sqft.toLocaleString()} sqft · {project.floors} floor{project.floors > 1 ? "s" : ""}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <Card label="Estimated final cost" value={formatUSD(e.finalCost, true)} accent />
          <Card label="Cost per sqft" value={formatUSD(e.costPerSqft)} />
          <Card label="Timeline" value={`${e.timelineMonths} mo`} />
        </div>

        <Section title="Cost breakdown">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k} className="border-b border-border/40">
                  <td className="py-2.5 text-muted-foreground">{k}</td>
                  <td className="py-2.5 text-right tabular-nums">{formatUSD(v)}</td>
                </tr>
              ))}
              <tr>
                <td className="py-3 font-semibold">Final</td>
                <td className="py-3 text-right font-semibold text-gradient tabular-nums">{formatUSD(e.finalCost)}</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Section title="Timeline">
          <div className="text-sm text-muted-foreground">
            Estimated start <span className="text-foreground">{project.startDate}</span>, completion in approximately{" "}
            <span className="text-foreground">{e.timelineMonths} months</span> at {project.urgency.toLowerCase()} pace.
          </div>
        </Section>

        <Section title="Risk notes">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-semibold">{e.riskScore}/100</div>
            <div className="text-xs text-muted-foreground">Confidence {e.confidence}%</div>
          </div>
          <ul className="text-sm text-muted-foreground mt-3 space-y-1.5 list-disc pl-4">
            <li>Structural complexity: {project.structural}</li>
            <li>Permit complexity: {project.permit}</li>
            <li>Site access: {project.siteAccess}</li>
            <li>Schedule pressure: {project.urgency}</li>
          </ul>
        </Section>

        <Section title="Recommendations">
          <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
            <li>Lock contractor bids within ±5% of the {formatUSD(e.finalCost, true)} ceiling.</li>
            <li>Allocate the 12% contingency separately to avoid scope erosion.</li>
            <li>Validate permit timelines with SF Planning before committing to the start date.</li>
            {project.urgency === "Fast-track" && <li>Pre-order long-lead materials (windows, custom millwork) immediately.</li>}
          </ul>
        </Section>

        <div className="mt-10 pt-6 border-t border-border/60 text-xs text-muted-foreground text-center">
          Generated by BuildScope SF · Estimates are indicative and assume 2026 market conditions.
        </div>
      </motion.div>
    </AppShell>
  );
}