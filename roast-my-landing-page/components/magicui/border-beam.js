"use client";

import { cn } from "../../lib/utils";

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#ffaa40",
  colorTo = "#e63946",
  delay = 0,
}) {
  return (
    <div
      style={{
        "--size": size,
        "--duration": `${duration}s`,
        "--anchor": anchor,
        "--border-width": borderWidth,
        "--color-from": colorFrom,
        "--color-to": colorTo,
        "--delay": `-${delay}s`,
      }}
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),conic-gradient(from_calc((var(--anchor)-var(--size)*0.5)*1deg),transparent_0%,var(--color-from)_calc(var(--size)*0.5*1%),var(--color-to)_calc(var(--size)*1%),transparent_calc(var(--size)*1.5*1%))]",
        "animate-border-beam [animation-delay:var(--delay)]",
        className
      )}
    />
  );
}
