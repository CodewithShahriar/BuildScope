import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useProject";
import { Button } from "@/components/ui/button";
import {
  Sparkles, ArrowRight, Building2, ShieldCheck,
  Zap, Sun, Moon, LineChart, Layers, Activity,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BuildScope SF — Estimate San Francisco Construction Costs in Minutes" },
      { name: "description", content: "Plan smarter with live cost projections, premium material breakdowns, timeline estimates, and risk insights — all in one modern calculator." },
    ],
  }),
  component: Index,
});

function Index() {
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] pointer-events-none"
           style={{ background: "var(--gradient-glow)" }} />

      <header className="relative z-10 max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center glow">
            <Building2 className="size-5 text-primary-foreground" />
          </div>
          <div className="font-semibold tracking-tight">BuildScope <span className="text-muted-foreground font-normal">SF</span></div>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#stats" className="hover:text-foreground transition">Why us</a>
          <a href="#preview" className="hover:text-foreground transition">Preview</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Link to="/wizard">
            <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow">
              Start <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </header>

      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs text-muted-foreground mb-6">
          <span className="size-1.5 rounded-full bg-primary glow" />
          Live for San Francisco · 2026 pricing data
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]">
          Estimate <span className="text-gradient">San Francisco</span><br />
          construction costs in minutes
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Plan smarter with live cost projections, premium material breakdowns,
          timeline estimates, and risk insights — all in one modern calculator.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/wizard">
            <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow h-12 px-6">
              <Sparkles className="size-4" /> Start Estimating
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="h-12 px-6 glass">
              View Demo <ArrowRight className="size-4" />
            </Button>
          </Link>
        </motion.div>

        <motion.div id="preview"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-20 relative">
          <div className="rounded-2xl glass glow-border p-4 md:p-6 text-left shadow-[var(--shadow-elegant)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-2.5 rounded-full bg-destructive/70" />
              <div className="size-2.5 rounded-full bg-chart-3/70" />
              <div className="size-2.5 rounded-full bg-chart-5/70" />
              <div className="ml-auto text-xs text-muted-foreground">buildscope.app/dashboard</div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <PreviewStat label="Final estimate" value="$1.84M" trend="+4.2% vs base" />
              <PreviewStat label="Cost / sqft" value="$836" trend="Premium tier" />
              <PreviewStat label="Timeline" value="9.4 mo" trend="Normal pace" />
            </div>
            <div className="mt-4 grid md:grid-cols-5 gap-4">
              <div className="md:col-span-3 rounded-xl bg-secondary/40 p-5 h-56 relative overflow-hidden">
                <div className="text-xs text-muted-foreground mb-2">Cost breakdown</div>
                <div className="flex items-end gap-3 h-36">
                  {[60, 78, 42, 90, 55, 70].map((h, i) => (
                    <motion.div key={i}
                      initial={{ height: 0 }} animate={{ height: `${h}%` }}
                      transition={{ delay: 0.6 + i * 0.08, duration: 0.7, ease: "easeOut" }}
                      className="flex-1 rounded-t-md"
                      style={{ background: "linear-gradient(180deg, oklch(0.78 0.18 195), oklch(0.68 0.22 310))" }}
                    />
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 rounded-xl bg-secondary/40 p-5 h-56 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Risk score</div>
                  <div className="text-3xl font-semibold mt-1">42<span className="text-base text-muted-foreground">/100</span></div>
                </div>
                <div className="space-y-2">
                  {["Permit complexity", "Site access", "Fast-track"].map((t, i) => (
                    <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-1.5 rounded-full" style={{ background: `oklch(0.78 0.18 ${195 + i * 40})` }} />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="stats" className="relative z-10 max-w-6xl mx-auto px-6 py-16 border-t border-border/40">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: "1.2K+", l: "SF projects modeled" },
            { v: "$840M", l: "in budgets planned" },
            { v: "94%", l: "estimate confidence" },
            { v: "<2 min", l: "to first estimate" },
          ].map((s) => (
            <div key={s.l} className="p-6 rounded-xl glass">
              <div className="text-3xl md:text-4xl font-semibold text-gradient">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Features</div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">Built for serious SF builders</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="p-6 rounded-2xl glass glow-border hover:-translate-y-0.5 transition-transform">
              <div className="size-10 rounded-lg bg-gradient-primary grid place-items-center glow mb-4">
                <f.icon className="size-5 text-primary-foreground" />
              </div>
              <div className="font-medium">{f.title}</div>
              <div className="text-sm text-muted-foreground mt-2">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="p-10 rounded-3xl glass glow-border">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Your next project, scoped.</h2>
          <p className="mt-3 text-muted-foreground">Open the wizard and get a beautifully detailed estimate in under two minutes.</p>
          <Link to="/wizard">
            <Button size="lg" className="mt-8 bg-gradient-primary text-primary-foreground hover:opacity-90 glow h-12 px-6">
              <Sparkles className="size-4" /> Start Estimating
            </Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-8 text-xs text-muted-foreground flex justify-between border-t border-border/40">
        <span>© 2026 BuildScope SF</span>
        <span>Frontend demo · figures are illustrative</span>
      </footer>
    </div>
  );
}

function PreviewStat({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-xl bg-secondary/40 p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      <div className="text-[11px] text-primary mt-1">{trend}</div>
    </div>
  );
}

const FEATURES = [
  { title: "Live calculations", desc: "Every change updates the final cost, timeline, and risk score in real time.", icon: Zap },
  { title: "Premium breakdowns", desc: "Labor, materials, finishing, permits, sustainability — all clearly itemized.", icon: Layers },
  { title: "SF-aware pricing", desc: "Zone multipliers from Downtown to Sunset bake in local cost reality.", icon: Building2 },
  { title: "Risk insights", desc: "A radar of permit, structural, and site risks before you commit a dollar.", icon: ShieldCheck },
  { title: "Scenario compare", desc: "Pit Premium vs Luxury, sustainable vs standard, fast vs flexible.", icon: LineChart },
  { title: "Confidence meter", desc: "Understand how solid your estimate is before sharing it with stakeholders.", icon: Activity },
];