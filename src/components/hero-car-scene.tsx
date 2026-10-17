"use client";

import { useEffect, useRef } from "react";

export function HeroCarScene() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = true;
    function syncPlayback() {
      if (!element) return;
      if (reducedMotion.matches || !visible || document.hidden) {
        element.pause();
      } else {
        void element.play().catch(() => { /* The poster remains visible when autoplay is unavailable. */ });
      }
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(element);
    reducedMotion.addEventListener("change", syncPlayback);
    document.addEventListener("visibilitychange", syncPlayback);
    syncPlayback();
    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", syncPlayback);
      document.removeEventListener("visibilitychange", syncPlayback);
      element.pause();
    };
  }, []);

  return <div className="hero-car-scene" role="img" aria-label="Xe thể thao đỗ dưới ánh đèn, phản chiếu trên mặt đường mưa">
    <video ref={video} className="hero-car-video" src="/videos/hero-car-rain.mp4" poster="/images/hero-car-rain.webp" width="1280" height="536" muted loop playsInline preload="none" disablePictureInPicture aria-hidden="true" />
  </div>;
}
