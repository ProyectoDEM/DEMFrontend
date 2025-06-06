import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import { showAlert } from "./AlertMessage";
import AuthModal from "../Layouts/Auth/AuthModal";
import { useApi } from "../Services/Apis";
import DEMLogo from "../assets/DEMLogo.png";


const NavigationBar = ({ logo }) => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [pendingRedirect, setPendingRedirect] = useState(null);
  const { getRequest, postRequest } = useApi();

  useEffect(() => {
    let cancelado = false;
    const token = localStorage.getItem("token");
    if (!token || userInfo) return;

    const nombre1 = localStorage.getItem("nombre1");
    const apellido1 = localStorage.getItem("apellido1");

    if (nombre1 && apellido1) {
      setUserInfo({ nombre: nombre1, apellido: apellido1 });
      return;
    }

    const fetchSessionData = async () => {
      try {
        const res = await getRequest("/api/sesion/datos-sesion");
        if (cancelado || !res?.data?.nombre1 || !res?.data?.apellido1) return;

        const { nombre1, apellido1, email } = res.data;
        localStorage.setItem("nombre1", nombre1);
        localStorage.setItem("apellido1", apellido1);
        localStorage.setItem("email", email);
        setUserInfo({ nombre: nombre1, apellido: apellido1 });
      } catch (error) {
        if (!cancelado) {
          console.error("Error al obtener sesión:", error);
          showAlert("No se pudo obtener la información del usuario", "error");
        }
      }
    };

    fetchSessionData();

    return () => {
      cancelado = true;
    };
  }, [userInfo]);

  const handleLogout = async () => {
  try {
    const response = await postRequest("/api/sesion/logout", {});
    const detalleUsuario = response.data?.detalleUsuario;
    
    localStorage.clear();
    setUserInfo(null);
    showAlert(detalleUsuario || "Sesión cerrada exitosamente", "info");
    navigate("/");
  } catch (error) {
    console.error("Error en logout:", error);
    showAlert("Error cerrando sesión", "error");
  }
};

  const handleAuthSuccess = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("nombre1", data.nombre1);
    localStorage.setItem("apellido1", data.apellido1);
    setUserInfo({ nombre: data.nombre1, apellido: data.apellido1 });
    //showAlert("Sesión iniciada correctamente", "success");
    setOpenModal(false);

    if (pendingRedirect === "publicar") {
      navigate("/publicar");
      setPendingRedirect(null);
    }
  };

  const handlePublicarClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/publicar");
    } else {
      setPendingRedirect("publicar");
      setOpenModal(true);
    }
  };

  const handleGestionarClick = () => {
    navigate("/mis-propiedades");
  };

  return (
    <>
      <AppBar
        position="sticky"
        color="default"
        elevation={3}
        sx={{ width: "100%", top: 0, left: 0, zIndex: 1300, backgroundColor: "#ff385c" }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
            <Box
              onClick={() => navigate("/")}
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              {logo || (
                <img
                  src={DEMLogo}
                  alt="DEM Logo"
                  style={{ height: 80, width: 90 }}
                />
              )}
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <Button
                color="inherit"
                startIcon={<AddHomeWorkIcon />}
                onClick={handlePublicarClick}
                sx={{ textTransform: "none" }}
              >
                Publicar alojamiento
              </Button>

              {userInfo && (
                <Button
                  color="inherit"
                  startIcon={<HomeWorkIcon />}
                  onClick={handleGestionarClick}
                  sx={{ textTransform: "none" }}
                >
                  Gestionar propiedades
                </Button>
              )}

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
