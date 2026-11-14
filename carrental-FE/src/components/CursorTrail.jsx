import { useEffect, useRef } from "react";

// Pháo hoa cam ở đuôi chuột: mỗi lần di chuột bắn ra vài tia lửa nhỏ, bay toả ra rồi tắt nhanh.
// Chỉ bật với chuột thật (pointer: fine) và khi người dùng không yêu cầu giảm chuyển động.
const LIFE_MS = 260;      // tuổi thọ mỗi tia (ngắn)
const MAX_SPARKS = 90;
const TAIL_X = 7;         // đuôi mũi tên chuột so với đầu mũi tên
const TAIL_Y = 16;
const COLORS = ["252,108,38", "255,149,77", "255,190,120"];

export function CursorTrail() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const finePointer = window.matchMedia("(pointer: fine)");
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (!finePointer.matches || reduced.matches) return undefined;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const sparks = [];
        let frame = 0;
        let running = false;
        let last = null;

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const draw = () => {
            const now = performance.now();
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.lineCap = "round";
            for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                const age = now - s.born;
                if (age > LIFE_MS) { sparks.splice(i, 1); continue; }
                const life = 1 - age / LIFE_MS;
                const t = age / 1000;
                const x = s.x + s.vx * t, y = s.y + s.vy * t + 120 * t * t; // hơi rơi xuống như pháo hoa
                const tail = 0.018;                                           // vệt ngắn ~18ms quãng bay
                ctx.strokeStyle = `rgba(${s.color}, ${life})`;
                ctx.lineWidth = 0.6 + 1.6 * life;
                ctx.beginPath();
                ctx.moveTo(x - s.vx * tail, y - s.vy * tail);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            if (sparks.length) frame = requestAnimationFrame(draw);
            else { running = false; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
        };

        const onMove = event => {
            const x = event.clientX + TAIL_X, y = event.clientY + TAIL_Y;
            const dist = last ? Math.hypot(x - last.x, y - last.y) : 0;
            last = { x, y };
            const count = Math.min(4, 1 + Math.floor(dist / 12));
            const now = performance.now();
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 60 + Math.random() * 140;
                sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, born: now, color: COLORS[(Math.random() * COLORS.length) | 0] });
            }
            if (sparks.length > MAX_SPARKS) sparks.splice(0, sparks.length - MAX_SPARKS);
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
