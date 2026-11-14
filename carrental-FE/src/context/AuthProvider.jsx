import { authenticate, registerAccount } from "@/services/authService.js";
import { getMyProfile } from "@/services/accountService.js";
import { clearSession, readSession, subscribeSession, updateSessionAccount } from "@/utils/session.js";
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

function endSession() {
    clearSession();
}

export const AuthContext = createContext({
    ready: false,
    loggedIn: false,
    user: null,
    isAdmin: false,
    isOwner: false,
    login: async () => { },
    register: async () => { },
    logout: () => { },
    refreshAccount: async () => null,
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
    const refreshAccount = useCallback(async () => {
        const current = readSession();
        if (!current?.accessToken || !current?.account?.id)
            return null;
        try {
            const profile = await getMyProfile();
            if (profile?.id === current.account.id && profile?.role) {
                updateSessionAccount({
                    role: profile.role,
                    kycStatus: profile.kycStatus,
                    fullName: profile.fullName ?? current.account.fullName,
                    avatarUrl: profile.avatarUrl ?? current.account.avatarUrl ?? null,
                });
            }
            return profile;
        }
        catch {
            return null;
        }
    }, []);
    useEffect(() => {
        if (session?.accessToken && session?.account?.id && !session.account.avatarUrl) {
            void refreshAccount();
        }
    }, [session?.accessToken, session?.account?.id, session?.account?.avatarUrl, refreshAccount]);
    const value = useMemo(() => {
        const user = session?.account ?? null;
        return {
            ready,
            loggedIn: Boolean(user),
            user,
            isAdmin: user?.role === "ADMIN",
            isOwner: user?.role === "OWNER",
            login,
            register,
            logout,
            refreshAccount,
        };
    }, [ready, session, login, register, logout, refreshAccount]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
