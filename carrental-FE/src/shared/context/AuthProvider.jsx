import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { readSession, subscribeSession } from "@/shared/storage/session.js";
import * as authService from "@/services/auth.service.js";

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
        const next = await authService.login(credentials);
        setSession(next);
        return next;
    }, []);
    const register = useCallback((payload) => authService.register(payload), []);
    const logout = useCallback(() => {
        authService.logout();
        setSession(null);
    }, []);
    const value = useMemo(() => {
        const user = session?.account ?? null;
        return { ready, loggedIn: Boolean(user), user, isAdmin: user?.role === "ADMIN", login, register, logout };
    }, [ready, session, login, register, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

