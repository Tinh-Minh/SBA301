"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { LazyMotion, domAnimation, m, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";

const CELL_SIZE = 48;
const trailSlots = Array.from({ length: 16 }, (_, index) => index);
const sparkCells = [[1, 1], [5, 3], [9, 0], [3, 6], [10, 5], [7, 7]];

export function InteractiveGrid({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const trails = useRef<HTMLDivElement>(null);
  const cursor = useRef({ cell: "", slot: 0 });
  const animations = useRef<(Animation | undefined)[]>([]);
  const reducedMotion = useReducedMotion();
  const visible = useInView(root, { margin: "100px" });
  const pointerX = useMotionValue(-1000);
  const pointerY = useMotionValue(-1000);
  const springX = useSpring(pointerX, { stiffness: 220, damping: 30, mass: .4 });
  const springY = useSpring(pointerY, { stiffness: 220, damping: 30, mass: .4 });
  const mask = useMotionTemplate`radial-gradient(300px circle at ${reducedMotion ? pointerX : springX}px ${reducedMotion ? pointerY : springY}px, #000 0%, #0009 40%, transparent 80%)`;

  useEffect(() => () => { for (const animation of animations.current) animation?.cancel(); }, []);

  function move(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return;
    const zone = event.currentTarget;
    const bounds = zone.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    if (zone.dataset.glowing !== "true") {
      springX.jump(x);
      springY.jump(y);
    }
    pointerX.set(x);
    pointerY.set(y);
    zone.dataset.glowing = "true";
    const cellX = Math.floor(x / CELL_SIZE) * CELL_SIZE;
    const cellY = Math.floor(y / CELL_SIZE) * CELL_SIZE;
    const cell = `${cellX},${cellY}`;
    if (cell === cursor.current.cell) return;
    cursor.current.cell = cell;
    zone.style.setProperty("--cell-x", `${cellX}px`);
    zone.style.setProperty("--cell-y", `${cellY}px`);
    if (reducedMotion) return;
    const slot = cursor.current.slot++ % trailSlots.length;
    const tile = trails.current?.children[slot] as HTMLElement | undefined;
    if (!tile) return;
    animations.current[slot]?.cancel();
    tile.style.transform = `translate(${cellX}px, ${cellY}px)`;
    animations.current[slot] = tile.animate(
      [{ opacity: .6 }, { opacity: .24, offset: .3 }, { opacity: 0 }],
      { duration: 1100, easing: "ease-out" },
    );
  }

  function leave(event: PointerEvent<HTMLElement>) {
    event.currentTarget.dataset.glowing = "false";
    cursor.current.cell = "";
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <section ref={root} id="interactive-grid-zone" className="square-grid-container" data-grid-visible={visible} onPointerMove={move} onPointerLeave={leave} onPointerCancel={leave}>
        <div className="grid-artwork" aria-hidden="true">
          <div className="grid-base" />
          <div className="grid-ambient" />
          <svg className="grid-sparks" width="100%" height="100%">
            <defs><pattern id="hero-grid-sparks" width="576" height="384" patternUnits="userSpaceOnUse">
              {sparkCells.map(([x, y], index) => <rect key={index} x={x * CELL_SIZE + 1} y={y * CELL_SIZE + 1} width="46" height="46" className={`grid-spark grid-spark--${index}`} />)}
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#hero-grid-sparks)" />
          </svg>
          <div className="grid-beams"><i /><i /><i /><i /></div>
          <m.div className="grid-spotlight" style={{ maskImage: mask, WebkitMaskImage: mask }}>
            <div className="grid-glow-canvas" />
            <div className="grid-glow-nodes" />
          </m.div>
          <m.div className="grid-radial-glow" style={{ x: springX, y: springY }} />
          <div ref={trails} className="grid-trails">{trailSlots.map(slot => <div key={slot} className="grid-trail-cell" />)}</div>
          <div className="grid-active-cell" />
        </div>
        {children}
      </section>
    </LazyMotion>
  );
}
