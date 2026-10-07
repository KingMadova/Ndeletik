"use client";

import { useMouseGlow } from "@/hooks/useMouseGlow";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function MouseGlow() {
  const { x, y } = useMouseGlow();
  const prefersReduced = useReducedMotion();

  if (prefersReduced) return null;

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(212, 154, 68, 0.12) 0%, transparent 70%)",
        transform: "translate(-50%, -50%)",
        transition: "transform 0.1s ease-out",
      }}
    />
  );
}