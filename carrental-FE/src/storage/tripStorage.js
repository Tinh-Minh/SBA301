const key = "cardb:trip-cancellations:v1";
export function readTripCancellations() {
    try {
        const value = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(value) ? value.filter(id => typeof id === "string") : [];
    } catch { return []; }
}
export function cancelTrip(id) {
    try {
        localStorage.setItem(key, JSON.stringify([...new Set([...readTripCancellations(), id])]));
        return true;
    } catch { return false; }
}
