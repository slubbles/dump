"use client";

import { cn } from "../../lib/utils";

export function ShineBorder({
  borderRadius = 8,
  borderWidth = 1,
  duration = 14,
  color = ["#ff6b35", "#e63946", "#ff6b35"],
  className,
  children,
}) {
  return (
    <div
      style={{
        "--border-radius": `${borderRadius}px`,
      }}
      className={cn(
        "relative grid min-h-[60px] w-full place-items-center rounded-[var(--border-radius)] bg-zinc-900/40 p-3",
        className
      )}
    >
      <div
        style={{
          "--border-radius": `${borderRadius}px`,
          "--border-width": `${borderWidth}px`,
          "--shine-pulse-duration": `${duration}s`,
          "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          "--background-radial-gradient": `radial-gradient(transparent,transparent, ${Array.isArray(color) ? color.join(",") : color},transparent,transparent)`,
        }}
        className="before:absolute before:inset-0 before:aspect-square before:size-full before:rounded-[var(--border-radius)] before:p-[var(--border-width)] before:will-change-[background-position] before:content-[''] before:![-webkit-mask-composite:xor] before:![mask-composite:exclude] before:[background-image:var(--background-radial-gradient)] before:[background-size:300%_300%] before:[mask:var(--mask-linear-gradient)] motion-safe:before:animate-shine-pulse pointer-events-none absolute inset-0 rounded-[var(--border-radius)]"
      />
      {children}
    </div>
  );
}
