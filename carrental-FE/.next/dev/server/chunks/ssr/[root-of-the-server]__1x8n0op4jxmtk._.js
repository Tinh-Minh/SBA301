module.exports = [
(()=>{"use strict";return[
"[project]/src/components/auth-provider.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/auth.service.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])({
    ready: false,
    loggedIn: false,
    user: null,
    isAdmin: false,
    login: async ()=>{},
    register: async ()=>{},
    logout: ()=>{}
});
function AuthProvider({ children }) {
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [session, setSession] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const sync = ()=>setSession((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readSession"])());
        sync();
        setReady(true);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["subscribeSession"])(sync);
    }, []);
    const login = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (credentials)=>{
        const next = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["login"](credentials);
        setSession(next);
        return next;
    }, []);
    const register = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((payload)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["register"](payload), []);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["logout"]();
        setSession(null);
    }, []);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const user = session?.account ?? null;
        return {
            ready,
            loggedIn: Boolean(user),
            user,
            isAdmin: user?.role === "ADMIN",
            login,
            register,
            logout
        };
    }, [
        ready,
        session,
        login,
        register,
        logout
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/auth-provider.jsx",
        lineNumber: 39,
        columnNumber: 12
    }, this);
}
const useAuth = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
}),
"[project]/src/components/header.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Header",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/auth-provider.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$site$2d$brand$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/site-brand.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/labels.js [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
const publicNavigation = [
    [
        "/explore",
        "Khám phá xe"
    ],
    [
        "/my-trips",
        "Chuyến xe của tôi"
    ],
    [
        "/list-your-car",
        "Cho thuê xe"
    ],
    [
        "/pricing",
        "Cách tính giá"
    ]
];
const memberNavigation = [
    [
        "/explore",
        "Khám phá xe"
    ],
    [
        "/my-trips",
        "Chuyến xe của tôi"
    ],
    [
        "/owner/dashboard",
        "Chủ xe"
    ],
    [
        "/pricing",
        "Cách tính giá"
    ]
];
const adminLink = [
    "/admin/dashboard",
    "Quản trị"
];
const accountLinks = [
    [
        "/account",
        "Hồ sơ cá nhân",
        "badge"
    ],
    [
        "/account/orders",
        "Đơn thuê xe",
        "receipt_long"
    ],
    [
        "/account/history",
        "Lịch sử chuyến đi",
        "history"
    ],
    [
        "/account/bank",
        "Tài khoản ngân hàng",
        "account_balance"
    ],
    [
        "/owner/dashboard",
        "Kênh chủ xe",
        "directions_car"
    ]
];
function Header({ previewState } = {}) {
    const instance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    const mobileId = previewState === undefined ? "mobile-navigation" : `mobile-navigation-${instance}`;
    const accountId = previewState === undefined ? "account-menu" : `account-menu-${instance}`;
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { loggedIn: authenticated, user, isAdmin, logout } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const loggedIn = previewState ?? authenticated;
    const displayName = user?.fullName || (previewState ? "Khách hàng CarDB" : "Tài khoản");
    const displayCode = user ? `${user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"} • #${user.id}` : "CarDB";
    const navigation = loggedIn ? isAdmin ? [
        ...memberNavigation,
        adminLink
    ] : memberNavigation : publicNavigation;
    const menuLinks = isAdmin ? [
        ...accountLinks,
        [
            "/admin/dashboard",
            "Trang quản trị",
            "admin_panel_settings"
        ]
    ] : accountLinks;
    const activePath = previewState === undefined ? path : loggedIn ? "/my-trips" : "/explore";
    const overPhoto = previewState === undefined && (path === "/login" || path === "/register");
    const [menu, setMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [account, setAccount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    function close() {
        setMenu(false);
        setAccount(false);
    }
    function signOut() {
        logout();
        close();
        router.push("/");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        className: `site-header ${overPhoto ? "auth-overlay" : "border-border-light bg-white/95 backdrop-blur-xl"} ${previewState === undefined ? `fixed inset-x-0 top-0 z-50 ${overPhoto ? "" : "border-b"}` : "relative w-full rounded-2xl border shadow-sm"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$site$2d$brand$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SiteBrand"], {
                        compact: true,
                        onClick: close
                    }, void 0, false, {
                        fileName: "[project]/src/components/header.jsx",
                        lineNumber: 33,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        "aria-label": "Điều hướng chính",
                        className: "hidden items-center gap-1 lg:flex",
                        children: navigation.map(([href, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: href,
                                onClick: close,
                                "aria-current": activePath.startsWith(href) ? "page" : undefined,
                                className: `rounded-xl px-3 py-2 text-sm font-medium transition-colors ${activePath.startsWith(href) ? "bg-accent-soft font-semibold text-brand-accent" : "text-text-secondary hover:bg-section-bg hover:text-text-primary"}`,
                                children: label
                            }, href, false, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 34,
                                columnNumber: 123
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/header.jsx",
                        lineNumber: 34,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 sm:gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "tel:19008899",
                                className: "hidden shrink-0 items-center gap-2 md:flex",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex size-8 items-center justify-center rounded-full bg-accent-soft text-brand-accent",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                                            name: "call",
                                            className: "text-[16px]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/header.jsx",
                                            lineNumber: 36,
                                            columnNumber: 191
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/header.jsx",
                                        lineNumber: 36,
                                        columnNumber: 87
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "flex flex-col gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[9px] font-semibold uppercase leading-none text-text-secondary",
                                                children: "Hỗ trợ 24/7"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 36,
                                                columnNumber: 279
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                className: "text-xs leading-none text-brand-accent",
                                                children: "1900 8899"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 36,
                                                columnNumber: 383
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/header.jsx",
                                        lineNumber: 36,
                                        columnNumber: 241
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 36,
                                columnNumber: 9
                            }, this),
                            loggedIn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        "aria-label": `Tài khoản ${displayName}`,
                                        "aria-expanded": account,
                                        "aria-controls": accountId,
                                        onClick: ()=>{
                                            setAccount((value)=>!value);
                                            setMenu(false);
                                        },
                                        className: "flex items-center gap-2 border-l border-border-light py-2 pl-3 text-left sm:gap-3 sm:pl-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex size-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-accent to-[#ff8f59] text-xs font-bold text-white shadow-inner",
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initials"])(displayName)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/header.jsx",
                                                        lineNumber: 37,
                                                        columnNumber: 353
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-emerald-500"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/header.jsx",
                                                        lineNumber: 37,
                                                        columnNumber: 545
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 37,
                                                columnNumber: 326
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "hidden flex-col gap-1 sm:flex",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "flex items-center gap-1.5 text-xs font-bold leading-none text-text-primary",
                                                        children: [
                                                            displayName,
                                                            isAdmin ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] text-amber-700",
                                                                children: "ADMIN"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/header.jsx",
                                                                lineNumber: 37,
                                                                columnNumber: 821
                                                            }, this) : null
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/header.jsx",
                                                        lineNumber: 37,
                                                        columnNumber: 704
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[10px] leading-none text-text-secondary",
                                                        children: displayCode
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/header.jsx",
                                                        lineNumber: 37,
                                                        columnNumber: 950
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 37,
                                                columnNumber: 656
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: "expand_more",
                                                className: "text-[18px] text-text-secondary"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 37,
                                                columnNumber: 1040
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/header.jsx",
                                        lineNumber: 37,
                                        columnNumber: 47
                                    }, this),
                                    account ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                tabIndex: -1,
                                                "aria-label": "Đóng menu tài khoản",
                                                onClick: ()=>setAccount(false),
                                                className: "fixed inset-0 z-[-1] cursor-default"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 38,
                                                columnNumber: 24
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                                                id: accountId,
                                                "aria-label": "Tài khoản",
                                                onKeyDown: (event)=>{
                                                    if (event.key === "Escape") setAccount(false);
                                                },
                                                className: "absolute right-0 top-full mt-2 w-60 rounded-xl border border-border-light bg-white p-2 shadow-xl",
                                                children: [
                                                    menuLinks.map(([href, label, icon])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                            href: href,
                                                            onClick: close,
                                                            className: "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-text-primary hover:bg-accent-soft hover:text-brand-accent",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                                                                    name: icon,
                                                                    className: "text-[18px]"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/header.jsx",
                                                                    lineNumber: 39,
                                                                    columnNumber: 359
                                                                }, this),
                                                                label
                                                            ]
                                                        }, href, true, {
                                                            fileName: "[project]/src/components/header.jsx",
                                                            lineNumber: 39,
                                                            columnNumber: 184
                                                        }, this)),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: signOut,
                                                        className: "mt-1 flex w-full items-center gap-2 rounded-lg border-t border-border-light px-3 py-2.5 text-sm text-error hover:bg-error-container/30",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                                                                name: "logout",
                                                                className: "text-[18px]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/header.jsx",
                                                                lineNumber: 39,
                                                                columnNumber: 605
                                                            }, this),
                                                            "Đăng xuất"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/header.jsx",
                                                        lineNumber: 39,
                                                        columnNumber: 418
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 38,
                                                columnNumber: 176
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/header.jsx",
                                        lineNumber: 38,
                                        columnNumber: 22
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 37,
                                columnNumber: 21
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/login",
                                        className: "rounded-lg px-2 py-2 text-xs font-semibold text-text-primary hover:text-brand-accent sm:text-sm",
                                        children: "Đăng nhập"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/header.jsx",
                                        lineNumber: 40,
                                        columnNumber: 20
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/register",
                                        className: "hidden items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-shadow hover:bg-primary-hover hover:shadow-md sm:inline-flex",
                                        children: [
                                            "Đăng ký",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: "arrow_forward",
                                                className: "text-[16px]"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/header.jsx",
                                                lineNumber: 40,
                                                columnNumber: 384
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/header.jsx",
                                        lineNumber: 40,
                                        columnNumber: 164
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 40,
                                columnNumber: 18
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                "aria-label": menu ? "Đóng menu" : "Mở menu",
                                "aria-expanded": menu,
                                "aria-controls": mobileId,
                                onClick: ()=>{
                                    setMenu((value)=>!value);
                                    setAccount(false);
                                },
                                className: "header-menu-toggle flex size-9 items-center justify-center rounded-lg border border-border-light text-text-primary lg:hidden",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                                    name: menu ? "close" : "menu"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/header.jsx",
                                    lineNumber: 41,
                                    columnNumber: 323
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 41,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/header.jsx",
                        lineNumber: 35,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/header.jsx",
                lineNumber: 32,
                columnNumber: 5
            }, this),
            menu ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                id: mobileId,
                "aria-label": "Điều hướng di động",
                className: "header-mobile-navigation border-t border-border-light bg-white px-4 py-3 shadow-lg lg:hidden",
                children: [
                    navigation.map(([href, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: href,
                            onClick: close,
                            "aria-current": activePath.startsWith(href) ? "page" : undefined,
                            className: `block rounded-lg px-4 py-3 text-sm font-semibold ${activePath.startsWith(href) ? "bg-accent-soft text-brand-accent" : "text-text-primary hover:bg-accent-soft hover:text-brand-accent"}`,
                            children: label
                        }, href, false, {
                            fileName: "[project]/src/components/header.jsx",
                            lineNumber: 44,
                            columnNumber: 204
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 flex justify-between border-t border-border-light px-4 pt-4 text-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                href: loggedIn ? "/account" : "/register",
                                onClick: close,
                                children: loggedIn ? "Hồ sơ cá nhân" : "Đăng ký tài khoản"
                            }, void 0, false, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 44,
                                columnNumber: 617
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                href: "tel:19008899",
                                className: "font-semibold text-brand-accent",
                                children: "1900 8899"
                            }, void 0, false, {
                                fileName: "[project]/src/components/header.jsx",
                                lineNumber: 44,
                                columnNumber: 739
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/header.jsx",
                        lineNumber: 44,
                        columnNumber: 527
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/header.jsx",
                lineNumber: 44,
                columnNumber: 13
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/header.jsx",
        lineNumber: 31,
        columnNumber: 12
    }, this);
}
}),
"[project]/src/components/hold-button.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HoldButton",
    ()=>HoldButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function HoldButton({ children, onComplete, danger = false, disabled = false }) {
    const hint = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    const [holding, setHolding] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const fill = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const frame = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const started = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const complete = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(onComplete);
    complete.current = onComplete;
    function stop() {
        if (frame.current !== null) cancelAnimationFrame(frame.current);
        frame.current = null;
        started.current = null;
        setHolding(false);
        if (fill.current) fill.current.style.transform = "scaleX(0)";
    }
    function start() {
        if (disabled || started.current !== null) return;
        started.current = performance.now();
        setHolding(true);
        function tick(now) {
            if (started.current === null) return;
            const progress = Math.min((now - started.current) / 1600, 1);
            if (fill.current) fill.current.style.transform = `scaleX(${progress})`;
            if (progress >= 1) {
                stop();
                complete.current();
            } else frame.current = requestAnimationFrame(tick);
        }
        frame.current = requestAnimationFrame(tick);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>()=>{
            if (frame.current !== null) cancelAnimationFrame(frame.current);
        }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full",
        "data-hold-control": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                disabled: disabled,
                "aria-describedby": hint,
                onPointerDown: (event)=>{
                    if (event.button !== 0) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    start();
                },
                onPointerUp: stop,
                onPointerCancel: stop,
                onPointerLeave: stop,
                onBlur: stop,
                onContextMenu: (event)=>event.preventDefault(),
                onKeyDown: (event)=>{
                    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                        event.preventDefault();
                        start();
                    }
                },
                onKeyUp: (event)=>{
                    if (event.key === " " || event.key === "Enter") {
                        event.preventDefault();
                        stop();
                    }
                },
                className: `relative flex w-full touch-none select-none items-center justify-center gap-2 overflow-hidden rounded-full px-3 py-4 text-xs font-bold sm:px-6 sm:text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${danger ? "border border-error/25 bg-error-container/40 text-error hover:bg-error-container/70" : "bg-primary text-white shadow-md hover:bg-primary-container"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        ref: fill,
                        "aria-hidden": "true",
                        className: `pointer-events-none absolute inset-0 origin-left scale-x-0 ${danger ? "bg-error/15" : "bg-secondary-fixed/25"}`
                    }, void 0, false, {
                        fileName: "[project]/src/components/hold-button.jsx",
                        lineNumber: 58,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "relative flex items-center justify-center gap-2 whitespace-nowrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                                name: danger ? "cancel" : "verified",
                                className: "text-[20px]"
                            }, void 0, false, {
                                fileName: "[project]/src/components/hold-button.jsx",
                                lineNumber: 59,
                                columnNumber: 91
                            }, this),
                            holding ? "Tiếp tục giữ…" : children
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/hold-button.jsx",
                        lineNumber: 59,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/hold-button.jsx",
                lineNumber: 44,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                id: hint,
                className: "mt-2 text-center text-[11px] leading-5 text-text-muted",
                children: [
                    "Giữ 1,6 giây để ",
                    danger ? "hủy" : "xác nhận",
                    ". Thả tay để dừng. Bàn phím: giữ Enter hoặc Space."
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/hold-button.jsx",
                lineNumber: 61,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/hold-button.jsx",
        lineNumber: 43,
        columnNumber: 12
    }, this);
}
}),
"[project]/src/components/icon.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Icon",
    ()=>Icon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function Icon({ name, className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "aria-hidden": "true",
        className: `material-symbols-outlined inline-block size-[1em] overflow-hidden text-center leading-none ${className}`,
        children: name
    }, void 0, false, {
        fileName: "[project]/src/components/icon.jsx",
        lineNumber: 2,
        columnNumber: 12
    }, this);
}
}),
"[project]/src/components/interactions.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Interactions",
    ()=>Interactions
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/auth-provider.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hold$2d$button$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/hold-button.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
const money = (value)=>Math.round(value).toLocaleString("vi-VN") + " đ";
function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}
function activate(button) {
    button.parentElement?.querySelectorAll(":scope > button").forEach((el)=>{
        el.dataset.active = String(el === button);
        el.setAttribute("aria-pressed", String(el === button));
    });
}
function filterCars(category) {
    document.querySelectorAll("[data-vehicle-card]").forEach((card)=>{
        card.dataset.filterHidden = String(category !== "all" && card.dataset.vehicleCard !== category);
    });
}
function Modal({ title, close, children }) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        ref.current?.showModal();
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dialog", {
        ref: ref,
        onCancel: close,
        onClick: (event)=>{
            if (event.currentTarget === event.target) close();
        },
        "aria-labelledby": "app-dialog-title",
        className: "m-auto w-[calc(100%-2rem)] max-w-2xl rounded-xl border border-border-light bg-white p-0 text-text-primary shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-5 sm:p-7",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-5 flex items-start justify-between gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            id: "app-dialog-title",
                            className: "text-xl font-bold",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/src/components/interactions.jsx",
                            lineNumber: 16,
                            columnNumber: 321
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            "aria-label": "Đóng hộp thoại",
                            onClick: close,
                            className: "flex size-8 shrink-0 items-center justify-center rounded-full bg-section-bg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                                name: "close",
                                className: "text-[20px]"
                            }, void 0, false, {
                                fileName: "[project]/src/components/interactions.jsx",
                                lineNumber: 16,
                                columnNumber: 543
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/interactions.jsx",
                            lineNumber: 16,
                            columnNumber: 389
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/interactions.jsx",
                    lineNumber: 16,
                    columnNumber: 260
                }, this),
                children
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/interactions.jsx",
            lineNumber: 16,
            columnNumber: 232
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/interactions.jsx",
        lineNumber: 15,
        columnNumber: 12
    }, this);
}
function Interactions({ children }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const path = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    const { login, register } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const toastTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [toast, setToast] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [modal, setModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [empty, setEmpty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [rating, setRating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    function notify(text) {
        setToast(text);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(()=>setToast(""), 4000);
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>()=>{
            if (toastTimer.current) clearTimeout(toastTimer.current);
        }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        setModal(null);
        setEmpty(false);
        setRating(0);
        const params = new URLSearchParams(window.location.search);
        if (params.get("filter")) filterCars(params.get("filter"));
        if (params.has("cancelled")) notify("Đã hủy yêu cầu thuê xe.");
        const scope = root.current;
        if (!scope) return;
        scope.querySelectorAll("[data-handler='toggleCard']").forEach((el)=>{
            el.tabIndex = 0;
            el.setAttribute("role", "button");
            el.setAttribute("aria-expanded", String(!el.closest("[id^='card-']")?.querySelector(".card-body,.card-content")?.classList.contains("hidden")));
        });
        scope.querySelectorAll("input:not([id])").forEach((input, index)=>input.id = `cardb-field-${index}`);
        scope.querySelectorAll("[data-star]").forEach((el)=>el.setAttribute("aria-label", `${el.dataset.star} sao`));
        scope.querySelectorAll("[data-val]").forEach((el)=>el.setAttribute("aria-label", `Đánh giá ${el.dataset.val} sao`));
        const dialog = scope.querySelector("#modal-add-bank,#change-default-bank-modal");
        if (dialog) {
            dialog.setAttribute("role", "dialog");
            dialog.setAttribute("aria-modal", "true");
            dialog.setAttribute("aria-label", path.endsWith("/add") ? "Thêm tài khoản ngân hàng" : "Đổi tài khoản mặc định");
            dialog.querySelector("input,button")?.focus();
        }
        if (path.endsWith("bank/add") && params.get("edit") === "1") {
            const heading = dialog?.querySelector("h2,h3");
            if (heading) heading.textContent = "Chỉnh sửa tài khoản ngân hàng";
            const number = document.getElementById("account-number");
            if (number) number.value = "0071001234982";
        }
        if (path === "/account") try {
            const saved = JSON.parse(localStorage.getItem("cardb:profile:v1") ?? "{}");
            for (const [id, value] of Object.entries(saved)){
                const field = document.getElementById(id);
                if (field instanceof HTMLInputElement) field.value = String(value);
                else if (field) field.textContent = String(value);
            }
        } catch  {}
    }, [
        path
    ]);
    async function copy(value) {
        try {
            await navigator.clipboard.writeText(value);
            notify("Đã sao chép: " + value);
        } catch  {
            setModal({
                kind: "info",
                title: "Thông tin cần sao chép",
                body: value
            });
        }
    }
    function search(button) {
        const container = button.closest("section") ?? root.current;
        const location = container?.querySelector("select")?.value ?? "TP. Hồ Chí Minh";
        const fields = container?.querySelectorAll('input[type="text"]');
        const params = new URLSearchParams({
            location,
            start: fields?.[0]?.value ?? "08:00, 25/10/2026",
            end: fields?.[1]?.value ?? "20:00, 27/10/2026"
        });
        if (path === "/explore") {
            notify("Đã cập nhật thời gian tìm xe.");
            return;
        }
        router.push("/explore?" + params);
    }
    function click(event) {
        const target = event.target;
        if (target.closest("[data-hold-control],[data-native]")) return;
        const button = target.closest("button,a,[data-action],[data-handler],[data-tab-target]");
        if (!button) {
            if (target.tagName === "IMG" && target.closest("main") && !path.includes("dang-") && !target.closest("a")) {
                const img = target;
                setModal({
                    kind: "image",
                    title: img.alt || "Hình ảnh xe",
                    image: img.src
                });
            }
            return;
        }
        if (button.getAttribute("type") === "submit") return;
        const text = (button.getAttribute("aria-label") || button.textContent || "").trim();
        const handler = button.dataset.handler ?? "";
        const arg = button.dataset.args?.match(/['"]([^'"]+)['"]/)?.[1] ?? "";
        const action = button.dataset.action;
        if (handler === "toggleCancelModal" && button.dataset.args?.includes("true") || action === "cancel-order") {
            setModal({
                kind: "cancel",
                title: "Hủy yêu cầu thuê xe",
                body: "Giữ nút bên dưới để xác nhận hủy. Thả tay trước khi hết thời gian để giữ nguyên yêu cầu."
            });
            return;
        }
        if (button.dataset.route) {
            router.push(button.dataset.route);
            return;
        }
        if (handler === "switchAuthTab") {
            router.push(arg === "register" ? "/register" : "/login");
            return;
        }
        if (handler === "togglePasswordVisibility" || action === "password") {
            const input = arg ? document.getElementById(arg) : button.parentElement?.querySelector("input");
            if (input) input.type = input.type === "password" ? "text" : "password";
            return;
        }
        if (handler === "toggleCard") {
            const card = document.getElementById(arg);
            if (card) {
                const content = card.querySelector(".card-body,.card-content,.details-content,.expandable-content") ?? card.lastElementChild;
                content?.classList.toggle("hidden");
                if (content) content.style.display = content.classList.contains("hidden") ? "none" : "";
                button.setAttribute("aria-expanded", String(!content?.classList.contains("hidden")));
            }
            return;
        }
        if (handler === "selectPaymentMethod") {
            const group = document.getElementById("payment-methods");
            group?.querySelectorAll("[data-handler='selectPaymentMethod']").forEach((el)=>el.dataset.active = String(el === button));
            notify("Đã chọn phương thức thanh toán.");
            return;
        }
        if (handler === "copyOrderCode" || handler === "navigator.clipboard.writeText" || action === "copy") {
            void copy(arg || "CDB-ORD-20261026-904");
            return;
        }
        if (handler === "window.print" || action === "receipt") {
            window.print();
            return;
        }
        if (action === "trip-filter") {
            const status = button.dataset.statusFilter;
            activate(button);
            root.current?.querySelectorAll("[data-trip-card]").forEach((card)=>card.dataset.filterHidden = String(status !== "all" && card.dataset.tripStatus !== status));
            setEmpty(!root.current?.querySelector('[data-trip-card]:not([data-filter-hidden="true"])'));
            return;
        }
        if (action === "choice") {
            activate(button);
            notify(`Đã chọn ${text.replace(/^\+\s*/, "")}.`);
            return;
        }
        if (action === "page") {
            activate(button);
            notify(/^[1-9]\d*$/.test(text) ? `Đã chọn trang ${text}. Các mục hiện có được hiển thị trong danh sách.` : "Danh sách hiện đã hiển thị các mục có sẵn.");
            return;
        }
        if (action === "view-layout") {
            const card = root.current?.querySelector("[data-vehicle-card]");
            if (card?.parentElement) card.parentElement.dataset.resultsLayout = button.dataset.layout;
            activate(button);
            return;
        }
        if (action === "edit-search") {
            root.current?.querySelector("section")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
            notify("Chọn lại ngày nhận, ngày trả xe và nhấn Cập nhật.");
            return;
        }
        if (action === "refresh-list") {
            router.refresh();
            notify("Đã làm mới danh sách chuyến xe.");
            return;
        }
        if (action === "download-report") {
            const lines = root.current?.querySelector("main")?.innerText.split("\n").filter(Boolean) ?? [];
            const csv = "\ufeffNội dung\n" + lines.map((line)=>'"' + line.replaceAll('"', '""') + '"').join("\n");
            const url = URL.createObjectURL(new Blob([
                csv
            ], {
                type: "text/csv;charset=utf-8"
            }));
            const download = document.createElement("a");
            download.href = url;
            download.download = "cardb-lich-su.csv";
            download.click();
            setTimeout(()=>URL.revokeObjectURL(url), 1000);
            notify("Đã xuất lịch sử dạng CSV, có thể mở bằng Excel.");
            return;
        }
        if (action === "media-info") {
            setModal({
                kind: "info",
                title: text,
                body: "Nội dung này đang được cập nhật. Bạn có thể xem ảnh thực tế trong thư viện xe hoặc liên hệ 1900 8899 để được hỗ trợ."
            });
            return;
        }
        if (action === "contact-owner") {
            setModal({
                kind: "info",
                title: "Liên hệ chủ xe",
                body: "Liên hệ tổng đài CarDB 1900 8899 để được kết nối với chủ xe và tư vấn lịch trình."
            });
            return;
        }
        if (action === "preview-attachment") {
            setModal({
                kind: "info",
                title: "Bằng chứng đính kèm",
                body: "anh_taplo_dong_ho_tra_xe_08h00.jpg — Tải lên ảnh từ thiết bị để đính kèm bằng chứng của bạn."
            });
            return;
        }
        if (action === "remove-attachment") {
            button.closest("[data-attachment]")?.remove();
            setText("attachment-count", `Tài liệu đã chuẩn bị đính kèm (${root.current?.querySelectorAll("[data-attachment]").length ?? 0})`);
            notify("Đã xóa tệp đính kèm.");
            return;
        }
        if (action === "remove-voucher" || action === "apply-voucher") {
            const input = document.getElementById("voucher-input");
            const apply = action === "apply-voucher";
            if (apply && !input?.value.trim()) {
                notify("Nhập mã ưu đãi trước khi áp dụng.");
                input?.focus();
                return;
            }
            const total = apply ? 3700000 : 3900000;
            root.current?.querySelectorAll("[data-checkout-total]").forEach((el)=>el.textContent = el.dataset.checkoutTotal === "number" ? total.toLocaleString("vi-VN") : money(total));
            const discount = root.current?.querySelector("[data-voucher-discount]");
            if (discount) discount.textContent = money(apply ? -200000 : 0);
            const status = document.getElementById("voucher-status-box");
            if (status) {
                status.style.display = apply ? "" : "none";
                const code = status.querySelector("strong");
                if (code && input) code.textContent = input.value.toUpperCase();
            }
            if (!apply && input) input.value = "";
            setText("btn-apply-voucher", apply ? "Đã áp dụng" : "Áp dụng");
            notify(apply ? "Đã áp dụng mã ưu đãi." : "Đã bỏ mã ưu đãi.");
            return;
        }
        if (action === "search") {
            search(button);
            return;
        }
        if (action === "rental-mode") {
            activate(button);
            return;
        }
        if (action === "filter") {
            const category = /điện|EV|Điện/.test(text) ? "ev" : /SUV|Gầm cao/.test(text) ? "suv" : /Sedan|sang/.test(text) ? "luxury" : "all";
            filterCars(category);
            activate(button);
            return;
        }
        if (action === "apply-filter") {
            const fuel = root.current?.querySelector('aside input[type="radio"]:checked');
            const label = fuel?.closest("label")?.textContent ?? "";
            const category = /điện|EV|Điện/.test(label) ? "ev" : "all";
            filterCars(category);
            setEmpty(document.querySelectorAll('[data-vehicle-card]:not([data-filter-hidden="true"])').length === 0);
            notify("Đã áp dụng bộ lọc.");
            return;
        }
        if (action === "clear-filter") {
            filterCars("all");
            setEmpty(false);
            root.current?.querySelectorAll('aside input[type="checkbox"],aside input[type="radio"]').forEach((input)=>input.checked = false);
            notify("Đã xóa bộ lọc.");
            return;
        }
        if (action === "favorite") {
            button.dataset.favorite = String(button.dataset.favorite !== "true");
            button.setAttribute("aria-pressed", button.dataset.favorite);
            notify(button.dataset.favorite === "true" ? "Đã lưu xe yêu thích." : "Đã bỏ lưu xe.");
            return;
        }
        if (action === "demo-login") {
            router.push("/login");
            return;
        }
        if (action === "edit-profile" || button.id === "btnEditProfile") {
            for (const id of [
                "fieldFullName",
                "fieldPhone",
                "fieldDob",
                "fieldAddress"
            ]){
                const field = document.getElementById(id);
                if (field instanceof HTMLInputElement) {
                    field.readOnly = false;
                    field.disabled = false;
                    field.focus();
                } else if (field) {
                    field.contentEditable = "true";
                    field.classList.add("outline", "outline-brand-accent");
                }
            }
            setText("editBtnText", "Đang chỉnh sửa");
            notify("Bạn có thể chỉnh sửa thông tin cá nhân.");
            return;
        }
        if (action === "save-profile" || button.id === "btnSaveProfile") {
            const saved = {};
            for (const id of [
                "fieldFullName",
                "fieldPhone",
                "fieldDob",
                "fieldAddress"
            ]){
                const field = document.getElementById(id);
                if (field instanceof HTMLInputElement) saved[id] = field.value;
                else if (field) saved[id] = field.textContent ?? "";
            }
            try {
                localStorage.setItem("cardb:profile:v1", JSON.stringify(saved));
            } catch  {}
            notify("Đã lưu thay đổi.");
            return;
        }
        if (button.dataset.star || button.dataset.val) {
            const score = Number(button.dataset.star || button.dataset.val);
            if (button.dataset.star) setRating(score);
            button.parentElement?.querySelectorAll("button").forEach((el)=>el.dataset.ratingActive = String(Number(el.dataset.star || el.dataset.val) <= score));
            setText("rating-feedback-label", `${score} sao — ${score >= 4 ? "Hài lòng" : "Đã ghi nhận lựa chọn"}`);
            return;
        }
        if (action === "review" || button.id === "submit-review-btn") {
            if (!rating) {
                notify("Vui lòng chọn số sao đánh giá.");
                return;
            }
            notify("Đã gửi đánh giá chuyến đi.");
            router.push("/account/history");
            return;
        }
        if (action === "dispute" || button.id === "submit-dispute-btn") {
            const reason = document.getElementById("dispute-detail");
            if (!reason?.value.trim()) {
                notify("Vui lòng nhập nội dung cần xem xét.");
                reason?.focus();
                return;
            }
            notify("Đã gửi yêu cầu xem xét.");
            router.push("/orders/CDB-ORD-20261026-904");
            return;
        }
        if (action === "upload") {
            const input = button.closest("section")?.querySelector('input[type="file"]') ?? document.querySelector('input[type="file"]');
            if (input) input.click();
            else {
                const picker = document.createElement("input");
                picker.type = "file";
                picker.accept = "image/*,.pdf";
                picker.multiple = true;
                picker.onchange = ()=>notify(`Đã chọn ${picker.files?.length ?? 0} tệp cho bản xem trước.`);
                picker.click();
            }
            return;
        }
        if (action === "default-bank") {
            router.push("/account/bank/default");
            return;
        }
        if (action === "bank-details") {
            const card = button.closest("article") ?? button.closest("[data-purpose='bank-card']");
            setModal({
                kind: "info",
                title: "Thông tin tài khoản ngân hàng",
                body: (card?.querySelector("h3")?.textContent?.trim() || "Tài khoản đã liên kết") + " — Thông tin nhận chi trả được mã hóa. Bạn có thể chỉnh sửa hoặc chọn làm tài khoản mặc định."
            });
            return;
        }
        if (action === "preview-image") {
            const scope = button.closest("[id^='card-']") ?? button.closest("section") ?? root.current;
            const img = button.parentElement?.querySelector("img") ?? scope?.querySelector("img");
            if (img) setModal({
                kind: "image",
                title: img.alt || "Ảnh đối chiếu",
                image: img.src
            });
            else notify("Chưa có ảnh đối chiếu cho mục này.");
            return;
        }
        if (action === "remove-bank") {
            setModal({
                kind: "info",
                title: "Gỡ liên kết tài khoản",
                body: "Tài khoản mẫu đã được gỡ liên kết trong phiên xem trước."
            });
            return;
        }
        if (action === "handover" || /Xác nhận của tôi/.test(text) && path === "/handover/pickup") {
            notify("Đã xác nhận biên bản nhận xe.");
            router.push("/my-trips");
            return;
        }
        if (action === "return" || /Xác nhận của tôi/.test(text) && path === "/handover/return") {
            notify("Đã xác nhận biên bản trả xe.");
            router.push("/reviews");
            return;
        }
        if (path.includes("/bank/") && /Hủy|Đóng/.test(text)) {
            router.push("/account/bank");
            return;
        }
        if (path.endsWith("bank/default") && /Xác nhận|Lưu/.test(text)) {
            notify("Đã đổi tài khoản mặc định.");
            router.push("/account/bank");
            return;
        }
        if (/Lưu bản nháp/.test(text)) {
            notify("Đã lưu bản nháp biên bản.");
            return;
        }
        if (button.tagName === "A") return;
        if (/Quay lại|Trở về/.test(text)) {
            router.push("/my-trips");
            return;
        }
        if (/Áp dụng/.test(text)) {
            notify("Đã áp dụng mã ưu đãi.");
            return;
        }
        if (/Chọn|Thêm|Xác nhận|Lưu/.test(text)) {
            activate(button);
            notify("Đã cập nhật lựa chọn.");
        }
    }
    const value = (id)=>document.getElementById(id)?.value ?? "";
    async function submitLogin(form) {
        const email = value("login-account").trim();
        const password = value("login-password");
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            notify("Vui lòng nhập email đã đăng ký (hệ thống đăng nhập bằng email).");
            return;
        }
        if (!password) {
            notify("Vui lòng nhập mật khẩu.");
            return;
        }
        form.setAttribute("aria-busy", "true");
        try {
            const session = await login({
                email,
                password
            });
            notify(`Xin chào ${session.account.fullName}!`);
            const next = new URLSearchParams(window.location.search).get("next");
            router.push(next && next.startsWith("/") ? next : session.account.role === "ADMIN" ? "/admin/dashboard" : "/explore");
        } catch (error) {
            notify(error.status === 401 ? "Email hoặc mật khẩu không đúng." : error.message);
        } finally{
            form.removeAttribute("aria-busy");
        }
    }
    async function submitRegister(form) {
        const payload = {
            fullName: value("reg-fullname"),
            email: value("reg-email"),
            phone: value("reg-phone"),
            password: value("reg-password")
        };
        if (!payload.fullName.trim() || !payload.email.trim() || !payload.phone.trim() || !payload.password) {
            notify("Vui lòng nhập đầy đủ họ tên, email, số điện thoại và mật khẩu.");
            return;
        }
        if (payload.password !== value("reg-confirm-password")) {
            notify("Mật khẩu xác nhận chưa khớp.");
            return;
        }
        form.setAttribute("aria-busy", "true");
        try {
            await register(payload);
            await login({
                email: payload.email,
                password: payload.password
            });
            notify("Tạo tài khoản thành công. Chào mừng bạn đến với CarDB!");
            router.push("/account");
        } catch (error) {
            notify(error.message);
        } finally{
            form.removeAttribute("aria-busy");
        }
    }
    function submit(event) {
        if (event.target.closest?.("[data-native]")) return;
        event.preventDefault();
        const form = event.target;
        if (path === "/login") {
            void submitLogin(form);
            return;
        }
        if (path === "/register") {
            void submitRegister(form);
            return;
        }
        if (path.includes("/bank/")) {
            try {
                localStorage.setItem("cardb:bank:v1", JSON.stringify({
                    name: form.querySelector('#bank-name')?.value,
                    number: form.querySelector('#account-number')?.value
                }));
            } catch  {}
            notify("Đã lưu tài khoản ngân hàng mẫu.");
            router.push("/account/bank");
            return;
        }
        if (path === "/booking/confirm") {
            router.push("/booking/success");
            return;
        }
        notify("Đã lưu thông tin trong bản xem trước.");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: root,
        onClick: click,
        onSubmit: submit,
        onInput: (event)=>{
            const el = event.target;
            if ([
                "review-content",
                "dispute-detail"
            ].includes(el.id)) setText("char-counter", `${el.value.length}/1000`);
        },
        onChange: (event)=>{
            const el = event.target;
            if (el.type === "file") notify(`Đã chọn ${el.files?.length ?? 0} tệp.`);
        },
        onKeyDown: (event)=>{
            const el = event.target;
            if (el.getAttribute("role") === "button" && [
                "Enter",
                " "
            ].includes(event.key)) {
                event.preventDefault();
                el.click();
            }
            if (event.key === "Escape" && path.includes("/bank/")) router.push("/account/bank");
        },
        children: [
            children,
            empty ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                role: "status",
                className: "mx-auto my-4 max-w-xl rounded-lg border border-border-light bg-white p-6 text-center text-text-secondary",
                children: path === "/explore" ? "Chưa có xe phù hợp. Hãy thử xóa hoặc thay đổi bộ lọc." : "Chưa có chuyến xe ở trạng thái này."
            }, void 0, false, {
                fileName: "[project]/src/components/interactions.jsx",
                lineNumber: 510,
                columnNumber: 12
            }, this) : null,
            toast ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "status",
                className: "toast fixed inset-x-4 bottom-5 z-[150] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-border-light bg-text-primary px-5 py-4 text-sm text-white shadow-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                        name: "check_circle",
                        className: "text-[20px] text-brand-accent"
                    }, void 0, false, {
                        fileName: "[project]/src/components/interactions.jsx",
                        lineNumber: 511,
                        columnNumber: 237
                    }, this),
                    toast,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        "aria-label": "Đóng thông báo",
                        onClick: ()=>setToast(""),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                            name: "close",
                            className: "text-[18px]"
                        }, void 0, false, {
                            fileName: "[project]/src/components/interactions.jsx",
                            lineNumber: 511,
                            columnNumber: 392
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/interactions.jsx",
                        lineNumber: 511,
                        columnNumber: 313
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/interactions.jsx",
                lineNumber: 511,
                columnNumber: 12
            }, this) : null,
            modal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Modal, {
                title: modal.title,
                close: ()=>setModal(null),
                children: [
                    modal.kind === "image" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: modal.image,
                        alt: modal.title,
                        className: "max-h-[70vh] w-full rounded-lg object-contain"
                    }, void 0, false, {
                        fileName: "[project]/src/components/interactions.jsx",
                        lineNumber: 512,
                        columnNumber: 94
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm leading-7 text-text-secondary",
                        children: modal.body
                    }, void 0, false, {
                        fileName: "[project]/src/components/interactions.jsx",
                        lineNumber: 512,
                        columnNumber: 197
                    }, this),
                    modal.kind === "cancel" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$hold$2d$button$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HoldButton"], {
                            danger: true,
                            onComplete: ()=>{
                                setModal(null);
                                router.push("/my-trips?cancelled=1");
                                notify("Đã hủy yêu cầu thuê xe.");
                            },
                            children: "Giữ để hủy đặt xe"
                        }, void 0, false, {
                            fileName: "[project]/src/components/interactions.jsx",
                            lineNumber: 512,
                            columnNumber: 316
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/interactions.jsx",
                        lineNumber: 512,
                        columnNumber: 294
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/interactions.jsx",
                lineNumber: 512,
                columnNumber: 12
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/interactions.jsx",
        lineNumber: 498,
        columnNumber: 12
    }, this);
}
}),
"[project]/src/components/site-brand.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SiteBrand",
    ()=>SiteBrand
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
;
;
function SiteBrand({ onClick, compact = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        href: "/",
        "aria-label": "CarDB — Trang chủ",
        onClick: onClick,
        className: "inline-flex shrink-0 items-center gap-1.5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-2xl font-black tracking-tight text-text-primary",
                children: [
                    "Car",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-brand-accent",
                        children: "DB"
                    }, void 0, false, {
                        fileName: "[project]/src/components/site-brand.jsx",
                        lineNumber: 4,
                        columnNumber: 79
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/site-brand.jsx",
                lineNumber: 4,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `ml-2 flex-col border-l border-border-light pl-3 text-[9px] font-semibold uppercase leading-none tracking-wider text-text-secondary ${compact ? "hidden sm:flex" : "flex"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[10px] font-bold tracking-widest",
                        children: "Di chuyển"
                    }, void 0, false, {
                        fileName: "[project]/src/components/site-brand.jsx",
                        lineNumber: 6,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "mt-1",
                        children: "Cao cấp"
                    }, void 0, false, {
                        fileName: "[project]/src/components/site-brand.jsx",
                        lineNumber: 6,
                        columnNumber: 79
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/site-brand.jsx",
                lineNumber: 5,
                columnNumber: 5
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/site-brand.jsx",
        lineNumber: 3,
        columnNumber: 12
    }, this);
}
}),
"[project]/src/lib/labels.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FALLBACK_CAR_IMAGE",
    ()=>FALLBACK_CAR_IMAGE,
    "carImage",
    ()=>carImage,
    "carName",
    ()=>carName,
    "carTypeLabels",
    ()=>carTypeLabels,
    "disputeStatusLabels",
    ()=>disputeStatusLabels,
    "docTypeLabels",
    ()=>docTypeLabels,
    "formatMoney",
    ()=>formatMoney,
    "fuelTypeLabels",
    ()=>fuelTypeLabels,
    "handoverTypeLabels",
    ()=>handoverTypeLabels,
    "initials",
    ()=>initials,
    "kycStatusLabels",
    ()=>kycStatusLabels,
    "orderStatusLabels",
    ()=>orderStatusLabels,
    "orderStatusTone",
    ()=>orderStatusTone,
    "paymentMethodLabels",
    ()=>paymentMethodLabels,
    "paymentStatusLabels",
    ()=>paymentStatusLabels,
    "rentalTypeLabels",
    ()=>rentalTypeLabels,
    "toNumber",
    ()=>toNumber,
    "transactionStatusLabels",
    ()=>transactionStatusLabels,
    "transactionTypeLabels",
    ()=>transactionTypeLabels,
    "transmissionLabels",
    ()=>transmissionLabels,
    "verifyStatusLabels",
    ()=>verifyStatusLabels
]);
const vnd = new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0
});
function toNumber(value) {
    if (value === null || value === undefined || value === "") return 0;
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : 0;
}
const formatMoney = (value)=>`${vnd.format(Math.round(toNumber(value)))} đ`;
const carTypeLabels = {
    SEDAN: "Sedan",
    HATCHBACK: "Hatchback",
    SUV: "SUV",
    MPV: "MPV",
    PICKUP: "Bán tải",
    LUXURY: "Hạng sang",
    OTHER: "Khác"
};
const fuelTypeLabels = {
    GASOLINE: "Xăng",
    DIESEL: "Dầu",
    ELECTRIC: "Điện",
    HYBRID: "Hybrid"
};
const transmissionLabels = {
    AUTOMATIC: "Số tự động",
    MANUAL: "Số sàn"
};
const rentalTypeLabels = {
    HOURLY: "Theo giờ",
    DAILY: "Theo ngày",
    BOTH: "Giờ & ngày"
};
const orderStatusLabels = {
    PENDING: "Chờ chủ xe xác nhận",
    CONFIRMED: "Đã xác nhận",
    REJECTED: "Bị từ chối",
    EXPIRED: "Hết hạn",
    ONGOING: "Đang thuê",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy"
};
const orderStatusTone = {
    PENDING: "bg-[#FEF3C7] text-[#B45309]",
    CONFIRMED: "bg-[#DBEAFE] text-[#1D4ED8]",
    REJECTED: "bg-[#FEE2E2] text-[#B91C1C]",
    EXPIRED: "bg-[#F0F1EF] text-[#666666]",
    ONGOING: "bg-[#CCFBF1] text-[#0F766E]",
    COMPLETED: "bg-[#D1FAE5] text-[#047857]",
    CANCELLED: "bg-[#FEE2E2] text-[#B91C1C]"
};
const paymentStatusLabels = {
    UNPAID: "Chưa thanh toán",
    PAID: "Đã thanh toán",
    REFUNDED: "Đã hoàn tiền"
};
const transactionStatusLabels = {
    PENDING: "Đang chờ",
    SUCCESS: "Thành công",
    FAILED: "Thất bại",
    CANCELLED: "Đã hủy"
};
const transactionTypeLabels = {
    DEPOSIT: "Tiền cọc",
    RENTAL_PAYMENT: "Tiền thuê",
    EXTRA_FEE: "Phụ phí",
    REFUND: "Hoàn tiền"
};
const paymentMethodLabels = {
    VNPAY: "VNPay",
    MOMO: "MoMo",
    BANK_TRANSFER: "Chuyển khoản",
    CASH: "Tiền mặt"
};
const kycStatusLabels = {
    NONE: "Chưa xác minh",
    PENDING: "Đang xét duyệt",
    VERIFIED: "Đã xác minh",
    REJECTED: "Bị từ chối"
};
const verifyStatusLabels = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Bị từ chối"
};
const docTypeLabels = {
    CITIZEN_ID: "CCCD / CMND",
    DRIVER_LICENSE: "Giấy phép lái xe",
    PASSPORT: "Hộ chiếu"
};
const disputeStatusLabels = {
    OPEN: "Mới mở",
    IN_REVIEW: "Đang xem xét",
    RESOLVED: "Đã giải quyết",
    REJECTED: "Bác bỏ"
};
const handoverTypeLabels = {
    PICKUP: "Nhận xe",
    RETURN: "Trả xe"
};
function carName(item) {
    if (!item) return "Xe";
    if (item.carName) return item.carName;
    return [
        item.brand,
        item.model
    ].filter(Boolean).join(" ") || "Xe";
}
function initials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
const FALLBACK_CAR_IMAGE = "/images/cardb-02d5cb41aa8f9514.webp";
function carImage(item) {
    if (!item) return FALLBACK_CAR_IMAGE;
    if (item.primaryImageUrl) return item.primaryImageUrl;
    const images = Array.isArray(item.images) ? item.images : [];
    const primary = images.find((image)=>image.isPrimary || image.primary) ?? images[0];
    return primary?.imageUrl || FALLBACK_CAR_IMAGE;
}
}),
"[project]/src/lib/session.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearSession",
    ()=>clearSession,
    "currentUserId",
    ()=>currentUserId,
    "readSession",
    ()=>readSession,
    "saveSession",
    ()=>saveSession,
    "subscribeSession",
    ()=>subscribeSession,
    "updateSessionAccount",
    ()=>updateSessionAccount
]);
const STORAGE_KEY = "cardb:session:v2";
const EVENT = "cardb:session-change";
function canUseStorage() {
    return ("TURBOPACK compile-time value", "undefined") !== "undefined" && typeof window.localStorage !== "undefined";
}
function readSession() {
    if (!canUseStorage()) return null;
    //TURBOPACK unreachable
    ;
}
function saveSession(tokenResponse) {
    const session = {
        accessToken: tokenResponse.accessToken,
        tokenType: tokenResponse.tokenType || "Bearer",
        expiresAt: tokenResponse.expiresIn ? Date.now() + Number(tokenResponse.expiresIn) * 1000 : null,
        account: tokenResponse.account
    };
    if (canUseStorage()) //TURBOPACK unreachable
    ;
    return session;
}
function updateSessionAccount(patch) {
    const session = readSession();
    if (!session || !canUseStorage()) return;
    //TURBOPACK unreachable
    ;
}
function clearSession() {
    if (!canUseStorage()) return;
    //TURBOPACK unreachable
    ;
}
function subscribeSession(listener) {
    if ("TURBOPACK compile-time truthy", 1) return ()=>{};
    //TURBOPACK unreachable
    ;
    const onStorage = undefined;
}
function currentUserId() {
    return readSession()?.account?.id ?? null;
}
}),
"[project]/src/services/auth.service.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "changePassword",
    ()=>changePassword,
    "login",
    ()=>login,
    "logout",
    ()=>logout,
    "register",
    ()=>register
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/http.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session.js [app-ssr] (ecmascript)");
;
;
async function login({ email, password }) {
    const token = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/auth/login", {
        method: "POST",
        auth: false,
        json: {
            email: email.trim(),
            password
        }
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveSession"])(token);
}
function register({ fullName, email, phone, password }) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/auth/register", {
        method: "POST",
        auth: false,
        json: {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim().replace(/\s+/g, ""),
            password
        }
    });
}
function changePassword({ currentPassword, newPassword }) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/auth/change-password", {
        method: "POST",
        json: {
            currentPassword,
            newPassword
        }
    });
}
function logout() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearSession"])();
}
}),
"[project]/src/services/http.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ApiError",
    ()=>ApiError,
    "USE_MOCK_API",
    ()=>USE_MOCK_API,
    "fetchAllPages",
    ()=>fetchAllPages,
    "jsonBody",
    ()=>jsonBody,
    "mockResponse",
    ()=>mockResponse,
    "request",
    ()=>request,
    "toPage",
    ()=>toPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session.js [app-ssr] (ecmascript)");
;
/**
 * Mặc định gọi cùng origin `/api/...`; Next.js rewrite (next.config.mjs) chuyển tiếp sang backend.
 * Đặt `NEXT_PUBLIC_API_URL` nếu muốn gọi thẳng backend (khi đó backend phải mở CORS cho header X-User-Id).
 */ const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
class ApiError extends Error {
    status;
    code;
    fieldErrors;
    constructor(status, message, code, fieldErrors = []){
        super(message);
        this.status = status;
        this.code = code;
        this.fieldErrors = fieldErrors;
        this.name = "ApiError";
    }
}
function buildQuery(query) {
    if (!query) return "";
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)){
        if (value === undefined || value === null || value === "") continue;
        if (Array.isArray(value)) value.forEach((item)=>params.append(key, String(item)));
        else params.append(key, String(value));
    }
    const text = params.toString();
    return text ? `?${text}` : "";
}
const statusMessages = {
    400: "Dữ liệu gửi lên không hợp lệ.",
    401: "Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập.",
    403: "Bạn không có quyền thực hiện thao tác này.",
    404: "Không tìm thấy dữ liệu yêu cầu.",
    409: "Dữ liệu đã thay đổi hoặc bị trùng, vui lòng tải lại.",
    500: "Máy chủ gặp lỗi, vui lòng thử lại sau."
};
function errorFromBody(status, body) {
    const fieldErrors = Array.isArray(body?.errors) ? body.errors : [];
    const detail = fieldErrors.map((item)=>item?.message).filter(Boolean);
    const base = body?.message || body?.error || statusMessages[status] || `Lỗi ${status}`;
    const message = detail.length && !detail.includes(base) ? `${base}: ${detail.join("; ")}` : base;
    return new ApiError(status, message, body?.code, fieldErrors);
}
function unwrap(body) {
    if (body && typeof body === "object" && !Array.isArray(body) && "data" in body && ("success" in body || "status" in body || "message" in body)) return body.data;
    return body;
}
async function request(path, init = {}) {
    const { json, query, auth = true, headers: extraHeaders, ...rest } = init;
    const headers = {
        Accept: "application/json",
        ...extraHeaders
    };
    let body = rest.body;
    if (json !== undefined) {
        body = JSON.stringify(json);
        headers["Content-Type"] = "application/json";
    } else if (typeof body === "string" && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }
    const session = auth ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["readSession"])() : null;
    if (session) {
        headers.Authorization = `${session.tokenType || "Bearer"} ${session.accessToken}`;
        headers["X-User-Id"] = String(session.account.id);
    }
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
            ...rest,
            body,
            headers
        });
    } catch  {
        throw new ApiError(0, "Không kết nối được tới máy chủ backend. Kiểm tra backend đã chạy ở cổng 8080 chưa.");
    }
    const contentType = response.headers.get("content-type") || "";
    let payload;
    if (response.status !== 204) {
        if (contentType.includes("json")) {
            try {
                payload = await response.json();
            } catch  {
                payload = undefined;
            }
        } else {
            const text = await response.text();
            payload = text ? {
                message: text.length > 300 ? undefined : text
            } : undefined;
        }
    }
    if (!response.ok) {
        if (response.status === 401 && session) (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clearSession"])();
        if (response.status >= 500 && !payload?.message) throw new ApiError(response.status, response.status === 502 || response.status === 503 || response.status === 504 ? "Không kết nối được tới máy chủ backend. Kiểm tra backend đã chạy chưa." : statusMessages[500]);
        throw errorFromBody(response.status, payload);
    }
    return unwrap(payload);
}
const jsonBody = (value)=>JSON.stringify(value);
function mockResponse(value, delayMs = 200) {
    return new Promise((resolve)=>setTimeout(()=>resolve(structuredClone(value)), delayMs));
}
function toPage(data) {
    if (Array.isArray(data)) return {
        content: data,
        page: 0,
        size: data.length,
        totalElements: data.length,
        totalPages: 1
    };
    const content = data?.content ?? data?.items ?? [];
    return {
        content,
        page: data?.page ?? data?.number ?? 0,
        size: data?.size ?? content.length,
        totalElements: data?.totalElements ?? content.length,
        totalPages: data?.totalPages ?? 1
    };
}
async function fetchAllPages(path, query = {}, { pageSize = 100, maxPages = 20 } = {}) {
    const all = [];
    for(let page = 0; page < maxPages; page += 1){
        const result = toPage(await request(path, {
            query: {
                ...query,
                page,
                size: pageSize
            }
        }));
        all.push(...result.content);
        if (page + 1 >= result.totalPages || result.content.length === 0) break;
    }
    return all;
}
}),
]})(),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1x8n0op4jxmtk._.js.map