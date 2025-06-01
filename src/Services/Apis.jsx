import axios from "axios";

// Detectar si estamos en desarrollo o producción
const isDev = import.meta.env.DEV;

// Instancia Axios con baseURL condicional
const api = axios.create({
  baseURL: isDev
    ? ""
    : "https://backend-service-135144276966.us-central1.run.app",
  timeout: 10000,
});

// Interceptor para agregar token y headers globales
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // Headers por defecto
    config.headers["Content-Type"] = "application/json";
    config.headers["x-api-key"] = "346FD0B5-32D2-40BF-AFD7-07A4DA00A9F0";

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // Debug: mostrar la URL completa que se va a llamar
    console.log(
      "🔗 URL completa:",
      isDev
        ? `http://localhost:5173${config.url}`
        : `${config.baseURL}${config.url}`
    );
    console.log(
      "🌍 Modo:",
      isDev ? "Desarrollo (con proxy)" : "Producción (directo)"
    );

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuesta para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("🚨 Error interceptado:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
    });
    return Promise.reject(error);
  }
);

// Función POST genérica
export const postRequest = async (url, data, headers = {}) => {
  try {
    console.log("➡️ POST a:", url, "con:", data);

    const response = await api.post(url, data, { headers });

    console.log("✅ Respuesta:", response);
    return response;
  } catch (error) {
    console.error("❌ Error en POST:", error);
    throw error;
  }
};

// Función GET genérica
export const getRequest = async (url, params = null) => {
  try {
    console.log("🔍 GET a:", url, params ? "con parámetros:" : "", params);

    const config = {
      ...(params && { params }),
    };

    const response = await api.get(url, config);

    console.log("✅ GET Respuesta:", response);
    return response;
  } catch (error) {
    if (error.code === "ERR_NETWORK") {
      console.error("❌ Error de red - Problema de CORS o conectividad");
    } else if (error.response) {
      console.error(
        "❌ Error del servidor:",
        error.response.status,
        error.response.data
      );
    } else if (error.request) {
      console.error("❌ No se recibió respuesta del servidor");
    }

    console.error("❌ Error en GET:", error);
    throw error;
  }
};

// Función DELETE genérica
export const deleteRequest = async (url) => {
  try {
    const response = await api.delete(url);
    console.log("✅ DELETE Respuesta:", response);
    return response;
  } catch (error) {
    console.error("❌ Error en DELETE:", error);
    throw error;
  }
};
