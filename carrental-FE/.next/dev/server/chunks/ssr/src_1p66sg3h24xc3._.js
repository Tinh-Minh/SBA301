(()=>{"use strict";module.exports = [
"[project]/src/components/live-ui.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LivePage",
    ()=>LivePage,
    "LiveState",
    ()=>LiveState,
    "Pill",
    ()=>Pill,
    "Primary",
    ()=>Primary,
    "fieldClass",
    ()=>fieldClass
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function LivePage({ children, width = "max-w-6xl" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        "data-native": true,
        className: "w-full bg-[#F7F7F5] pt-24 pb-16",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: `mx-auto w-full px-4 sm:px-6 ${width}`,
            children: children
        }, void 0, false, {
            fileName: "[project]/src/components/live-ui.jsx",
            lineNumber: 5,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/live-ui.jsx",
        lineNumber: 4,
        columnNumber: 12
    }, this);
}
const fieldClass = "w-full rounded-xl border border-[#E9E9E7] bg-white px-3 py-2 text-sm text-[#292929]";
function LiveState({ loading, error, empty, label = "dữ liệu", onRetry }) {
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "rounded-2xl border border-[#E9E9E7] bg-white p-5 text-sm text-[#666666]",
        children: [
            "Đang tải ",
            label,
            "…"
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/live-ui.jsx",
        lineNumber: 13,
        columnNumber: 16
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap items-center gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-5 text-sm text-[#B91C1C]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: error.message
            }, void 0, false, {
                fileName: "[project]/src/components/live-ui.jsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            onRetry ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onRetry,
                className: "font-bold underline",
                children: "Thử lại"
            }, void 0, false, {
                fileName: "[project]/src/components/live-ui.jsx",
                lineNumber: 17,
                columnNumber: 18
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/live-ui.jsx",
        lineNumber: 15,
        columnNumber: 16
    }, this);
    if (empty) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "rounded-2xl border border-[#E9E9E7] bg-white p-5 text-sm text-[#666666]",
        children: [
            "Chưa có ",
            label,
            "."
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/live-ui.jsx",
        lineNumber: 20,
        columnNumber: 16
    }, this);
    return null;
}
function Primary({ children, disabled, type = "button", onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: type,
        disabled: disabled,
        onClick: onClick,
        className: "inline-flex items-center justify-center rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e55915] disabled:opacity-60",
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/live-ui.jsx",
        lineNumber: 25,
        columnNumber: 12
    }, this);
}
function Pill({ children, className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/live-ui.jsx",
        lineNumber: 29,
        columnNumber: 12
    }, this);
}
}),
"[project]/src/components/require-auth.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RequireAuth",
    ()=>RequireAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/auth-provider.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
