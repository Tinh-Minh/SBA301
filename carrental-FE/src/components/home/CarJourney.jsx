import { carIntroPath, CAR_INTRO_DURATION } from "./carIntroPath.js";
import { useEffect, useRef, useState } from "react";

const INTRO_SPEED = 1.5;

const poses = [
    { x: 0.02, y: -0.16, scale: 1.04, yaw: -0.65, tilt: 0, overhead: 0, customer: 0, depart: 0 },
    { x: 0.16, y: 0.02, scale: 0.66, yaw: -1.10, tilt: -0.025, overhead: 0.10, customer: 0, depart: 0 },
    { x: 0.26, y: 0.23, scale: 0.40, yaw: 0.35, tilt: 0, overhead: 0.28, customer: 0, depart: 0 },
    { x: -0.23, y: -0.04, scale: 0.77, yaw: 2.75, tilt: 0, overhead: 0.04, customer: 1, depart: 0 },
    { x: -0.27, y: -0.22, scale: 0.45, yaw: -0.7, tilt: 0, overhead: 0.12, customer: 0, depart: 0 },
    { x: 0.24, y: -0.08, scale: 0.78, yaw: 4.72, tilt: 0, overhead: 0.94, customer: 0, depart: 0 },
    { x: -0.25, y: -0.08, scale: 0.72, yaw: 3.25, tilt: 0, overhead: 0.20, customer: 0, depart: 0 },
    { x: 0, y: 0, scale: 0.85, yaw: Math.PI, tilt: 0, overhead: 0.06, customer: 0, depart: 0.05 },
];

const chapterIds = ["hero", "search", "fleet", "steps", "flow", "drive", "faq", "finale"];
const chapterPoses = Object.fromEntries(chapterIds.map((id, index) => [id, poses[index]]));

export function CarJourney({ root }) {
    const host = useRef(null);
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
        host.current.removeAttribute('style');
        host.current.removeAttribute('data-car-stage');
        let chapters = [];
        const header = document.querySelector(".site-header");
        function measure() {
            const headerHeight = header?.getBoundingClientRect().height || 80;
            document.documentElement.style.setProperty("--journey-header-height", `${headerHeight}px`);
            chapters = [...element.querySelectorAll("[data-car-stop]")];
            stops = chapters.map(chapter => chapter.getBoundingClientRect().top + window.scrollY - headerHeight);
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
            if (mobile) {
                const mobilePoses = [
                    { x:0, y:-0.08, scale:1.10 }, { x:0, y:0.03, scale:0.85 },
                    { x:0.26, y:0.23, scale:0.38 },
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
            element.dataset.introTitle = intro.step >= 2 ? "visible" : "hidden";
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
            element.style.setProperty("--journey-progress", Math.min(1, scroll / stops.at(-1)));
            element.dataset.carChapter = chapters[Math.min(chapters.length - 1, index + (t > 0.5 ? 1 : 0))].dataset.carStop;
            for (const chapter of chapters) {
                const passage = Math.max(-1, Math.min(1, (scroll - (chapter.getBoundingClientRect().top + scroll)) / innerHeight));
                chapter.style.setProperty("--passage", motion.matches ? 0 : passage);

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
        <nav className="journey-rail" aria-label="Hành trình trên trang">
            {[['hero','Bắt đầu'],['search','Tìm xe'],['fleet','Bộ sưu tập'],['steps','Kết nối'],['flow','Cách thuê xe'],['drive','Lăn bánh'],['faq','Giải đáp'],['finale','Lên đường']].map(([id,label]) => <a key={id} href={`#journey-${id}`} data-journey-stop={id} aria-label={label}><span>{label}</span></a>)}
        </nav>
    </>;
}
