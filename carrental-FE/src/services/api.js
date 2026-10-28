import axios from "axios";

import { clearSession, readSession } from "@/utils/session.js";

/**
 * Mặc định gọi cùng origin `/api/...`; Vite / nginx proxy chuyển tiếp sang backend.
 * Đặt `VITE_API_URL` nếu muốn gọi thẳng backend (khi đó backend phải mở CORS cho header X-User-Id).
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

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
    return params.toString();
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

async function decodeResponse(response) {
    if (response.status === 204) return undefined;
    const body = response.data instanceof Blob ? await response.data.text() : response.data;
    if (response.headers["content-type"]?.includes("json")) {
        if (typeof body !== "string") return body;
        try { return JSON.parse(body); } catch { return undefined; }
    }
    return body ? { message: String(body).length > 300 ? undefined : String(body) } : undefined;
}

export const httpClient = axios.create({
    baseURL: API_BASE_URL || undefined,
    headers: { Accept: "application/json" },
    paramsSerializer: { serialize: buildQuery },
    responseType: "text",
    transformResponse: [body => body],
});

httpClient.interceptors.request.use(config => {
    const session = config.requiresAuth === false ? null : readSession();
    if (session) {
        config.headers.set("Authorization", `${session.tokenType || "Bearer"} ${session.accessToken}`);
        config.headers.set("X-User-Id", String(session.account.id));
        config.sessionToken = session.accessToken;
    }
    return config;
});

httpClient.interceptors.response.use(async response => {
    if (response.config.responseType === "blob") return response;
    response.data = unwrap(await decodeResponse(response));
    return response;
}, async error => {
    if (axios.isCancel(error)) return Promise.reject(error);
    const response = error.response;
    if (!response) return Promise.reject(new ApiError(0,
        "Không kết nối được tới máy chủ backend. Kiểm tra backend đã chạy ở cổng 8080 chưa."));
    const { status } = response;
    const payload = await decodeResponse(response);
    if (status === 401 && error.config.sessionToken && error.config.sessionToken === readSession()?.accessToken)
        clearSession();
    if (status >= 500 && !payload?.message) return Promise.reject(new ApiError(status,
        [502, 503, 504].includes(status) ? "Không kết nối được tới máy chủ backend. Kiểm tra backend đã chạy chưa." : statusMessages[500]));
    return Promise.reject(errorFromBody(status, payload));
});

/** Shared backend request contract; Axios owns transport and interceptors. */
export async function request(path, init = {}) {
    const { json, query, auth = true, headers: extraHeaders = {}, body, credentials, ...config } = init;
    const headers = { ...extraHeaders };
    const data = json !== undefined ? json : body;
    if (json !== undefined || typeof data === "string")
        headers["Content-Type"] ??= "application/json";
    const response = await httpClient.request({
        ...config, url: path, params: query, data, headers, requiresAuth: auth,
        ...(credentials ? { withCredentials: credentials === "include" } : {}),
    });
    return response.data;
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
