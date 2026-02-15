"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export function TypingAnimation({
  text,
  duration = 50,
  className,
  as: Component = "div",
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingEffect);
      }
    }, duration);
    return () => clearInterval(typingEffect);
  }, [text, duration, started]);

  return (
    <Component ref={ref} className={cn("font-display text-center text-4xl font-bold leading-[5rem] tracking-[-0.02em] drop-shadow-sm", className)}>
      {displayedText}
    </Component>
  );
}
