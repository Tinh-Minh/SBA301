(()=>{"use strict";module.exports = [
"[project]/src/components/date-field.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DateField",
    ()=>DateField,
    "DateTimeField",
    ()=>DateTimeField
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/datetime.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const dateMessage = "Nhập theo ngày/tháng/năm, ví dụ 07/06/2004";
const dateTimeMessage = "Nhập theo ngày/tháng/năm giờ:phút, ví dụ 07/06/2004 08:30";
function maskDate(raw) {
    const typed = String(raw).trim();
    const iso = typed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
    const loose = typed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (loose) return `${loose[1].padStart(2, "0")}/${loose[2].padStart(2, "0")}/${loose[3]}`;
    const digits = typed.replace(/\D/g, "").slice(0, 8);
    return [
        digits.slice(0, 2),
        digits.slice(2, 4),
        digits.slice(4, 8)
    ].filter(Boolean).join("/");
}
function maskDateTime(raw) {
    const typed = String(raw).trim();
    const iso = typed.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (iso) return `${iso[3]}/${iso[2]}/${iso[1]} ${iso[4]}:${iso[5]}`;
    const loose = typed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2})$/);
    if (loose) return `${loose[1].padStart(2, "0")}/${loose[2].padStart(2, "0")}/${loose[3]} ${loose[4].padStart(2, "0")}:${loose[5]}`;
    const digits = typed.replace(/\D/g, "").slice(0, 12);
    let text = [
        digits.slice(0, 2),
        digits.slice(2, 4),
        digits.slice(4, 8)
    ].filter(Boolean).join("/");
    if (digits.length > 8) text += ` ${digits.slice(8, 10)}`;
    if (digits.length > 10) text += `:${digits.slice(10, 12)}`;
    return text;
}
const CalendarInput = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(function CalendarInput({ value, onChange, className, required, id, name, withTime = false }, ref) {
    const format = withTime ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatInputDateTime"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatInputDate"];
    const parse = withTime ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseInputDateTime"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["parseInputDate"];
    const mask = withTime ? maskDateTime : maskDate;
    const message = withTime ? dateTimeMessage : dateMessage;
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>format(value));
    const [focused, setFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (focused) return;
        setText((current)=>!value && current.trim() ? current : format(value));
    }, [
        value,
        focused,
        format
    ]);
    function commit(raw, input) {
        const next = mask(raw);
        setText(next);
        const iso = parse(next);
        if (!next) {
            input.setCustomValidity("");
            onChange({
                target: {
                    value: ""
                }
            });
            return;
        }
        if (iso) {
            input.setCustomValidity("");
            onChange({
                target: {
                    value: iso
                }
            });
            return;
        }
        input.setCustomValidity(message);
        onChange({
            target: {
                value: ""
            }
        });
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        ref: ref,
        id: id,
        name: name,
        required: required,
        type: "text",
        inputMode: "numeric",
        autoComplete: "bday",
        placeholder: withTime ? "dd/mm/yyyy hh:mm" : "dd/mm/yyyy",
        title: message,
        value: text,
        onFocus: ()=>setFocused(true),
        onBlur: (event)=>{
            setFocused(false);
            if (!parse(text) && text.trim()) event.target.reportValidity();
        },
        onChange: (event)=>commit(event.target.value, event.target),
        className: className
    }, void 0, false, {
        fileName: "[project]/src/components/date-field.jsx",
        lineNumber: 66,
        columnNumber: 12
    }, this);
});
const DateField = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(function DateField(props, ref) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarInput, {
        ...props,
        ref: ref
    }, void 0, false, {
        fileName: "[project]/src/components/date-field.jsx",
        lineNumber: 71,
        columnNumber: 12
    }, this);
});
const DateTimeField = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["forwardRef"])(function DateTimeField(props, ref) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarInput, {
        ...props,
        withTime: true,
        ref: ref
    }, void 0, false, {
        fileName: "[project]/src/components/date-field.jsx",
        lineNumber: 75,
        columnNumber: 12
    }, this);
});
}),
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
"[project]/src/components/profile-layout.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileLayout",
    ()=>ProfileLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$profile$2d$sidebar$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/profile-sidebar.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$require$2d$auth$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/require-auth.jsx [app-ssr] (ecmascript)");
