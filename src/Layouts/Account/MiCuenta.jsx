import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/Apis";
import { showAlert } from "../../components/AlertMessage";
import NavigationBar from "../../components/NavigationBar";

const MiCuenta = () => {
  const navigate = useNavigate();
  const { getRequest } = useApi();
  const [userData, setUserData] = useState({
    nombre1: "",
    apellido1: "",
    email: "",
    telefono: "",
  });
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    let cancelado = false;

    const token = localStorage.getItem("token");
    if (!token) return;

    const nombre1 = localStorage.getItem("nombre1");
    const apellido1 = localStorage.getItem("apellido1");
    const email = localStorage.getItem("email");

    if (nombre1 && apellido1 && email) {
      setUserData({
        nombre1,
        apellido1,
        email,
        telefono: localStorage.getItem("telefono") || "",
      });
    } else {
      getRequest("/api/sesion/datos-sesion")
        .then((res) => {
          if (cancelado) return;
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
        })
        .catch(() => {
          if (!cancelado) {
            showAlert("No se pudo obtener la información del usuario", "error");
          }
        });
    }

    getRequest("/api/reserva/mis-reservas")
      .then((res) => {
        if (!cancelado) setReservas(res.data || []);
      })
      .catch(() => {
        if (!cancelado) console.error("Error al cargar reservas");
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    showAlert("Sesión cerrada correctamente", "info");
    navigate("/");
  };

  return (
    <>
      <NavigationBar />
      <Container maxWidth="xs" sx={{ mt: 4 }}>
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <IconButton onClick={() => navigate(-1)} size="small">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>
              Mi cuenta
            </Typography>
            <Box width={24} />
          </Box>

          <Box mb={2}>
            <Typography variant="caption" color="text.secondary">
              Nombre completo
            </Typography>
            <Typography variant="body2">
              {userData.nombre1} {userData.apellido1}
            </Typography>
          </Box>

          <Box mb={2}>
            <Typography variant="caption" color="text.secondary">
              Correo electrónico
            </Typography>
            <Typography variant="body2">{userData.email}</Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Teléfono
            </Typography>
            <Typography variant="body2">
              {userData.telefono || "No disponible"}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mt: 3, borderRadius: 2, fontSize: "0.8rem" }}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </Paper>

        <Paper elevation={0} sx={{ mt: 4, p: 2 }}>
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Historial de reservas
          </Typography>
          {reservas.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aún no tienes reservas registradas.
            </Typography>
          ) : (
            <List dense>
              {reservas.map((r, i) => (
                <ListItem key={i} disablePadding>
                  <ListItemText
                    primary={`${r.tituloPropiedad} - ${r.fechaInicio} a ${r.fechaFin}`}
                    secondary={`Personas: ${r.cantidadPersonas}`}
                    primaryTypographyProps={{ fontSize: 13 }}
                    secondaryTypographyProps={{
                      fontSize: 11,
                      color: "text.secondary",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default MiCuenta;
