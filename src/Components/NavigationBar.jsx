import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { showAlert } from "./AlertMessage";
import AuthModal from "../Layouts/Auth/AuthModal";
import { getRequest } from "../Services/Apis";

const NavigationBar = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

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

        setUserInfo({ nombre: nombre1, apellido: apellido1 });
      } catch (error) {
        showAlert("No se pudo obtener la información del usuario", "error");
      }
    };

    fetchSessionData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nombre1");
    localStorage.removeItem("apellido1");
    localStorage.removeItem("email");
    setUserInfo(null);
    showAlert("Sesión cerrada exitosamente", "info");
    navigate("/");
  };

  const handleAuthSuccess = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("nombre1", data.nombre1);
    localStorage.setItem("apellido1", data.apellido1);
    setUserInfo({ nombre: data.nombre1, apellido: data.apellido1 });
    showAlert("Sesión iniciada correctamente", "success");
    setOpenModal(false);
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="primary"
        elevation={3}
        sx={{ width: "100%", top: 0, left: 0, zIndex: 1300 }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: "bold", cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Donde es Mae?
            </Typography>

            <Box display="flex" alignItems="center" gap={2}>
              {userInfo ? (
                <>
                  <Button
                    color="inherit"
                    startIcon={<AccountCircleIcon />}
                    onClick={() => navigate("/mi-cuenta")}
                    sx={{ textTransform: "none" }}
                  >
                    {userInfo.nombre} {userInfo.apellido}
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ textTransform: "none" }}
                  >
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <Button
                  color="inherit"
                  startIcon={<AccountCircleIcon />}
                  onClick={() => setOpenModal(true)}
                  sx={{ textTransform: "none" }}
                >
                  Iniciar sesión
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <AuthModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default NavigationBar;