;
;
;
;
;
;
const labels = {
    account: "Hồ sơ cá nhân",
    verification: "Hồ sơ định danh eKYC",
    driver: "Hồ sơ tài xế",
    banks: "Tài khoản ngân hàng",
    orders: "Quản lý đơn thuê",
    history: "Lịch sử chuyến đi"
};
function ProfileLayout({ active, title, description, actions, children, live = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        "data-native": live ? "" : undefined,
        className: "profile-layout w-full bg-background pt-20",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-7xl mx-auto px-margin-mobile md:px-margin py-space-lg",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                    "aria-label": "Đường dẫn hồ sơ",
                    className: "flex flex-wrap items-center gap-space-xs mb-space-md text-on-surface-variant font-body-sm text-body-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            className: "hover:text-primary-container transition-colors",
                            children: "Trang chủ"
                        }, void 0, false, {
                            fileName: "[project]/src/components/profile-layout.jsx",
                            lineNumber: 19,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                            name: "chevron_right",
                            className: "text-base text-outline"
                        }, void 0, false, {
                            fileName: "[project]/src/components/profile-layout.jsx",
                            lineNumber: 20,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            href: "/account",
                            className: "hover:text-primary-container transition-colors",
                            children: "Hồ sơ & Tài khoản"
                        }, void 0, false, {
                            fileName: "[project]/src/components/profile-layout.jsx",
                            lineNumber: 21,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                            name: "chevron_right",
                            className: "text-base text-outline"
                        }, void 0, false, {
                            fileName: "[project]/src/components/profile-layout.jsx",
                            lineNumber: 22,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            "aria-current": "page",
                            className: "text-on-surface font-label-sm text-label-sm",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/src/components/profile-layout.jsx",
                            lineNumber: 23,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/profile-layout.jsx",
                    lineNumber: 18,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "profile-heading flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "min-w-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-space-xs mb-space-xs",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-label-sm uppercase tracking-wider",
                                        children: labels[active]
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/profile-layout.jsx",
                                        lineNumber: 28,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/profile-layout.jsx",
                                    lineNumber: 27,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "font-headline-lg text-headline-lg text-on-surface tracking-tight",
                                    children: title
                                }, void 0, false, {
                                    fileName: "[project]/src/components/profile-layout.jsx",
                                    lineNumber: 30,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-body-md text-body-md text-on-surface-variant mt-space-xs max-w-2xl",
                                    children: description
                                }, void 0, false, {
                                    fileName: "[project]/src/components/profile-layout.jsx",
                                    lineNumber: 31,
                                    columnNumber: 11
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/profile-layout.jsx",
                            lineNumber: 26,
                            columnNumber: 9
                        }, this),
                        actions ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "profile-heading-actions shrink-0 md:max-w-[35%]",
                            children: actions
                        }, void 0, false, {
                            fileName: "[project]/src/components/profile-layout.jsx",
                            lineNumber: 33,
                            columnNumber: 20
                        }, this) : null
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/profile-layout.jsx",
                    lineNumber: 25,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "profile-columns grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$profile$2d$sidebar$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProfileSidebar"], {
                            active: active,
                            className: "lg:col-span-4 xl:col-span-3"
                        }, void 0, false, {
                            fileName: "[project]/src/components/profile-layout.jsx",
                            lineNumber: 36,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                            className: "profile-content min-w-0 lg:col-span-8 xl:col-span-9 flex flex-col gap-space-lg",
                            "data-purpose": active === "banks" ? "bank-account-content" : "profile-content",
                            children: live ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$require$2d$auth$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RequireAuth"], {
                                children: children
                            }, void 0, false, {
                                fileName: "[project]/src/components/profile-layout.jsx",
                                lineNumber: 38,
                                columnNumber: 19
                            }, this) : children
                        }, void 0, false, {
                            fileName: "[project]/src/components/profile-layout.jsx",
                            lineNumber: 37,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/profile-layout.jsx",
                    lineNumber: 35,
                    columnNumber: 7
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/profile-layout.jsx",
            lineNumber: 17,
            columnNumber: 5
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/profile-layout.jsx",
        lineNumber: 16,
        columnNumber: 12
    }, this);
}
}),
"[project]/src/components/profile-sidebar.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ProfileSidebar",
    ()=>ProfileSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/auth-provider.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/icon.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/labels.js [app-ssr] (ecmascript)");
