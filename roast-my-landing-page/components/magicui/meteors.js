"use client";

import { cn } from "../../lib/utils";

export function Meteors({ number = 20, className }) {
  const meteors = new Array(number).fill(true);
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {meteors.map((_, idx) => (
        <span
          key={idx}
          className="absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-orange-400 shadow-[0_0_0_1px_#ffffff10]"
          style={{
            top: 0,
            left: `${Math.floor(Math.random() * 400) - 100}px`,
            animationDelay: `${Math.random() * 0.6 + 0.2}s`,
            animationDuration: `${Math.floor(Math.random() * 8 + 2)}s`,
          }}
        >
          <div className="absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-orange-400 to-transparent" />
        </span>
      ))}
    </div>
  );
}
