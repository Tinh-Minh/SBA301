"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
const key = "cardb:session:v1";
const AuthContext = createContext({ loggedIn: false, login: () => { }, logout: () => { } });
export function AuthProvider({ children }) {
    const [loggedIn, setLoggedIn] = useState(false);
    useEffect(() => {
        try {
            setLoggedIn(localStorage.getItem(key) === "demo");
        }
        catch { /* Storage is optional for the prototype. */ }
    }, []);
    const login = useCallback(() => {
        setLoggedIn(true);
        try {
            localStorage.setItem(key, "demo");
        }
        catch { /* Keep the current session in memory. */ }
    }, []);
    const logout = useCallback(() => {
        setLoggedIn(false);
        try {
            localStorage.removeItem(key);
        }
        catch { /* Keep the current session in memory. */ }
    }, []);
    const value = useMemo(() => ({ loggedIn, login, logout }), [loggedIn, login, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
