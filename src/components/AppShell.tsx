import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Sparkles, PieChart, GitCompareArrows,
  FileText, FolderOpen, Sun, Moon, Building2,
} from "lucide-react";
import { useTheme } from "@/hooks/useProject";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/wizard", label: "New Estimate", icon: Sparkles },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/breakdown", label: "Breakdown", icon: PieChart },
  { to: "/compare", label: "Compare", icon: GitCompareArrows },
  { to: "/report", label: "Report", icon: FileText },
  { to: "/projects", label: "Saved Projects", icon: FolderOpen },
] as const;

export function AppShell({ children, title }: { children: React.ReactNode; title: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none"
           style={{ background: "var(--gradient-glow)" }} />

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2 p-4 border-r border-border/60 glass relative z-10">
        <Link to="/" className="flex items-center gap-2 px-2 py-3 mb-2">
          <div className="size-9 rounded-xl bg-gradient-primary grid place-items-center glow">
            <Building2 className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-semibold tracking-tight">BuildScope</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">San Francisco</div>
          </div>
        </Link>
        <nav className="flex flex-col gap-1 mt-2">
          {NAV.map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-secondary/80 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                )}
              >
                {active && (
                  <motion.div layoutId="nav-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r bg-primary glow" />
                )}
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto p-3 rounded-xl glass glow-border">
          <div className="text-xs text-muted-foreground">Pro tip</div>
          <div className="text-sm mt-1">Toggle sustainability options to see live impact on your final estimate.</div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 border-b border-border/60 flex items-center justify-between px-4 md:px-8 glass">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">BuildScope SF</div>
            <h1 className="text-base font-medium">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Link to="/wizard">
              <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow">
                <Sparkles className="size-4" /> New Estimate
              </Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
        {/* Mobile bottom nav */}
        <nav className="md:hidden sticky bottom-0 flex justify-around border-t border-border/60 glass py-2">
          {NAV.slice(0, 5).map((item) => {
            const active = path === item.to;
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to}
                className={cn("flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
                  active ? "text-primary" : "text-muted-foreground")}>
                <Icon className="size-4" />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}