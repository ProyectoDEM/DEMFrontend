// src/components/Security/TokenRefresher.jsx
import { useEffect } from "react";
import { refreshTokenSilencioso } from "../../Services/Apis";

const TokenRefresher = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await refreshTokenSilencioso();
      console.log("RESPONSE ACTUALIZAR TOKEN: ", response);

      if (response?.data?.token) {
        localStorage.setItem("token", response.data.token);
        console.log("🔁 Token actualizado correctamente");
      } else {
        console.warn("⚠️ Token no renovado, cerrando sesión");
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }, 240000); // 4 minutos

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default TokenRefresher;
