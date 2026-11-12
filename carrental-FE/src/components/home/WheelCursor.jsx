import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const COLORS = ["#FC6C26", "#292929", "#E85D04"];
const PARTICLE_SIZE = 22;
const SPAWN_DISTANCE = 2;
const GRAVITY = 0.02;
const FADE_SPEED = 0.955;
const VELOCITY = { min: 0.5, max: 1.5 };

function canAnimate() {
    return window.matchMedia("(hover: hover) and (any-pointer: fine)").matches
        && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function drawWheel(ctx, x, y, radius, rotation, color, alpha) {
    if (radius < 1.2 || alpha < 0.04) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.lineCap = "butt";
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = Math.max(1.25, radius * 0.3);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#f7f4ef";
    ctx.lineWidth = Math.max(1, radius * 0.08);
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.5, radius * 0.12);
    ctx.beginPath();
    for (let spoke = 0; spoke < 4; spoke += 1) {
        const angle = (spoke / 4) * Math.PI;
        ctx.moveTo(Math.cos(angle) * radius * 0.08, Math.sin(angle) * radius * 0.08);
        ctx.lineTo(Math.cos(angle) * radius * 0.48, Math.sin(angle) * radius * 0.48);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}

function createParticle(x, y) {
    const speed = Math.random() * (VELOCITY.max - VELOCITY.min) + VELOCITY.min;
    return {
        x,
        y,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: (Math.random() < 0.5 ? -1 : 1) * speed,
        vy: -(Math.random() * VELOCITY.max),
        life: 100,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() < 0.5 ? -1 : 1) * (0.015 + Math.random() * 0.03),
    };
}

export function WheelCursor() {
    const canvasRef = useRef(null);
    const [enabled, setEnabled] = useState(canAnimate);

    useEffect(() => {
        const hover = window.matchMedia("(hover: hover) and (any-pointer: fine)");
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setEnabled(canAnimate());
        hover.addEventListener("change", update);
        motion.addEventListener("change", update);
        return () => {
            hover.removeEventListener("change", update);
            motion.removeEventListener("change", update);
        };
    }, []);

    useEffect(() => {
        if (!enabled) return undefined;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const particles = [];
        const pointer = { x: 0, y: 0 };
        const previous = { x: 0, y: 0 };
        let frame = 0;
        let running = true;

        function resize() {
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(window.innerWidth * ratio);
            canvas.height = Math.floor(window.innerHeight * ratio);
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        }

        function onMove(event) {
            pointer.x = event.clientX;
            pointer.y = event.clientY;
            if (Math.hypot(pointer.x - previous.x, pointer.y - previous.y) <= SPAWN_DISTANCE) return;
            particles.push(createParticle(pointer.x, pointer.y));
            previous.x = pointer.x;
            previous.y = pointer.y;
        }

        function tick() {
            if (!running) return;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            for (let index = particles.length - 1; index >= 0; index -= 1) {
                const particle = particles[index];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += GRAVITY;
                particle.life *= FADE_SPEED;
                particle.rotation += particle.spin;
                if (particle.life <= 0.1) {
                    particles.splice(index, 1);
                    continue;
                }
                const scale = particle.life / 100;
                drawWheel(ctx, particle.x, particle.y, PARTICLE_SIZE * 0.62 * scale, particle.rotation, particle.color, scale * 0.72);
            }
            if (running) frame = requestAnimationFrame(tick);
        }

        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", onMove);
        frame = requestAnimationFrame(tick);
        return () => {
            running = false;
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", onMove);
        };
    }, [enabled]);

    if (!enabled) return null;
    return createPortal(<canvas ref={canvasRef} className="journey-wheel-cursor" aria-hidden="true" />, document.body);
}
