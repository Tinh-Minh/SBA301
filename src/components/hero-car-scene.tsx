"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

export function HeroCarScene() {
  const video = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    const card = video.current?.closest<HTMLElement>(".hero-car-card");
    if (!card) return;
    function centerEntrance() {
      if (!card) return;
      // Offset layout coordinates ignore the entrance transform already in progress.
      let top = 0;
      let element: HTMLElement | null = card;
      while (element) {
        top += element.offsetTop;
        element = element.offsetParent as HTMLElement | null;
      }
      card.style.setProperty("--hero-entry-y", `${window.innerHeight / 2 + window.scrollY - top - card.offsetHeight / 2}px`);
    }
    centerEntrance();
    card.dataset.entryReady = "true";
    window.addEventListener("resize", centerEntrance, { passive: true });
    return () => window.removeEventListener("resize", centerEntrance);
  }, []);

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
