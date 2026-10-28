import { driverService } from "@/services/accountService.js";
import { authenticate, registerAccount } from "@/services/authService.js";
import { clearSession, readSession, subscribeSession } from "@/utils/session.js";
import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function endSession() {
    clearSession();
}

export const AuthContext = createContext({
    ready: false,
    loggedIn: false,
    user: null,
    driver: null,
    isAdmin: false,
    isDriver: false,
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
    const account = session?.account ?? null;
    const driverQuery = useQuery({
        queryKey: ["api", account?.id ?? "guest", "account", "driver-membership"],
        queryFn: () => driverService.me(),
        enabled: ready && Boolean(account) && account.role !== "ADMIN",
        retry: false,
    });
    const value = useMemo(() => {
        const user = account;
        const driver = driverQuery.data ?? null;
        return {
            ready, loggedIn: Boolean(user), user, driver,
            isAdmin: user?.role === "ADMIN",
            isDriver: driver?.status === "ACTIVE",
            login, register, logout,
        };
    }, [ready, account, driverQuery.data, login, register, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
