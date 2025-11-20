import axios from 'axios';

const defaultBase = (() => {
  // In dev, use Vite proxy via relative '/api'
  try {
    if ((import.meta as any).env?.DEV) {
      return '/api';
    }
  } catch {}
  // Otherwise use explicit env or fallback to 5001
  try {
    const envBase = (import.meta as any).env?.VITE_API_BASE_URL;
    if (envBase) return envBase;
  } catch {}
  try {
    const host = typeof window !== 'undefined' && window.location ? window.location.hostname : 'localhost';
    return `http://${host}:5000/api`;
  } catch {
    return 'http://localhost:5000/api';
  }
})();

const adminApi = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || defaultBase,
  headers: { 'Content-Type': 'application/json' }
});

// Debug: log resolved API base URL once on init
try {
  const resolvedBase = (adminApi.defaults && adminApi.defaults.baseURL) || 'unknown';
  // eslint-disable-next-line no-console
  console.log('[AdminAPI] baseURL =', resolvedBase);
} catch {}

adminApi.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminAccess') : null;
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
    // Debug: log token presence
    console.log('[AdminAPI] Request with token:', config.url, token ? 'YES' : 'NO');
  } else {
    console.warn('[AdminAPI] No admin token found for request:', config.url);
  }
  return config;
});

// Debug: log response errors for easier troubleshooting
adminApi.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('[AdminAPI] ✅ Response:', {
      url: response.config?.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    try {
      const cfg = error?.config || {};
      if (error?.response?.status === 401 && !(cfg as any)._retryAdmin) {
        (cfg as any)._retryAdmin = true;
        try {
          const refresh = typeof window !== 'undefined' ? localStorage.getItem('adminRefresh') : null;
          if (!refresh) throw new Error('No refresh');
          const res = await axios.post(`${adminApi.defaults.baseURL}/admin/refresh`, { refresh });
          const access = res.data?.access;
          const newRefresh = res.data?.refresh || refresh;
          if (!access) throw new Error('No access');
          localStorage.setItem('adminAccess', access);
          localStorage.setItem('adminRefresh', newRefresh);
          cfg.headers = cfg.headers || {};
          (cfg.headers as any).Authorization = `Bearer ${access}`;
          return adminApi.request(cfg);
        } catch (e) {
          try {
            localStorage.removeItem('adminAccess');
            localStorage.removeItem('adminRefresh');
          } catch {}
          if (typeof window !== 'undefined') window.location.href = '/admin/login';
          return Promise.reject(e);
        }
      }
      // eslint-disable-next-line no-console
      console.error('[AdminAPI] Error', {
        url: cfg?.url,
        method: cfg?.method,
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
    } catch {}
    return Promise.reject(error);
  }
);

export default adminApi;

