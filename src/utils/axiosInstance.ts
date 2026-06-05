/**
 * axiosInstance.ts — superadmin panel
 *
 * Pre-configured axios instance with:
 *  - withCredentials: true  (sends HttpOnly cookies automatically)
 *  - 401 interceptor with token refresh + request queue
 *
 * IMPORTANT: Auth endpoints (/auth/*) are NEVER intercepted for retry.
 * This prevents infinite loops when validate-me / refresh-token itself returns 401.
 */

import axios, {
    AxiosError,
    InternalAxiosRequestConfig,
} from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:4898` : 'http://localhost:4898');

// ─── Auth endpoints that must NEVER be retried ────────────────────────────────
const AUTH_ENDPOINTS = ['/auth/validate-me', '/auth/refresh-token', '/auth/logout', '/auth/login'];

function isAuthEndpoint(url?: string): boolean {
    if (!url) return false;
    return AUTH_ENDPOINTS.some((path) => url.includes(path));
}

// ─── Silently clear cookies + redirect to login ───────────────────────────────
function forceLogout() {
    if (typeof window === 'undefined') return;
    // Clear cookies via backend (fire-and-forget, don't await)
    axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true }).catch(() => { });
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
    window.location.href = '/';
}

// ─── Base instance ────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Refresh state ────────────────────────────────────────────────────────────
let isRefreshing = false;

type QueueEntry = {
    resolve: () => void;
    reject: (err: unknown) => void;
};

let failedQueue: QueueEntry[] = [];

function drainQueue(error: unknown) {
    console.log(`[Axios] Draining queue of ${failedQueue.length} requests (Error: ${!!error})`);
    failedQueue.forEach((entry) => {
        if (error) entry.reject(error);
        else entry.resolve();
    });
    failedQueue = [];
}

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        const status = error.response?.status;
        const requestUrl = originalRequest?.url ?? '';

        // ── Never intercept auth endpoints — avoids infinite loops ────────────
        if (isAuthEndpoint(requestUrl)) {
            return Promise.reject(error);
        }

        // ── 403 Forbidden: only force logout if it's an auth/role error ──────
        // Business-rule 403s (e.g. "ticket belongs to different branch") should
        // NOT log the user out — only role mismatch / inactive account should.
        if (status === 403) {
            const msg: string = (error.response?.data as any)?.message ?? '';
            console.log(`[Axios] 403 Forbidden on ${requestUrl}. Message: "${msg}"`);
            const isAuthError = msg.toLowerCase().includes('inactive') || msg.toLowerCase().includes('role');
            if (isAuthError) {
                console.log(`[Axios] 403 is Auth/Role related. Forcing logout.`);
                forceLogout();
            }
            return Promise.reject(error);
        }

        // ── Only retry once on 401 ────────────────────────────────────────────
        if (status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        console.log(`[Axios] 401 Unauthorized on ${requestUrl}. Triggering refresh flow.`);

        // ── Queue subsequent requests while refreshing ────────────────────────
        if (isRefreshing) {
            console.log(`[Axios] Refresh already in progress. Queueing request: ${requestUrl}`);
            return new Promise<void>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => {
                    console.log(`[Axios] Retrying queued request: ${requestUrl}`);
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;
        console.log(`[Axios] Initiating refresh token request...`);

        try {
            await axios.post(`${API_URL}/api/auth/refresh-token`, {}, { withCredentials: true });
            console.log(`[Axios] Refresh token request successful. Replaying original request: ${requestUrl}`);
            drainQueue(null);
            return api(originalRequest);
        } catch (refreshError) {
            console.error(`[Axios] Refresh token request failed. Forcing logout.`, refreshError);
            drainQueue(refreshError);
            forceLogout();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
