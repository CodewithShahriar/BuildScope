import { useEffect, useState, useCallback } from "react";
import { defaultProject, loadCurrent, saveCurrent, type ProjectInput } from "@/lib/buildscope";

export function useProject() {
  const [project, setProject] = useState<ProjectInput>(() => defaultProject());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadCurrent();
    if (saved) setProject(saved);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCurrent(project);
  }, [project, hydrated]);

  const update = useCallback(<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => {
    setProject((p) => ({ ...p, [key]: value }));
  }, []);

  return { project, setProject, update, hydrated };
}

export function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("buildscope:theme")) as "dark" | "light" | null;
    if (stored) setTheme(stored);
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("buildscope:theme", theme);
  }, [theme]);
  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}