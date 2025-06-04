"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Container,
  Typography,
  Paper,
  IconButton,
  Button,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  Avatar,
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import LogoutIcon from '@mui/icons-material/Logout';
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import PeopleIcon from "@mui/icons-material/People"
import HomeIcon from "@mui/icons-material/Home"
import { useNavigate } from "react-router-dom"
import { useApi } from "../../Services/Apis"
import { showAlert } from "../../Components/AlertMessage"
import NavigationBar from "../../Components/NavigationBar"

const MiCuenta = () => {
  const navigate = useNavigate()
  const { getRequest } = useApi()
  const [userData, setUserData] = useState({
    nombre1: "",
    apellido1: "",
    email: "",
    telefono: "",
  })
  const [reservas, setReservas] = useState([])

  useEffect(() => {
    let cancelado = false

    const token = localStorage.getItem("token")
    if (!token) return

    const nombre1 = localStorage.getItem("nombre1")
    const apellido1 = localStorage.getItem("apellido1")
    const email = localStorage.getItem("email")

    if (nombre1 && apellido1 && email) {
      setUserData({
        nombre1,
        apellido1,
        email,
        telefono: localStorage.getItem("telefono") || "",
      })
    } else {
      getRequest("/api/sesion/datos-sesion")
        .then((res) => {
          if (cancelado) return
          const { nombre1, apellido1, email } = res.data
          localStorage.setItem("nombre1", nombre1)
          localStorage.setItem("apellido1", apellido1)
          localStorage.setItem("email", email)
          setUserData({
            nombre1,
            apellido1,
            email,
            telefono: localStorage.getItem("telefono") || "",
          })
        })
        .catch(() => {
          if (!cancelado) {
            showAlert("No se pudo obtener la información del usuario", "error")
          }
        })
    }

    getRequest("/api/reserva/listar-reservas/2")
      .then((res) => {
        if (!cancelado) {
          const data = res.data
          if (Array.isArray(data.reservas)) {
            setReservas(data.reservas)
          } else {
            console.error("El campo 'reservas' no es un array:", data)
            setReservas([])
          }
        }
      })
      .catch((error) => {
        if (!cancelado) {
          console.error("Error al cargar reservas:", error)
          setReservas([])
        }
      })

    return () => {
      cancelado = true
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    showAlert("Sesión cerrada correctamente", "info")
    navigate("/")
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmada":
        return "success"
      case "completada":
        return "primary"
      case "cancelada":
        return "error"
      case "pendiente":
        return "warning"
      default:
        return "default"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getInitials = (nombre, apellido) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
  }

  return (
    <>
      <NavigationBar />
      <Container maxWidth="xs" sx={{ mt: 4, pb: 4 }}>
        {/* Tarjeta de información del usuario */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <IconButton onClick={() => navigate(-1)} size="small">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>
              Mi cuenta
            </Typography>
            <Box width={24} />
          </Box>

          {/* Avatar y nombre */}
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: "primary.main",
                fontSize: "1.2rem",
                fontWeight: 600,
                mr: 2,
              }}
            >
              {getInitials(userData.nombre1, userData.apellido1)}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {userData.nombre1} {userData.apellido1}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userData.email}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Información del usuario */}
          <Box mb={2}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
              Correo electrónico
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {userData.email}
            </Typography>
          </Box>

          <Box mb={3}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
              Teléfono
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {userData.telefono || "No disponible"}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            size="medium"
            startIcon={<LogoutIcon />}
            sx={{
              mt: 2,
              borderRadius: 2,
              py: 1.5,
              textTransform: "none",
              fontWeight: 500,
            }}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </Paper>

        {/* Tarjeta de historial de reservas */}
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ p: 3, pb: 1 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Historial de reservas
            </Typography>
          </Box>

          {reservas.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CalendarTodayIcon sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Aún no tienes reservas registradas.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ px: 2, pb: 2 }}>
              {reservas.map((reserva, index) => (
                <Card
                  key={index}
                  elevation={0}
                  sx={{
                    mb: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: 1,
                      transform: "translateY(-1px)",
                    },
                    "&:last-child": {
                      mb: 0,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                    {/* Título y estado */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box flex={1} mr={1}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.3,
                            mb: 1,
                          }}
                        >
                          <HomeIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }} />
                          {reserva.propiedadTitulo}
                        </Typography>
                      </Box>
                      <Chip
                        label={reserva.estadoReservaDescripcion}
                        color={getStatusColor(reserva.estadoReservaDescripcion)}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.75rem",
                          height: 24,
                        }}
                      />
                    </Box>

                    {/* Información de fechas y personas */}
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary", mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(reserva.fechaInicio)} - {formatDate(reserva.fechaFin)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center">
                          <PeopleIcon sx={{ fontSize: 16, color: "text.secondary", mr: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            {reserva.cantidadPersonas} {reserva.cantidadPersonas === 1 ? "persona" : "personas"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      </Container>
    </>
  )
}

export default MiCuenta
