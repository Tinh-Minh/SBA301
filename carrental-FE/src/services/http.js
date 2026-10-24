import { clearSession, readSession } from "@/lib/session";

/**
 * Mặc định gọi cùng origin `/api/...`; Next.js rewrite (next.config.mjs) chuyển tiếp sang backend.
 * Đặt `NEXT_PUBLIC_API_URL` nếu muốn gọi thẳng backend (khi đó backend phải mở CORS cho header X-User-Id).
 */
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

/** Chỉ dùng dữ liệu mẫu khi bật rõ ràng `NEXT_PUBLIC_USE_MOCK_API=true`. */
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

export class ApiError extends Error {
    status;
    code;
    fieldErrors;
    constructor(status, message, code, fieldErrors = []) {
        super(message);
        this.status = status;
        this.code = code;
        this.fieldErrors = fieldErrors;
        this.name = "ApiError";
    }
}

function buildQuery(query) {
    if (!query)
        return "";
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === "")
            continue;
        if (Array.isArray(value))
            value.forEach(item => params.append(key, String(item)));
        else
            params.append(key, String(value));
    }
    const text = params.toString();
    return text ? `?${text}` : "";
}

const statusMessages = {
    400: "Dữ liệu gửi lên không hợp lệ.",
    401: "Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập.",
    403: "Bạn không có quyền thực hiện thao tác này.",
    404: "Không tìm thấy dữ liệu yêu cầu.",
    409: "Dữ liệu đã thay đổi hoặc bị trùng, vui lòng tải lại.",
    500: "Máy chủ gặp lỗi, vui lòng thử lại sau.",
};

function errorFromBody(status, body) {
    const fieldErrors = Array.isArray(body?.errors) ? body.errors : [];
    const detail = fieldErrors.map(item => item?.message).filter(Boolean);
    const base = body?.message || body?.error || statusMessages[status] || `Lỗi ${status}`;
    const message = detail.length && !detail.includes(base) ? `${base}: ${detail.join("; ")}` : base;
    return new ApiError(status, message, body?.code, fieldErrors);
}

function unwrap(body) {
    if (body && typeof body === "object" && !Array.isArray(body) && "data" in body
        && ("success" in body || "status" in body || "message" in body))
        return body.data;
    return body;
}

/**
 * Gọi backend. `init.json` sẽ được serialize thành JSON; `init.query` thành query string.
 * Tự gắn `Authorization: Bearer` và `X-User-Id` từ phiên đăng nhập.
 */
export async function request(path, init = {}) {
    const { json, query, auth = true, headers: extraHeaders, ...rest } = init;
    const headers = { Accept: "application/json", ...extraHeaders };
    let body = rest.body;
    if (json !== undefined) {
        body = JSON.stringify(json);
        headers["Content-Type"] = "application/json";
    }
    else if (typeof body === "string" && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
    }
    const session = auth ? readSession() : null;
    if (session) {
        headers.Authorization = `${session.tokenType || "Bearer"} ${session.accessToken}`;
        headers["X-User-Id"] = String(session.account.id);
    }
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, { ...rest, body, headers });
    }
    catch {
        throw new ApiError(0, "Không kết nối được tới máy chủ backend. Kiểm tra backend đã chạy ở cổng 8080 chưa.");
    }
    const contentType = response.headers.get("content-type") || "";
    let payload;
    if (response.status !== 204) {
        if (contentType.includes("json")) {
            try {
                payload = await response.json();
            }
            catch {
                payload = undefined;
            }
        }
        else {
            const text = await response.text();
            payload = text ? { message: text.length > 300 ? undefined : text } : undefined;
        }
    }
    if (!response.ok) {
        if (response.status === 401 && session)
            clearSession();
        if (response.status >= 500 && !payload?.message)
            throw new ApiError(response.status, response.status === 502 || response.status === 503 || response.status === 504
                ? "Không kết nối được tới máy chủ backend. Kiểm tra backend đã chạy chưa."
                : statusMessages[500]);
        throw errorFromBody(response.status, payload);
    }
    return unwrap(payload);
}

export const jsonBody = (value) => JSON.stringify(value);

export function mockResponse(value, delayMs = 200) {
    return new Promise(resolve => setTimeout(() => resolve(structuredClone(value)), delayMs));
}

/** Chuẩn hóa trang Spring `{content,page,size,totalElements,totalPages}` (hoặc mảng) về một dạng. */
export function toPage(data) {
    if (Array.isArray(data))
        return { content: data, page: 0, size: data.length, totalElements: data.length, totalPages: 1 };
    const content = data?.content ?? data?.items ?? [];
    return {
        content,
        page: data?.page ?? data?.number ?? 0,
        size: data?.size ?? content.length,
        totalElements: data?.totalElements ?? content.length,
        totalPages: data?.totalPages ?? 1,
    };
}

/** Lấy toàn bộ các trang (giới hạn an toàn) của một endpoint phân trang. */
export async function fetchAllPages(path, query = {}, { pageSize = 100, maxPages = 20 } = {}) {
    const all = [];
    for (let page = 0; page < maxPages; page += 1) {
        const result = toPage(await request(path, { query: { ...query, page, size: pageSize } }));
        all.push(...result.content);
        if (page + 1 >= result.totalPages || result.content.length === 0)
            break;
    }
    return all;
}
