"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "../../lib/utils";

export function Particles({
  className,
  quantity = 50,
  staticity = 50,
  ease = 50,
  size = 0.4,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}) {
  const canvasRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const context = useRef(null);
  const circles = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

  const hexToRgb = (hex) => {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
    const num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const rgb = hexToRgb(color);

  const circleParams = useCallback(() => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const translateX = 0;
    const translateY = 0;
    const pSize = Math.floor(Math.random() * 2) + size;
    const alpha = 0;
    const targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.1;
    const dy = (Math.random() - 0.5) * 0.1;
    const magnetism = 0.1 + Math.random() * 4;
    return { x, y, translateX, translateY, size: pSize, alpha, targetAlpha, dx, dy, magnetism };
  }, [size]);

  const resizeCanvas = useCallback(() => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0;
      canvasSize.current.w = canvasContainerRef.current.offsetWidth;
      canvasSize.current.h = canvasContainerRef.current.offsetHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, [dpr]);

  const drawCircle = useCallback(
    (circle, update = false) => {
      if (context.current) {
        const { x, y, translateX, translateY, size: s, alpha } = circle;
        context.current.translate(translateX, translateY);
        context.current.beginPath();
        context.current.arc(x, y, s, 0, 2 * Math.PI);
        context.current.fillStyle = `rgba(${rgb.join(", ")}, ${alpha})`;
        context.current.fill();
        context.current.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (!update) circles.current.push(circle);
      }
    },
    [dpr, rgb]
  );

  const initCanvas = useCallback(() => {
    resizeCanvas();
    for (let i = 0; i < quantity; i++) {
      const circle = circleParams();
      drawCircle(circle);
    }
  }, [circleParams, drawCircle, quantity, resizeCanvas]);

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();

    const handleResize = () => initCanvas();
    window.addEventListener("resize", handleResize);

    let animationId;
    const animate = () => {
      if (context.current) {
        context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);
        circles.current.forEach((circle, i) => {
          const edge = [
            circle.x + circle.translateX - circle.size,
            canvasSize.current.w - circle.x - circle.translateX - circle.size,
            circle.y + circle.translateY - circle.size,
            canvasSize.current.h - circle.y - circle.translateY - circle.size,
          ];
          const closestEdge = edge.reduce((a, b) => Math.min(a, b));
          const remapClosestEdge = parseFloat(
            Math.max(0, Math.min(closestEdge / 20, 1)).toFixed(2)
          );
          if (remapClosestEdge > 1) {
            circle.alpha += 0.02;
            if (circle.alpha > circle.targetAlpha) circle.alpha = circle.targetAlpha;
          } else {
            circle.alpha = circle.targetAlpha * remapClosestEdge;
          }
          circle.x += circle.dx + vx;
          circle.y += circle.dy + vy;
          circle.translateX +=
            (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) / ease;
          circle.translateY +=
            (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) / ease;

          drawCircle(circle, true);

          if (
            circle.x < -circle.size ||
            circle.x > canvasSize.current.w + circle.size ||
            circle.y < -circle.size ||
            circle.y > canvasSize.current.h + circle.size
          ) {
            circles.current.splice(i, 1);
            const newCircle = circleParams();
            drawCircle(newCircle);
          }
        });
      }
      animationId = window.requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMove = (e) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const { w, h } = canvasSize.current;
        const x = e.clientX - rect.left - w / 2;
        const y = e.clientY - rect.top - h / 2;
        const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
        if (inside) {
          mouse.current.x = x;
          mouse.current.y = y;
        }
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.cancelAnimationFrame(animationId);
    };
  }, [circleParams, drawCircle, ease, initCanvas, quantity, staticity, vx, vy]);

  return (
    <div ref={canvasContainerRef} className={cn("pointer-events-none", className)} aria-hidden="true">
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
}
