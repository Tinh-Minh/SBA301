"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readSession, subscribeSession } from "@/storage/sessionStorage.js";
import * as authService from "@/services/auth.service";

const AuthContext = createContext({
    ready: false,
    loggedIn: false,
    user: null,
    isAdmin: false,
    login: async () => { },
    register: async () => { },
    logout: () => { },
});

export function AuthProvider({ children }) {
    const [ready, setReady] = useState(false);
    const [session, setSession] = useState(null);
    useEffect(() => {
        const sync = () => setSession(readSession());
        sync();
        setReady(true);
        return subscribeSession(sync);
    }, []);
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

export const useAuth = () => useContext(AuthContext);
