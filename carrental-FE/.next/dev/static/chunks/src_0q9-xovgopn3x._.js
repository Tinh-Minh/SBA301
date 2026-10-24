(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/date-field.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DateField",
    ()=>DateField,
    "DateTimeField",
    ()=>DateTimeField
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/datetime.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
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
const CalendarInput = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_s(function CalendarInput({ value, onChange, className, required, id, name, withTime = false }, ref) {
    _s();
    const format = withTime ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatInputDateTime"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatInputDate"];
    const parse = withTime ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseInputDateTime"] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseInputDate"];
    const mask = withTime ? maskDateTime : maskDate;
    const message = withTime ? dateTimeMessage : dateMessage;
    const [text, setText] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "CalendarInput.CalendarInput.useState": ()=>format(value)
    }["CalendarInput.CalendarInput.useState"]);
    const [focused, setFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CalendarInput.CalendarInput.useEffect": ()=>{
            if (focused) return;
            setText({
                "CalendarInput.CalendarInput.useEffect": (current)=>!value && current.trim() ? current : format(value)
            }["CalendarInput.CalendarInput.useEffect"]);
        }
    }["CalendarInput.CalendarInput.useEffect"], [
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
}, "GYak2txC4BvQ2779OEo+dHp9HYU="));
_c = CalendarInput;
const DateField = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c1 = function DateField(props, ref) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarInput, {
        ...props,
        ref: ref
    }, void 0, false, {
        fileName: "[project]/src/components/date-field.jsx",
        lineNumber: 71,
        columnNumber: 12
    }, this);
});
_c2 = DateField;
const DateTimeField = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(_c3 = function DateTimeField(props, ref) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CalendarInput, {
        ...props,
        withTime: true,
        ref: ref
    }, void 0, false, {
        fileName: "[project]/src/components/date-field.jsx",
        lineNumber: 75,
        columnNumber: 12
    }, this);
});
_c4 = DateTimeField;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "CalendarInput");
__turbopack_context__.k.register(_c1, "DateField$forwardRef");
__turbopack_context__.k.register(_c2, "DateField");
__turbopack_context__.k.register(_c3, "DateTimeField$forwardRef");
__turbopack_context__.k.register(_c4, "DateTimeField");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/live-ui.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function LivePage({ children, width = "max-w-6xl" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        "data-native": true,
        className: "w-full bg-[#F7F7F5] pt-24 pb-16",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
_c = LivePage;
const fieldClass = "w-full rounded-xl border border-[#E9E9E7] bg-white px-3 py-2 text-sm text-[#292929]";
function LiveState({ loading, error, empty, label = "dữ liệu", onRetry }) {
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap items-center gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-5 text-sm text-[#B91C1C]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: error.message
            }, void 0, false, {
                fileName: "[project]/src/components/live-ui.jsx",
                lineNumber: 16,
                columnNumber: 7
            }, this),
            onRetry ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
    if (empty) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
_c1 = LiveState;
function Primary({ children, disabled, type = "button", onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
_c2 = Primary;
function Pill({ children, className = "" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/live-ui.jsx",
        lineNumber: 29,
        columnNumber: 12
    }, this);
}
_c3 = Pill;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "LivePage");
__turbopack_context__.k.register(_c1, "LiveState");
__turbopack_context__.k.register(_c2, "Primary");
__turbopack_context__.k.register(_c3, "Pill");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-async-resource.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAsyncAction",
    ()=>useAsyncAction,
    "useAsyncResource",
    ()=>useAsyncResource
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
function useAsyncResource(load, key = "") {
    _s();
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        loading: true
    });
    const [version, setVersion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useAsyncResource.useEffect": ()=>{
            let cancelled = false;
            setState({
                "useAsyncResource.useEffect": (current)=>({
                        ...current,
                        loading: true,
                        error: undefined
                    })
            }["useAsyncResource.useEffect"]);
            load().then({
                "useAsyncResource.useEffect": (data)=>{
                    if (!cancelled) setState({
                        data,
                        loading: false
                    });
                }
            }["useAsyncResource.useEffect"], {
                "useAsyncResource.useEffect": (error)=>{
                    if (!cancelled) setState({
                        "useAsyncResource.useEffect": (current)=>({
                                ...current,
                                loading: false,
                                error: error instanceof Error ? error : new Error(String(error))
                            })
                    }["useAsyncResource.useEffect"]);
                }
            }["useAsyncResource.useEffect"]);
            return ({
                "useAsyncResource.useEffect": ()=>{
                    cancelled = true;
                }
            })["useAsyncResource.useEffect"];
        }
    }["useAsyncResource.useEffect"], [
        key,
        version
    ]);
    const reload = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAsyncResource.useCallback[reload]": ()=>setVersion({
                "useAsyncResource.useCallback[reload]": (value)=>value + 1
            }["useAsyncResource.useCallback[reload]"])
    }["useAsyncResource.useCallback[reload]"], []);
    return {
        ...state,
        reload
    };
}
_s(useAsyncResource, "v1eumM0wJFPGrx+3+skczVWBglQ=");
function useAsyncAction(action, onSuccess) {
    _s1();
    const [running, setRunning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])();
    const run = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAsyncAction.useCallback[run]": async (...args)=>{
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
        }
    }["useAsyncAction.useCallback[run]"], [
        action,
        onSuccess
    ]);
    return {
        run,
        running,
        error
    };
}
_s1(useAsyncAction, "E6M2sQMFQOP9aaZtFRTkiP/36dU=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/datetime.js [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/adapters.js [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/datetime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/labels.js [app-client] (ecmascript)");
;
;
const isoOrNull = (value)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseDate"])(value)?.toISOString() ?? null;
const money = (value)=>Math.round((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toNumber"])(value));
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
        quantity: Math.max(1, Math.round((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toNumber"])(order.quantity))),
        rentalAmount: money(order.rentalAmount),
        discountAmount: money(order.discountAmount),
        totalAmount: money(order.totalAmount),
        depositAmount: money(order.depositAmount),
        commissionRate: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toNumber"])(order.commissionRate ?? 10)
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
        odometerKm: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toNumber"])(handover.odometerKm),
        fuelPercent: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toNumber"])(handover.fuelPercent),
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/services/slot.service.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "slotService",
    ()=>slotService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/datetime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/http.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/adapters.js [app-client] (ecmascript)");
;
;
;
const slotService = {
    /** GET /api/slots/search — các khung giờ OPEN mà khách có thể đặt. */ async search ({ city, carType, seats, maxPricePerHour, maxPricePerDay, rentalType, startTime, endTime, page = 0, size = 12 } = {}) {
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toPage"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["request"])("/api/slots/search", {
            query: {
                city,
                carType,
                seats,
                maxPricePerHour,
                maxPricePerDay,
                rentalType,
                startTime: startTime ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toLocalIso"])(startTime) : undefined,
                endTime: endTime ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toLocalIso"])(endTime) : undefined,
                page,
                size
            }
        }));
        return {
            ...result,
            content: result.content.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeSlot"])
        };
    },
    /** GET /api/slots/{id} */ getById: async (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeSlot"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["request"])(`/api/slots/${id}`)),
    /** GET /api/slots/car/{carId} (chủ xe) */ listByCar: async (carId)=>(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fetchAllPages"])(`/api/slots/car/${carId}`, {}, {
            pageSize: 100
        })).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeSlot"]),
    /** POST /api/slots */ create: async ({ carId, startTime, endTime, rentalOption, minRentalHours, customPricePerHour, customPricePerDay })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeSlot"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["request"])("/api/slots", {
            method: "POST",
            json: {
                carId,
                startTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toLocalIso"])(startTime),
                endTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toLocalIso"])(endTime),
                rentalOption,
                minRentalHours: minRentalHours ? Number(minRentalHours) : null,
                customPricePerHour: customPricePerHour ? Number(customPricePerHour) : null,
                customPricePerDay: customPricePerDay ? Number(customPricePerDay) : null
            }
        })),
    close: async (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeSlot"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["request"])(`/api/slots/${id}/close`, {
            method: "PATCH"
        })),
    cancel: async (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeSlot"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["request"])(`/api/slots/${id}/cancel`, {
            method: "PATCH"
        })),
    reopen: async (id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$adapters$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizeSlot"])(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$http$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["request"])(`/api/slots/${id}/reopen`, {
            method: "PATCH"
        }))
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/views/live/ExploreCars.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ExploreCars
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$date$2d$field$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/date-field.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/live-ui.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$async$2d$resource$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-async-resource.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/datetime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/labels.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$slot$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/slot.service.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
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
const carTypes = [
    "",
    "SEDAN",
    "SUV",
    "HATCHBACK",
    "MPV",
    "PICKUP",
    "LUXURY",
    "OTHER"
];
function initialFilters(params) {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(8, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    end.setHours(20, 0, 0, 0);
    return {
        city: params.get("city") || params.get("location") || "",
        carType: params.get("carType") || "",
        seats: params.get("seats") || "",
        rentalType: params.get("type") || "",
        startTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseQueryDateTime"])(params.get("start")) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toInputDateTime"])(start),
        endTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["parseQueryDateTime"])(params.get("end")) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toInputDateTime"])(end),
        maxPricePerDay: params.get("maxPricePerDay") || ""
    };
}
function ExploreCars() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LivePage"], {
        width: "max-w-7xl",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Explorer, {}, void 0, false, {
            fileName: "[project]/src/views/live/ExploreCars.jsx",
            lineNumber: 34,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/views/live/ExploreCars.jsx",
        lineNumber: 33,
        columnNumber: 12
    }, this);
}
_c = ExploreCars;
function Explorer() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "Explorer.useState": ()=>initialFilters(params)
    }["Explorer.useState"]);
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(form);
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "Explorer.useCallback[load]": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$slot$2e$service$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["slotService"].search({
                city: query.city || undefined,
                carType: query.carType || undefined,
                seats: query.seats ? Number(query.seats) : undefined,
                rentalType: query.rentalType || undefined,
                startTime: query.startTime ? new Date(query.startTime) : undefined,
                endTime: query.endTime ? new Date(query.endTime) : undefined,
                maxPricePerDay: query.maxPricePerDay ? Number(query.maxPricePerDay) : undefined,
                page,
                size: 12
            })
    }["Explorer.useCallback[load]"], [
        query,
        page
    ]);
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$async$2d$resource$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAsyncResource"])(load, JSON.stringify({
        query,
        page
    }));
    const rows = result.data?.content ?? [];
    const update = (key)=>(event)=>setForm((current)=>({
                    ...current,
                    [key]: event.target.value
                }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[11px] font-bold uppercase tracking-wide text-[#666666]",
                        children: "Thuê xe tự lái"
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 59,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "mt-1 text-2xl font-bold text-[#292929]",
                        children: "Khám phá xe đang trống lịch"
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 60,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-sm text-[#666666]",
                        children: "Chỉ hiện các khung giờ chủ xe đang mở. Chọn xe để xem giá và gửi yêu cầu thuê."
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 61,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/live/ExploreCars.jsx",
                lineNumber: 58,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                className: "grid gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4",
                onSubmit: (event)=>{
                    event.preventDefault();
                    if (!event.currentTarget.reportValidity()) return;
                    setPage(0);
                    setQuery(form);
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-semibold text-[#666666]",
                        children: [
                            "Thành phố",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: form.city,
                                onChange: update("city"),
                                placeholder: "Hồ Chí Minh",
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fieldClass"]} mt-1`
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/ExploreCars.jsx",
                                lineNumber: 65,
                                columnNumber: 72
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 65,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-semibold text-[#666666]",
                        children: [
                            "Loại xe",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: form.carType,
                                onChange: update("carType"),
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fieldClass"]} mt-1`,
                                children: carTypes.map((type)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: type,
                                        children: type ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["carTypeLabels"][type] : "Tất cả"
                                    }, type || "all", false, {
                                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                                        lineNumber: 67,
                                        columnNumber: 122
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/ExploreCars.jsx",
                                lineNumber: 67,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 66,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-semibold text-[#666666]",
                        children: [
                            "Số chỗ tối thiểu",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                min: "2",
                                max: "16",
                                value: form.seats,
                                onChange: update("seats"),
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fieldClass"]} mt-1`
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/ExploreCars.jsx",
                                lineNumber: 69,
                                columnNumber: 79
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 69,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-semibold text-[#666666]",
                        children: [
                            "Hình thức",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                value: form.rentalType,
                                onChange: update("rentalType"),
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fieldClass"]} mt-1`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "Giờ hoặc ngày"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                                        lineNumber: 71,
                                        columnNumber: 106
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "HOURLY",
                                        children: "Theo giờ"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                                        lineNumber: 71,
                                        columnNumber: 145
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "DAILY",
                                        children: "Theo ngày"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                                        lineNumber: 71,
                                        columnNumber: 185
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/live/ExploreCars.jsx",
                                lineNumber: 71,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 70,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-semibold text-[#666666]",
                        children: [
                            "Nhận xe",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$date$2d$field$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DateTimeField"], {
                                value: form.startTime,
                                onChange: update("startTime"),
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fieldClass"]} mt-1`
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/ExploreCars.jsx",
                                lineNumber: 73,
                                columnNumber: 70
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 73,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-semibold text-[#666666]",
                        children: [
                            "Trả xe",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$date$2d$field$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DateTimeField"], {
                                value: form.endTime,
                                onChange: update("endTime"),
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fieldClass"]} mt-1`
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/ExploreCars.jsx",
                                lineNumber: 74,
                                columnNumber: 69
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 74,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-semibold text-[#666666]",
                        children: [
                            "Giá ngày tối đa (đ)",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                min: "0",
                                step: "10000",
                                value: form.maxPricePerDay,
                                onChange: update("maxPricePerDay"),
                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fieldClass"]} mt-1`
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/ExploreCars.jsx",
                                lineNumber: 75,
                                columnNumber: 82
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 75,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-end",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Primary"], {
                            type: "submit",
                            children: "Tìm xe trống"
                        }, void 0, false, {
                            fileName: "[project]/src/views/live/ExploreCars.jsx",
                            lineNumber: 76,
                            columnNumber: 39
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 76,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/live/ExploreCars.jsx",
                lineNumber: 63,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$live$2d$ui$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LiveState"], {
                loading: result.loading && !result.data,
                error: result.error,
                empty: result.data && !rows.length,
                label: "xe trống lịch",
                onRetry: result.reload
            }, void 0, false, {
                fileName: "[project]/src/views/live/ExploreCars.jsx",
                lineNumber: 78,
                columnNumber: 5
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
                children: rows.map((slot)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        className: "overflow-hidden rounded-2xl border border-[#E9E9E7] bg-white shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["carImage"])(slot),
                                alt: `${slot.brand} ${slot.model}`,
                                className: "h-40 w-full object-cover"
                            }, void 0, false, {
                                fileName: "[project]/src/views/live/ExploreCars.jsx",
                                lineNumber: 81,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2 p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "font-bold text-[#292929]",
                                        children: [
                                            slot.brand,
                                            " ",
                                            slot.model
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                                        lineNumber: 83,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-[#666666]",
                                        children: [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["carTypeLabels"][slot.carType] ?? slot.carType,
                                            " • ",
                                            slot.seats,
                                            " chỗ • ",
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["transmissionLabels"][slot.transmission] ?? slot.transmission,
                                            " • ",
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fuelTypeLabels"][slot.fuelType] ?? slot.fuelType
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                                        lineNumber: 84,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-[#666666]",
                                        children: [
                                            slot.district,
                                            slot.city
                                        ].filter(Boolean).join(", ")
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                                        lineNumber: 85,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-[#292929]",
                                        children: [
                                            "Trống ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDateTime"])(slot.startTime),
                                            " → ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$datetime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatDateTime"])(slot.endTime)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                                        lineNumber: 86,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-bold text-[#FC6C26]",
                                        children: [
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMoney"])(slot.pricePerHour),
                                            "/giờ • ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMoney"])(slot.pricePerDay),
                                            "/ngày"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                                        lineNumber: 87,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[11px] text-[#666666]",
                                        children: [
                                            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$labels$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["rentalTypeLabels"][slot.rentalOption] ?? slot.rentalOption,
                                            " • tối thiểu ",
                                            slot.minRentalHours,
                                            " giờ"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                                        lineNumber: 88,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: `/cars/${slot.carId}?slotId=${slot.id}&start=${encodeURIComponent(query.startTime)}&end=${encodeURIComponent(query.endTime)}`,
                                        className: "mt-1 inline-flex w-fit rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white",
                                        children: "Thuê xe này"
                                    }, void 0, false, {
                                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                                        lineNumber: 89,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/views/live/ExploreCars.jsx",
                                lineNumber: 82,
                                columnNumber: 9
                            }, this)
                        ]
                    }, slot.id, true, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 80,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/views/live/ExploreCars.jsx",
                lineNumber: 79,
                columnNumber: 5
            }, this),
            result.data && result.data.totalPages > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-end gap-2 text-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        disabled: page <= 0,
                        onClick: ()=>setPage(page - 1),
                        className: "rounded-lg border border-[#E9E9E7] bg-white px-3 py-1.5 font-bold disabled:opacity-40",
                        children: "‹ Trước"
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 94,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[#666666]",
                        children: [
                            "Trang ",
                            page + 1,
                            "/",
                            result.data.totalPages,
                            " • ",
                            result.data.totalElements,
                            " khung giờ"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 95,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        disabled: page + 1 >= result.data.totalPages,
                        onClick: ()=>setPage(page + 1),
                        className: "rounded-lg border border-[#E9E9E7] bg-white px-3 py-1.5 font-bold disabled:opacity-40",
                        children: "Sau ›"
                    }, void 0, false, {
                        fileName: "[project]/src/views/live/ExploreCars.jsx",
                        lineNumber: 96,
                        columnNumber: 7
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/views/live/ExploreCars.jsx",
                lineNumber: 93,
                columnNumber: 50
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/src/views/live/ExploreCars.jsx",
        lineNumber: 57,
        columnNumber: 12
    }, this);
}
_s(Explorer, "EcB1z5hSCde2iIBct9BgxLEP8Ic=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$async$2d$resource$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAsyncResource"]
    ];
});
_c1 = Explorer;
var _c, _c1;
__turbopack_context__.k.register(_c, "ExploreCars");
__turbopack_context__.k.register(_c1, "Explorer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=src_0q9-xovgopn3x._.js.map