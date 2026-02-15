"use client";

import { cn } from "../../lib/utils";

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#ff6b3533",
  gradientOpacity = 0,
  gradientFrom = "#ff6b35",
  gradientTo = "#e63946",
}) {
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-zinc-800/60 bg-zinc-900/40",
        "overflow-hidden transition-all duration-300",
        "hover:border-orange-500/20 hover:bg-zinc-900/60",
        className
      )}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
        e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
      }}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(${gradientSize}px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${gradientColor}, transparent 65%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
