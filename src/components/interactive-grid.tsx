"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

export function InteractiveGrid({ children }: { children: ReactNode }) {
  const frame = useRef<number | null>(null);
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);

  function move(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    const zone = event.currentTarget;
    const bounds = zone.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      zone.style.setProperty("--mouse-x", `${x}px`);
      zone.style.setProperty("--mouse-y", `${y}px`);
      zone.style.setProperty("--cell-x", `${Math.floor(x / 32) * 32}px`);
      zone.style.setProperty("--cell-y", `${Math.floor(y / 32) * 32}px`);
      zone.dataset.glowing = "true";
      frame.current = null;
    });
  }

  function leave(event: PointerEvent<HTMLElement>) {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    event.currentTarget.dataset.glowing = "false";
  }

  return (
    <section id="interactive-grid-zone" className="square-grid-container relative w-full overflow-hidden border-b border-border-light px-6 py-12 md:px-10" onPointerMove={move} onPointerLeave={leave} onPointerCancel={leave}>
      <div className="grid-radial-glow" aria-hidden="true" />
      <div className="grid-glow-canvas" aria-hidden="true" />
      <div className="grid-active-cell" aria-hidden="true" />
      {children}
    </section>
  );
}
