import axios from 'axios';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api-ibc.itr-compass.co.id/api",
    timeout: 60000,
    withCredentials: true,
})

let csrfToken = null;
const safeMethods = ['get', 'head', 'options'];
let isRefreshing = false;
let refreshPromise = null;

const csrfClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://api-ibc.itr-compass.co.id/api",
    timeout: 60000,
    withCredentials: true,
});

async function ensureCsrfToken() {
    if (csrfToken) return csrfToken;
    const res = await csrfClient.get('/csrf');
    csrfToken = res.data?.csrfToken;
    return csrfToken;
}

apiClient.interceptors.request.use(
    async (config) => {
        const method = (config.method || 'get').toLowerCase();
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

        const isCsrfError = status === 403 && message.includes("csrf");
        const isAuthError = status === 401;
        const isRefreshCall = config?.url?.includes('/refresh');

        if (isCsrfError && !config._csrfRetried) {
            try {
                csrfToken = null;
                const token = await ensureCsrfToken();
                config._csrfRetried = true;
                config.headers = config.headers || {};
                config.headers['X-CSRF-Token'] = token;
                return apiClient(config);
            } catch (e) {
                // fall through to reject
            }
        }

        // If 401, try refresh once, then retry original request; if still fails, logout hard
        if (isAuthError && !config._retryAuth && !isRefreshCall) {
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
                // Hard logout: best-effort call, then redirect
                try { await apiClient.post('/logout'); } catch (_) {}
                if (typeof window !== 'undefined') {
                    window.location = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient
