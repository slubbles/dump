"use client";

import { cn } from "../../lib/utils";
import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  className,
  gaugeColor = "#ff6b35",
  gaugeBgColor = "#27272a",
  showValue = true,
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [currentValue, setCurrentValue] = useState(min);

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        setCurrentValue(value);
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [isInView, value]);

  const circumference = 2 * Math.PI * 45;
  const percentPx = circumference - ((currentValue - min) / (max - min)) * circumference;

  return (
    <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)}>
      <svg className="transform -rotate-90" width="120" height="120" viewBox="0 0 120 120">
        <circle
          className="transition-all duration-100"
          strokeWidth="8"
          stroke={gaugeBgColor}
          fill="transparent"
          r="45"
          cx="60"
          cy="60"
        />
        <circle
          className="transition-all duration-1000 ease-out"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={percentPx}
          strokeLinecap="round"
          stroke={gaugeColor}
          fill="transparent"
          r="45"
          cx="60"
          cy="60"
        />
      </svg>
      {showValue && (
        <span className="absolute text-2xl font-black" style={{ color: gaugeColor }}>
          {currentValue}
        </span>
      )}
    </div>
  );
}
