import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/Icon.jsx";

const NoticeContext = createContext(() => {});

export function NoticeProvider({ children }) {
    const timer = useRef(null);
    const [notice, setNotice] = useState(null);
    useEffect(() => () => clearTimeout(timer.current), []);
    const notify = useCallback((message, tone = "success") => {
        clearTimeout(timer.current);
        setNotice({ message, tone: tone === "error" ? "error" : "success" });
        timer.current = setTimeout(() => setNotice(null), 4200);
    }, []);
    const popup = notice ? createPortal(
        <div role={notice.tone === "error" ? "alert" : "status"} data-notice={notice.tone} className={`toast fixed inset-x-4 top-24 z-[200] mx-auto flex w-fit max-w-md items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl ${notice.tone === "error" ? "border-red-200 bg-white text-red-800" : "border-emerald-200 bg-white text-emerald-800"}`}>
            <Icon name={notice.tone === "error" ? "error" : "check_circle"} className="mt-0.5 text-[20px]" />
            <p className="font-semibold">{notice.message}</p>
            <button type="button" aria-label="Đóng thông báo" onClick={() => setNotice(null)} className="text-current/70"><Icon name="close" className="text-[18px]" /></button>
        </div>,
        document.body,
    ) : null;
    return <NoticeContext.Provider value={notify}>{children}{popup}</NoticeContext.Provider>;
}

export function useNotice() {
    return useContext(NoticeContext);
}
