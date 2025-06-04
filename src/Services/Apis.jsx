import axios from "axios";
import { useLoading } from "../Context/LoadingProvider";

const isDev = import.meta.env.DEV;

// Configuración optimizada - SIEMPRE apunta a producción
const api = axios.create({
  baseURL: "https://backend-service-135144276966.us-central1.run.app",
  timeout: 8000, // Reducido de 10s a 8s
  // Optimizaciones de red
  maxRedirects: 3,
  validateStatus: (status) => status < 500, // Considera errores 4xx como válidos para manejarlos
});

// Headers comunes para evitar repetición
const getCommonHeaders = () => ({
  "x-api-key": "346FD0B5-32D2-40BF-AFD7-07A4DA00A9F0",
  Accept: "application/json",
});

// Interceptor de request optimizado
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Headers base
    config.headers = {
      ...config.headers,
      ...getCommonHeaders(),
    };

    // Content-Type solo si no es FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    // Authorization si hay token
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Log solo en desarrollo para reducir overhead
    if (isDev) {
      console.log("🔗 Request:", {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL}${config.url}`,
        env: "PRODUCCIÓN",
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de response optimizado
api.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.log("✅ Response:", response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    // Log de errores más eficiente
    if (isDev) {
      console.error("❌ API Error:", {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        message: error.response?.data?.message || error.message,
      });
    }
    return Promise.reject(error);
  }
);

// Cache simple para requests GET (opcional)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const getCacheKey = (url, params) => {
  return `${url}${params ? JSON.stringify(params) : ""}`;
};

export const useApi = () => {
  const { setLoading } = useLoading();

  // Loading con debounce para evitar parpadeos
  let loadingTimeout;
  const setLoadingDebounced = (loading) => {
    if (loading) {
      setLoading(true);
    } else {
      clearTimeout(loadingTimeout);
      loadingTimeout = setTimeout(() => setLoading(false), 100);
    }
  };

  const postRequest = async (url, data, headers = {}) => {
    setLoadingDebounced(true);
    try {
      const response = await api.post(url, data, { headers });
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoadingDebounced(false);
    }
  };

  const getRequest = async (url, params = null, useCache = false) => {
    // Cache check para GET requests
    if (useCache) {
      const cacheKey = getCacheKey(url, params);
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        if (isDev) console.log("📦 Cache hit:", url);
        return cached.data;
      }
    }

    setLoadingDebounced(true);
    try {
      const config = params ? { params } : {};
      const response = await api.get(url, config);

      // Guardar en cache si se solicitó
      if (useCache) {
        const cacheKey = getCacheKey(url, params);
        cache.set(cacheKey, {
          data: response,
          timestamp: Date.now(),
        });
      }

      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoadingDebounced(false);
    }
  };

  const deleteRequest = async (url) => {
    setLoadingDebounced(true);
    try {
      const response = await api.delete(url);

      // Limpiar cache relacionado después de DELETE
      for (const [key] of cache) {
        if (key.includes(url.split("/")[1])) {
          // Limpia por recurso base
          cache.delete(key);
        }
      }

      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoadingDebounced(false);
    }
  };

  const putRequest = async (url, data, headers = {}) => {
    setLoadingDebounced(true);
    try {
      const response = await api.put(url, data, { headers });

      // Limpiar cache relacionado después de PUT
      for (const [key] of cache) {
        if (key.includes(url.split("/")[1])) {
          cache.delete(key);
        }
      }

      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoadingDebounced(false);
    }
  };

  // Método para limpiar cache manualmente
  const clearCache = (pattern = null) => {
    if (pattern) {
      for (const [key] of cache) {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      }
    } else {
      cache.clear();
    }
  };

  return {
    postRequest,
    getRequest,
    deleteRequest,
    putRequest,
    clearCache,
  };
};