function RequireAuth({ children, admin = false, title = "Vui lòng đăng nhập" }) {
    const { ready, loggedIn, isAdmin } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    if (!ready) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex min-h-[40vh] items-center justify-center text-sm text-[#666666]",
        children: "Đang kiểm tra phiên đăng nhập…"
    }, void 0, false, {
        fileName: "[project]/src/components/require-auth.jsx",
        lineNumber: 12,
        columnNumber: 16
    }, this);
    if (!loggedIn) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Gate, {
        icon: "lock",
        title: title,
        body: "Trang này lấy dữ liệu trực tiếp từ hệ thống CarDB nên cần đăng nhập tài khoản của bạn.",
        action: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
            href: `/login?next=${encodeURIComponent(path)}`,
            className: "inline-flex items-center gap-2 rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e55915]",
            children: [
                "Đăng nhập",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
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
    if (admin && !isAdmin) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Gate, {
        icon: "admin_panel_settings",
        title: "Chỉ dành cho quản trị viên",
        body: "Tài khoản hiện tại không có quyền ADMIN. Đăng nhập bằng tài khoản quản trị để tiếp tục.",
        action: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
function Gate({ icon, title, body, action }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mx-auto my-10 flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-8 text-center shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex size-12 items-center justify-center rounded-full bg-[#FFF2EB] text-[#FC6C26]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-xl font-bold text-[#292929]",
                children: title
            }, void 0, false, {
                fileName: "[project]/src/components/require-auth.jsx",
                lineNumber: 23,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
}),
"[project]/src/hooks/use-async-resource.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAsyncAction",
    ()=>useAsyncAction,
    "useAsyncResource",
    ()=>useAsyncResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function useAsyncResource(load, key = "") {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        loading: true
    });
    const [version, setVersion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        setState((current)=>({
                ...current,
                loading: true,
                error: undefined
            }));
        load().then((data)=>{
            if (!cancelled) setState({
                data,
                loading: false
            });
        }, (error)=>{
            if (!cancelled) setState((current)=>({
                    ...current,
                    loading: false,
                    error: error instanceof Error ? error : new Error(String(error))
                }));
        });
        return ()=>{
            cancelled = true;
        };
    }, [
        key,
        version
    ]);
    const reload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>setVersion((value)=>value + 1), []);
    return {
        ...state,
        reload
    };
}
function useAsyncAction(action, onSuccess) {
    const [running, setRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])();
    const run = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (...args)=>{
        setRunning(true);
        setError(undefined);
        try {
            const result = await action(...args);
            onSuccess?.(result);
            return result;
        } catch (caught) {
            setError(caught instanceof Error ? caught : new Error(String(caught)));
            return undefined;
        } finally{
            setRunning(false);
        }
    }, [
        action,
        onSuccess
    ]);
    return {
        run,
        running,
        error
    };
}
}),
"[project]/src/lib/datetime.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addHours",
    ()=>addHours,
    "formatDate",
    ()=>formatDate,
    "formatDateTime",
    ()=>formatDateTime,
    "formatInputDate",
    ()=>formatInputDate,
    "formatInputDateTime",
    ()=>formatInputDateTime,
    "hoursBetween",
    ()=>hoursBetween,
    "parseDate",
    ()=>parseDate,
    "parseInputDate",
    ()=>parseInputDate,
    "parseInputDateTime",
    ()=>parseInputDateTime,
    "parseQueryDateTime",
    ()=>parseQueryDateTime,
    "toInputDateTime",
    ()=>toInputDateTime,
    "toLocalDate",
    ()=>toLocalDate,
    "toLocalIso",
    ()=>toLocalIso
]);
const pad = (value)=>String(value).padStart(2, "0");
function parseDate(value) {
    if (value === null || value === undefined || value === "") return null;
    if (value instanceof Date) return value;
    if (Array.isArray(value)) {
        const [y, m = 1, d = 1, h = 0, mi = 0, s = 0] = value;
        return new Date(y, m - 1, d, h, mi, s);
    }
    const text = String(value).trim();
    const local = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (local) {
        const date = new Date(Number(local[1]), Number(local[2]) - 1, Number(local[3]), Number(local[4] ?? 0), Number(local[5] ?? 0), Number(local[6] ?? 0));
        return Number.isNaN(date.getTime()) ? null : date;
    }
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
}
function toLocalIso(value) {
    const date = parseDate(value);
    if (!date) return null;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function toLocalDate(value) {
    const date = parseDate(value);
    if (!date) return null;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function parseQueryDateTime(value) {
    if (!value) return "";
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value)) return value.slice(0, 16);
    const match = String(value).match(/(\d{1,2}):(\d{2}).*?(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!match) return "";
    return `${match[5]}-${pad(match[4])}-${pad(match[3])}T${pad(match[1])}:${match[2]}`;
}
function toInputDateTime(value) {
    const date = parseDate(value);
    if (!date) return "";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function formatDateTime(value, fallback = "—") {
    const date = parseDate(value);
    if (!date) return fallback;
    return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
function formatDate(value, fallback = "—") {
    const date = parseDate(value);
    if (!date) return fallback;
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
function formatInputDate(value) {
    const date = parseDate(value);
    if (!date) return "";
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
function formatInputDateTime(value) {
    const date = parseDate(value);
    if (!date) return "";
    return `${formatInputDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function calendarDate(day, month, year) {
    if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1) return null;
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
    return date;
}
function parseInputDate(value) {
    const match = String(value).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return "";
    const date = calendarDate(Number(match[1]), Number(match[2]), Number(match[3]));
    if (!date) return "";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function parseInputDateTime(value) {
    const match = String(value).trim().match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/);
    if (!match) return "";
    const date = calendarDate(Number(match[1]), Number(match[2]), Number(match[3]));
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    if (!date || hour > 23 || minute > 59) return "";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour)}:${pad(minute)}`;
}
function hoursBetween(start, end) {
    const a = parseDate(start);
    const b = parseDate(end);
    if (!a || !b) return 0;
    return Math.max(0, (b.getTime() - a.getTime()) / 3_600_000);
}
function addHours(value, hours) {
    const date = parseDate(value) ?? new Date();
    return new Date(date.getTime() + hours * 3_600_000);
}
}),
"[project]/src/lib/owner/finance.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_COMMISSION_RATE",
    ()=>DEFAULT_COMMISSION_RATE,
    "calculatePayout",
    ()=>calculatePayout,
    "calculatePlatformFee",
    ()=>calculatePlatformFee,
    "calculateRentalAmount",
    ()=>calculateRentalAmount,
    "calculateTotalAmount",
    ()=>calculateTotalAmount,
    "formatPercent",
    ()=>formatPercent,
    "formatTrVnd",
    ()=>formatTrVnd,
    "formatVnd",
    ()=>formatVnd,
    "sumAmounts",
    ()=>sumAmounts
]);
const DEFAULT_COMMISSION_RATE = 10;
function assertVnd(amount, field) {
    if (!Number.isSafeInteger(amount) || amount < 0) throw new RangeError(`${field} phải là số VND nguyên không âm, nhận ${amount}`);
}
/** Tỷ lệ phần trăm NUMERIC(5,2) đổi sang basis point nguyên để tránh sai số dấu phẩy động. */ function toBasisPoints(commissionRate) {
    const basisPoints = Math.round(commissionRate * 100);
    if (basisPoints < 0 || basisPoints > 10000) throw new RangeError(`commissionRate phải nằm trong 0–100, nhận ${commissionRate}`);
    return basisPoints;
}
function calculateRentalAmount(unitPrice, quantity) {
    assertVnd(unitPrice, "unitPrice");
    if (!Number.isInteger(quantity) || quantity <= 0) throw new RangeError(`quantity phải là số nguyên dương, nhận ${quantity}`);
    const rentalAmount = unitPrice * quantity;
    assertVnd(rentalAmount, "rentalAmount");
    return rentalAmount;
}
function calculateTotalAmount(rentalAmount, discountAmount) {
    assertVnd(rentalAmount, "rentalAmount");
    assertVnd(discountAmount, "discountAmount");
    return Math.max(0, rentalAmount - discountAmount);
}
function calculatePlatformFee(grossAmount, commissionRate = DEFAULT_COMMISSION_RATE) {
    assertVnd(grossAmount, "grossAmount");
    const product = grossAmount * toBasisPoints(commissionRate);
    assertVnd(product, "grossAmount * commissionRate");
    return Math.round(product / 10000);
}
function calculatePayout(order) {
    const grossAmount = order.rentalAmount;
    const platformFee = calculatePlatformFee(grossAmount, order.commissionRate);
    return {
        grossAmount,
        platformFee,
        netAmount: grossAmount - platformFee
    };
}
function sumAmounts(rows, pick) {
    return rows.reduce((total, row)=>total + pick(row), 0);
}
const vndFormatter = new Intl.NumberFormat("vi-VN");
const formatVnd = (amount)=>`${vndFormatter.format(amount)} đ`;
function formatTrVnd(amount) {
    const abs = Math.abs(Math.trunc(amount));
    const thousandths = Math.round(abs / 1000);
    const whole = Math.floor(thousandths / 1000);
    const fraction = String(thousandths % 1000).padStart(3, "0").replace(/0+$/, "");
    const body = fraction ? `${vndFormatter.format(whole)},${fraction}` : vndFormatter.format(whole);
    return `${amount < 0 ? "-" : ""}${body} Tr VND`;
}
const formatPercent = (rate)=>`${new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 2
    }).format(rate)}%`;
}),
"[project]/src/lib/owner/rules.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OWNER_RESPONSE_WINDOW_MS",
    ()=>OWNER_RESPONSE_WINDOW_MS,
    "canRespondToOrder",
    ()=>canRespondToOrder,
    "findHandover",
    ()=>findHandover,
    "isHandoverConfirmed",
    ()=>isHandoverConfirmed,
    "isOrderExpired",
    ()=>isOrderExpired,
    "isPayoutReleasable",
    ()=>isPayoutReleasable,
    "nextHandoverType",
    ()=>nextHandoverType
]);
const OWNER_RESPONSE_WINDOW_MS = 2 * 60 * 60 * 1000;
function isOrderExpired(order, now = Date.now()) {
    return order.status === "PENDING" && !!order.expiresAt && Date.parse(order.expiresAt) <= now;
}
function canRespondToOrder(order, now = Date.now()) {
    return order.status === "PENDING" && !isOrderExpired(order, now);
}
function isHandoverConfirmed(handover) {
    return !!handover?.ownerConfirmedAt && !!handover.renterConfirmedAt;
}
function findHandover(handovers, type) {
    return handovers.find((handover)=>handover.handoverType === type);
}
function nextHandoverType(handovers) {
    const pickup = findHandover(handovers, "PICKUP");
    if (!isHandoverConfirmed(pickup)) return "PICKUP";
    return isHandoverConfirmed(findHandover(handovers, "RETURN")) ? null : "RETURN";
}
function isPayoutReleasable(handovers) {
    return isHandoverConfirmed(findHandover(handovers, "RETURN"));
}
}),
"[project]/src/services/adapters.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "carFromOrder",
    ()=>carFromOrder,
    "normalizeBankAccount",
    ()=>normalizeBankAccount,
    "normalizeCar",
    ()=>normalizeCar,
    "normalizeHandover",
    ()=>normalizeHandover,
    "normalizeOrder",
    ()=>normalizeOrder,
    "normalizePayout",
    ()=>normalizePayout,
    "normalizeSlot",
    ()=>normalizeSlot,
    "renterFromOrder",
    ()=>renterFromOrder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/datetime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/labels.js [app-ssr] (ecmascript)");
;
;
const isoOrNull = (value)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseDate"])(value)?.toISOString() ?? null;
const money = (value)=>Math.round((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toNumber"])(value));
function normalizeCar(car) {
    if (!car) return car;
    const images = Array.isArray(car.images) ? car.images.slice().sort((a, b)=>(a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : [];
    const primary = images.find((image)=>image.isPrimary) ?? images[0];
    return {
        ...car,
        images,
        documents: Array.isArray(car.documents) ? car.documents : [],
        primaryImageUrl: car.primaryImageUrl ?? primary?.imageUrl ?? null,
        pricePerHour: money(car.pricePerHour),
        pricePerDay: money(car.pricePerDay),
        depositAmount: money(car.depositAmount),
        extraKmFee: money(car.extraKmFee),
        kmLimitPerDay: car.kmLimitPerDay ?? null
    };
}
function normalizeOrder(order) {
    if (!order) return order;
    return {
        ...order,
        startTime: isoOrNull(order.startTime),
        endTime: isoOrNull(order.endTime),
        actualStartTime: isoOrNull(order.actualStartTime),
        actualEndTime: isoOrNull(order.actualEndTime),
        expiresAt: isoOrNull(order.expiresAt),
        confirmedAt: isoOrNull(order.confirmedAt),
        cancelledAt: isoOrNull(order.cancelledAt),
        createdAt: isoOrNull(order.createdAt),
        updatedAt: isoOrNull(order.updatedAt),
        unitPrice: money(order.unitPrice),
        quantity: Math.max(1, Math.round((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toNumber"])(order.quantity))),
        rentalAmount: money(order.rentalAmount),
        discountAmount: money(order.discountAmount),
        totalAmount: money(order.totalAmount),
        depositAmount: money(order.depositAmount),
        commissionRate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toNumber"])(order.commissionRate ?? 10)
    };
}
function normalizeHandover(handover) {
    if (!handover) return handover;
    return {
        ...handover,
        handedAt: isoOrNull(handover.handedAt),
        renterConfirmedAt: isoOrNull(handover.renterConfirmedAt),
        ownerConfirmedAt: isoOrNull(handover.ownerConfirmedAt),
        createdAt: isoOrNull(handover.createdAt),
        odometerKm: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toNumber"])(handover.odometerKm),
        fuelPercent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toNumber"])(handover.fuelPercent),
        images: Array.isArray(handover.images) ? handover.images : []
    };
}
function normalizeSlot(slot) {
    if (!slot) return slot;
    return {
        ...slot,
        id: slot.id ?? slot.slotId,
        startTime: isoOrNull(slot.startTime ?? slot.slotStartTime),
        endTime: isoOrNull(slot.endTime ?? slot.slotEndTime),
        pricePerHour: money(slot.pricePerHour),
        pricePerDay: money(slot.pricePerDay)
    };
}
function normalizePayout(payout) {
    if (!payout) return payout;
    return {
        ...payout,
        grossAmount: money(payout.grossAmount),
        platformFee: money(payout.platformFee),
        netAmount: money(payout.netAmount),
        paidAt: isoOrNull(payout.paidAt),
        createdAt: isoOrNull(payout.createdAt)
    };
}
function normalizeBankAccount(account) {
    if (!account) return account;
    return {
        ...account,
        accountNumber: account.accountNumberMasked ?? account.accountNumber ?? ""
    };
}
function renterFromOrder(order) {
    return {
        id: order.customerId,
        fullName: order.customerName || `Khách #${order.customerId}`,
        phone: "Liên hệ qua CarDB",
        kycStatus: "UNKNOWN"
    };
}
function carFromOrder(order) {
    const [brand, ...rest] = String(order.carName || "Xe").split(" ");
    return normalizeCar({
        id: order.carId,
        brand,
        model: rest.join(" "),
        licensePlate: order.licensePlate,
        status: "ACTIVE",
        pickupAddress: "",
        seats: 0
    });
}
}),
"[project]/src/services/customer-extra.service.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "driverService",
    ()=>driverService,
    "reviewService",
    ()=>reviewService,
    "transactionService",
    ()=>transactionService,
    "userDocumentService",
    ()=>userDocumentService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/datetime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/http.js [app-ssr] (ecmascript)");
;
;
;
const transactionService = {
    /** POST /api/transactions/payment — trả về giao dịch PENDING kèm `paymentUrl` VNPay sandbox. */ createPayment: ({ orderId, amount, method = "VNPAY" })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/transactions/payment", {
            method: "POST",
            json: {
                orderId: Number(orderId),
                amount: amount ?? null,
                method
            }
        }),
    /** POST /api/transactions/deposit */ createDeposit: ({ orderId, amount, method = "VNPAY" })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/transactions/deposit", {
            method: "POST",
            json: {
                orderId: Number(orderId),
                amount: amount ?? null,
                method
            }
        }),
    /** POST /api/transactions/{id}/simulate-gateway — giả lập cổng thanh toán (môi trường thử nghiệm). */ simulate: (id, success = true)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/transactions/${id}/simulate-gateway`, {
            method: "POST",
            json: {
                simulateSuccess: success,
                providerRef: `SIM-${Date.now()}`
            }
        }),
    /** GET /api/transactions/{id}/vnpay-url */ vnpayUrl: (id, bankCode)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/transactions/${id}/vnpay-url`, {
            query: {
                bankCode
            }
        }).then((data)=>data?.paymentUrl),
    /** GET /api/transactions/vnpay-return?format=json&vnp_... — xác thực chữ ký VNPay trả về. */ vnpayReturn: (params)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/transactions/vnpay-return", {
            query: {
                ...params,
                format: "json"
            }
        }),
    listByOrder: async (orderId)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toPage"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/transactions", {
            query: {
                orderId,
                size: 50,
                sort: "id,desc"
            }
        })).content
};
const reviewService = {
    create: ({ orderId, revieweeId, rating, comment })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/reviews", {
            method: "POST",
            json: {
                orderId: Number(orderId),
                reviewerId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["currentUserId"])(),
                revieweeId: Number(revieweeId),
                rating: Number(rating),
                comment: comment?.trim() || null
            }
        }),
    listByOrder: async (orderId)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toPage"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/reviews", {
            query: {
                orderId,
                size: 20
            }
        })).content,
    listForUser: async (revieweeId, size = 10)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toPage"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/reviews", {
            query: {
                revieweeId,
                size
            }
        }))
};
const driverService = {
    /** GET /api/drivers/me — 404 nếu chưa đăng ký. */ async me () {
        try {
            return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/drivers/me");
        } catch (error) {
            if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"] && error.status === 404) return null;
            throw error;
        }
    },
    eligibility: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/drivers/me/eligibility"),
    register: ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/drivers", {
            method: "POST"
        })
};
const userDocumentService = {
    listMine: async ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toPage"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/user-documents", {
            query: {
                scope: "mine",
                size: 50
            }
        })).content,
    get: (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/user-documents/${id}`),
    submit ({ docType, docNumber, fullNameOnDoc, dateOfBirthOnDoc, issuePlace, issueDate, expiresAt, licenseClass, frontImage, backImage }) {
        const form = new FormData();
        form.append("docType", docType);
        form.append("docNumber", docNumber.trim());
        const optional = {
            fullNameOnDoc,
            issuePlace,
            licenseClass: docType === "DRIVER_LICENSE" ? licenseClass : undefined
        };
        for (const [key, value] of Object.entries(optional))if (value?.trim?.()) form.append(key, value.trim());
        for (const [key, value] of Object.entries({
            dateOfBirthOnDoc,
            issueDate,
            expiresAt
        }))if (value) form.append(key, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toLocalDate"])(value));
        if (frontImage) form.append("frontImage", frontImage);
        if (backImage) form.append("backImage", backImage);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/user-documents", {
            method: "POST",
            body: form
        });
    },
    async image (id, side) {
        const session = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readSession"])();
        const response = await fetch(`/api/user-documents/${id}/files/${side}`, {
            headers: session ? {
                Authorization: `Bearer ${session.accessToken}`,
                "X-User-Id": String(session.account.id)
            } : {}
        });
        if (!response.ok) throw new Error("Không tải được ảnh giấy tờ.");
        return URL.createObjectURL(await response.blob());
    }
};
}),
"[project]/src/services/mock/owner-db.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "findOrFail",
    ()=>findOrFail,
    "nextMockId",
    ()=>nextMockId,
    "ownerDb",
    ()=>ownerDb,
    "toOrderView",
    ()=>toOrderView,
    "toPayoutView",
    ()=>toPayoutView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$owner$2f$finance$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/owner/finance.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/http.js [app-ssr] (ecmascript)");
;
;
const minutesFromNow = (minutes)=>new Date(Date.now() + minutes * 60_000).toISOString();
const owner = {
    id: 1,
    fullName: "Trần Đức Nam",
    email: "nam.tran@cardb.vn",
    phone: "0903 889 921",
    avatarUrl: "/images/cardb-5e45d798899a87c8.webp",
    kycStatus: "VERIFIED",
    role: "CUSTOMER",
    status: "ACTIVE"
};
const renters = [
    {
        id: 2,
        fullName: "Nguyễn Hoàng Minh",
        email: "minh.nguyen@gmail.com",
        phone: "0912 448 920",
        kycStatus: "VERIFIED",
        role: "CUSTOMER",
        status: "ACTIVE"
    },
    {
        id: 3,
        fullName: "Lê Thu Hà",
        email: "thuha.le@gmail.com",
        phone: "0987 120 334",
        kycStatus: "VERIFIED",
        role: "CUSTOMER",
        status: "ACTIVE"
    },
    {
        id: 4,
        fullName: "Phạm Quốc Bảo",
        email: "bao.pham@outlook.com",
        phone: "0938 765 002",
        kycStatus: "VERIFIED",
        role: "CUSTOMER",
        status: "ACTIVE"
    }
];
const bankAccounts = [
    {
        id: 1,
        customerId: 1,
        bankName: "Vietcombank",
        accountNumber: "007100****982",
        accountHolder: "TRẦN ĐỨC NAM",
        isDefault: true
    },
    {
        id: 2,
        customerId: 1,
        bankName: "Techcombank",
        accountNumber: "1903****5521",
        accountHolder: "TRẦN ĐỨC NAM",
        isDefault: false
    }
];
const cars = [
    {
        id: 1,
        ownerId: 1,
        licensePlate: "51K-889.92",
        brand: "VinFast",
        model: "VF 9 Plus AWD",
        manufactureYear: 2025,
        carType: "SUV",
        seats: 7,
        transmission: "AUTOMATIC",
        fuelType: "ELECTRIC",
        pickupAddress: "208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM",
        pricePerHour: 180000,
        pricePerDay: 1950000,
        depositAmount: 15000000,
        kmLimitPerDay: 350,
        extraKmFee: 5000,
        status: "ACTIVE",
        primaryImageUrl: "/images/cardb-e5cfa07014e754d6.webp"
    },
    {
        id: 2,
        ownerId: 1,
        licensePlate: "51H-246.18",
        brand: "Mercedes-Benz",
        model: "GLC 300 4MATIC",
        manufactureYear: 2024,
        carType: "LUXURY",
        seats: 5,
        transmission: "AUTOMATIC",
        fuelType: "GASOLINE",
        pickupAddress: "208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM",
        pricePerHour: 250000,
        pricePerDay: 2800000,
        depositAmount: 20000000,
        kmLimitPerDay: 350,
        extraKmFee: 5000,
        status: "ACTIVE",
        primaryImageUrl: "/images/cardb-1ec43e930558b9f7.webp"
    },
    {
        id: 3,
        ownerId: 1,
        licensePlate: "30K-512.67",
        brand: "Kia",
        model: "Carnival Signature",
        manufactureYear: 2024,
        carType: "MPV",
        seats: 7,
        transmission: "AUTOMATIC",
        fuelType: "DIESEL",
        pickupAddress: "12 Thảo Điền, TP. Thủ Đức, TP.HCM",
        pricePerHour: 150000,
        pricePerDay: 1600000,
        depositAmount: 10000000,
        kmLimitPerDay: 350,
        extraKmFee: 5000,
        status: "INACTIVE",
        primaryImageUrl: "/images/cardb-82e98b75b37c32c9.webp"
    },
    {
        id: 4,
        ownerId: 1,
        licensePlate: "51G-778.30",
        brand: "Mazda",
        model: "CX-5 Premium",
        manufactureYear: 2023,
        carType: "SUV",
        seats: 5,
        transmission: "AUTOMATIC",
        fuelType: "GASOLINE",
        pickupAddress: "12 Thảo Điền, TP. Thủ Đức, TP.HCM",
        pricePerHour: 110000,
        pricePerDay: 1100000,
        depositAmount: 8000000,
        kmLimitPerDay: 350,
        extraKmFee: 5000,
        status: "PENDING_APPROVAL",
        primaryImageUrl: "/images/cardb-73b166040535beb8.webp"
    }
];
const slots = [
    {
        id: 1,
        carId: 1,
        startTime: "2026-10-01T00:00:00+07:00",
        endTime: "2026-10-31T23:59:59+07:00",
        pricePerHour: 180000,
        pricePerDay: 1950000,
        rentalOption: "BOTH",
        status: "OPEN"
    },
    {
        id: 2,
        carId: 2,
        startTime: "2026-10-01T00:00:00+07:00",
        endTime: "2026-10-31T23:59:59+07:00",
        pricePerHour: 250000,
        pricePerDay: 2800000,
        rentalOption: "DAILY",
        status: "OPEN"
    },
    {
        id: 3,
        carId: 3,
        startTime: "2026-10-01T00:00:00+07:00",
        endTime: "2026-10-15T23:59:59+07:00",
        pricePerHour: 150000,
        pricePerDay: 1600000,
        rentalOption: "DAILY",
        status: "CLOSED"
    },
    {
        id: 4,
        carId: 1,
        startTime: "2026-11-01T00:00:00+07:00",
        endTime: "2026-11-30T23:59:59+07:00",
        pricePerHour: 180000,
        pricePerDay: 1950000,
        rentalOption: "BOTH",
        status: "OPEN"
    }
];
function order(input) {
    const rentalAmount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$owner$2f$finance$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateRentalAmount"])(input.unitPrice, input.quantity);
    return {
        ...input,
        rentalAmount,
        totalAmount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$owner$2f$finance$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculateTotalAmount"])(rentalAmount, input.discountAmount),
        commissionRate: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$owner$2f$finance$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DEFAULT_COMMISSION_RATE"]
    };
}
const orders = [
    order({
        id: 904,
        orderCode: "CDB-ORD-20261026-904",
        customerId: 2,
        carId: 1,
        carSlotId: 1,
        rentalType: "DAILY",
        startTime: "2026-10-26T09:00:00+07:00",
        endTime: "2026-10-28T09:00:00+07:00",
        unitPrice: 1950000,
        quantity: 2,
        discountAmount: 200000,
        depositAmount: 15000000,
        status: "CONFIRMED",
        paymentStatus: "PAID"
    }),
    order({
        id: 911,
        orderCode: "CDB-ORD-20261020-911",
        customerId: 3,
        carId: 2,
        carSlotId: 2,
        rentalType: "DAILY",
        startTime: "2026-10-20T08:00:00+07:00",
        endTime: "2026-10-23T08:00:00+07:00",
        unitPrice: 2800000,
        quantity: 3,
        discountAmount: 0,
        depositAmount: 20000000,
        status: "PENDING",
        paymentStatus: "UNPAID",
        expiresAt: minutesFromNow(95)
    }),
    order({
        id: 912,
        orderCode: "CDB-ORD-20261019-912",
        customerId: 4,
        carId: 1,
        carSlotId: 1,
        rentalType: "HOURLY",
        startTime: "2026-10-19T08:00:00+07:00",
        endTime: "2026-10-19T14:00:00+07:00",
        unitPrice: 180000,
        quantity: 6,
        discountAmount: 100000,
        depositAmount: 15000000,
        status: "PENDING",
        paymentStatus: "UNPAID",
        expiresAt: minutesFromNow(25)
    }),
    order({
        id: 887,
        orderCode: "CDB-ORD-20261016-887",
        customerId: 4,
        carId: 2,
        carSlotId: 2,
        rentalType: "DAILY",
        startTime: "2026-10-16T08:00:00+07:00",
        endTime: "2026-10-18T08:00:00+07:00",
        actualStartTime: "2026-10-16T08:12:00+07:00",
        unitPrice: 2800000,
        quantity: 2,
        discountAmount: 0,
        depositAmount: 20000000,
        status: "ONGOING",
        paymentStatus: "PAID"
    }),
    order({
        id: 861,
        orderCode: "CDB-ORD-20261010-861",
        customerId: 3,
        carId: 1,
        carSlotId: 1,
        rentalType: "DAILY",
        startTime: "2026-10-10T09:00:00+07:00",
        endTime: "2026-10-13T09:00:00+07:00",
        actualStartTime: "2026-10-10T09:05:00+07:00",
        actualEndTime: "2026-10-13T08:40:00+07:00",
        unitPrice: 1950000,
        quantity: 3,
        discountAmount: 300000,
        depositAmount: 15000000,
        status: "COMPLETED",
        paymentStatus: "PAID"
    }),
    order({
        id: 842,
        orderCode: "CDB-ORD-20261003-842",
        customerId: 2,
        carId: 3,
        carSlotId: 3,
        rentalType: "DAILY",
        startTime: "2026-10-03T07:00:00+07:00",
        endTime: "2026-10-04T07:00:00+07:00",
        actualStartTime: "2026-10-03T07:10:00+07:00",
        actualEndTime: "2026-10-04T06:55:00+07:00",
        unitPrice: 1600000,
        quantity: 1,
        discountAmount: 0,
        depositAmount: 10000000,
        status: "COMPLETED",
        paymentStatus: "PAID"
    })
];
const handovers = [
    {
        id: 1,
        orderId: 887,
        handoverType: "PICKUP",
        odometerKm: 18420,
        fuelPercent: 82,
        conditionNote: "Xe sạch, không trầy xước mới.",
        handedAt: "2026-10-16T08:12:00+07:00",
        ownerConfirmedAt: "2026-10-16T08:14:00+07:00",
        renterConfirmedAt: "2026-10-16T08:15:00+07:00"
    },
    {
        id: 2,
        orderId: 861,
        handoverType: "PICKUP",
        odometerKm: 6120,
        fuelPercent: 95,
        handedAt: "2026-10-10T09:05:00+07:00",
        ownerConfirmedAt: "2026-10-10T09:06:00+07:00",
        renterConfirmedAt: "2026-10-10T09:07:00+07:00"
    },
    {
        id: 3,
        orderId: 861,
        handoverType: "RETURN",
        odometerKm: 6984,
        fuelPercent: 41,
        conditionNote: "Đúng hạn mức km, pin còn 41%.",
        handedAt: "2026-10-13T08:40:00+07:00",
        ownerConfirmedAt: "2026-10-13T08:45:00+07:00",
        renterConfirmedAt: "2026-10-13T08:46:00+07:00"
    },
    {
        id: 4,
        orderId: 842,
        handoverType: "PICKUP",
        odometerKm: 32540,
        fuelPercent: 100,
        handedAt: "2026-10-03T07:10:00+07:00",
        ownerConfirmedAt: "2026-10-03T07:11:00+07:00",
        renterConfirmedAt: "2026-10-03T07:12:00+07:00"
    },
    {
        id: 5,
        orderId: 842,
        handoverType: "RETURN",
        odometerKm: 32811,
        fuelPercent: 76,
        handedAt: "2026-10-04T06:55:00+07:00",
        ownerConfirmedAt: "2026-10-04T07:00:00+07:00",
        renterConfirmedAt: "2026-10-04T07:01:00+07:00"
    }
];
function payout(id, orderId, status, paidAt) {
    const source = orders.find((item)=>item.id === orderId);
    return {
        id,
        orderId,
        recipientId: owner.id,
        bankAccountId: 1,
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$owner$2f$finance$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["calculatePayout"])(source),
        status,
        paidAt
    };
}
const payouts = [
    payout(1, 904, "PENDING"),
    payout(2, 887, "PENDING"),
    payout(3, 861, "PAID", "2026-10-14T10:00:00+07:00"),
    payout(4, 842, "PAID", "2026-10-05T10:00:00+07:00")
];
const ownerDb = {
    owner,
    renters,
    bankAccounts,
    cars,
    slots,
    orders,
    handovers,
    payouts
};
let nextId = 1000;
const nextMockId = ()=>nextId++;
function findOrFail(rows, id, entity) {
    const row = rows.find((item)=>item.id === id);
    if (!row) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"](404, `Không tìm thấy ${entity} #${id}`);
    return row;
}
function toOrderView(rentalOrder) {
    return {
        order: rentalOrder,
        car: findOrFail(cars, rentalOrder.carId, "xe"),
        renter: findOrFail(renters, rentalOrder.customerId, "khách thuê"),
        handovers: handovers.filter((item)=>item.orderId === rentalOrder.id)
    };
}
function toPayoutView(item) {
    const rentalOrder = findOrFail(orders, item.orderId, "đơn thuê");
    return {
        payout: item,
        order: rentalOrder,
        car: findOrFail(cars, rentalOrder.carId, "xe")
    };
}
}),
"[project]/src/services/order.service.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "adminOrderService",
    ()=>adminOrderService,
    "loadCarsById",
    ()=>loadCarsById,
    "loadHandovers",
    ()=>loadHandovers,
    "orderService",
    ()=>orderService,
    "rentalService",
    ()=>rentalService,
    "toOwnerViews",
    ()=>toOwnerViews
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$owner$2f$rules$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/owner/rules.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/datetime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/http.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/adapters.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$mock$2f$owner$2d$db$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/mock/owner-db.js [app-ssr] (ecmascript)");
;
;
;
;
;
function expireStaleMockOrders() {
    for (const order of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$mock$2f$owner$2d$db$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDb"].orders)if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$owner$2f$rules$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isOrderExpired"])(order)) order.status = "EXPIRED";
}
function respond(id, status) {
    expireStaleMockOrders();
    const order = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$mock$2f$owner$2d$db$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findOrFail"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$mock$2f$owner$2d$db$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDb"].orders, id, "đơn thuê");
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$owner$2f$rules$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["canRespondToOrder"])(order)) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ApiError"](409, `Đơn ${order.orderCode} không còn chờ phản hồi`);
    order.status = status;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockResponse"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$mock$2f$owner$2d$db$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toOrderView"])(order));
}
const reasonBody = (reason)=>reason ? {
        reason
    } : {};
