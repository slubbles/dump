"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export function AnimatedList({ children, className, delay = 1000 }) {
  const [index, setIndex] = useState(0);
  const childrenArray = Array.isArray(children) ? children : [children];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => Math.min(prev + 1, childrenArray.length));
    }, delay);
    return () => clearInterval(interval);
  }, [childrenArray.length, delay]);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {childrenArray.slice(0, index).map((child, i) => (
        <div
          key={i}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
