import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useProject } from "@/hooks/useProject";
import {
  calculate, deleteProject, formatUSD, loadSaved, saveProject,
  type ProjectInput,
} from "@/lib/buildscope";
import { Button } from "@/components/ui/button";
import { Trash2, FolderOpen, Save, Sparkles } from "lucide-react";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Saved Projects — BuildScope SF" }, { name: "description", content: "Manage previously saved construction estimates." }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { project, setProject } = useProject();
  const [list, setList] = useState<ProjectInput[]>([]);

  useEffect(() => { setList(loadSaved()); }, []);
  const refresh = () => setList(loadSaved());

  return (
    <AppShell title="Saved Projects">
      <div className="flex justify-between items-end mb-6">
        <p className="text-sm text-muted-foreground">All your estimates live locally in this browser.</p>
        <Button onClick={() => { saveProject(project); refresh(); toast.success("Current project saved"); }}
          className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow">
          <Save className="size-4" /> Save current
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl glass glow-border p-16 text-center">
          <FolderOpen className="size-10 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-medium mt-4">No saved projects yet</h2>
          <p className="text-sm text-muted-foreground mt-1">Generate an estimate and it'll appear here.</p>
          <Link to="/wizard">
            <Button className="mt-6 bg-gradient-primary text-primary-foreground hover:opacity-90 glow">
              <Sparkles className="size-4" /> Start new estimate
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {list.map((p, i) => {
              const e = calculate(p);
              return (
                <motion.div key={p.id} layout
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                  className="rounded-2xl glass glow-border p-5 hover:-translate-y-0.5 transition-transform">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{p.propertyType} · {p.zone}</div>
                      <div className="font-medium mt-1">{p.name}</div>
                    </div>
                    <button onClick={() => { deleteProject(p.id); refresh(); toast("Project deleted"); }}
                      className="text-muted-foreground hover:text-destructive transition" aria-label="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="text-3xl font-semibold mt-3 text-gradient">{formatUSD(e.finalCost, true)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{p.sqft.toLocaleString()} sqft · {p.quality} · {e.timelineMonths} mo</div>
                  <div className="mt-4 flex gap-2">
                    <Link to="/dashboard" className="flex-1">
                      <Button variant="outline" className="w-full glass" onClick={() => setProject(p)}>Open</Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </AppShell>
  );
}