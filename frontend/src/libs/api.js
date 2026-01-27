import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-ibc.itr-compass.co.id/api";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    withCredentials: true,
});

let csrfToken = null;
const ACCESS_TOKEN_KEY = "access_token";
let accessToken = null;
const safeMethods = ['get', 'head', 'options'];
let isRefreshing = false;
let refreshPromise = null;

const csrfClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    withCredentials: true,
});

const AUTH_ENDPOINTS = [
    "/login",
    "/login-otp",
    "/refresh",
    "/logout",
    "/resend-otp",
    "/register",
    "/forgot-password",
    "/csrf",
];

const PUBLIC_ROUTES = [
    "/login",
    "/forgot-password",
    "/reset-password",
    "/otp",
    "/otp-verify",
];

function isPublicRoute(pathname) {
    return PUBLIC_ROUTES.some((route) => pathname === route);
}

function getRequestPath(config) {
    if (!config) return "";
    try {
        const base = config.baseURL || API_BASE_URL;
        return new URL(config.url || "", base).pathname;
    } catch (err) {
        return config.url || "";
    }
}

function isAuthEndpoint(pathname) {
    return AUTH_ENDPOINTS.some((segment) => pathname.includes(segment));
}

if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (accessToken) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
}

export function setAccessToken(token) {
    accessToken = token || null;
    if (typeof window !== 'undefined') {
        if (accessToken) {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        } else {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            delete apiClient.defaults.headers.common['Authorization'];
        }
    }
}

async function ensureCsrfToken() {
    if (csrfToken) return csrfToken;
    const res = await csrfClient.get('/csrf');
    csrfToken = res.data?.csrfToken;
    if (csrfToken) {
        apiClient.defaults.headers.common['X-CSRF-Token'] = csrfToken;
    }
    return csrfToken;
}

export async function prefetchCsrfToken() {
    return ensureCsrfToken();
}

apiClient.interceptors.request.use(
    async (config) => {
        const method = (config.method || 'get').toLowerCase();
        if (!config.headers?.Authorization && accessToken) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        if (!safeMethods.includes(method) && !config.headers['X-CSRF-Token']) {
            try {
                const token = await ensureCsrfToken();
                if (token) {
                    config.headers['X-CSRF-Token'] = token;
                }
            } catch (err) {
                // If fetching CSRF token fails, surface the error
                return Promise.reject(err);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const message = (error.response?.data?.message || "").toString().toLowerCase();
        const config = error.config || {};
        const path = getRequestPath(config);

        const isCsrfError = status === 403 && message.includes("csrf");
        const isAuthError = status === 401;
        const isRefreshCall = path.includes("/refresh");
        const skipAuthRetry = isAuthEndpoint(path);

        if (isCsrfError && !config._csrfRetried) {
            try {
                csrfToken = null;
                const token = await ensureCsrfToken();
                config._csrfRetried = true;
                config.headers = config.headers || {};
                config.headers['X-CSRF-Token'] = token;
                if (token) {
                    apiClient.defaults.headers.common['X-CSRF-Token'] = token;
                }
                return apiClient(config);
            } catch (e) {
                // fall through to reject
            }
        }

        // If 401, try refresh once, then retry original request; if still fails, logout hard
        if (isAuthError && !config._retryAuth && !isRefreshCall && !skipAuthRetry) {
            try {
                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshPromise = apiClient.post('/refresh');
                }
                await refreshPromise;
                isRefreshing = false;
                refreshPromise = null;
                config._retryAuth = true;
                return apiClient(config);
            } catch (e) {
                isRefreshing = false;
                refreshPromise = null;
                // Hard logout: clear local state, then redirect
                if (typeof window !== 'undefined') {
                    localStorage.removeItem("user_data");
                    localStorage.removeItem("user_email_for_otp");
                    const currentPath = window.location?.pathname || "";
                    if (!isPublicRoute(currentPath)) {
                        window.location = '/login';
                    }
                }
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient
