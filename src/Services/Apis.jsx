import axios from "axios";
import { useLoading } from "../Context/LoadingProvider";

const isDev = import.meta.env.DEV;

const api = axios.create({
  baseURL: isDev
    ? ""
    : "https://backend-service-135144276966.us-central1.run.app",
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    config.headers["x-api-key"] = "346FD0B5-32D2-40BF-AFD7-07A4DA00A9F0";
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
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

export const useApi = () => {
  const { setLoading } = useLoading();

  const postRequest = async (url, data, headers = {}) => {
    setLoading(true);
    try {
      console.log("➡️ POST a:", url, "con:", data);
      const response = await api.post(url, data, { headers });
      console.log("✅ Respuesta:", response);
      return response;
    } catch (error) {
      console.error("❌ Error en POST:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getRequest = async (url, params = null) => {
    setLoading(true);
    try {
      console.log("🔍 GET a:", url, params ? "con parámetros:" : "", params);
      const config = params ? { params } : {};
      const response = await api.get(url, config);
      console.log("✅ GET Respuesta:", response);
      return response;
    } catch (error) {
      console.error("❌ Error en GET:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRequest = async (url) => {
    setLoading(true);
    try {
      const response = await api.delete(url);
      console.log("✅ DELETE Respuesta:", response);
      return response;
    } catch (error) {
      console.error("❌ Error en DELETE:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { postRequest, getRequest, deleteRequest };
};
