import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/Icon.jsx";

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
    const [message, setMessage] = useState("");
    const timer = useRef(null);
    const notify = useCallback(text => {
        clearTimeout(timer.current);
        setMessage(text);
        timer.current = setTimeout(() => setMessage(""), 4000);
    }, []);
    const dismiss = () => { clearTimeout(timer.current); setMessage(""); };
    useEffect(() => () => clearTimeout(timer.current), []);
    return <ToastContext.Provider value={notify}>
      {children}
      {message ? <div role="status" className="app-toast fixed inset-x-4 bottom-5 z-[150] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-3 rounded-xl border border-border-light bg-text-primary px-5 py-4 text-sm text-white shadow-xl"><Icon name="check_circle" className="text-[20px] text-brand-accent"/><span>{message}</span><button type="button" aria-label="Đóng thông báo" onClick={dismiss} className="shrink-0"><Icon name="close" className="text-[18px]"/></button></div> : null}
    </ToastContext.Provider>;
}
