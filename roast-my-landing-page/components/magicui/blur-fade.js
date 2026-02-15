"use client";

import { motion, useInView, useAnimation } from "framer-motion";
import { useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

export function BlurIn({ children, className, duration = 0.5, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { filter: "blur(10px)", opacity: 0 },
        visible: { filter: "blur(0px)", opacity: 1 },
      }}
      transition={{ duration, delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

export function BlurFade({ children, className, duration = 0.4, delay = 0, yOffset = 6, inView = true }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const show = !inView || isInView;

  return (
    <motion.div
      ref={ref}
      initial={{ y: yOffset, opacity: 0, filter: "blur(6px)" }}
      animate={show ? { y: 0, opacity: 1, filter: "blur(0px)" } : {}}
      transition={{ duration, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
