import axios from 'axios';

const defaultBase = (() => {
  // In dev, use Vite proxy via relative '/api' for better compatibility
  try {
    if ((import.meta as any).env?.DEV) {
      return '/api';
    }
  } catch {}
  // Otherwise use explicit env or fallback to 8001 (Django server)
  try {
    const envBase = (import.meta as any).env?.VITE_API_BASE_URL;
    if (envBase) return envBase;
  } catch {}
  try {
    const host = typeof window !== 'undefined' && window.location ? window.location.hostname : 'localhost';
    return `http://${host}:8001/api`;
  } catch {
    return 'http://localhost:8001/api';
  }
})();

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || defaultBase,
  withCredentials: false,
  timeout: 120000, // 2 minutes for file uploads
});

// Debug: log resolved API base URL once on init
try {
  const resolvedBase = (api.defaults && api.defaults.baseURL) || 'unknown';
  // eslint-disable-next-line no-console
  console.log('[API] baseURL =', resolvedBase);
} catch {}

api.interceptors.request.use((config) => {
  try {
    // List of public endpoints that don't require authentication
    const publicEndpoints = [
      '/users/send-otp',
      '/users/verify-otp',
      '/users/complete-signup',
      '/bookings/calculate-fare',
      '/bookings/public-status',
      '/bookings/geocode',
      '/bookings/reverse-geocode',
      '/bookings/book'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // Only add token for authenticated endpoints
    if (!isPublicEndpoint) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      // Respect pre-set Authorization (e.g., driver_token) if caller provided it
      const alreadyAuth = !!(config.headers && (config.headers as any).Authorization);
      if (token && !alreadyAuth) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    }
    
    // Ensure correct Content-Type: let axios set it for FormData
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
    if (isFormData) {
      if (config.headers && 'Content-Type' in config.headers) {
        delete (config.headers as any)['Content-Type'];
      }
    } else {
      (config.headers as any)['Content-Type'] = (config.headers as any)['Content-Type'] || 'application/json';
    }
  } catch {
    // ignore storage errors
  }
  return config;
});

// Global refresh state to prevent concurrent refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
let lastRefreshAttempt = 0;
const REFRESH_COOLDOWN_MS = 5000; // 5 seconds cooldown between refresh attempts

