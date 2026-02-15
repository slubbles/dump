"use client";

import { cn } from "../../lib/utils";

export function AnimatedBeamMultiple({ className }) {
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden", className)}>
      <svg
        className="absolute h-full w-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="beam-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6b35" stopOpacity="0" />
            <stop offset="50%" stopColor="#ff6b35" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#e63946" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1="0%"
          y1="50%"
          x2="100%"
          y2="50%"
          stroke="url(#beam-gradient-1)"
          strokeWidth="2"
          className="animate-beam"
        />
      </svg>
    </div>
  );
}
