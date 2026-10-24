"use client";
import { useEffect, useRef } from "react";
export function InteractiveGrid({ children }) {
    const root = useRef(null);
    useEffect(() => {
        const zone = root.current;
        if (!zone)
            return;
        zone.dataset.glowing = "false";
        let frame = 0;
        let clientX = -1000;
        let clientY = -1000;
        let pointerPresent = false;
        function update() {
            frame = 0;
            if (!zone)
                return;
            const bounds = zone.getBoundingClientRect();
            const x = clientX - bounds.left;
            const y = clientY - bounds.top;
            const inside = pointerPresent && x >= 0 && y >= 0 && x < bounds.width && y < bounds.height;
            zone.style.setProperty("--grid-x", `${x}px`);
            zone.style.setProperty("--grid-y", `${y}px`);
            zone.dataset.glowing = String(inside);
        }
        function schedule() {
            if (!frame)
                frame = requestAnimationFrame(update);
        }
        function move(event) {
            clientX = event.clientX;
            clientY = event.clientY;
            pointerPresent = event.pointerType !== "touch";
            schedule();
        }
        function leave() {
            pointerPresent = false;
            schedule();
        }
        window.addEventListener("pointermove", move, { passive: true });
        window.addEventListener("scroll", schedule, { passive: true, capture: true });
        window.addEventListener("resize", schedule, { passive: true });
        window.addEventListener("blur", leave);
        window.addEventListener("pointercancel", leave);
        document.documentElement.addEventListener("pointerleave", leave);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("pointermove", move);
            window.removeEventListener("scroll", schedule, true);
            window.removeEventListener("resize", schedule);
            window.removeEventListener("blur", leave);
            window.removeEventListener("pointercancel", leave);
            document.documentElement.removeEventListener("pointerleave", leave);
        };
    }, []);
    return (<section ref={root} id="interactive-grid-zone" className="square-grid-container">
      <div className="grid-reveal" aria-hidden="true"/>
      {children}
    </section>);
}
