import { useEffect, useRef } from "react";

// Vệt chuột: các điểm gần nhất được nối thành một dải mảnh, mờ dần theo thời gian.
// Chỉ bật với chuột thật (pointer: fine) và khi người dùng không yêu cầu giảm chuyển động.
const LIFE_MS = 420;
const MAX_POINTS = 48;

export function CursorTrail() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const finePointer = window.matchMedia("(pointer: fine)");
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (!finePointer.matches || reduced.matches) return undefined;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const points = [];
        let frame = 0;
        let running = false;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = () => {
            const now = performance.now();
            while (points.length && now - points[0].t > LIFE_MS) points.shift();
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            for (let i = 1; i < points.length; i++) {
                const a = points[i - 1], b = points[i];
                const life = 1 - (now - b.t) / LIFE_MS;      // 1 = mới, 0 = sắp tắt
                const order = i / points.length;              // đầu vệt dày hơn đuôi
                ctx.strokeStyle = `rgba(252, 108, 38, ${0.55 * life})`;
                ctx.lineWidth = 1 + 5 * life * order;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
            if (points.length) frame = requestAnimationFrame(draw);
            else { running = false; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
        };

        const onMove = event => {
            points.push({ x: event.clientX, y: event.clientY, t: performance.now() });
            if (points.length > MAX_POINTS) points.shift();
            if (!running) { running = true; frame = requestAnimationFrame(draw); }
        };

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", resize);
            window.removeEventListener("pointermove", onMove);
        };
    }, []);

    return <canvas ref={canvasRef} aria-hidden="true" className="cursor-trail" />;
}