"use client";
;
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
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2d$provider$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
        className: `space-y-4 ${className}`,
        "data-purpose": "account-sidebar",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative overflow-hidden rounded-xl bg-surface-container-lowest p-4 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pointer-events-none absolute -top-4 -right-4 size-24 rounded-full bg-gradient-to-br from-primary-container/10 to-transparent blur-xl"
                    }, void 0, false, {
                        fileName: "[project]/src/components/profile-sidebar.jsx",
                        lineNumber: 23,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex size-14 shrink-0 items-center justify-center rounded-full bg-[#FFF2EB] text-lg font-bold text-[#FC6C26] ring-2 ring-primary-container/20",
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initials"])(user?.fullName)
                            }, void 0, false, {
                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                lineNumber: 25,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "min-w-0 flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "truncate text-sm font-semibold text-on-surface",
                                        children: user?.fullName ?? "Khách"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/profile-sidebar.jsx",
                                        lineNumber: 26,
                                        columnNumber: 41
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-0.5 text-xs text-on-surface-variant",
                                        children: user ? `Mã khách hàng #${user.id}` : "Chưa đăng nhập"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/profile-sidebar.jsx",
                                        lineNumber: 26,
                                        columnNumber: 136
                                    }, this),
                                    user?.role === "ADMIN" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "mt-1.5 inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-2 py-0.5 text-[10px] font-semibold text-on-secondary-fixed",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                "aria-label": "Hồ sơ và tài khoản",
                className: "space-y-4 rounded-xl bg-surface-container-lowest p-2 shadow-sm",
                children: groups.map((group)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant",
                                children: group.title
                            }, void 0, false, {
                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                lineNumber: 30,
                                columnNumber: 51
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: group.links.map((link)=>{
                                    const selected = link.section === active;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                        href: link.href,
                                        "aria-current": selected ? "page" : undefined,
                                        className: `group flex items-center gap-2 rounded-lg px-4 py-2.5 transition-colors ${selected ? "bg-primary-fixed/50 font-semibold text-primary-container shadow-sm" : "text-on-surface hover:bg-surface-container-low"}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
                                                name: link.icon,
                                                className: `shrink-0 text-[20px] ${selected ? "text-primary-container" : "text-outline group-hover:text-primary-container"}`
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                                lineNumber: 32,
                                                columnNumber: 327
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "min-w-0 flex-1 whitespace-nowrap text-sm",
                                                children: link.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                                lineNumber: 32,
                                                columnNumber: 477
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3 rounded-xl bg-gradient-to-br from-surface-container-low to-surface-container p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "flex size-10 items-center justify-center rounded-lg bg-surface-container-lowest text-primary-container shadow-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-semibold text-on-surface",
                                children: "Cần trợ giúp xác minh?"
                            }, void 0, false, {
                                fileName: "[project]/src/components/profile-sidebar.jsx",
                                lineNumber: 37,
                                columnNumber: 12
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "tel:19008899",
                        className: "flex items-center justify-between rounded-lg bg-surface-container-lowest p-3 text-primary-container shadow-sm transition-colors hover:bg-surface-bright",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex flex-col gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[10px] font-semibold uppercase text-on-surface-variant",
                                        children: "Tổng đài 24/7"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/profile-sidebar.jsx",
                                        lineNumber: 38,
                                        columnNumber: 232
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
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
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$icon$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Icon"], {
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
"[project]/src/services/customer.service.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getCustomer",
    ()=>getCustomer,
    "getCustomerKyc",
    ()=>getCustomerKyc,
    "getMyKyc",
    ()=>getMyKyc,
    "getMyProfile",
    ()=>getMyProfile,
    "listCustomers",
    ()=>listCustomers,
    "updateCustomerStatus",
    ()=>updateCustomerStatus,
    "updateMyProfile",
    ()=>updateMyProfile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/http.js [app-ssr] (ecmascript)");
;
const getMyProfile = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/customers/me");
const getMyKyc = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/customers/me/kyc");
function updateMyProfile({ fullName, dateOfBirth, address, email, phone, avatarUrl }) {
    const json = {};
    if (fullName !== undefined) json.fullName = fullName;
    if (dateOfBirth !== undefined) json.dateOfBirth = dateOfBirth || null;
    if (address !== undefined) json.address = address;
    if (email !== undefined) json.email = email.trim();
    if (phone !== undefined) json.phone = phone.trim().replace(/\s+/g, "");
    if (avatarUrl !== undefined) json.avatarUrl = avatarUrl?.trim() ? avatarUrl.trim() : null;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/customers/me", {
        method: "PATCH",
        json
    });
}
async function listCustomers({ status, kycStatus, keyword, page = 0, size = 20, sort = "createdAt,desc" } = {}) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toPage"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])("/api/customers", {
        query: {
            status,
            kycStatus,
            keyword,
            page,
            size,
            sort
        }
    }));
}
const getCustomer = (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/customers/${id}`);
const getCustomerKyc = (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/customers/${id}/kyc`);
const updateCustomerStatus = (id, status, reason)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["request"])(`/api/customers/${id}/status`, {
        method: "PATCH",
        json: {
            status,
            reason
        }
    });
}),
"[project]/src/views/live/AccountLive.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AccountLive
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$date$2d$field$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/date-field.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$profile$2d$layout$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/profile-layout.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/live-ui.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$async$2d$resource$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-async-resource.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/datetime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/labels.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/auth.service.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$customer$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/customer.service.js [app-ssr] (ecmascript)");
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
;
function AccountLive() {
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        const [profile, kyc] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$customer$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMyProfile"])(),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$customer$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMyKyc"])().catch(()=>null)
        ]);
        return {
            profile,
            kyc
        };
    }, []);
    const detail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$async$2d$resource$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAsyncResource"])(load, "me");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$profile$2d$layout$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ProfileLayout"], {
        live: true,
        active: "account",
        title: "Hồ sơ cá nhân",
        description: "Thông tin dùng cho hợp đồng thuê và bàn giao xe. Email và số điện thoại phải còn duy nhất trong hệ thống.",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LiveState"], {
                loading: detail.loading && !detail.data,
                error: detail.error,
                label: "hồ sơ",
                onRetry: detail.reload
            }, void 0, false, {
                fileName: "[project]/src/views/live/AccountLive.jsx",
                lineNumber: 20,
                columnNumber: 5
            }, this),
            detail.data ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Editor, {
                profile: detail.data.profile,
                kyc: detail.data.kyc,
                onSaved: detail.reload
            }, void 0, false, {
                fileName: "[project]/src/views/live/AccountLive.jsx",
                lineNumber: 21,
                columnNumber: 20
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/views/live/AccountLive.jsx",
        lineNumber: 19,
        columnNumber: 12
    }, this);
}
function Editor({ profile, kyc, onSaved }) {
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [fullName, setFullName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(profile.fullName ?? "");
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(profile.email ?? "");
    const [phone, setPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(profile.phone ?? "");
    const [avatarUrl, setAvatarUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(profile.avatarUrl ?? "");
    const [dateOfBirth, setDob] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toLocalDate"])(profile.dateOfBirth) ?? "");
    const birthDate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [address, setAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(profile.address ?? "");
    const [currentPassword, setCurrentPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [newPassword, setNewPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const save = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$async$2d$resource$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAsyncAction"])(async ()=>{
        if (birthDate.current && !birthDate.current.reportValidity()) return;
        const updated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$customer$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateMyProfile"])({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            avatarUrl: avatarUrl.trim(),
            dateOfBirth: dateOfBirth || null,
            address: address.trim()
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateSessionAccount"])({
            fullName: updated.fullName ?? fullName.trim()
        });
        setEditing(false);
        onSaved();
    });
    const [passwordNote, setPasswordNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const password = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$async$2d$resource$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAsyncAction"])(async ()=>{
        setPasswordNote("");
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$auth$2e$service$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["changePassword"])({
            currentPassword,
            newPassword
        });
        setCurrentPassword("");
        setNewPassword("");
        setPasswordNote("Đã đổi mật khẩu.");
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg font-bold",
                                        children: "Thông tin cá nhân"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/live/AccountLive.jsx",
                                        lineNumber: 62,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-[#666666]",
                                        children: [
                                            "Mã khách hàng #",
                                            profile.id,
                                            " • tham gia ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDate"])(profile.createdAt)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/live/AccountLive.jsx",
                                        lineNumber: 63,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/live/AccountLive.jsx",
                                lineNumber: 61,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setEditing((value)=>!value),
                                className: "rounded-xl border border-[#E9E9E7] px-4 py-2 text-sm font-bold",
                                children: editing ? "Đóng" : "Chỉnh sửa"
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/AccountLive.jsx",
                                lineNumber: 65,
                                columnNumber: 7
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/AccountLive.jsx",
                        lineNumber: 60,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("dl", {
                        className: "grid gap-3 sm:grid-cols-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: "Họ và tên",
                                children: editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    value: fullName,
                                    onChange: (event)=>setFullName(event.target.value),
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fieldClass"]
                                }, void 0, false, {
                                    fileName: "[project]/src/views/live/AccountLive.jsx",
                                    lineNumber: 68,
                                    columnNumber: 43
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                    children: profile.fullName
                                }, void 0, false, {
                                    fileName: "[project]/src/views/live/AccountLive.jsx",
                                    lineNumber: 68,
                                    columnNumber: 146
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/AccountLive.jsx",
                                lineNumber: 68,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: "Email",
                                children: editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "email",
                                    value: email,
                                    onChange: (event)=>setEmail(event.target.value),
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fieldClass"]
                                }, void 0, false, {
                                    fileName: "[project]/src/views/live/AccountLive.jsx",
                                    lineNumber: 69,
                                    columnNumber: 39
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        profile.email,
                                        " ",
                                        profile.emailVerified ? "• đã xác thực" : ""
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/views/live/AccountLive.jsx",
                                    lineNumber: 69,
                                    columnNumber: 149
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/AccountLive.jsx",
                                lineNumber: 69,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: "Số điện thoại",
                                children: editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    value: phone,
                                    onChange: (event)=>setPhone(event.target.value),
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fieldClass"],
                                    placeholder: "09xxxxxxxx"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/live/AccountLive.jsx",
                                    lineNumber: 70,
                                    columnNumber: 47
                                }, this) : profile.phone || "—"
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/AccountLive.jsx",
                                lineNumber: 70,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: "Ngày sinh",
                                children: editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$date$2d$field$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DateField"], {
                                    ref: birthDate,
                                    value: dateOfBirth,
                                    onChange: (event)=>setDob(event.target.value),
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fieldClass"]
                                }, void 0, false, {
                                    fileName: "[project]/src/views/live/AccountLive.jsx",
                                    lineNumber: 71,
                                    columnNumber: 43
                                }, this) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDate"])(profile.dateOfBirth)
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/AccountLive.jsx",
                                lineNumber: 71,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: "Trạng thái tài khoản",
                                children: profile.status === "LOCKED" ? "Bị khóa" : "Đang hoạt động"
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/AccountLive.jsx",
                                lineNumber: 72,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                label: "KYC",
                                children: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["kycStatusLabels"][kyc?.kycStatus] ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["kycStatusLabels"][profile.kycStatus] ?? "—",
                                    kyc?.evaluatedOn ? ` • ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDate"])(kyc.evaluatedOn)}` : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/live/AccountLive.jsx",
                                lineNumber: 73,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sm:col-span-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                    label: "Địa chỉ",
                                    children: editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: address,
                                        onChange: (event)=>setAddress(event.target.value),
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fieldClass"]
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/live/AccountLive.jsx",
                                        lineNumber: 74,
                                        columnNumber: 72
                                    }, this) : profile.address || "Chưa cập nhật"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/live/AccountLive.jsx",
                                    lineNumber: 74,
                                    columnNumber: 38
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/AccountLive.jsx",
                                lineNumber: 74,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sm:col-span-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                    label: "Ảnh đại diện (URL)",
                                    children: editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        value: avatarUrl,
                                        onChange: (event)=>setAvatarUrl(event.target.value),
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fieldClass"],
                                        placeholder: "https://..."
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/live/AccountLive.jsx",
                                        lineNumber: 75,
                                        columnNumber: 83
                                    }, this) : profile.avatarUrl || "Chưa có"
                                }, void 0, false, {
                                    fileName: "[project]/src/views/live/AccountLive.jsx",
                                    lineNumber: 75,
                                    columnNumber: 38
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/AccountLive.jsx",
                                lineNumber: 75,
                                columnNumber: 7
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/AccountLive.jsx",
                        lineNumber: 67,
                        columnNumber: 5
                    }, this),
                    save.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-[#B91C1C]",
                        children: save.error.message
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/AccountLive.jsx",
                        lineNumber: 77,
                        columnNumber: 19
                    }, this) : null,
                    editing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Primary"], {
                        disabled: save.running || fullName.trim().length < 2,
                        onClick: ()=>void save.run(),
                        children: save.running ? "Đang lưu…" : "Lưu thay đổi"
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/AccountLive.jsx",
                        lineNumber: 78,
                        columnNumber: 16
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/live/AccountLive.jsx",
                lineNumber: 59,
                columnNumber: 49
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-lg font-bold",
                        children: "Đổi mật khẩu"
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/AccountLive.jsx",
                        lineNumber: 81,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-3 sm:grid-cols-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-semibold text-[#666666]",
                                children: [
                                    "Mật khẩu hiện tại",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "password",
                                        value: currentPassword,
                                        onChange: (event)=>setCurrentPassword(event.target.value),
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fieldClass"]} mt-1`
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/live/AccountLive.jsx",
                                        lineNumber: 83,
                                        columnNumber: 80
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/live/AccountLive.jsx",
                                lineNumber: 83,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "text-xs font-semibold text-[#666666]",
                                children: [
                                    "Mật khẩu mới",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "password",
                                        value: newPassword,
                                        onChange: (event)=>setNewPassword(event.target.value),
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fieldClass"]} mt-1`
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/live/AccountLive.jsx",
                                        lineNumber: 84,
                                        columnNumber: 75
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/live/AccountLive.jsx",
                                lineNumber: 84,
                                columnNumber: 7
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/AccountLive.jsx",
                        lineNumber: 82,
                        columnNumber: 5
                    }, this),
                    password.error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-[#B91C1C]",
                        children: password.error.message
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/AccountLive.jsx",
                        lineNumber: 86,
                        columnNumber: 23
                    }, this) : passwordNote ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-[#166534]",
                        children: passwordNote
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/AccountLive.jsx",
                        lineNumber: 86,
                        columnNumber: 107
                    }, this) : null,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Primary"], {
                        disabled: password.running || !currentPassword || newPassword.length < 8,
                        onClick: ()=>void password.run(),
                        children: password.running ? "Đang đổi…" : "Cập nhật mật khẩu"
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/AccountLive.jsx",
                        lineNumber: 87,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/live/AccountLive.jsx",
                lineNumber: 80,
                columnNumber: 3
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/views/live/AccountLive.jsx",
        lineNumber: 59,
        columnNumber: 12
    }, this);
}
function Field({ label, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-xl bg-[#F7F7F5] p-3 text-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[11px] font-bold uppercase text-[#666666]",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/views/live/AccountLive.jsx",
                lineNumber: 92,
                columnNumber: 65
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-1 font-semibold text-[#292929]",
                children: children
            }, void 0, false, {
                fileName: "[project]/src/views/live/AccountLive.jsx",
                lineNumber: 92,
                columnNumber: 138
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/views/live/AccountLive.jsx",
        lineNumber: 92,
        columnNumber: 12
    }, this);
}
}),
];})()

//# sourceMappingURL=src_0rqe4xb5akcd4._.js.map