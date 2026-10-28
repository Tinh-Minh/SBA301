import { useEffect, useLayoutEffect, useRef } from "react";
export function HeroCarScene() {
    const video = useRef(null);
    useLayoutEffect(() => {
        const card = video.current?.closest(".hero-car-card");
        if (!card)
            return;
        function centerEntrance() {
            if (!card)
                return;
            // Offset layout coordinates ignore the entrance transform already in progress.
            let top = 0;
            let element = card;
            while (element) {
                top += element.offsetTop;
                element = element.offsetParent;
            }
            card.style.setProperty("--hero-entry-y", `${window.innerHeight / 2 + window.scrollY - top - card.offsetHeight / 2}px`);
        }
        centerEntrance();
        card.dataset.entryReady = "true";
        function removeScrollListeners() {
            window.removeEventListener("wheel", onWheel);
            window.removeEventListener("touchmove", finishEntrance);
            window.removeEventListener("scroll", finishEntrance);
            window.removeEventListener("keydown", onKeyDown);
        }
        function finishEntrance() {
            removeScrollListeners();
            for (const animation of document.getAnimations()) {
                if (animation instanceof CSSAnimation && animation.animationName.startsWith("home-")) {
                    animation.finish();
                }
            }
        }
        function onWheel(event) {
            if (!event.ctrlKey && (event.deltaX || event.deltaY))
                finishEntrance();
        }
        function onKeyDown(event) {
            if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey)
                return;
            if (event.target instanceof Element && event.target.closest("input,textarea,select,button,a,summary,[contenteditable]:not([contenteditable='false']),[role='button']"))
                return;
            if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key))
                finishEntrance();
        }
        window.addEventListener("wheel", onWheel, { passive: true });
        window.addEventListener("touchmove", finishEntrance, { passive: true });
        window.addEventListener("scroll", finishEntrance, { passive: true });
        window.addEventListener("keydown", onKeyDown);
        if (window.scrollY > 0)
            finishEntrance();
        window.addEventListener("resize", centerEntrance, { passive: true });
        return () => {
            removeScrollListeners();
            window.removeEventListener("resize", centerEntrance);
        };
    }, []);
    useEffect(() => {
        const element = video.current;
        if (!element)
            return;
        const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
        let visible = true;
        function syncPlayback() {
            if (!element)
                return;
            if (reducedMotion.matches || !visible || document.hidden) {
                element.pause();
            }
            else {
                void element.play().catch(() => { });
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
    <video ref={video} className="hero-car-video" src="/videos/hero-car-rain.mp4" poster="/images/hero-car-rain.webp" width="1280" height="536" muted loop playsInline preload="none" disablePictureInPicture aria-hidden="true"/>
  </div>;
}
