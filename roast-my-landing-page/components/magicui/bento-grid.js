"use client";

import { cn } from "../../lib/utils";

export function BentoGrid({ children, className }) {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[22rem] grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoCard({
  name,
  className,
  background,
  Icon,
  description,
  cta,
  href,
}) {
  return (
    <div
      className={cn(
        "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
        "bg-zinc-900/40 border border-zinc-800/60",
        "hover:border-orange-500/20 transition-all duration-300",
        "sm:col-span-1",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-zinc-900/20" />
      {background && (
        <div className="pointer-events-none absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
          {background}
        </div>
      )}
      <div className="relative z-10 flex h-full flex-col p-6">
        {Icon && <Icon className="h-8 w-8 text-orange-500 mb-4 origin-left transform-gpu transition-all duration-300 ease-in-out group-hover:scale-[1.15]" />}
        <h3 className="text-lg font-semibold text-zinc-100 mb-1">{name}</h3>
        <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
        {(cta || href) && (
          <div className="mt-auto pt-4">
            <a
              href={href || "#"}
              className="flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 transition-colors font-medium"
            >
              {cta || "Learn more"}
              <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
