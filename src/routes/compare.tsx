import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { useProject } from "@/hooks/useProject";
import { calculate, formatUSD, type ProjectInput } from "@/lib/buildscope";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export const Route = createFileRoute("/compare")({
  head: () => ({ meta: [{ title: "Scenario Compare — BuildScope SF" }, { name: "description", content: "Compare quality tiers, sustainability, and urgency side by side." }] }),
  component: ComparePage,
});

const SCENARIOS = [
  { id: "std-prem", label: "Standard vs Premium" },
  { id: "prem-lux", label: "Premium vs Luxury" },
  { id: "sust", label: "With vs Without Sustainability" },
  { id: "speed", label: "Normal vs Fast-track" },
] as const;

function buildScenario(id: string, p: ProjectInput) {
  switch (id) {
    case "std-prem":
      return [
        { label: "Standard", project: { ...p, quality: "Standard" as const } },
        { label: "Premium", project: { ...p, quality: "Premium" as const } },
      ];
    case "prem-lux":
      return [
        { label: "Premium", project: { ...p, quality: "Premium" as const } },
        { label: "Luxury", project: { ...p, quality: "Luxury" as const } },
      ];
    case "sust":
      return [
        { label: "Without sustainability", project: { ...p, solarReady: false, greenMaterials: false, efficientWindows: false, smartHome: false } },
        { label: "With sustainability", project: { ...p, solarReady: true, greenMaterials: true, efficientWindows: true, smartHome: true } },
      ];
    case "speed":
      return [
        { label: "Normal pace", project: { ...p, urgency: "Normal" as const } },
        { label: "Fast-track", project: { ...p, urgency: "Fast-track" as const } },
      ];
  }
  return [{ label: "A", project: p }, { label: "B", project: p }];
}

function ComparePage() {
  const { project } = useProject();
  const [scenario, setScenario] = useState<string>("std-prem");

  const pair = useMemo(() => buildScenario(scenario, project), [scenario, project]);
  const a = pair[0], b = pair[1];
  const ea = calculate(a.project);
  const eb = calculate(b.project);
  const diff = eb.finalCost - ea.finalCost;

  const data = [
    { name: a.label, cost: Math.round(ea.finalCost), color: "oklch(0.4 0.04 260)" },
    { name: b.label, cost: Math.round(eb.finalCost), color: "oklch(0.78 0.18 195)" },
  ];

  return (
    <AppShell title="Scenario Comparison">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s) => (
            <button key={s.id} onClick={() => setScenario(s.id)}
              className={cn("px-4 py-2 rounded-full text-sm transition",
                scenario === s.id ? "bg-gradient-primary text-primary-foreground glow" : "glass text-muted-foreground hover:text-foreground")}>
              {s.label}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[{ s: a, e: ea }, { s: b, e: eb }].map((item, i) => (
            <motion.div key={item.s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className={cn("rounded-2xl p-6 glass", i === 1 && "glow-border")}>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.s.label}</div>
              <div className="text-4xl font-semibold mt-2 text-gradient">{formatUSD(item.e.finalCost, true)}</div>
              <div className="text-sm text-muted-foreground mt-1">{formatUSD(item.e.costPerSqft)}/sqft · {item.e.timelineMonths} mo · Risk {item.e.riskScore}/100</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Mini label="Labor" value={formatUSD(item.e.laborEstimate, true)} />
                <Mini label="Materials" value={formatUSD(item.e.materialEstimate, true)} />
                <Mini label="Permits" value={formatUSD(item.e.permitCost, true)} />
                <Mini label="Sustainability" value={formatUSD(item.e.sustainabilityCost, true)} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl glass p-6">
          <div className="flex justify-between mb-2">
            <div className="text-sm text-muted-foreground">Side-by-side total</div>
            <div className={cn("text-sm font-medium", diff >= 0 ? "text-destructive" : "text-chart-5")}>
              {diff >= 0 ? "+" : ""}{formatUSD(diff)} ({((diff / ea.finalCost) * 100).toFixed(1)}%)
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={data} layout="vertical">
                <XAxis type="number" stroke="oklch(0.7 0.03 260)" fontSize={11} tickFormatter={(v) => formatUSD(Number(v), true)} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" stroke="oklch(0.7 0.03 260)" fontSize={12} tickLine={false} axisLine={false} width={140} />
                <Tooltip contentStyle={{ background: "oklch(0.21 0.025 260)", border: "1px solid oklch(1 0 0 / 0.12)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v) => formatUSD(Number(v))} cursor={{ fill: "oklch(1 0 0 / 0.04)" }} />
                <Bar dataKey="cost" radius={[0, 8, 8, 0]}>
                  {data.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 p-3">
      <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{label}</div>
      <div className="font-medium tabular-nums">{value}</div>
    </div>
  );
}