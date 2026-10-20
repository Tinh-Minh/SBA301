"use client";
import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "./icon";
export function HoldButton({ children, onComplete, danger = false, disabled = false }) {
    const hint = useId();
    const [holding, setHolding] = useState(false);
    const fill = useRef(null);
    const frame = useRef(null);
    const started = useRef(null);
    const complete = useRef(onComplete);
    complete.current = onComplete;
    function stop() {
        if (frame.current !== null)
            cancelAnimationFrame(frame.current);
        frame.current = null;
        started.current = null;
        setHolding(false);
        if (fill.current)
            fill.current.style.transform = "scaleX(0)";
    }
    function start() {
        if (disabled || started.current !== null)
            return;
        started.current = performance.now();
        setHolding(true);
        function tick(now) {
            if (started.current === null)
                return;
            const progress = Math.min((now - started.current) / 1600, 1);
            if (fill.current)
                fill.current.style.transform = `scaleX(${progress})`;
            if (progress >= 1) {
                stop();
                complete.current();
            }
            else
                frame.current = requestAnimationFrame(tick);
        }
        frame.current = requestAnimationFrame(tick);
    }
    useEffect(() => () => { if (frame.current !== null)
        cancelAnimationFrame(frame.current); }, []);
    return <div className="w-full" data-hold-control="true">
    <button type="button" disabled={disabled} aria-describedby={hint} onPointerDown={event => {
            if (event.button !== 0)
                return;
            event.currentTarget.setPointerCapture(event.pointerId);
            start();
        }} onPointerUp={stop} onPointerCancel={stop} onPointerLeave={stop} onBlur={stop} onContextMenu={event => event.preventDefault()} onKeyDown={event => {
            if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                event.preventDefault();
                start();
            }
        }} onKeyUp={event => { if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        stop();
    } }} className={`relative flex w-full touch-none select-none items-center justify-center gap-2 overflow-hidden rounded-full px-3 py-4 text-xs font-bold sm:px-6 sm:text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${danger ? "border border-error/25 bg-error-container/40 text-error hover:bg-error-container/70" : "bg-primary text-white shadow-md hover:bg-primary-container"}`}>
      <span ref={fill} aria-hidden="true" className={`pointer-events-none absolute inset-0 origin-left scale-x-0 ${danger ? "bg-error/15" : "bg-secondary-fixed/25"}`}/>
      <span className="relative flex items-center justify-center gap-2 whitespace-nowrap"><Icon name={danger ? "cancel" : "verified"} className="text-[20px]"/>{holding ? "Tiếp tục giữ…" : children}</span>
    </button>
    <p id={hint} className="mt-2 text-center text-[11px] leading-5 text-text-muted">Giữ 1,6 giây để {danger ? "hủy" : "xác nhận"}. Thả tay để dừng. Bàn phím: giữ Enter hoặc Space.</p>
  </div>;
}
