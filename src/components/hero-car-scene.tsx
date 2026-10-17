"use client";

import { useState } from "react";

const spokes = Array.from({ length: 10 }, (_, index) => index * 36);

function Wheel({ position }: { position: "front" | "rear" }) {
  return (
    <div className={`hero-wheel hero-wheel--${position}`}>
      <div className="hero-wheel-spin">
        <svg viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="47" fill="#10171b" stroke="#8c969d" strokeWidth="3" />
          {spokes.map(angle => (
            <path key={angle} d="M47 43 42 7 48 5 54 44Z" fill={`url(#rim-metal-${position})`} transform={`rotate(${angle} 50 50)`} />
          ))}
          <defs>
            <linearGradient id={`rim-metal-${position}`}><stop stopColor="#66747e" /><stop offset=".5" stopColor="#edf1f3" /><stop offset="1" stopColor="#74818a" /></linearGradient>
          </defs>
          <circle cx="50" cy="50" r="10" fill="#a0a9ad" stroke="#323d43" strokeWidth="4" />
        </svg>
      </div>
    </div>
  );
}

export function HeroCarScene() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="hero-car-scene" data-paused={paused}>
      <div className="hero-car-stage">
        <img src="/images/cardb-02d5cb41aa8f9514.webp" alt="Xe SUV màu xanh bên cung đường ven biển" width="512" height="279" className="hero-car-photo" loading="eager" fetchPriority="high" decoding="async" />
        <div className="hero-car-effects" aria-hidden="true">
          <Wheel position="front" />
          <Wheel position="rear" />
          <span className="hero-headlight hero-headlight--near" />
          <span className="hero-headlight hero-headlight--far" />
          <span className="hero-light-spill" />
          <div className="hero-wind"><i /><i /><i /><i /><i /></div>
        </div>
      </div>
      <button type="button" className="hero-motion-toggle" aria-pressed={paused} onClick={() => setPaused(value => !value)}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">{paused ? <path d="m4 2 10 6-10 6Z" /> : <path d="M3 2h4v12H3zm6 0h4v12H9z" />}</svg>
        {paused ? "Bật chuyển động" : "Dừng chuyển động"}
      </button>
    </div>
  );
}
