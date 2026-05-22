import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useProject } from "@/hooks/useProject";
import { calculate, formatUSD, QUALITY_RATE, type Quality } from "@/lib/buildscope";
import { Button } from "@/components/ui/button";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { AlertTriangle, TrendingUp, Clock, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Estimate Dashboard — BuildScope SF" }, { name: "description", content: "Live cost dashboard with charts, breakdowns, and smart insights." }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { project, hydrated } = useProject();
  const [loading, setLoading] = useState(true);
  const estimate = useMemo(() => calculate(project), [project]);

  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [hydrated]);

  const qualityBars = (["Basic","Standard","Premium","Luxury"] as Quality[]).map((q) => {
    const e = calculate({ ...project, quality: q });
    return { quality: q, cost: Math.round(e.finalCost) };
  });

  const insights = buildInsights(project, estimate);

  if (loading) return <AppShell title="Dashboard"><Skeleton /></AppShell>;

  return (
    <AppShell title="Estimate Dashboard">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">{project.propertyType} · {project.zone}</div>
            <h2 className="text-3xl font-semibold tracking-tight mt-1">{project.name}</h2>
          </div>
          <div className="flex gap-2">
            <Link to="/wizard"><Button variant="outline" className="glass">Edit inputs</Button></Link>
            <Link to="/report">
              <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow">
                View Report <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero number */}
        <div className="rounded-3xl glass glow-border p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[300px] pointer-events-none"
               style={{ background: "var(--gradient-glow)" }} />
          <div className="relative grid md:grid-cols-3 gap-6 items-end">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Final estimate</div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-7xl font-semibold tracking-tight text-gradient mt-2">
                {formatUSD(estimate.finalCost, true)}
              </motion.div>
              <div className="text-sm text-muted-foreground mt-2">Includes 12% contingency · {formatUSD(estimate.costPerSqft)}/sqft</div>
            </div>
            <StatTile icon={Clock} label="Timeline" value={`${estimate.timelineMonths} mo`} />
            <StatTile icon={ShieldCheck} label="Confidence" value={`${estimate.confidence}%`} accent />
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 rounded-2xl glass p-6">
            <div className="text-sm text-muted-foreground">Cost breakdown</div>
            <div className="h-64 mt-2">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={estimate.breakdown} dataKey="value" nameKey="name"
                    innerRadius={60} outerRadius={95} paddingAngle={2}>
                    {estimate.breakdown.map((b) => <Cell key={b.name} fill={b.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatUSD(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {estimate.breakdown.map((b) => (
                <div key={b.name} className="flex items-center gap-2 text-xs">
                  <span className="size-2 rounded-full" style={{ background: b.color }} />
                  <span className="text-muted-foreground">{b.name}</span>
                  <span className="ml-auto tabular-nums">{formatUSD(b.value, true)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 rounded-2xl glass p-6">
            <div className="text-sm text-muted-foreground">Quality tier comparison</div>
            <div className="h-64 mt-2">
              <ResponsiveContainer>
                <BarChart data={qualityBars}>
                  <XAxis dataKey="quality" stroke="oklch(0.7 0.03 260)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.7 0.03 260)" fontSize={11} tickFormatter={(v) => formatUSD(Number(v), true)} tickLine={false} axisLine={false} width={60} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatUSD(Number(v))} cursor={{ fill: "oklch(1 0 0 / 0.04)" }} />
                  <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                    {qualityBars.map((q) => (
                      <Cell key={q.quality}
                        fill={q.quality === project.quality ? "oklch(0.78 0.18 195)" : "oklch(0.4 0.04 260)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-muted-foreground mt-2">Highlighted bar shows your current tier ({project.quality}, ${QUALITY_RATE[project.quality]}/sqft).</div>
          </div>
        </div>

        {/* Risk + insights */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="rounded-2xl glass p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Risk score</div>
                <div className="text-5xl font-semibold mt-2">{estimate.riskScore}<span className="text-base text-muted-foreground">/100</span></div>
              </div>
              <div className={cn("px-3 py-1 rounded-full text-xs",
                estimate.riskScore < 35 ? "bg-chart-5/20 text-chart-5"
                  : estimate.riskScore < 65 ? "bg-chart-3/20 text-chart-3"
                  : "bg-destructive/20 text-destructive")}>
                {estimate.riskScore < 35 ? "Low" : estimate.riskScore < 65 ? "Medium" : "High"}
              </div>
            </div>
            <div className="h-2 mt-4 rounded-full bg-secondary overflow-hidden">
              <motion.div className="h-full bg-gradient-primary"
                initial={{ width: 0 }} animate={{ width: `${estimate.riskScore}%` }} transition={{ duration: 0.8 }} />
            </div>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <div>Structural: {project.structural}</div>
              <div>Permit: {project.permit}</div>
              <div>Site access: {project.siteAccess}</div>
              <div>Urgency: {project.urgency}</div>
            </div>
          </div>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
            {insights.map((ins, i) => (
              <motion.div key={ins.title}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="rounded-2xl glass p-5 hover:-translate-y-0.5 transition-transform">
                <div className="flex items-center gap-2">
                  <ins.icon className="size-4 text-primary" />
                  <div className="text-sm font-medium">{ins.title}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">{ins.body}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Link to="/compare">
            <Button variant="outline" className="glass">
              <Sparkles className="size-4" /> Run scenario comparison
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

const tooltipStyle = {
  background: "oklch(0.21 0.025 260)",
  border: "1px solid oklch(1 0 0 / 0.12)",
  borderRadius: 12,
  fontSize: 12,
  color: "white",
};

function StatTile({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-xl p-5 border", accent ? "border-primary/30 bg-primary/5" : "border-border bg-secondary/30")}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="size-3.5" />{label}</div>
      <div className="text-3xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function buildInsights(p: any, e: any) {
  const arr: { title: string; body: string; icon: any }[] = [];
  if (p.permit === "High") arr.push({ icon: AlertTriangle, title: "Permit complexity may increase your budget", body: "High permit complexity adds ~14% on adjusted costs — plan for added time and consulting fees." });
  if (p.siteAccess === "Difficult") arr.push({ icon: AlertTriangle, title: "Difficult site access can raise labor cost", body: "Tight access requires smaller crews and specialized equipment, pushing labor up ~18%." });
  if (p.quality === "Premium" || p.quality === "Luxury") arr.push({ icon: TrendingUp, title: `${p.quality} finishes are your largest cost driver`, body: "Consider mixing high-impact rooms at this tier and stepping others down to Standard." });
  if (p.urgency === "Fast-track") arr.push({ icon: Clock, title: "Fast-track adds overtime risk", body: "Compressed schedules raise labor premiums and increase coordination risk on inspections." });
  if (p.solarReady || p.efficientWindows) arr.push({ icon: ShieldCheck, title: "Sustainability options may qualify for SF incentives", body: "BayREN and SFPUC programs occasionally offset solar and envelope upgrades — verify availability." });
  if (arr.length < 4) arr.push({ icon: TrendingUp, title: "Your estimate is healthy", body: `Confidence sits at ${e.confidence}% with the chosen factor mix.` });
  return arr.slice(0, 4);
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-32 rounded-2xl bg-secondary/40" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-64 rounded-2xl bg-secondary/40" />
        <div className="h-64 rounded-2xl bg-secondary/40" />
      </div>
    </div>
  );
}