import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "reliefnet-theme";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const timer = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const syncTheme = () => {
      let preference;
      try { preference = localStorage.getItem(STORAGE_KEY); } catch {}
      const next = preference === "dark" || (preference !== "light" && media.matches);
      document.documentElement.classList.toggle("dark", next);
      document.documentElement.style.colorScheme = next ? "dark" : "light";
      setDark(next);
    };
    const syncStorage = (event) => {
      if (event.key === STORAGE_KEY || event.key === null) syncTheme();
    };
    media.addEventListener("change", syncTheme);
    window.addEventListener("storage", syncStorage);
    return () => {
      media.removeEventListener("change", syncTheme);
      window.removeEventListener("storage", syncStorage);
      window.clearTimeout(timer.current);
      document.documentElement.classList.remove("theme-transition");
    };
  }, []);

  function toggleTheme() {
    const next = !dark;
    const root = document.documentElement;
    root.classList.add("theme-transition");
    root.classList.toggle("dark", next);
    root.style.colorScheme = next ? "dark" : "light";
    setDark(next);
    try { localStorage.setItem(STORAGE_KEY, next ? "dark" : "light"); } catch {}
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => root.classList.remove("theme-transition"), 240);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="theme-toggle relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-soft hover:bg-bg-alt hover:text-ink"
    >
      <svg className="theme-sun absolute h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </svg>
      <svg className="theme-moon absolute h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />
      </svg>
    </button>
  );
}
