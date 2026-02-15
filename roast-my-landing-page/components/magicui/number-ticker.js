"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
}) {
  const ref = useRef(null);
  const [displayValue, setDisplayValue] = useState(direction === "down" ? value : 0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    let rafId;
    let timerId;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const duration = 2000;
          const startValue = direction === "down" ? value : 0;
          const endValue = direction === "down" ? 0 : value;

          timerId = setTimeout(() => {
            const animate = () => {
              const elapsed = Date.now() - startTime - delay;
              if (elapsed < 0) {
                rafId = requestAnimationFrame(animate);
                return;
              }
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = startValue + (endValue - startValue) * eased;
              setDisplayValue(Number(current.toFixed(decimalPlaces)));
              if (progress < 1) {
                rafId = requestAnimationFrame(animate);
              }
            };
            rafId = requestAnimationFrame(animate);
          }, delay);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      if (timerId) clearTimeout(timerId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value, direction, delay, hasAnimated, decimalPlaces]);

  return (
    <span ref={ref} className={cn("inline-block tabular-nums tracking-wider", className)}>
      {displayValue}
    </span>
  );
}
