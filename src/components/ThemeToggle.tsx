"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      {/* Sun */}
      <svg
        className={`h-4 w-4 transition-colors duration-300 ${isDark ? "text-text-muted" : "text-amber-400"}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
      >
        <path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>

      {/* Switch */}
      <button
        onClick={toggle}
        className="relative h-7 w-12 rounded-full border border-card-inner-border bg-card-inner-bg transition-colors duration-300"
        style={{ transitionTimingFunction: "var(--ease-out)" }}
        aria-label="Basculer le thème"
      >
        <div
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#6817F8] to-[#EE56CE] shadow-[0_0_8px_rgba(236,77,203,0.3)] transition-transform duration-300"
          style={{
            left: isDark ? "calc(100% - 24px)" : "3px",
            transitionTimingFunction: "var(--ease-out)",
          }}
        />
      </button>

      {/* Moon */}
      <svg
        className={`h-4 w-4 transition-colors duration-300 ${isDark ? "text-[#EE56CE]" : "text-text-muted"}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
      >
        <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
      </svg>
    </div>
  );
}
