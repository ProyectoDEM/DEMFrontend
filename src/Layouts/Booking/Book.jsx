import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApi } from "../../Services/Apis";
import { showAlert } from "../../Components/AlertMessage";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
} from "@mui/material";

const Book = () => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const navigate = useNavigate();
  const { propiedadId } = useParams();
  const { postRequest } = useApi();

  const handleReserva = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showAlert("Debes iniciar sesión para reservar", "warning");
      navigate("/");
      return;
    }

    const reservaData = {
      propiedadId: parseInt(propiedadId),
      fechaInicio,
      fechaFin,
      cantidadPersonas,
    };

    try {
      await postRequest("/api/reserva/crear", reservaData);
      showAlert("Reserva realizada con éxito", "success");
      navigate("/");
    } catch (error) {
      if (error?.response?.data?.detalleUsuario) {
        showAlert(error.response.data.detalleUsuario, "error");
      } else {
        showAlert("No se pudo completar la reserva", "error");
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Reserva de propiedad
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Fecha de inicio"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Fecha de fin"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Cantidad de personas"
            type="number"
            value={cantidadPersonas}
            onChange={(e) => setCantidadPersonas(e.target.value)}
            fullWidth
            inputProps={{ min: 1 }}
          />

          <Button
            variant="contained"
            onClick={handleReserva}
            sx={{ mt: 1, borderRadius: 2 }}
          >
            Confirmar reserva
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Book;
