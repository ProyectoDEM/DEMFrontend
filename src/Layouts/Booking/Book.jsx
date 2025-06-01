import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { postRequest } from "../../Services/Apis";

const Book = () => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const navigate = useNavigate();
  const { propiedadId } = useParams(); // Obtiene el id de la propiedad desde la URL

  const handleReserva = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      // Si no está logueado, redirige al login
      navigate("/login");
      return;
    }

    const reservaData = {
      propiedadId: parseInt(propiedadId),
      fechaInicio,
      fechaFin,
      cantidadPersonas,
    };

    try {
      await postRequest("api/reserva/crear", reservaData);
      alert("Reserva realizada con éxito");
      navigate("/"); // Redirige al inicio después de la reserva
    } catch (error) {
      console.error("Error al realizar la reserva", error);
    }
  };

  return (
    <div className="reserva-container">
      <h2>Reserva de propiedad</h2>
      <div>
        <label htmlFor="fechaInicio">Fecha de inicio</label>
        <input
          type="date"
          id="fechaInicio"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="fechaFin">Fecha de fin</label>
        <input
          type="date"
          id="fechaFin"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="cantidadPersonas">Cantidad de personas</label>
        <input
          type="number"
          id="cantidadPersonas"
          value={cantidadPersonas}
          onChange={(e) => setCantidadPersonas(e.target.value)}
          required
        />
      </div>
      <button onClick={handleReserva}>Confirmar reserva</button>
    </div>
  );
};

export default Book;
