"use client";

import { cn } from "../../lib/utils";

export function WordPullUp({ words, className, delay = 0.05 }) {
  return (
    <div className="flex flex-wrap justify-center">
      {words.split(" ").map((word, i) => (
        <span
          key={i}
          className={cn(
            "inline-block animate-pull-up opacity-0 pr-2",
            className
          )}
          style={{
            animationDelay: `${i * delay + 0.1}s`,
            animationFillMode: "forwards",
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}

export function WordFadeIn({ words, className, delay = 0.05 }) {
  return (
    <div className="flex flex-wrap justify-center">
      {words.split(" ").map((word, i) => (
        <span
          key={i}
          className={cn(
            "inline-block animate-fade-in-word opacity-0 pr-2",
            className
          )}
          style={{
            animationDelay: `${i * delay + 0.1}s`,
            animationFillMode: "forwards",
          }}
        >
          {word}
        </span>
      ))}
    </div>
  );
}

export function GradualSpacing({ text, className, delayMultiple = 0.04 }) {
  return (
    <div className="flex justify-center space-x-1">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={cn(
            "inline-block animate-fade-in-word opacity-0 tracking-tighter",
            className
          )}
          style={{
            animationDelay: `${i * delayMultiple}s`,
            animationFillMode: "forwards",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}
