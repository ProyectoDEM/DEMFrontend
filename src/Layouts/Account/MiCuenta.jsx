import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import { getRequest } from "../../Services/Apis";
import { showAlert } from "../../components/AlertMessage";

const MiCuenta = () => {
  const [userData, setUserData] = useState({
    nombre1: "",
    apellido1: "",
    email: "",
    telefono: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchSessionData = async () => {
      try {
        const res = await getRequest("/api/sesion/datos-sesion");
        const { nombre1, apellido1, email } = res.data;

        localStorage.setItem("nombre1", nombre1);
        localStorage.setItem("apellido1", apellido1);
        localStorage.setItem("email", email);

        setUserData({
          nombre1,
          apellido1,
          email,
          telefono: localStorage.getItem("telefono") || "",
        });
      } catch (error) {
        showAlert("No se pudo obtener la información del usuario", "error");
      }
    };

    fetchSessionData();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Mi Cuenta
        </Typography>
        <Box mb={2}>
          <Typography variant="subtitle1" fontWeight="medium">
            Nombre:
          </Typography>
          <Typography>
            {userData.nombre1} {userData.apellido1}
          </Typography>
        </Box>
        <Box mb={2}>
          <Typography variant="subtitle1" fontWeight="medium">
            Correo electrónico:
          </Typography>
          <Typography>{userData.email}</Typography>
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight="medium">
            Teléfono:
          </Typography>
          <Typography>
            {userData.telefono || "Teléfono no disponible"}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default MiCuenta;
