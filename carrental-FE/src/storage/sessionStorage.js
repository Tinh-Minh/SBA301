const STORAGE_KEY = "cardb:session:v2";
const EVENT = "cardb:session-change";

function canUseStorage() {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readSession() {
    if (!canUseStorage())
        return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;
        const session = JSON.parse(raw);
        if (!session?.accessToken || !session?.account?.id)
            return null;
        if (session.expiresAt && Date.now() >= session.expiresAt) {
            window.localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return session;
    }
    catch {
        return null;
    }
}

export function saveSession(tokenResponse) {
    const session = {
        accessToken: tokenResponse.accessToken,
        tokenType: tokenResponse.tokenType || "Bearer",
        expiresAt: tokenResponse.expiresIn ? Date.now() + Number(tokenResponse.expiresIn) * 1000 : null,
        account: tokenResponse.account,
    };
    if (canUseStorage()) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        window.dispatchEvent(new Event(EVENT));
    }
    return session;
}

export function updateSessionAccount(patch) {
    const session = readSession();
    if (!session || !canUseStorage())
        return;
    session.account = { ...session.account, ...patch };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event(EVENT));
}

export function clearSession() {
    if (!canUseStorage())
        return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(EVENT));
}

export function subscribeSession(listener) {
    if (typeof window === "undefined")
        return () => { };
    const onStorage = (event) => {
        if (event.key === null || event.key === STORAGE_KEY)
            listener();
    };
    window.addEventListener(EVENT, listener);
    window.addEventListener("storage", onStorage);
    return () => {
        window.removeEventListener(EVENT, listener);
        window.removeEventListener("storage", onStorage);
    };
}

export function currentUserId() {
    return readSession()?.account?.id ?? null;
}
