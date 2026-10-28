import { endpoints } from "@/shared/api/endpoints.js";
import { request } from "@/shared/api/client.js";
import { clearSession, readSession, saveSession, subscribeSession } from "@/utils/session.js";
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

/** POST /api/auth/login — backend chỉ nhận email + mật khẩu. */
export async function authenticate({ email, password }) {
    const token = await request(endpoints.auth.login, { method: "POST", auth: false, json: { email: email.trim(), password } });
    return saveSession(token);
}

/** POST /api/auth/register → trả về hồ sơ khách hàng vừa tạo. */
export function registerAccount({ fullName, email, phone, password }) {
    return request(endpoints.auth.register, {
        method: "POST",
        auth: false,
        json: { fullName: fullName.trim(), email: email.trim(), phone: phone.trim().replace(/\s+/g, ""), password },
    });
}


export function endSession() {
    clearSession();
}

export const AuthContext = createContext({
    ready: false,
    loggedIn: false,
    user: null,
    isAdmin: false,
    login: async () => { },
    register: async () => { },
    logout: () => { },
});

export function AuthProvider({ children }) {
    const queryClient = useQueryClient();
    const sessionToken = useRef(undefined);
    const [ready, setReady] = useState(false);
    const [session, setSession] = useState(null);
    useEffect(() => {
        const sync = () => {
            const next = readSession();
            if (sessionToken.current !== next?.accessToken) {
                void queryClient.cancelQueries();
                queryClient.clear();
                sessionToken.current = next?.accessToken;
            }
            setSession(next);
        };
        sync();
        setReady(true);
        return subscribeSession(sync);
    }, [queryClient]);
    const login = useCallback(async (credentials) => {
        const next = await authenticate(credentials);
        setSession(next);
        return next;
    }, []);
    const register = useCallback((payload) => registerAccount(payload), []);
    const logout = useCallback(() => {
        endSession();
        setSession(null);
    }, []);
    const value = useMemo(() => {
        const user = session?.account ?? null;
        return { ready, loggedIn: Boolean(user), user, isAdmin: user?.role === "ADMIN", login, register, logout };
    }, [ready, session, login, register, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