// Enhanced error handling for proxy and network issues
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      const cfg = error?.config || {};
      const url = cfg?.url || '';
      
      // NEVER retry refresh/auth endpoints - they should fail gracefully
      // This prevents infinite loops when refresh itself fails
      const isRefreshEndpoint = url.includes('/users/refresh') || 
                                url.includes('/auth/refresh') || 
                                url.includes('/rider/refresh') ||
                                url.includes('/admin/refresh');
      if (isRefreshEndpoint) {
        // Clear tokens if refresh fails and stop the loop
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          isRefreshing = false;
          refreshPromise = null;
        } catch {}
        // Don't log refresh failures to avoid spam
        return Promise.reject(error);
      }
      
      // Token refresh on 401 - but only if not already refreshing
      if (error?.response?.status === 401 && !(cfg as any)._retryAuth && !isRefreshing) {
        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshAttempt;
        
        // Rate limit: don't attempt refresh if we just tried recently
        if (timeSinceLastRefresh < REFRESH_COOLDOWN_MS) {
          // Clear tokens and reject - user needs to re-authenticate
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
          } catch {}
          return Promise.reject(error);
        }
        
        (cfg as any)._retryAuth = true;
        lastRefreshAttempt = now;
        
        // Use existing refresh promise if one is in progress
        if (refreshPromise) {
          try {
            const newToken = await refreshPromise;
            if (newToken) {
              cfg.headers = cfg.headers || {};
              (cfg.headers as any).Authorization = `Bearer ${newToken}`;
              return api.request(cfg);
            }
          } catch {
            // Refresh failed, continue to clear tokens
          }
        }
        
        // Start new refresh attempt
        isRefreshing = true;
        refreshPromise = (async () => {
          try {
            const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
            if (!refreshToken) throw new Error('No refresh token');
            
            // Use correct refresh endpoint
            const base = (api.defaults && api.defaults.baseURL) || '/api';
            const res = await axios.post(`${base}/users/refresh`, { refresh: refreshToken }, {
              timeout: 10000, // 10 second timeout
              validateStatus: (status) => status < 500 // Don't throw on 4xx
            });
            
            if (res.status === 200 && res.data?.access) {
              const newAccess = res.data.access;
              const newRefresh = res.data.refresh || refreshToken;
              try { localStorage.setItem('token', newAccess); } catch {}
              try { localStorage.setItem('refreshToken', newRefresh); } catch {}
              return newAccess;
            } else {
              throw new Error('Refresh failed');
            }
          } catch (refreshErr) {
            // Clear tokens on any refresh failure
            try {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
            } catch {}
            throw refreshErr;
          } finally {
            isRefreshing = false;
            // Clear promise after a delay to allow concurrent requests to use it
            setTimeout(() => { refreshPromise = null; }, 1000);
          }
        })();
        
        try {
          const newToken = await refreshPromise;
          if (newToken) {
            // Retry original request with new token
            cfg.headers = cfg.headers || {};
            (cfg.headers as any).Authorization = `Bearer ${newToken}`;
            return api.request(cfg);
          }
        } catch (refreshErr) {
          // Refresh failed - don't redirect during booking flow
          try {
            if (typeof window !== 'undefined') {
              const isBookingFlow = sessionStorage.getItem('rideFlow') === 'active';
              const isBookingPage = ['/booking-details', '/ride-initiate', '/booking-confirmation', '/ride-payment-feedback'].some(
                path => window.location.pathname === path
              );
              if (!isBookingFlow && !isBookingPage) {
                window.location.href = '/signin';
              }
            }
          } catch {}
          return Promise.reject(refreshErr);
        }
      }
      const isNetworkError = !error?.response;
      const isProxyError = error?.code === 'ECONNREFUSED' || error?.message?.includes('proxy');
      
      // Don't log errors for refresh endpoints to avoid spam
      if (!isRefreshEndpoint) {
        // eslint-disable-next-line no-console
        console.error('[API] Error', {
          url: cfg?.url,
          method: cfg?.method,
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
          code: error?.code,
          isNetworkError,
          isProxyError
        });
      }
      
      // Retry logic for network/proxy errors
      const alreadyRetried = (cfg as any)._retryWithAltBase === true;
      if ((isNetworkError || isProxyError) && !alreadyRetried) {
        const currentBase = (cfg.baseURL || (api.defaults && api.defaults.baseURL) || '') as string;
        let altBase = currentBase;
        
        // Try different fallback strategies
        if (currentBase.includes('127.0.0.1')) {
          altBase = currentBase.replace('127.0.0.1', 'localhost');
        } else if (currentBase.includes('localhost')) {
          altBase = currentBase.replace('localhost', '127.0.0.1');
        } else if (currentBase.startsWith('/api')) {
          // If using proxy and it fails, try direct connection
          altBase = 'http://localhost:8001/api';
        }
        
        if (altBase && altBase !== currentBase) {
          (cfg as any)._retryWithAltBase = true;
          try { 
            console.warn('[API] Network/Proxy error, retrying with baseURL =', altBase); 
          } catch {}
          return api.request({ ...(cfg as any), baseURL: altBase });
        }
      }
    } catch {}
    return Promise.reject(error);
  }
);

export default api;

// Rider-scoped API instance using a separate token key
export const riderApi = (() => {
  const instance = axios.create({
    baseURL: (import.meta as any).env?.VITE_API_BASE_URL || defaultBase,
    withCredentials: false
  });
  instance.interceptors.request.use((config) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('rider_token') : null;
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
      const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
      if (isFormData) {
        if (config.headers && 'Content-Type' in config.headers) {
          delete (config.headers as any)['Content-Type'];
        }
      } else {
        (config.headers as any)['Content-Type'] = (config.headers as any)['Content-Type'] || 'application/json';
      }
    } catch {}
    return config;
  });
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      try {
        const cfg = error?.config || {};
        const isNetworkError = !error?.response;
        const alreadyRetried = (cfg as any)._retryWithAltBase === true;
        if (isNetworkError && !alreadyRetried) {
          const currentBase = (cfg.baseURL || (instance.defaults && instance.defaults.baseURL) || '') as string;
          let altBase = currentBase;
          if (currentBase.includes('127.0.0.1')) {
            altBase = currentBase.replace('127.0.0.1', 'localhost');
          } else if (currentBase.includes('localhost')) {
            altBase = currentBase.replace('localhost', '127.0.0.1');
          }
          if (altBase && altBase !== currentBase) {
            (cfg as any)._retryWithAltBase = true;
            return instance.request({ ...(cfg as any), baseURL: altBase });
          }
        }
      } catch {}
      return Promise.reject(error);
    }
  );
  return instance;
})();

