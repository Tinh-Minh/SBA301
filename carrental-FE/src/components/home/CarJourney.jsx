import { carIntroPath, CAR_INTRO_DURATION } from "./carIntroPath.js";
import { useEffect, useRef, useState } from "react";

const INTRO_SPEED = 1.5;

const poses = [
    { x: 0.28, y: -0.22, scale: 0.72, yaw: -0.78, tilt: 0, overhead: 0, customer: 0, depart: 0 },
    { x: 0.16, y: 0.02, scale: 0.66, yaw: -1.10, tilt: -0.025, overhead: 0.10, customer: 0, depart: 0 },
    { x: 0.34, y: -0.34, scale: 0.5, yaw: Math.PI / 2, tilt: 0, overhead: 0, customer: 0, depart: 0 },
    { x: -0.23, y: -0.04, scale: 0.77, yaw: 2.75, tilt: 0, overhead: 0.04, customer: 1, depart: 0 },
    { x: -0.27, y: -0.22, scale: 0.45, yaw: -0.7, tilt: 0, overhead: 0.12, customer: 0, depart: 0 },
    { x: 0.24, y: -0.08, scale: 0.78, yaw: 4.72, tilt: 0, overhead: 0.94, customer: 0, depart: 0 },
    { x: -0.25, y: -0.08, scale: 0.72, yaw: 3.25, tilt: 0, overhead: 0.20, customer: 0, depart: 0 },
    { x: 0, y: 0, scale: 0.85, yaw: Math.PI, tilt: 0, overhead: 0.06, customer: 0, depart: 0.05 },
];

const chapterIds = ["hero", "search", "fleet", "steps", "flow", "drive", "faq", "finale"];
const chapterPoses = Object.fromEntries(chapterIds.map((id, index) => [id, poses[index]]));

function smoothstep(value) {
    const t = Math.max(0, Math.min(1, value));
    return t * t * (3 - 2 * t);
}

function mixAngle(from, to, t) {
    return from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * t;
}

// The search page stays put, then the car grows and drives left to right,
// pulling the listings sheet across behind its nose.
function fleetPass(progress, mobile) {
    const search = chapterPoses.search;
    const fleet = chapterPoses.fleet;
    const side = Math.PI / 2;
    const scale = mobile ? 0.52 : 0.6;
    const lane = mobile ? -0.2 : -0.34;
    const launch = 0.18;
    const cruise = 0.7;
    const enter = mobile ? -0.2 : -0.26;
    const leave = mobile ? 0.26 : 0.36;
    if (progress <= 0)
        return { pose: { ...search }, reveal: 0, spin: 0 };
    if (progress < launch) {
        const u = smoothstep(progress / launch);
        return {
            pose: {
                x: search.x + (enter - search.x) * u,
                y: search.y + (lane - search.y) * u,
                scale: search.scale + (scale - search.scale) * u,
                yaw: mixAngle(search.yaw, side, u),
                tilt: search.tilt * (1 - u),
                overhead: search.overhead * (1 - u),
                customer: 0,
                depart: 0,
            },
            reveal: 0,
            spin: u * 2,
        };
    }
    if (progress < cruise) {
        const u = smoothstep((progress - launch) / (cruise - launch));
        const x = enter + (leave - enter) * u;
        return {
            pose: { x, y: lane, scale, yaw: side, tilt: 0, overhead: 0, customer: 0, depart: 0 },
            reveal: Math.max(0, Math.min(1, (x + 0.22) / 0.62)),
            spin: 4 + u * 8,
        };
    }
    const u = smoothstep((progress - cruise) / (1 - cruise));
    const park = mobile ? 0.34 : 0.46;
    const rise = u < 0.45 ? 0 : smoothstep((u - 0.45) / 0.55);
    const slide = smoothstep(Math.min(1, u / 0.45));
    return {
        pose: {
            x: leave + (park - leave) * slide + (fleet.x - park) * rise,
            y: lane + (fleet.y - lane) * rise,
            scale: scale + (0.48 - scale) * slide + (fleet.scale - 0.48) * rise,
            yaw: mixAngle(side, fleet.yaw, rise),
            tilt: 0,
            overhead: fleet.overhead * rise,
            customer: 0,
            depart: 0,
        },
        reveal: 1,
        spin: (1 - rise) * 2,
    };
}

export function CarJourney({ root }) {
    const host = useRef(null);
    const speedRef = useRef(null);
    const gaugeRef = useRef(null);
    const [status, setStatus] = useState("loading");
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let stopped = false;
        let scene;
        let frame = 0;
        let stops = [];
        let finaleStarted = null;
        let introStarted = null;
        let wheelReadyAt = null;
        let introSkipped = window.scrollY > 8;
        const motion = matchMedia("(prefers-reduced-motion: reduce)");
        const element = root.current;
        element.style.setProperty("--intro-speed", String(INTRO_SPEED));
        element.dataset.introState = introSkipped || motion.matches ? "complete" : "loading";
        element.dataset.introTitle = "hidden";
        element.dataset.introBrand = "hidden";
        host.current.removeAttribute('style');
        host.current.removeAttribute('data-car-stage');
        let chapters = [];
        let lastScroll = window.scrollY;
        let lastSpeedAt = performance.now();
        let shownSpeed = 0;
        const header = document.querySelector(".site-header");
        function measure() {
            const headerHeight = header?.getBoundingClientRect().height || 80;
            document.documentElement.style.setProperty("--journey-header-height", `${headerHeight}px`);
            chapters = [...element.querySelectorAll("[data-car-stop]")];
            stops = chapters.map(chapter => {
                const marker = chapter.dataset.carPin ? element.querySelector(`[data-car-marker="${chapter.dataset.carPin}"]`) : null;
                const node = marker ?? chapter;
                return node.getBoundingClientRect().top + window.scrollY - headerHeight;
            });
            stops[0] = 0;

            schedule();
        }
        function update() {
            frame = 0;
            const scroll = window.scrollY;
            let index = 0;
            while (index < stops.length - 2 && scroll > stops[index + 1]) index++;
            const t = Math.max(0, Math.min(1, (scroll - stops[index]) / Math.max(1, stops[index + 1] - stops[index])));
            const blend = t * t * (3 - 2 * t);
            const fromId = chapters[index].dataset.carStop;
            const toId = chapters[index + 1].dataset.carStop;
            const from = chapterPoses[fromId], to = chapterPoses[toId];
            const pose = {};
            for (const key of Object.keys(from)) pose[key] = from[key] + (to[key] - from[key]) * blend;
            // Dip below the copy when crossing from one side of the page to the other.
            if (from.x * to.x < 0) pose.y -= Math.sin(t * Math.PI) * 0.22;
            if (wheelReadyAt != null && introStarted == null) {
                const ready = performance.now() - wheelReadyAt >= 900 / INTRO_SPEED && (!document.fonts || document.fonts.status === "loaded");
                if (ready || introSkipped || motion.matches) {
                    introStarted = performance.now();
                    element.dataset.introState = introSkipped || motion.matches ? "complete" : "playing";
                    setStatus("ready");
                } else schedule();
            }
            const introElapsed = introStarted == null ? 0 : (performance.now() - introStarted) * INTRO_SPEED;
            if (introStarted != null && !introSkipped && introElapsed < CAR_INTRO_DURATION && !motion.matches) schedule();
            else if (introSkipped || motion.matches || introStarted != null) element.dataset.introState = "complete";
            pose.distance = motion.matches ? 0 : scroll * 0.012;
            const mobile = innerWidth < 1024;
            let fleetReveal = chapterIds.indexOf(fromId) > chapterIds.indexOf("fleet") || fromId === "fleet" ? 1 : 0;
            let fleetDrive = 0;
            if (!motion.matches && fromId === "search" && toId === "fleet") {
                fleetDrive = t <= 0.22 ? 0 : (t - 0.22) / 0.78;
                const pass = fleetPass(fleetDrive, mobile);
                Object.assign(pose, pass.pose);
                fleetReveal = pass.reveal;
                pose.distance += pass.spin;
            }
            element.style.setProperty("--fleet-reveal", fleetReveal.toFixed(4));
            if (mobile && !(fromId === "search" && toId === "fleet" && !motion.matches)) {
                const mobilePoses = [
                    { x:0.16, y:-0.24, scale:0.72 }, { x:0.08, y:0.2, scale:0.52 },
                    { x:0.2, y:-0.16, scale:0.48 },
                    innerWidth >= 640 && innerHeight < 600 ? { x:-0.22, y:-0.10, scale:0.60 } : { x:-0.04, y:-0.10, scale:innerWidth < 640 ? 0.95 : 0.78 },
                    { x:0.24, y:0.24, scale:0.45 },
                    { x:0, y:-0.12, scale:1.05 }, innerWidth < 640 ? { x:0.30, y:0.38, scale:0.38 } : { x:0.26, y:0.20, scale:0.38 },
                    { x:0, y:0, scale:1.45 },
                ];
                for (const key of ['x','y','scale']) pose[key] = mobilePoses[chapterIds.indexOf(fromId)][key] + (mobilePoses[chapterIds.indexOf(toId)][key] - mobilePoses[chapterIds.indexOf(fromId)][key]) * blend;
            }
            const intro = carIntroPath(introSkipped ? CAR_INTRO_DURATION : introElapsed, mobile);
            element.style.setProperty("--intro-light", motion.matches ? 1 : intro.light);
            element.dataset.introStep = String(intro.step);
            const brandStart = 2600;
            const titleStart = 4700;
            if (introSkipped || motion.matches) {
                element.dataset.introBrand = "done";
                element.dataset.introTitle = "visible";
            } else if (introElapsed >= titleStart) {
                element.dataset.introBrand = "out";
                element.dataset.introTitle = "visible";
            } else if (introElapsed >= brandStart) {
                element.dataset.introBrand = "in";
                element.dataset.introTitle = "hidden";
            } else {
                element.dataset.introBrand = "hidden";
                element.dataset.introTitle = "hidden";
            }
            pose.wheelCloseup = 0;
            pose.wheelSpinSpeed = 0;
            pose.lapX = 0;
            pose.lapZ = 0;
            if (!motion.matches) pose.distance += intro.distance;
            if (fromId === "hero" && !introSkipped && !motion.matches && (introStarted == null || introElapsed < CAR_INTRO_DURATION)) {
                pose.wheelCloseup = intro.wheelCloseup;
                pose.wheelSpinSpeed = introStarted == null ? 1.2 : intro.wheelSpinSpeed;
                pose.lapX = intro.x;
                pose.lapZ = intro.z;
                pose.yaw = intro.yaw;
                pose.overhead += (0.92 - pose.overhead) * intro.overhead;
            }
            // Introduce the conversation after the car has approached its section.
            const conversationIndex = chapters.findIndex(chapter => chapter.dataset.carStop === 'steps');
            const conversationSpan = Math.min(stops[conversationIndex] - stops[conversationIndex - 1], stops[conversationIndex + 1] - stops[conversationIndex]);
            const conversationDistance = Math.min(1, Math.abs(scroll - stops[conversationIndex]) / Math.max(1, conversationSpan * 0.4));
            pose.customer = motion.matches ? 0 : 1 - conversationDistance * conversationDistance * (3 - 2 * conversationDistance);
            host.current.style.opacity = "1";
            const isFinale = scroll >= stops.at(-1) - 8;
            if (isFinale && !motion.matches) {
                finaleStarted ??= performance.now();
                const elapsed = Math.min(1, (performance.now() - finaleStarted) / 2600);
                Object.assign(pose, poses.at(-1), { y:0, scale:mobile ? 1.45 : 0.85 });
                pose.depart = 0.05 + elapsed * elapsed * (3-2*elapsed) * 0.40;
                pose.distance += elapsed * 8;
                if (elapsed < 1) schedule();
            } else finaleStarted = null;
            // Keep the final car in the same page space as its CTA when the footer enters.
            const finaleOffset = motion.matches ? 0 : Math.max(0, scroll - stops.at(-1));
            host.current.style.transform = finaleOffset ? `translate3d(0, -${finaleOffset}px, 0)` : '';
            scene?.setPose(motion.matches ? { ...poses[0], x: 0, scale: mobile ? 1 : 1.2, distance: 0, wheelCloseup: 0, wheelSpinSpeed: 0, lapX: 0, lapZ: 0 } : pose);
            const progress = Math.min(1, scroll / Math.max(1, stops.at(-1)));
            const now = performance.now();
            const elapsed = Math.max(16, now - lastSpeedAt);
            const coast = (1 - progress) * 56 + 8;
            const burst = Math.min(46, Math.abs(scroll - lastScroll) / elapsed * 150);
            const targetSpeed = motion.matches ? 0 : coast * 0.42 + burst;
            shownSpeed += (targetSpeed - shownSpeed) * 0.14;
            lastScroll = scroll;
            lastSpeedAt = now;
            if (speedRef.current) speedRef.current.textContent = String(Math.round(shownSpeed));
            if (gaugeRef.current) gaugeRef.current.style.setProperty("--speed", String(Math.min(1, Math.max(0, shownSpeed / 80))));
            if (Math.abs(targetSpeed - shownSpeed) > 0.6) schedule();
            element.dataset.carChapter = chapters[Math.min(chapters.length - 1, index + (t > 0.5 ? 1 : 0))].dataset.carStop;
            for (let chapterIndex = 0; chapterIndex < chapters.length; chapterIndex += 1) {
                const chapter = chapters[chapterIndex];
                const passage = Math.max(-1, Math.min(1, (scroll - (chapter.getBoundingClientRect().top + scroll)) / innerHeight));
                chapter.style.setProperty("--passage", motion.matches ? 0 : passage);
                const start = stops[Math.max(0, chapterIndex - 1)] ?? 0;
                const end = stops[chapterIndex] ?? start;
                const progress = chapterIndex === 0 ? 1 : (scroll - start) / Math.max(1, end - start);
                const introDone = element.dataset.introState === "complete";
                const arrived = chapter.dataset.carStop === "fleet" && fromId === "search"
                    ? fleetDrive > 0.12
                    : chapterIndex === 0 ? introDone : progress >= 0.68;
                chapter.dataset.carArrived = motion.matches || arrived ? "true" : "false";
            }
        }
        function schedule() { if (!frame) frame = requestAnimationFrame(update); }
        const resize = new ResizeObserver(measure);
        resize.observe(element);
        if (header) resize.observe(header);
        const contentChanges = new MutationObserver(measure);
        contentChanges.observe(element.querySelector('main'), { childList:true, subtree:true });
        function onScroll() {
            if (window.scrollY > 8) introSkipped = true;
            schedule();
        }
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", measure, { passive: true });
        motion.addEventListener("change", schedule);
        measure();
        setStatus("loading");
        element.dataset.sceneStatus = "loading";
        import("./carScrollScene.js").then(({ createCarScrollScene }) => {
            if (stopped) return;
            scene = createCarScrollScene(host.current, {
                reducedMotion: motion.matches,
                onReady: () => { if (!stopped) {
                    wheelReadyAt = performance.now();
                    element.dataset.sceneStatus = "ready";
                    schedule();
                } },
                onError: () => { if (!stopped) { setStatus("error"); element.dataset.sceneStatus = "error"; element.dataset.introState = "complete"; } },
            });
            update();
        }).catch(() => { if (!stopped) { setStatus("error"); element.dataset.sceneStatus = "error"; element.dataset.introState = "complete"; } });
        return () => {
            stopped = true;
            cancelAnimationFrame(frame);
            resize.disconnect();
            contentChanges.disconnect();
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", measure);
            motion.removeEventListener("change", schedule);
            scene?.dispose();
            document.documentElement.style.removeProperty("--journey-header-height");
        };
    }, [root, attempt]);

    return <>
        <div ref={host} className="journey-canvas" role="img" aria-label="Dodge Challenger 3D di chuyển theo cuộn trang" />
        {status !== "ready" ? <div className="journey-loading" role="status" data-native>
            {status === "error" ? <><span>Không thể tải mô hình 3D trên thiết bị này.</span><button type="button" onClick={() => setAttempt(value => value + 1)}>Thử lại</button></> : <><span>Đang chuẩn bị hành trình…</span></>}
        </div> : null}
        <div className="journey-speed" aria-hidden="true" ref={gaugeRef}>
          <svg viewBox="0 0 100 100" className="journey-speed-dial">
            <path className="journey-speed-track" d="M 22.6 77.4 A 38 38 0 1 1 77.4 77.4" pathLength="100"/>
            <path className="journey-speed-value" d="M 22.6 77.4 A 38 38 0 1 1 77.4 77.4" pathLength="100"/>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => <line key={i} className="journey-speed-tick" x1="50" y1="9" x2="50" y2={i % 2 ? 13 : 15} transform={`rotate(${-135 + i * 33.75} 50 50)`}/>)}
            <line className="journey-speed-needle" x1="50" y1="50" x2="50" y2="20"/>
            <circle className="journey-speed-hub" cx="50" cy="50" r="3.2"/>
          </svg>
          <p className="journey-speed-readout"><strong ref={speedRef}>0</strong><span>km/h</span></p>
        </div>
        <nav className="journey-rail" aria-label="Hành trình trên trang">
            {[['hero','Bắt đầu'],['search','Tìm xe'],['fleet','Bộ sưu tập'],['steps','Kết nối'],['flow','Cách thuê xe'],['drive','Lăn bánh'],['faq','Giải đáp'],['finale','Lên đường']].map(([id,label]) => <a key={id} href={`#journey-${id}`} data-journey-stop={id} aria-label={label}><span>{label}</span></a>)}
        </nav>
    </>;
}