async function loadCarsById(carIds) {
    const unique = [
        ...new Set(carIds.filter(Boolean))
    ];
    const entries = await Promise.all(unique.map(async (id)=>{
        try {
            return [
                id,
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeCar"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/cars/${id}`))
            ];
        } catch  {
            return [
                id,
                null
            ];
        }
    }));
    return new Map(entries);
}
async function loadHandovers(orderId) {
    const list = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/orders/${orderId}/handovers`);
    return (Array.isArray(list) ? list : []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeHandover"]);
}
async function toOwnerViews(orders, { withHandovers = false } = {}) {
    const normalized = orders.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeOrder"]);
    const cars = await loadCarsById(normalized.map((order)=>order.carId));
    const needsHandover = new Set([
        "CONFIRMED",
        "ONGOING",
        "COMPLETED"
    ]);
    return Promise.all(normalized.map(async (order)=>({
            order,
            car: cars.get(order.carId) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["carFromOrder"])(order),
            renter: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["renterFromOrder"])(order),
            handovers: withHandovers && needsHandover.has(order.status) ? await loadHandovers(order.id).catch(()=>[]) : []
        })));
}
const orderService = {
    /** Chủ xe: GET /api/orders/my-cars */ async listMine (status) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USE_MOCK_API"]) {
            expireStaleMockOrders();
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockResponse"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$mock$2f$owner$2d$db$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDb"].orders.filter((order)=>!status || order.status === status).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$mock$2f$owner$2d$db$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toOrderView"]));
        }
        const orders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchAllPages"])("/api/orders/my-cars", {
            status,
            sortBy: "createdAt",
            direction: "desc"
        });
        return toOwnerViews(orders, {
            withHandovers: status !== "PENDING"
        });
    },
    async getById (id) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USE_MOCK_API"]) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mockResponse"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$mock$2f$owner$2d$db$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toOrderView"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$mock$2f$owner$2d$db$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findOrFail"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$mock$2f$owner$2d$db$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ownerDb"].orders, id, "đơn thuê")));
        const [view] = await toOwnerViews([
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/orders/${id}`)
        ], {
            withHandovers: true
        });
        return view;
    },
    /** PUT /api/orders/{id}/confirm */ async approve (id) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USE_MOCK_API"]) return respond(id, "CONFIRMED");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeOrder"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/orders/${id}/confirm`, {
            method: "PUT",
            json: {}
        }));
    },
    /** PUT /api/orders/{id}/reject { reason } */ async reject (id, reason) {
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["USE_MOCK_API"]) return respond(id, "REJECTED");
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeOrder"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/orders/${id}/reject`, {
            method: "PUT",
            json: reasonBody(reason)
        }));
    }
};
const rentalService = {
    /** POST /api/orders/quote */ quote: ({ carSlotId, rentalType, startTime, endTime, voucherCode })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/orders/quote", {
            method: "POST",
            json: {
                carSlotId: Number(carSlotId),
                rentalType,
                startTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toLocalIso"])(startTime),
                endTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toLocalIso"])(endTime),
                voucherCode: voucherCode?.trim() || null
            }
        }),
    /** POST /api/orders */ create: async ({ carSlotId, rentalType, startTime, endTime, voucherCode, note })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeOrder"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/orders", {
            method: "POST",
            json: {
                carSlotId: Number(carSlotId),
                rentalType,
                startTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toLocalIso"])(startTime),
                endTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toLocalIso"])(endTime),
                voucherCode: voucherCode?.trim() || null,
                note: note?.trim() || null
            }
        })),
    /** GET /api/orders/my-rentals */ async listMine (status) {
        return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchAllPages"])("/api/orders/my-rentals", {
            status,
            sortBy: "createdAt",
            direction: "desc"
        })).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeOrder"]);
    },
    getById: async (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeOrder"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/orders/${id}`)),
    /** PUT /api/orders/{id}/cancel { reason } */ cancel: async (id, reason)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeOrder"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/orders/${id}/cancel`, {
            method: "PUT",
            json: reasonBody(reason)
        })),
    /** GET /api/orders/{id}/logs */ logs: (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/orders/${id}/logs`),
    handovers: loadHandovers
};
const adminOrderService = {
    async list ({ status, page = 0, size = 20 } = {}) {
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toPage"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/orders", {
            query: {
                status,
                page,
                size,
                sortBy: "createdAt",
                direction: "desc"
            }
        }));
        return {
            ...result,
            content: result.content.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeOrder"])
        };
    },
    async listAll (status) {
        return (await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchAllPages"])("/api/orders", {
            status,
            sortBy: "createdAt",
            direction: "desc"
        })).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["normalizeOrder"]);
    }
};
}),
"[project]/src/views/live/PaymentLive.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PaymentLive
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$require$2d$auth$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/require-auth.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/live-ui.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$async$2d$resource$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-async-resource.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/labels.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$order$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/order.service.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$customer$2d$extra$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/customer-extra.service.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
function PaymentLive() {
    const orderId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])().get("orderId");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LivePage"], {
        width: "max-w-xl",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$require$2d$auth$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RequireAuth"], {
            title: "Đăng nhập để thanh toán",
            children: orderId ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Pay, {
                orderId: orderId
            }, void 0, false, {
                fileName: "[project]/src/views/live/PaymentLive.jsx",
                lineNumber: 16,
                columnNumber: 18
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm",
                children: [
                    "Thiếu mã đơn. Mở thanh toán từ ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        href: "/my-trips",
                        className: "font-bold text-[#FC6C26]",
                        children: "chuyến xe của tôi"
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/PaymentLive.jsx",
                        lineNumber: 16,
                        columnNumber: 99
                    }, this),
                    "."
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/live/PaymentLive.jsx",
                lineNumber: 16,
                columnNumber: 45
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/views/live/PaymentLive.jsx",
            lineNumber: 15,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/views/live/PaymentLive.jsx",
        lineNumber: 14,
        columnNumber: 12
    }, this);
}
function Pay({ orderId }) {
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const [order, transactions] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$order$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rentalService"].getById(orderId),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$customer$2d$extra$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transactionService"].listByOrder(orderId)
        ]);
        return {
            order,
            transactions
        };
    }, [
        orderId
    ]);
    const detail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$async$2d$resource$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAsyncResource"])(load, orderId);
    const [method, setMethod] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("VNPAY");
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const pay = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$async$2d$resource$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAsyncAction"])(async ()=>{
        const tx = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$customer$2d$extra$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transactionService"].createPayment({
            orderId,
            amount: Number(detail.data.order.totalAmount),
            method
        });
        setPending(tx);
        if (tx.paymentUrl) window.open(tx.paymentUrl, "_blank", "noopener");
        return tx;
    });
    const simulate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$async$2d$resource$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAsyncAction"])(async (success)=>{
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$customer$2d$extra$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["transactionService"].simulate(pending.id, success);
        setPending(null);
        detail.reload();
    });
    if (!detail.data) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LiveState"], {
        loading: detail.loading,
        error: detail.error,
        label: "đơn thanh toán",
        onRetry: detail.reload
    }, void 0, false, {
        fileName: "[project]/src/views/live/PaymentLive.jsx",
        lineNumber: 42,
        columnNumber: 16
    }, this);
    const { order } = detail.data;
    const paid = order.paymentStatus === "PAID";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                href: `/orders/${order.id}`,
                className: "text-sm font-bold text-[#FC6C26]",
                children: [
                    "← ",
                    order.orderCode
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/live/PaymentLive.jsx",
                lineNumber: 46,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-xl font-bold",
                children: "Thanh toán tiền thuê"
            }, void 0, false, {
                fileName: "[project]/src/views/live/PaymentLive.jsx",
                lineNumber: 47,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-[#666666]",
                children: [
                    order.carName,
                    " • ",
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["paymentStatusLabels"][order.paymentStatus] ?? order.paymentStatus
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/live/PaymentLive.jsx",
                lineNumber: 48,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-2xl font-bold text-[#FC6C26]",
                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatMoney"])(order.totalAmount)
            }, void 0, false, {
                fileName: "[project]/src/views/live/PaymentLive.jsx",
                lineNumber: 49,
                columnNumber: 5
            }, this),
            paid ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "rounded-xl bg-[#ECFDF5] p-3 text-sm text-[#047857]",
                children: "Đơn này đã thanh toán."
            }, void 0, false, {
                fileName: "[project]/src/views/live/PaymentLive.jsx",
                lineNumber: 50,
                columnNumber: 13
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-semibold text-[#666666]",
                        children: [
                            "Phương thức",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: method,
                                onChange: (event)=>setMethod(event.target.value),
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fieldClass"]} mt-1`,
                                children: Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["paymentMethodLabels"]).map(([id, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: id,
                                        children: label
                                    }, id, false, {
                                        fileName: "[project]/src/views/live/PaymentLive.jsx",
                                        lineNumber: 52,
                                        columnNumber: 173
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/PaymentLive.jsx",
                                lineNumber: 52,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/PaymentLive.jsx",
                        lineNumber: 51,
                        columnNumber: 7
                    }, this),
                    pay.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-[#B91C1C]",
                        children: pay.error.message
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/PaymentLive.jsx",
                        lineNumber: 54,
                        columnNumber: 20
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Primary"], {
                        disabled: pay.running || order.status === "PENDING" || order.status === "CANCELLED",
                        onClick: ()=>void pay.run(),
                        children: pay.running ? "Đang tạo giao dịch…" : "Thanh toán qua cổng"
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/PaymentLive.jsx",
                        lineNumber: 55,
                        columnNumber: 7
                    }, this),
                    order.status === "PENDING" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-[#666666]",
                        children: "Chờ chủ xe xác nhận đơn trước khi thanh toán."
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/PaymentLive.jsx",
                        lineNumber: 56,
                        columnNumber: 37
                    }, this) : null,
                    pending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl border border-[#E9E9E7] p-3 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: [
                                    "Giao dịch #",
                                    pending.id,
                                    " đang chờ. Nếu cổng VNPay sandbox chưa cấu hình, dùng giả lập bên dưới."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/live/PaymentLive.jsx",
                                lineNumber: 58,
                                columnNumber: 9
                            }, this),
                            pending.paymentUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: pending.paymentUrl,
                                target: "_blank",
                                rel: "noreferrer",
                                className: "mt-2 inline-flex font-bold text-[#FC6C26]",
                                children: "Mở lại trang VNPay"
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/PaymentLive.jsx",
                                lineNumber: 59,
                                columnNumber: 31
                            }, this) : null,
                            simulate.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-2 text-[#B91C1C]",
                                children: simulate.error.message
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/PaymentLive.jsx",
                                lineNumber: 60,
                                columnNumber: 27
                            }, this) : null,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3 flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: simulate.running,
                                        onClick: ()=>void simulate.run(true),
                                        className: "rounded-lg bg-[#047857] px-3 py-1.5 text-xs font-bold text-white",
                                        children: "Giả lập thành công"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/live/PaymentLive.jsx",
                                        lineNumber: 62,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: simulate.running,
                                        onClick: ()=>void simulate.run(false),
                                        className: "rounded-lg border border-[#EF4444] px-3 py-1.5 text-xs font-bold text-[#EF4444]",
                                        children: "Giả lập thất bại"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/live/PaymentLive.jsx",
                                        lineNumber: 63,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/live/PaymentLive.jsx",
                                lineNumber: 61,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/PaymentLive.jsx",
                        lineNumber: 57,
                        columnNumber: 18
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/live/PaymentLive.jsx",
                lineNumber: 50,
                columnNumber: 108
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/views/live/PaymentLive.jsx",
        lineNumber: 45,
        columnNumber: 12
    }, this);
}
}),
];})()

//# sourceMappingURL=src_1p66sg3h24xc3._.js.map