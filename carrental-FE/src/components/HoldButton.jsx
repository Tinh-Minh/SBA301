import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon.jsx";
export function HoldButton({ children, onComplete, danger = false, disabled = false }) {
    const hint = useId();
    const [holding, setHolding] = useState(false);
    const fill = useRef(null);
    const button = useRef(null);
    const outline = useRef(null);
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
        if (fill.current) fill.current.style.transform = "scaleX(0)";
        if (outline.current) outline.current.style.strokeDashoffset = "1";
    }
    function start() {
        if (disabled || started.current !== null)
            return;
        started.current = performance.now();
        setHolding(true);
        function tick(now) {
            if (started.current === null)
                return;
            const progress = Math.min((now - started.current) / (danger ? 2500 : 1600), 1);
            if (fill.current) fill.current.style.transform = `scaleX(${progress})`;
            // A continuous ease-out keeps the final stretch slower without changing hold time.
            if (outline.current) outline.current.style.strokeDashoffset = String((1 - progress) ** 3);
            if (progress >= 1) {
                stop();
                complete.current();
            }
            else
                frame.current = requestAnimationFrame(tick);
        }
        frame.current = requestAnimationFrame(tick);
    }
    useLayoutEffect(() => {
        if (!danger || !button.current || !outline.current) return;
        const element = button.current;
        const path = outline.current;
        function resizeOutline() {
            const { width, height } = path.ownerSVGElement.getBoundingClientRect();
            const inset = 1.5;
            const radius = Math.max(0, Math.min(width, height) / 2 - inset);
            // Begin at twelve o'clock and follow the rounded perimeter clockwise.
            path.setAttribute("d", `M ${width / 2} ${inset} H ${width - radius - inset} A ${radius} ${radius} 0 0 1 ${width - inset} ${radius + inset} V ${height - radius - inset} A ${radius} ${radius} 0 0 1 ${width - radius - inset} ${height - inset} H ${radius + inset} A ${radius} ${radius} 0 0 1 ${inset} ${height - radius - inset} V ${radius + inset} A ${radius} ${radius} 0 0 1 ${radius + inset} ${inset} H ${width / 2} Z`);
        }
        resizeOutline();
        const observer = new ResizeObserver(resizeOutline);
        observer.observe(element);
        return () => observer.disconnect();
    }, [danger]);
    useEffect(() => () => { if (frame.current !== null)
        cancelAnimationFrame(frame.current); }, []);
    return <div className="w-full" data-hold-control="true">
    <button ref={button} type="button" data-holding={holding} disabled={disabled} aria-describedby={hint} onPointerDown={event => {
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
      {danger ? <svg aria-hidden="true" focusable="false" className="hold-outline pointer-events-none absolute inset-0 h-full w-full"><path ref={outline} data-hold-outline pathLength="1" fill="none" vectorEffect="non-scaling-stroke"/></svg> : <span ref={fill} aria-hidden="true" className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-secondary-fixed/25"/>}
      <span className="relative flex items-center justify-center gap-2 whitespace-nowrap">{!danger && <Icon name="verified" className="text-[20px]"/>}{danger ? children : holding ? "Tiếp tục giữ…" : children}</span>
    </button>
    <p id={hint} className={danger ? "sr-only" : "mt-2 text-center text-[11px] leading-5 text-text-muted"}>Giữ {danger ? "2,5" : "1,6"} giây để {danger ? "hủy" : "xác nhận"}. Thả tay để dừng. Bàn phím: giữ Enter hoặc Space.</p>
  </div>;
}
