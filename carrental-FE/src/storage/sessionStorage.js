const SESSION_KEY = "cardb:session:v1";

export const demoSession = {
    isLoggedIn() {
        try { return localStorage.getItem(SESSION_KEY) === "demo"; }
        catch { return false; }
    },
    login() {
        try { localStorage.setItem(SESSION_KEY, "demo"); }
        catch { /* Keep the current session in memory when storage is unavailable. */ }
    },
    logout() {
        try { localStorage.removeItem(SESSION_KEY); }
        catch { /* Keep the current session in memory when storage is unavailable. */ }
    },
};
