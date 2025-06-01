import React from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate en lugar de useHistory

const NotFound = () => {
  const navigate = useNavigate(); // Inicializa useNavigate

  const handleRedirect = () => {
    navigate("/login"); // Redirige a la página de login cuando el usuario hace clic en el botón
  };

  return (
    <div className="notfound-container">
      <div className="notfound-box">
        <h1 className="notfound-heading">404</h1>
        <p className="notfound-message">
          ¡Vaya! No encontramos lo que buscabas.
        </p>
        <p className="notfound-submessage">
          Haz clic en el botón para ser redirigido al login.
        </p>
        <button onClick={handleRedirect} className="redirect-button">
          Ir al Login
        </button>
      </div>
    </div>
  );
};

export default NotFound;
