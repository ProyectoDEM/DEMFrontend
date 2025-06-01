import React, { useState } from "react";
import { postRequest } from "../../Services/Apis"; // Función para hacer peticiones POST
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loginData = {
      email: email,
      contrasenaHash: password,
    };

    try {
      const response = await postRequest("api/sesion/login", loginData);
      localStorage.setItem("token", response.data.token); // Guarda el token en localStorage
      navigate("/"); // Redirige a la página de inicio
    } catch (err) {
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
};

export default Login;
