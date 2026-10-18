"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { useMounted } from "@/hooks/useMounted";

export function ThemeToggle() {
  const { theme, toggle } = useThemeStore();
  const mounted = useMounted();

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
      aria-label="Toggle dark mode"
    >
      {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
    </button>
  );
}
