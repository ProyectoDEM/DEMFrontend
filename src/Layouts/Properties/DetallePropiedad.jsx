import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Paper,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  TextField,
  InputAdornment,
  CardActionArea,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import BathtubIcon from "@mui/icons-material/Bathtub";
import BedIcon from "@mui/icons-material/Bed";
import HotelIcon from "@mui/icons-material/Hotel";
import GroupIcon from "@mui/icons-material/Group";
import CategoryIcon from "@mui/icons-material/Category";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import RoomIcon from "@mui/icons-material/Room";
import NavigationBar from "../../Components/NavigationBar";
import { useApi } from "../../Services/Apis";
import { showAlert } from "../../Components/AlertMessage";

const DetallePropiedad = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRequest, postRequest } = useApi();
  const [propiedad, setPropiedad] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPropiedad = async () => {
      try {
        const { data } = await getRequest("/api/propiedad/propiedades");
        const propiedadData = data.propiedades.find(
          (p) => p.propiedadId.toString() === id
        );
        setPropiedad(propiedadData);
      } catch (err) {
        console.error("❌ Error al cargar propiedad:", err);
      }
    };

    fetchPropiedad();
  }, [id]);

  const todayStr = new Date().toISOString().split("T")[0];

  const handleReserva = async () => {
    const hoy = new Date();
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    hoy.setHours(0, 0, 0, 0);
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    const newErrors = {};

    if (!fechaInicio) newErrors.fechaInicio = "Seleccione una fecha válida.";
    if (!fechaFin) newErrors.fechaFin = "Seleccione una fecha válida.";
    if (inicio < hoy) newErrors.fechaInicio = "La fecha debe ser hoy o futura.";
    if (fin <= inicio)
      newErrors.fechaFin = "Debe ser posterior a la fecha de inicio.";
    if (!cantidadPersonas || cantidadPersonas < 1)
      newErrors.cantidadPersonas = "Debe ser al menos 1 persona.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showAlert("Debes iniciar sesión para reservar", "warning");
      navigate("/");
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
      showAlert("Reserva realizada con éxito", "success");
      navigate("/");
    } catch (error) {
      if (error?.response?.data?.detalleUsuario) {
        showAlert(error.response.data.detalleUsuario, "error");
      } else {
        showAlert("Error al realizar la reserva", "error");
      }
    }
  };

  if (!propiedad) return null;

  return (
    <>
      <NavigationBar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <IconButton onClick={() => navigate(-1)} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="body2"
            sx={{ ml: 1, cursor: "pointer" }}
            onClick={() => navigate(-1)}
          >
            Volver
          </Typography>
        </Box>

        <Card elevation={1} sx={{ mb: 4, borderRadius: 3 }}>
          <CardMedia
            component="img"
            height="250"
            image={
              propiedad.imagenBase64 ||
              "https://via.placeholder.com/400x300?text=Sin+imagen"
            }
            alt="Imagen de la propiedad"
          />
          <CardContent>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {propiedad.titulo}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {propiedad.descripcion}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              <RoomIcon fontSize="small" />
              {propiedad.direccion}, {propiedad.ciudad}, {propiedad.pais}
            </Typography>
          </CardContent>
        </Card>

        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} md={7}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Detalles de la Propiedad
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Paper elevation={1} sx={{ p: 2, flex: "1 1 200px" }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CategoryIcon fontSize="small" />
                  <Typography variant="body2">
                    {propiedad.tipoPropiedadDescripcion}
                  </Typography>
                </Box>
              </Paper>
              <Paper elevation={1} sx={{ p: 2, flex: "1 1 200px" }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <GroupIcon fontSize="small" />
                  <Typography variant="body2">
                    Capacidad: {propiedad.capacidadMaxima}
                  </Typography>
                </Box>
              </Paper>
              <Paper elevation={1} sx={{ p: 2, flex: "1 1 200px" }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <HotelIcon fontSize="small" />
                  <Typography variant="body2">
                    Habitaciones: {propiedad.habitaciones}
                  </Typography>
                </Box>
              </Paper>
              <Paper elevation={1} sx={{ p: 2, flex: "1 1 200px" }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BedIcon fontSize="small" />
                  <Typography variant="body2">
                    Camas: {propiedad.camas}
                  </Typography>
                </Box>
              </Paper>
              <Paper elevation={1} sx={{ p: 2, flex: "1 1 200px" }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BathtubIcon fontSize="small" />
                  <Typography variant="body2">
                    Baños: {propiedad.banos}
                  </Typography>
                </Box>
              </Paper>
              <Paper elevation={1} sx={{ p: 2, flex: "1 1 200px" }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <MonetizationOnIcon fontSize="small" />
                  <Typography variant="body2">
                    ${propiedad.precioPorNoche} / noche
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Reserva rápida
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Inicio"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: todayStr }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    error={Boolean(errors.fechaInicio)}
                    helperText={errors.fechaInicio}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Fin"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: fechaInicio || todayStr }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    error={Boolean(errors.fechaFin)}
                    helperText={errors.fechaFin}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Personas"
                    type="number"
                    inputProps={{ min: 1 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PeopleIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    value={cantidadPersonas}
                    onChange={(e) => setCantidadPersonas(e.target.value)}
                    error={Boolean(errors.cantidadPersonas)}
                    helperText={errors.cantidadPersonas}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ borderRadius: 2, textTransform: "none" }}
                    onClick={handleReserva}
                  >
                    Reservar
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default DetallePropiedad;
