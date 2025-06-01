import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
} from "@mui/material";

import { postRequest } from "../../Services/Apis";
import NavigationBar from "../../Components/NavigationBar";

const ReservaPropiedad = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cantidadPersonas, setCantidadPersonas] = useState(1);

  const handleReserva = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const reservaData = {
      propiedadId: parseInt(id),
      fechaInicio,
      fechaFin,
      cantidadPersonas: parseInt(cantidadPersonas),
    };

    try {
      await postRequest("/api/reserva/crear", reservaData);
      alert("Reserva realizada con éxito");
      navigate("/");
    } catch (error) {
      console.error("Error al realizar la reserva", error);
      alert("Error al realizar la reserva");
    }
  };

  return (
    <>
      <NavigationBar />
      <Container maxWidth="sm" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Reservar Propiedad #{id}
        </Typography>

        <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fecha de inicio"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Fecha de fin"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Cantidad de personas"
                type="number"
                value={cantidadPersonas}
                onChange={(e) => setCantidadPersonas(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleReserva}
              >
                Confirmar Reserva
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default ReservaPropiedad;
