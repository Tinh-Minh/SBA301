(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/hero-car-scene.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HeroCarScene",
    ()=>HeroCarScene
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function HeroCarScene() {
    _s();
    const video = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "HeroCarScene.useLayoutEffect": ()=>{
            const card = video.current?.closest(".hero-car-card");
            if (!card) return;
            function centerEntrance() {
                if (!card) return;
                // Offset layout coordinates ignore the entrance transform already in progress.
                let top = 0;
                let element = card;
                while(element){
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
                for (const animation of document.getAnimations()){
                    if (animation instanceof CSSAnimation && animation.animationName.startsWith("home-")) {
                        animation.finish();
                    }
                }
            }
            function onWheel(event) {
                if (!event.ctrlKey && (event.deltaX || event.deltaY)) finishEntrance();
            }
            function onKeyDown(event) {
                if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
                if (event.target instanceof Element && event.target.closest("input,textarea,select,button,a,summary,[contenteditable]:not([contenteditable='false']),[role='button']")) return;
                if ([
                    "ArrowDown",
                    "ArrowUp",
                    "PageDown",
                    "PageUp",
                    "Home",
                    "End",
                    " "
                ].includes(event.key)) finishEntrance();
            }
            window.addEventListener("wheel", onWheel, {
                passive: true
            });
            window.addEventListener("touchmove", finishEntrance, {
                passive: true
            });
            window.addEventListener("scroll", finishEntrance, {
                passive: true
            });
            window.addEventListener("keydown", onKeyDown);
            if (window.scrollY > 0) finishEntrance();
            window.addEventListener("resize", centerEntrance, {
                passive: true
            });
            return ({
                "HeroCarScene.useLayoutEffect": ()=>{
                    removeScrollListeners();
                    window.removeEventListener("resize", centerEntrance);
                }
            })["HeroCarScene.useLayoutEffect"];
        }
    }["HeroCarScene.useLayoutEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "HeroCarScene.useEffect": ()=>{
            const element = video.current;
            if (!element) return;
            const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
            let visible = true;
            function syncPlayback() {
                if (!element) return;
                if (reducedMotion.matches || !visible || document.hidden) {
                    element.pause();
                } else {
                    void element.play().catch({
                        "HeroCarScene.useEffect.syncPlayback": ()=>{}
                    }["HeroCarScene.useEffect.syncPlayback"]);
                }
            }
            const observer = new IntersectionObserver({
                "HeroCarScene.useEffect": ([entry])=>{
                    visible = entry.isIntersecting;
                    syncPlayback();
                }
            }["HeroCarScene.useEffect"]);
            observer.observe(element);
            reducedMotion.addEventListener("change", syncPlayback);
            document.addEventListener("visibilitychange", syncPlayback);
            syncPlayback();
            return ({
                "HeroCarScene.useEffect": ()=>{
                    observer.disconnect();
                    reducedMotion.removeEventListener("change", syncPlayback);
                    document.removeEventListener("visibilitychange", syncPlayback);
                    element.pause();
                }
            })["HeroCarScene.useEffect"];
        }
    }["HeroCarScene.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "hero-car-scene",
        role: "img",
        "aria-label": "Xe thể thao đỗ dưới ánh đèn, phản chiếu trên mặt đường mưa",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("video", {
            ref: video,
            className: "hero-car-video",
            src: "/videos/hero-car-rain.mp4",
            poster: "/images/hero-car-rain.webp",
            width: "1280",
            height: "536",
            muted: true,
            loop: true,
            playsInline: true,
            preload: "none",
            disablePictureInPicture: true,
            "aria-hidden": "true"
        }, void 0, false, {
            fileName: "[project]/src/components/hero-car-scene.jsx",
            lineNumber: 93,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/hero-car-scene.jsx",
        lineNumber: 92,
        columnNumber: 12
    }, this);
}
_s(HeroCarScene, "z2iSezoHe4TB29WGROeU3ILBq84=");
_c = HeroCarScene;
var _c;
__turbopack_context__.k.register(_c, "HeroCarScene");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/interactive-grid.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InteractiveGrid",
    ()=>InteractiveGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function InteractiveGrid({ children }) {
    _s();
    const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InteractiveGrid.useEffect": ()=>{
            const zone = root.current;
            if (!zone) return;
            zone.dataset.glowing = "false";
            let frame = 0;
            let clientX = -1000;
            let clientY = -1000;
            let pointerPresent = false;
            function update() {
                frame = 0;
                if (!zone) return;
                const bounds = zone.getBoundingClientRect();
                const x = clientX - bounds.left;
                const y = clientY - bounds.top;
                const inside = pointerPresent && x >= 0 && y >= 0 && x < bounds.width && y < bounds.height;
                zone.style.setProperty("--grid-x", `${x}px`);
                zone.style.setProperty("--grid-y", `${y}px`);
                zone.dataset.glowing = String(inside);
            }
            function schedule() {
                if (!frame) frame = requestAnimationFrame(update);
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
            window.addEventListener("pointermove", move, {
                passive: true
            });
            window.addEventListener("scroll", schedule, {
                passive: true,
                capture: true
            });
            window.addEventListener("resize", schedule, {
                passive: true
            });
            window.addEventListener("blur", leave);
            window.addEventListener("pointercancel", leave);
            document.documentElement.addEventListener("pointerleave", leave);
            return ({
                "InteractiveGrid.useEffect": ()=>{
                    cancelAnimationFrame(frame);
                    window.removeEventListener("pointermove", move);
                    window.removeEventListener("scroll", schedule, true);
                    window.removeEventListener("resize", schedule);
                    window.removeEventListener("blur", leave);
                    window.removeEventListener("pointercancel", leave);
                    document.documentElement.removeEventListener("pointerleave", leave);
                }
            })["InteractiveGrid.useEffect"];
        }
    }["InteractiveGrid.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        ref: root,
        id: "interactive-grid-zone",
        className: "square-grid-container",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid-reveal",
                "aria-hidden": "true"
            }, void 0, false, {
                fileName: "[project]/src/components/interactive-grid.jsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/interactive-grid.jsx",
        lineNumber: 56,
        columnNumber: 13
    }, this);
}
_s(InteractiveGrid, "/rr7G8WhLICCHRj4HQ5x5ovssB4=");
_c = InteractiveGrid;
var _c;
__turbopack_context__.k.register(_c, "InteractiveGrid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/password-strength.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PasswordStrength",
    ()=>PasswordStrength
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const LEVELS = [
    {
        label: "Yếu",
        color: "#DC2626"
    },
    {
        label: "Trung bình",
        color: "#D97706"
    },
    {
        label: "Khá",
        color: "#FC6C26"
    },
    {
        label: "Mạnh",
        color: "#15803D"
    }
];
function scorePassword(value) {
    if (!value) return 0;
    const longEnough = value.length >= 8;
    const hasLetter = /[A-Za-zÀ-ỹ]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasUpper = /[A-ZÀ-Ỹ]/.test(value);
    const hasSymbol = /[^A-Za-zÀ-ỹ0-9\s]/.test(value);
    if (!longEnough) return 1;
    if (!hasLetter || !hasDigit) return 2;
    if (value.length >= 12 && hasUpper && hasSymbol) return 4;
    return 3;
}
function PasswordStrength({ inputId = "reg-password" }) {
    _s();
    const [score, setScore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PasswordStrength.useEffect": ()=>{
            const input = document.getElementById(inputId);
            if (!input) return undefined;
            const update = {
                "PasswordStrength.useEffect.update": ()=>setScore(scorePassword(input.value))
            }["PasswordStrength.useEffect.update"];
            update();
            input.addEventListener("input", update);
            return ({
                "PasswordStrength.useEffect": ()=>input.removeEventListener("input", update)
            })["PasswordStrength.useEffect"];
        }
    }["PasswordStrength.useEffect"], [
        inputId
    ]);
    const level = score > 0 ? LEVELS[score - 1] : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "pt-0.5 space-y-1",
        "aria-live": "polite",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-1.5",
                children: [
                    0,
                    1,
                    2,
                    3
                ].map((index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "h-1 flex-1 rounded-full transition-colors duration-200",
                        style: {
                            backgroundColor: index < score ? level.color : "#E9E9E7"
                        }
                    }, index, false, {
                        fileName: "[project]/src/components/password-strength.jsx",
                        lineNumber: 42,
                        columnNumber: 34
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/password-strength.jsx",
                lineNumber: 41,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between text-[11px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "font-semibold",
                        style: {
                            color: level ? level.color : "#666666"
                        },
                        children: level ? `Độ mạnh: ${level.label}` : "Độ mạnh"
                    }, void 0, false, {
                        fileName: "[project]/src/components/password-strength.jsx",
                        lineNumber: 45,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[#666666]",
                        children: "Tối thiểu 8 ký tự, gồm chữ & số"
                    }, void 0, false, {
                        fileName: "[project]/src/components/password-strength.jsx",
                        lineNumber: 46,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/password-strength.jsx",
                lineNumber: 44,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/password-strength.jsx",
        lineNumber: 40,
        columnNumber: 12
    }, this);
}
_s(PasswordStrength, "6LqkIJiaorzg0taiAgz78FTgEiM=");
_c = PasswordStrength;
var _c;
__turbopack_context__.k.register(_c, "PasswordStrength");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/pricing-consultation.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PricingConsultation",
    ()=>PricingConsultation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function PricingConsultation() {
    _s();
    const [submitted, setSubmitted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    function submit(event) {
        event.preventDefault();
        event.stopPropagation();
        setSubmitted(true);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "enterpriseConsult",
        "data-pricing-section": "enterprise",
        className: "bg-card-bg py-12 md:py-16",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto grid max-w-[1240px] items-center gap-6 px-5 md:px-8 lg:grid-cols-12",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-6 lg:col-span-7",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mb-2 text-xs font-semibold uppercase tracking-wider text-brand-accent",
                                    children: "Dành cho khách hàng doanh nghiệp"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                    lineNumber: 14,
                                    columnNumber: 14
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-3xl font-bold leading-tight tracking-tight lg:text-5xl",
                                    children: [
                                        "Giải pháp thuê xe",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/src/components/pricing-consultation.jsx",
                                            lineNumber: 14,
                                            columnNumber: 228
                                        }, this),
                                        "cho kế hoạch dài hạn"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                    lineNumber: 14,
                                    columnNumber: 135
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-4 max-w-xl text-base leading-relaxed text-text-secondary",
                                    children: "Trao đổi nhu cầu sử dụng xe theo tháng, quý hoặc năm. CarDB cùng bạn lựa chọn phương án giao nhận, hồ sơ và lịch thanh toán phù hợp."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                    lineNumber: 14,
                                    columnNumber: 259
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/pricing-consultation.jsx",
                            lineNumber: 14,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-4 sm:grid-cols-2",
                            children: [
                                [
                                    "receipt_long",
                                    "Hồ sơ & hóa đơn",
                                    "Thống nhất thông tin hợp đồng, chứng từ và hóa đơn trước khi thuê."
                                ],
                                [
                                    "directions_car",
                                    "Phương án thay thế",
                                    "Trao đổi nhu cầu xe dự phòng cho lịch sử dụng dài hạn."
                                ],
                                [
                                    "badge",
                                    "Dịch vụ tài xế",
                                    "Chọn xe tự lái hoặc bổ sung tài xế theo lịch trình doanh nghiệp."
                                ],
                                [
                                    "payment",
                                    "Thanh toán linh hoạt",
                                    "Đối chiếu lịch thanh toán và điều kiện cọc trong báo giá riêng."
                                ]
                            ].map(([icon, title, description])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                    className: "flex items-start gap-3 rounded-xl bg-section-bg p-4 shadow-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                            name: icon,
                                            className: "text-brand-accent"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/pricing-consultation.jsx",
                                            lineNumber: 20,
                                            columnNumber: 142
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-sm font-semibold",
                                                    children: title
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                                    lineNumber: 20,
                                                    columnNumber: 196
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-xs leading-relaxed text-text-secondary",
                                                    children: description
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                                    lineNumber: 20,
                                                    columnNumber: 246
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-consultation.jsx",
                                            lineNumber: 20,
                                            columnNumber: 191
                                        }, this)
                                    ]
                                }, title, true, {
                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                    lineNumber: 20,
                                    columnNumber: 47
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/pricing-consultation.jsx",
                            lineNumber: 15,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>window.print(),
                                    className: "ui-action inline-flex items-center gap-2 rounded-full bg-brand-accent px-5 py-3 text-sm font-semibold text-on-primary shadow-md hover:bg-primary-hover",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                            name: "print",
                                            className: "text-[20px]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/pricing-consultation.jsx",
                                            lineNumber: 21,
                                            columnNumber: 276
                                        }, this),
                                        "In / Lưu bảng giá PDF"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                    lineNumber: 21,
                                    columnNumber: 60
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs text-text-secondary",
                                    children: "Lưu bảng giá bằng chức năng in của trình duyệt"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                    lineNumber: 21,
                                    columnNumber: 350
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/pricing-consultation.jsx",
                            lineNumber: 21,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/pricing-consultation.jsx",
                    lineNumber: 13,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-2xl border border-border-light bg-card-bg p-6 shadow-lg md:p-10 lg:col-span-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-2 flex items-center gap-2 text-sm font-semibold text-brand-accent",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: "mark_email_read"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                    lineNumber: 23,
                                    columnNumber: 194
                                }, this),
                                "Báo giá doanh nghiệp"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/pricing-consultation.jsx",
                            lineNumber: 23,
                            columnNumber: 110
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-2xl font-semibold",
                            children: "Trao đổi nhu cầu thuê xe"
                        }, void 0, false, {
                            fileName: "[project]/src/components/pricing-consultation.jsx",
                            lineNumber: 23,
                            columnNumber: 248
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-6 mt-3 text-xs leading-relaxed text-text-secondary",
                            children: "Điền thông tin để xem trước yêu cầu tư vấn của doanh nghiệp."
                        }, void 0, false, {
                            fileName: "[project]/src/components/pricing-consultation.jsx",
                            lineNumber: 23,
                            columnNumber: 316
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: submit,
                            className: "space-y-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "enterprise-name",
                                            className: "mb-1 block text-xs font-semibold",
                                            children: "Tên doanh nghiệp / tổ chức *"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/pricing-consultation.jsx",
                                            lineNumber: 25,
                                            columnNumber: 16
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            id: "enterprise-name",
                                            name: "company",
                                            type: "text",
                                            required: true,
                                            placeholder: "Tên doanh nghiệp của bạn",
                                            className: "w-full rounded-xl bg-section-bg px-4 py-3 text-sm"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/pricing-consultation.jsx",
                                            lineNumber: 25,
                                            columnNumber: 130
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                    lineNumber: 25,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid gap-3 sm:grid-cols-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "enterprise-contact",
                                                    className: "mb-1 block text-xs font-semibold",
                                                    children: "Người liên hệ *"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                                    lineNumber: 26,
                                                    columnNumber: 59
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    id: "enterprise-contact",
                                                    name: "contact",
                                                    required: true,
                                                    autoComplete: "name",
                                                    placeholder: "Nguyễn Văn A",
                                                    className: "w-full rounded-xl bg-section-bg px-4 py-3 text-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                                    lineNumber: 26,
                                                    columnNumber: 163
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-consultation.jsx",
                                            lineNumber: 26,
                                            columnNumber: 54
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "enterprise-phone",
                                                    className: "mb-1 block text-xs font-semibold",
                                                    children: "Số điện thoại *"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                                    lineNumber: 26,
                                                    columnNumber: 339
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    id: "enterprise-phone",
                                                    name: "phone",
                                                    type: "tel",
                                                    required: true,
                                                    autoComplete: "tel",
                                                    placeholder: "0901 234 567",
                                                    className: "w-full rounded-xl bg-section-bg px-4 py-3 text-sm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                                    lineNumber: 26,
                                                    columnNumber: 441
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-consultation.jsx",
                                            lineNumber: 26,
                                            columnNumber: 334
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                    lineNumber: 26,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "enterprise-fleet",
                                            className: "mb-1 block text-xs font-semibold",
                                            children: "Số lượng & loại xe"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/pricing-consultation.jsx",
                                            lineNumber: 27,
                                            columnNumber: 16
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            id: "enterprise-fleet",
                                            name: "fleet",
                                            className: "w-full rounded-xl bg-section-bg px-4 py-3 text-sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    children: "Từ 1–3 xe theo tháng / năm"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                                    lineNumber: 27,
                                                    columnNumber: 226
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    children: "Từ 4–10 xe cho chuyên gia"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                                    lineNumber: 27,
                                                    columnNumber: 269
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    children: "Trên 10 xe cho dự án"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                                    lineNumber: 27,
                                                    columnNumber: 311
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    children: "Xe kèm tài xế"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                                    lineNumber: 27,
                                                    columnNumber: 348
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-consultation.jsx",
                                            lineNumber: 27,
                                            columnNumber: 121
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                    lineNumber: 27,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "flex w-full items-center justify-center gap-2 rounded-full bg-text-primary px-4 py-3 text-sm font-semibold text-on-primary hover:bg-brand-accent",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                            name: "check",
                                            className: "text-[20px]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/pricing-consultation.jsx",
                                            lineNumber: 28,
                                            columnNumber: 190
                                        }, this),
                                        "Xem trước yêu cầu báo giá"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                    lineNumber: 28,
                                    columnNumber: 11
                                }, this),
                                submitted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    role: "status",
                                    className: "rounded-lg bg-status-success/10 p-3 text-xs leading-relaxed text-status-success-ink",
                                    children: [
                                        "Đã lưu yêu cầu trong bản xem trước. Gọi ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "tel:19008899",
                                            className: "font-bold underline",
                                            children: "1900 8899"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/pricing-consultation.jsx",
                                            lineNumber: 29,
                                            columnNumber: 177
                                        }, this),
                                        " để trao đổi trực tiếp với CarDB."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-consultation.jsx",
                                    lineNumber: 29,
                                    columnNumber: 24
                                }, this) : null
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/pricing-consultation.jsx",
                            lineNumber: 24,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/pricing-consultation.jsx",
                    lineNumber: 23,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/pricing-consultation.jsx",
            lineNumber: 12,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/pricing-consultation.jsx",
        lineNumber: 11,
        columnNumber: 12
    }, this);
}
_s(PricingConsultation, "S6ipnhtDax9I0+B/fnlVz3+f6e8=");
_c = PricingConsultation;
var _c;
__turbopack_context__.k.register(_c, "PricingConsultation");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/pricing-explorer.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PricingExplorer",
    ()=>PricingExplorer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pricing.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const modes = [
    {
        id: "self",
        label: "Thuê tự lái",
        icon: "key"
    },
    {
        id: "driver",
        label: "Kèm tài xế",
        icon: "person"
    },
    {
        id: "month",
        label: "Thuê theo tháng",
        icon: "garage_home"
    }
];
function PricingExplorer({ intro, benefits, comparison, fees }) {
    _s();
    const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("self");
    const [category, setCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [segmentId, setSegmentId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("electric");
    const [days, setDays] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(3);
    const [delivery, setDelivery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [insurance, setInsurance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const segment = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pricingSegments"].find((item)=>item.id === segmentId);
    const rate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rentalDiscount"])(days);
    const rental = segment.daily * days;
    const discount = Math.round(rental * rate);
    const driverFee = mode === "driver" ? 350000 * days : 0;
    const insuranceFee = insurance ? 99000 * days : 0;
    const deliveryFee = delivery ? 150000 : 0;
    const subtotal = rental - discount + driverFee + insuranceFee + deliveryFee;
    const tax = Math.round(subtotal * .08);
    function changeMode(value) {
        setMode(value);
        if (value === "month") setDays(30);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "data-pricing-section": "intro",
                className: "relative overflow-hidden bg-gradient-to-br from-accent-soft/50 via-white to-section-bg pt-10 pb-16",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-brand-accent/10 blur-3xl"
                    }, void 0, false, {
                        fileName: "[project]/src/components/pricing-explorer.jsx",
                        lineNumber: 29,
                        columnNumber: 154
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative mx-auto max-w-[1240px] px-5 md:px-8",
                        children: [
                            intro,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-6 flex max-w-3xl flex-wrap gap-1 rounded-full bg-accent-soft p-1 shadow-inner",
                                role: "group",
                                "aria-label": "Hình thức thuê",
                                children: modes.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        "aria-pressed": mode === item.id,
                                        onClick: ()=>changeMode(item.id),
                                        className: `ui-action flex flex-none sm:flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-colors ${mode === item.id ? "bg-card-bg text-text-primary shadow-sm" : "text-text-secondary hover:bg-section-bg"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: item.icon,
                                                className: "text-[18px]"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/pricing-explorer.jsx",
                                                lineNumber: 30,
                                                columnNumber: 522
                                            }, this),
                                            item.label
                                        ]
                                    }, item.id, true, {
                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                        lineNumber: 30,
                                        columnNumber: 163
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/pricing-explorer.jsx",
                                lineNumber: 30,
                                columnNumber: 5
                            }, this),
                            benefits
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/pricing-explorer.jsx",
                        lineNumber: 29,
                        columnNumber: 268
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/pricing-explorer.jsx",
                lineNumber: 29,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "data-pricing-section": "fleet",
                className: "bg-section-bg py-10",
                "aria-labelledby": "fleet-title",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-[1240px] px-5 md:px-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "lg:max-w-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            id: "fleet-title",
                                            className: "text-2xl font-bold tracking-tight md:text-3xl",
                                            children: "Phân khúc xe & mức giá thực tế"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 35,
                                            columnNumber: 40
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 text-sm text-text-secondary",
                                            children: "Chọn cách di chuyển, so sánh mức thuê theo phân khúc."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 35,
                                            columnNumber: 154
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                    lineNumber: 35,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex max-w-xl flex-wrap gap-2",
                                    role: "group",
                                    "aria-label": "Lọc phân khúc",
                                    children: [
                                        {
                                            id: "all",
                                            name: "Tất cả"
                                        },
                                        ...__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pricingSegments"]
                                    ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            "aria-pressed": category === item.id,
                                            onClick: ()=>setCategory(item.id),
                                            className: `ui-action rounded-full border px-3 py-2 text-xs font-medium transition-colors ${category === item.id ? "border-brand-accent bg-accent-soft text-brand-accent" : "border-border-light bg-card-bg text-text-secondary hover:border-brand-accent/40"}`,
                                            children: item.name
                                        }, item.id, false, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 36,
                                            columnNumber: 163
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                    lineNumber: 36,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/pricing-explorer.jsx",
                            lineNumber: 34,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3",
                            children: [
                                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pricingSegments"].filter((item)=>category === "all" || category === item.id).map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                        "data-price-card": item.id,
                                        className: "group flex flex-col overflow-hidden rounded-xl border border-border-light bg-card-bg transition-shadow hover:shadow-xl",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative aspect-[16/9] overflow-hidden bg-pill-bg",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: `/images/${item.image}`,
                                                        alt: item.imageAlt,
                                                        width: "640",
                                                        height: "360",
                                                        loading: "lazy",
                                                        decoding: "async",
                                                        className: "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                        lineNumber: 41,
                                                        columnNumber: 80
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "absolute left-4 top-4 rounded-full bg-card-bg/95 px-3 py-1 text-xs font-semibold shadow-sm",
                                                        children: item.seats
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                        lineNumber: 41,
                                                        columnNumber: 288
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/pricing-explorer.jsx",
                                                lineNumber: 41,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-1 flex-col p-6",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-lg font-bold",
                                                        children: item.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                        lineNumber: 42,
                                                        columnNumber: 55
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "mt-2 min-h-10 text-xs leading-relaxed text-text-secondary",
                                                        children: item.models
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                        lineNumber: 42,
                                                        columnNumber: 105
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-4 grid grid-cols-2 gap-2 text-xs",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "rounded bg-section-bg p-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "block text-text-secondary",
                                                                        children: "Số chỗ"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                        lineNumber: 42,
                                                                        columnNumber: 291
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        className: "mt-1 block",
                                                                        children: item.seats
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                        lineNumber: 42,
                                                                        columnNumber: 348
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                lineNumber: 42,
                                                                columnNumber: 248
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "rounded bg-section-bg p-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "block text-text-secondary",
                                                                        children: "Hộp số"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                        lineNumber: 42,
                                                                        columnNumber: 449
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        className: "mt-1 block",
                                                                        children: "Tự động"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                        lineNumber: 42,
                                                                        columnNumber: 506
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                lineNumber: 42,
                                                                columnNumber: 406
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                        lineNumber: 42,
                                                        columnNumber: 195
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "my-4 rounded-lg bg-accent-soft p-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-text-secondary",
                                                                children: mode === "month" ? "30 ngày, đã giảm 25%" : mode === "driver" ? "Đã gồm tài xế 350.000 đ/ngày" : "Giá thuê tham khảo"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                lineNumber: 42,
                                                                columnNumber: 617
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mt-2 flex flex-wrap items-baseline gap-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        className: "ui-money text-xl text-brand-accent",
                                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPrice"])(mode === "month" ? item.daily * 30 * .75 : item.daily + (mode === "driver" ? 350000 : 0))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                        lineNumber: 42,
                                                                        columnNumber: 841
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-xs text-text-secondary",
                                                                        children: [
                                                                            "/ ",
                                                                            mode === "month" ? "tháng" : "ngày"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                        lineNumber: 42,
                                                                        columnNumber: 1008
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                lineNumber: 42,
                                                                columnNumber: 783
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "mt-2 text-[11px] text-text-secondary",
                                                                children: [
                                                                    "Tự lái: ",
                                                                    item.range,
                                                                    "/ngày"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                lineNumber: 42,
                                                                columnNumber: 1106
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                        lineNumber: 42,
                                                        columnNumber: 565
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                        href: "/explore",
                                                        className: "mt-auto flex items-center justify-center gap-2 rounded-full bg-text-primary px-4 py-2.5 text-xs font-semibold text-on-primary hover:bg-brand-accent",
                                                        children: [
                                                            "Khám phá đội xe",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                name: "arrow_forward",
                                                                className: "text-[20px]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                lineNumber: 42,
                                                                columnNumber: 1390
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                        lineNumber: 42,
                                                        columnNumber: 1193
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/pricing-explorer.jsx",
                                                lineNumber: 42,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, item.id, true, {
                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                        lineNumber: 40,
                                        columnNumber: 99
                                    }, this)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                                    className: "relative flex flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br from-text-primary to-text-secondary p-6 text-on-primary md:p-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-brand-accent/25 blur-3xl"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 44,
                                            columnNumber: 177
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                    name: "loyalty",
                                                    className: "mb-8 text-[32px] text-brand-accent"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 44,
                                                    columnNumber: 317
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-2xl font-bold leading-tight",
                                                    children: [
                                                        "Đi lâu hơn.",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                                            lineNumber: 44,
                                                            columnNumber: 446
                                                        }, this),
                                                        "Tiết kiệm nhiều hơn."
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 44,
                                                    columnNumber: 386
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-4 text-sm leading-relaxed text-on-primary/70",
                                                    children: "Ưu đãi được tính trên tiền thuê xe, trước các dịch vụ bổ sung và thuế."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 44,
                                                    columnNumber: 477
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                                    className: "mt-8 divide-y divide-white/15",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex justify-between py-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                                    className: "text-sm",
                                                                    children: "Từ 7 ngày"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                    lineNumber: 44,
                                                                    columnNumber: 703
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                                    className: "text-xl font-bold text-brand-accent",
                                                                    children: "−10%"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                    lineNumber: 44,
                                                                    columnNumber: 741
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                                            lineNumber: 44,
                                                            columnNumber: 660
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex justify-between py-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                                                                    className: "text-sm",
                                                                    children: "Từ 30 ngày"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                    lineNumber: 44,
                                                                    columnNumber: 851
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                                                                    className: "text-xl font-bold text-brand-accent",
                                                                    children: "−25%"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                    lineNumber: 44,
                                                                    columnNumber: 890
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                                            lineNumber: 44,
                                                            columnNumber: 808
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 44,
                                                    columnNumber: 614
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 44,
                                            columnNumber: 291
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "#du-toan",
                                            className: "relative mt-8 flex items-center justify-between rounded-lg bg-card-bg px-4 py-3 text-sm font-semibold text-text-primary",
                                            children: [
                                                "Tính chi phí chuyến đi",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                    name: "expand_more",
                                                    className: "text-[18px]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 44,
                                                    columnNumber: 1141
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 44,
                                            columnNumber: 968
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                    lineNumber: 44,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/pricing-explorer.jsx",
                            lineNumber: 39,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-5 text-xs leading-relaxed text-text-secondary",
                            children: "Mức tham khảo chưa gồm thuế và dịch vụ tùy chọn. Giá cụ thể phụ thuộc dòng xe, thời gian nhận trả và được xác nhận trước khi đặt xe."
                        }, void 0, false, {
                            fileName: "[project]/src/components/pricing-explorer.jsx",
                            lineNumber: 46,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/pricing-explorer.jsx",
                    lineNumber: 33,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/pricing-explorer.jsx",
                lineNumber: 32,
                columnNumber: 5
            }, this),
            comparison,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                "data-pricing-section": "fees",
                className: "bg-section-bg py-12 md:py-16",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-[1240px] px-5 md:px-8",
                    children: [
                        fees,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            id: "du-toan",
                            className: "rounded-xl bg-card-bg p-6 shadow-sm md:p-10",
                            "aria-labelledby": "estimate-title",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col justify-between gap-8 xl:flex-row xl:items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "xl:max-w-sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mb-2 flex items-center gap-2 text-sm font-semibold text-brand-accent",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                            name: "receipt_long",
                                                            className: "text-[20px]"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                                            lineNumber: 53,
                                                            columnNumber: 124
                                                        }, this),
                                                        "Dự toán nhanh chi phí thuê xe"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 53,
                                                    columnNumber: 40
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    id: "estimate-title",
                                                    className: "text-xl font-semibold leading-snug",
                                                    children: "Tính tổng chi phí theo nhu cầu di chuyển"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 53,
                                                    columnNumber: 208
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-3 text-sm leading-relaxed text-text-secondary",
                                                    children: "Tiền thuê × số ngày, trừ ưu đãi, cộng dịch vụ bạn chọn và thuế. Tiền cọc được giữ riêng."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 53,
                                                    columnNumber: 324
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 53,
                                            columnNumber: 11
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-[auto_1fr_auto]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "rental-days",
                                                            className: "text-xs font-semibold text-text-secondary",
                                                            children: "Số ngày thuê"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                                            lineNumber: 55,
                                                            columnNumber: 18
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "mt-2 flex items-center rounded-full bg-section-bg p-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    "aria-label": "Giảm số ngày thuê",
                                                                    disabled: days <= 1,
                                                                    onClick: ()=>setDays((value)=>Math.max(1, value - 1)),
                                                                    className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-card-bg shadow-sm disabled:opacity-30",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        "aria-hidden": "true",
                                                                        children: "−"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                        lineNumber: 55,
                                                                        columnNumber: 438
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                    lineNumber: 55,
                                                                    columnNumber: 192
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                    id: "rental-days",
                                                                    type: "number",
                                                                    min: "1",
                                                                    max: "60",
                                                                    value: days,
                                                                    onChange: (event)=>setDays(Math.min(60, Math.max(1, Number(event.target.value) || 1))),
                                                                    className: "w-14 bg-transparent text-center text-lg font-bold"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                    lineNumber: 55,
                                                                    columnNumber: 480
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    "aria-label": "Tăng số ngày thuê",
                                                                    disabled: days >= 60,
                                                                    onClick: ()=>setDays((value)=>Math.min(60, value + 1)),
                                                                    className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-card-bg shadow-sm disabled:opacity-30",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                                        name: "add",
                                                                        className: "text-[18px]"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                        lineNumber: 55,
                                                                        columnNumber: 947
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                    lineNumber: 55,
                                                                    columnNumber: 699
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                                            lineNumber: 55,
                                                            columnNumber: 121
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 55,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "price-segment",
                                                            className: "text-xs font-semibold text-text-secondary",
                                                            children: "Phân khúc xe"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                                            lineNumber: 56,
                                                            columnNumber: 38
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                            id: "price-segment",
                                                            value: segmentId,
                                                            onChange: (event)=>setSegmentId(event.target.value),
                                                            className: "mt-2 block w-full max-w-full rounded-full bg-section-bg px-4 py-3 text-xs font-medium",
                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["pricingSegments"].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                    value: item.id,
                                                                    children: item.name
                                                                }, item.id, false, {
                                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                                    lineNumber: 56,
                                                                    columnNumber: 368
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                                            lineNumber: 56,
                                                            columnNumber: 143
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 56,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "rounded-xl bg-accent-soft p-4 sm:col-span-2 lg:col-span-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-xs text-text-secondary",
                                                            children: [
                                                                "Tổng dự kiến • Giảm ",
                                                                rate * 100,
                                                                "%"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                                            lineNumber: 57,
                                                            columnNumber: 88
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("output", {
                                                            id: "estimate-total",
                                                            "aria-live": "polite",
                                                            className: "ui-money mt-1 block text-xl font-bold text-brand-accent",
                                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPrice"])(subtotal + tax)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                                            lineNumber: 57,
                                                            columnNumber: 174
                                                        }, this),
                                                        discount > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-1 text-xs font-medium text-status-success-ink",
                                                            children: [
                                                                "Tiết kiệm ",
                                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPrice"])(discount)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                                            lineNumber: 57,
                                                            columnNumber: 343
                                                        }, this) : null
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 57,
                                                    columnNumber: 13
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 54,
                                            columnNumber: 11
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                    lineNumber: 52,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-border-light pt-5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "flex flex-wrap items-center gap-2 text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: insurance,
                                                    onChange: (event)=>setInsurance(event.target.checked)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 60,
                                                    columnNumber: 157
                                                }, this),
                                                "Bảo hiểm nâng cao",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-text-secondary",
                                                    children: "99.000 đ/ngày"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 60,
                                                    columnNumber: 273
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 60,
                                            columnNumber: 96
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "flex flex-wrap items-center gap-2 text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "checkbox",
                                                    checked: delivery,
                                                    onChange: (event)=>setDelivery(event.target.checked)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 60,
                                                    columnNumber: 400
                                                }, this),
                                                "Giao xe sân bay",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-text-secondary",
                                                    children: "150.000 đ/lượt"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 60,
                                                    columnNumber: 512
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 60,
                                            columnNumber: 339
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                    lineNumber: 60,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                    className: "mt-5 rounded-lg bg-section-bg p-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                            className: "cursor-pointer text-sm font-semibold",
                                            children: "Xem từng khoản trong dự toán"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 61,
                                            columnNumber: 64
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                                            className: "mt-4 grid gap-x-10 gap-y-3 text-xs sm:grid-cols-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PriceRow, {
                                                    label: `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPrice"])(segment.daily)} × ${days} ngày`,
                                                    amount: rental
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 61,
                                                    columnNumber: 226
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PriceRow, {
                                                    label: `Ưu đãi thời lượng (${rate * 100}%)`,
                                                    amount: -discount
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 61,
                                                    columnNumber: 308
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PriceRow, {
                                                    label: "Tài xế riêng",
                                                    amount: driverFee
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 61,
                                                    columnNumber: 383
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PriceRow, {
                                                    label: "Bảo hiểm nâng cao",
                                                    amount: insuranceFee
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 61,
                                                    columnNumber: 434
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PriceRow, {
                                                    label: "Giao xe sân bay",
                                                    amount: deliveryFee
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 61,
                                                    columnNumber: 493
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PriceRow, {
                                                    label: "Thuế minh họa (8%)",
                                                    amount: tax
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 61,
                                                    columnNumber: 549
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 61,
                                            columnNumber: 160
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                    lineNumber: 61,
                                    columnNumber: 9
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "max-w-2xl text-xs leading-relaxed text-text-secondary",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    className: "text-text-primary",
                                                    children: "Cọc thế chấp giữ riêng"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 62,
                                                    columnNumber: 164
                                                }, this),
                                                ": ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "ui-money",
                                                    children: "15.000.000 đ"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 62,
                                                    columnNumber: 235
                                                }, this),
                                                ", không cộng vào tổng. Thuế minh họa 8%; giá và điều kiện cuối cùng được xác nhận trong đơn thuê."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 62,
                                            columnNumber: 95
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            href: "/explore",
                                            className: "ui-action inline-flex items-center justify-center gap-2 rounded-full bg-text-primary px-4 py-2.5 text-xs font-semibold text-on-primary hover:bg-brand-accent",
                                            children: [
                                                "Tìm xe phù hợp",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                    name: "arrow_forward",
                                                    className: "text-[16px]"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                                    lineNumber: 62,
                                                    columnNumber: 587
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/pricing-explorer.jsx",
                                            lineNumber: 62,
                                            columnNumber: 382
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/pricing-explorer.jsx",
                                    lineNumber: 62,
                                    columnNumber: 9
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/pricing-explorer.jsx",
                            lineNumber: 51,
                            columnNumber: 7
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/pricing-explorer.jsx",
                    lineNumber: 50,
                    columnNumber: 83
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/pricing-explorer.jsx",
                lineNumber: 50,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/pricing-explorer.jsx",
        lineNumber: 28,
        columnNumber: 12
    }, this);
}
_s(PricingExplorer, "DYxNfZMFDAUMAh5GgFYrYRQm/Wk=");
_c = PricingExplorer;
function PriceRow({ label, amount }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap items-baseline justify-between gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dt", {
                className: "text-text-secondary",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/components/pricing-explorer.jsx",
                lineNumber: 68,
                columnNumber: 81
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("dd", {
                className: `ui-money font-semibold ${amount < 0 ? "text-status-success-ink" : ""}`,
                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pricing$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatPrice"])(amount)
            }, void 0, false, {
                fileName: "[project]/src/components/pricing-explorer.jsx",
                lineNumber: 68,
                columnNumber: 129
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/pricing-explorer.jsx",
        lineNumber: 68,
        columnNumber: 12
    }, this);
}
_c1 = PriceRow;
var _c, _c1;
__turbopack_context__.k.register(_c, "PricingExplorer");
__turbopack_context__.k.register(_c1, "PriceRow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/profile-sidebar.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileSidebar",
    ()=>ProfileSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/auth-provider.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/labels.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const groups = [
    {
        title: "Cài đặt tài khoản",
        links: [
            {
                section: "account",
                href: "/account",
                label: "Thông tin cá nhân",
                icon: "person"
            },
            {
                section: "verification",
                href: "/account/verification",
                label: "Xác minh giấy tờ",
                icon: "verified_user"
            },
            {
                section: "driver",
                href: "/account/driver",
                label: "Hồ sơ tài xế",
                icon: "badge"
            },
            {
                section: "banks",
                href: "/account/bank",
                label: "Tài khoản ngân hàng",
                icon: "account_balance"
            }
        ]
    },
    {
        title: "Quản lý chuyến đi",
        links: [
            {
                section: "orders",
                href: "/account/orders",
                label: "Đơn thuê xe",
                icon: "directions_car"
            },
            {
                section: "history",
                href: "/account/history",
                label: "Lịch sử chuyến đi",
                icon: "history"
            },
            {
                section: "owner",
                href: "/owner/dashboard",
                label: "Kênh chủ xe",
                icon: "garage_home"
            }
        ]
    }
];
function ProfileSidebar({ active, className = "" }) {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: `space-y-4 ${className}`,
        "data-purpose": "account-sidebar",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative overflow-hidden rounded-xl bg-surface-container-lowest p-4 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pointer-events-none absolute -top-4 -right-4 size-24 rounded-full bg-gradient-to-br from-primary-container/10 to-transparent blur-xl"
                    }, void 0, false, {
                        fileName: "[project]/src/components/profile-sidebar.jsx",
                        lineNumber: 23,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex size-14 shrink-0 items-center justify-center rounded-full bg-[#FFF2EB] text-lg font-bold text-[#FC6C26] ring-2 ring-primary-container/20",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initials"])(user?.fullName)
                            }, void 0, false, {
                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                lineNumber: 25,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "truncate text-sm font-semibold text-on-surface",
                                        children: user?.fullName ?? "Khách"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/profile-sidebar.jsx",
                                        lineNumber: 26,
                                        columnNumber: 41
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-0.5 text-xs text-on-surface-variant",
                                        children: user ? `Mã khách hàng #${user.id}` : "Chưa đăng nhập"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/profile-sidebar.jsx",
                                        lineNumber: 26,
                                        columnNumber: 136
                                    }, this),
                                    user?.role === "ADMIN" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "mt-1.5 inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-2 py-0.5 text-[10px] font-semibold text-on-secondary-fixed",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: "admin_panel_settings",
                                                className: "text-[12px]"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                                lineNumber: 26,
                                                columnNumber: 425
                                            }, this),
                                            "Quản trị viên"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/profile-sidebar.jsx",
                                        lineNumber: 26,
                                        columnNumber: 275
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                lineNumber: 26,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/profile-sidebar.jsx",
                        lineNumber: 24,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/profile-sidebar.jsx",
                lineNumber: 22,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                "aria-label": "Hồ sơ và tài khoản",
                className: "space-y-4 rounded-xl bg-surface-container-lowest p-2 shadow-sm",
                children: groups.map((group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant",
                                children: group.title
                            }, void 0, false, {
                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                lineNumber: 30,
                                columnNumber: 51
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: group.links.map((link)=>{
                                    const selected = link.section === active;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: link.href,
                                        "aria-current": selected ? "page" : undefined,
                                        className: `group flex items-center gap-2 rounded-lg px-4 py-2.5 transition-colors ${selected ? "bg-primary-fixed/50 font-semibold text-primary-container shadow-sm" : "text-on-surface hover:bg-surface-container-low"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: link.icon,
                                                className: `shrink-0 text-[20px] ${selected ? "text-primary-container" : "text-outline group-hover:text-primary-container"}`
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                                lineNumber: 32,
                                                columnNumber: 327
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "min-w-0 flex-1 whitespace-nowrap text-sm",
                                                children: link.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                                lineNumber: 32,
                                                columnNumber: 477
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: "chevron_right",
                                                className: "text-[16px] text-outline"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                                lineNumber: 32,
                                                columnNumber: 555
                                            }, this)
                                        ]
                                    }, link.href, true, {
                                        fileName: "[project]/src/components/profile-sidebar.jsx",
                                        lineNumber: 32,
                                        columnNumber: 24
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                lineNumber: 30,
                                columnNumber: 170
                            }, this)
                        ]
                    }, group.title, true, {
                        fileName: "[project]/src/components/profile-sidebar.jsx",
                        lineNumber: 30,
                        columnNumber: 28
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/profile-sidebar.jsx",
                lineNumber: 29,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3 rounded-xl bg-gradient-to-br from-surface-container-low to-surface-container p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex size-10 items-center justify-center rounded-lg bg-surface-container-lowest text-primary-container shadow-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                            name: "support_agent"
                        }, void 0, false, {
                            fileName: "[project]/src/components/profile-sidebar.jsx",
                            lineNumber: 36,
                            columnNumber: 138
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/profile-sidebar.jsx",
                        lineNumber: 36,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-semibold text-on-surface",
                                children: "Cần trợ giúp xác minh?"
                            }, void 0, false, {
                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                lineNumber: 37,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-xs leading-relaxed text-on-surface-variant",
                                children: "Đội ngũ chuyên viên CarDB sẵn sàng hỗ trợ qua kênh bảo mật ưu tiên."
                            }, void 0, false, {
                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                lineNumber: 37,
                                columnNumber: 93
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/profile-sidebar.jsx",
                        lineNumber: 37,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "tel:19008899",
                        className: "flex items-center justify-between rounded-lg bg-surface-container-lowest p-3 text-primary-container shadow-sm transition-colors hover:bg-surface-bright",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex flex-col gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-semibold uppercase text-on-surface-variant",
                                        children: "Tổng đài 24/7"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/profile-sidebar.jsx",
                                        lineNumber: 38,
                                        columnNumber: 232
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        className: "text-sm",
                                        children: "1900 8899"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/profile-sidebar.jsx",
                                        lineNumber: 38,
                                        columnNumber: 330
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                lineNumber: 38,
                                columnNumber: 194
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                                name: "call",
                                className: "text-[20px]"
                            }, void 0, false, {
                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                lineNumber: 38,
                                columnNumber: 383
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/profile-sidebar.jsx",
                        lineNumber: 38,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/profile-sidebar.jsx",
                lineNumber: 35,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/profile-sidebar.jsx",
        lineNumber: 21,
        columnNumber: 12
    }, this);
}
_s(ProfileSidebar, "9ep4vdl3mBfipxjmc+tQCDhw6Ik=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = ProfileSidebar;
var _c;
__turbopack_context__.k.register(_c, "ProfileSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/require-auth.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RequireAuth",
    ()=>RequireAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/auth-provider.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function RequireAuth({ children, admin = false, title = "Vui lòng đăng nhập" }) {
    _s();
    const { ready, loggedIn, isAdmin } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    if (!ready) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-[40vh] items-center justify-center text-sm text-[#666666]",
        children: "Đang kiểm tra phiên đăng nhập…"
    }, void 0, false, {
        fileName: "[project]/src/components/require-auth.jsx",
        lineNumber: 12,
        columnNumber: 16
    }, this);
    if (!loggedIn) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Gate, {
        icon: "lock",
        title: title,
        body: "Trang này lấy dữ liệu trực tiếp từ hệ thống CarDB nên cần đăng nhập tài khoản của bạn.",
        action: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: `/login?next=${encodeURIComponent(path)}`,
            className: "inline-flex items-center gap-2 rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e55915]",
            children: [
                "Đăng nhập",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                    name: "arrow_forward",
                    className: "text-[18px]"
                }, void 0, false, {
                    fileName: "[project]/src/components/require-auth.jsx",
                    lineNumber: 14,
                    columnNumber: 341
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/require-auth.jsx",
            lineNumber: 14,
            columnNumber: 150
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/require-auth.jsx",
        lineNumber: 14,
        columnNumber: 16
    }, this);
    if (admin && !isAdmin) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Gate, {
        icon: "admin_panel_settings",
        title: "Chỉ dành cho quản trị viên",
        body: "Tài khoản hiện tại không có quyền ADMIN. Đăng nhập bằng tài khoản quản trị để tiếp tục.",
        action: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/",
            className: "inline-flex items-center gap-2 rounded-xl border border-[#E9E9E7] bg-white px-5 py-2.5 text-sm font-bold text-[#292929]",
            children: "Về trang chủ"
        }, void 0, false, {
            fileName: "[project]/src/components/require-auth.jsx",
            lineNumber: 16,
            columnNumber: 188
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/require-auth.jsx",
        lineNumber: 16,
        columnNumber: 16
    }, this);
    return children;
}
_s(RequireAuth, "yUMqebJaNZJcxObJvd6L1FMzIak=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = RequireAuth;
function Gate({ icon, title, body, action }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto my-10 flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-8 text-center shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex size-12 items-center justify-center rounded-full bg-[#FFF2EB] text-[#FC6C26]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                    name: icon
                }, void 0, false, {
                    fileName: "[project]/src/components/require-auth.jsx",
                    lineNumber: 22,
                    columnNumber: 105
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/require-auth.jsx",
                lineNumber: 22,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-xl font-bold text-[#292929]",
                children: title
            }, void 0, false, {
                fileName: "[project]/src/components/require-auth.jsx",
                lineNumber: 23,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-[#666666]",
                children: body
            }, void 0, false, {
                fileName: "[project]/src/components/require-auth.jsx",
                lineNumber: 24,
                columnNumber: 5
            }, this),
            action
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/require-auth.jsx",
        lineNumber: 21,
        columnNumber: 12
    }, this);
}
_c1 = Gate;
var _c, _c1;
__turbopack_context__.k.register(_c, "RequireAuth");
__turbopack_context__.k.register(_c1, "Gate");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/pricing.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatPrice",
    ()=>formatPrice,
    "pricingSegments",
    ()=>pricingSegments,
    "rentalDiscount",
    ()=>rentalDiscount
]);
const pricingSegments = [
    {
        id: "sedan",
        name: "Sedan đô thị",
        models: "Hyundai Accent, Toyota Vios, Mazda 3, Kia K3",
        seats: "4–5 chỗ",
        daily: 750000,
        range: "700.000–900.000 đ",
        image: "pricing-sedan.webp",
        imageAlt: "Hyundai Accent trắng"
    },
    {
        id: "suv",
        name: "Crossover & SUV",
        models: "Mazda CX-5, Hyundai Creta, Toyota Corolla Cross",
        seats: "5 chỗ",
        daily: 1050000,
        range: "950.000–1.200.000 đ",
        image: "cardb-73b166040535beb8.webp",
        imageAlt: "Mazda CX-5"
    },
    {
        id: "mpv",
        name: "7 chỗ gia đình",
        models: "Kia Carnival, Hyundai Santa Fe, Toyota Fortuner",
        seats: "7 chỗ",
        daily: 1350000,
        range: "1.000.000–1.800.000 đ",
        image: "cardb-82e98b75b37c32c9.webp",
        imageAlt: "Kia Carnival"
    },
    {
        id: "electric",
        name: "Xe điện VinFast",
        models: "VF 5, VF 6, VF 8 Plus, VF 9",
        seats: "5–7 chỗ",
        daily: 1250000,
        range: "750.000–1.400.000 đ",
        image: "cardb-e5cfa07014e754d6.webp",
        imageAlt: "VinFast VF 8 Plus"
    },
    {
        id: "luxury",
        name: "Hạng sang",
        models: "Mercedes-Benz GLC, BMW 5-Series, Porsche Macan",
        seats: "4–5 chỗ",
        daily: 2400000,
        range: "Từ 2.200.000 đ",
        image: "cardb-1ec43e930558b9f7.webp",
        imageAlt: "Mercedes GLC 300"
    }
];
const priceFormatter = new Intl.NumberFormat("vi-VN");
const formatPrice = (amount)=>`${priceFormatter.format(amount || 0)} đ`;
const rentalDiscount = (days)=>days >= 30 ? .25 : days >= 7 ? .1 : 0;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=src_1rd1wucvlzm9g._.js.map