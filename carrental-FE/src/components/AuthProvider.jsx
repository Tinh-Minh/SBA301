import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { demoSession } from "@/storage/sessionStorage";
const AuthContext = createContext({ loggedIn: false, login: () => { }, logout: () => { } });
export function AuthProvider({ children }) {
    const [loggedIn, setLoggedIn] = useState(demoSession.isLoggedIn);
    const login = useCallback(() => {
        setLoggedIn(true);
        demoSession.login();
    }, []);
    const logout = useCallback(() => {
        setLoggedIn(false);
        demoSession.logout();
    }, []);
    const value = useMemo(() => ({ loggedIn, login, logout }), [loggedIn, login, logout]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
