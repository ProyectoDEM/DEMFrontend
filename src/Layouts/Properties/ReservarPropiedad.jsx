import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Paper,
  InputAdornment,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useApi } from "../../Services/Apis";
import { showAlert } from "../../Components/AlertMessage";
import NavigationBar from "../../Components/NavigationBar";

const ReservaPropiedad = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { postRequest, getRequest } = useApi();

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [propiedad, setPropiedad] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPropiedad = async () => {
      try {
        const res = await getRequest(`/api/propiedad/propiedades`);
        const match = res.data?.propiedades?.find(
          (p) => p.propiedadId.toString() === id
        );
        if (match) setPropiedad(match);
      } catch (error) {
        console.error("Error al obtener propiedad:", error);
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
      const response = await postRequest("/api/reserva/crear", reservaData);
      if (response.status === 200) {
        // Éxito
        const detalleUsuario = response.data?.detalleUsuario;
        showAlert(detalleUsuario || "Reserva realizada con éxito", "success");
        navigate("/");
      } else {
        // Error (ej. 400 Bad Request)
        const detalleUsuario = response.data?.detalleUsuario || "Error al crear la reserva";
        showAlert(detalleUsuario, "error");
        // Aquí NO navegas, permitiendo que el usuario corrija en la misma página
      }
    } catch (error) {
      if (error?.response?.data?.detalleUsuario) {
        showAlert(error.response.data.detalleUsuario, "error");
      } else {
        showAlert("Error al realizar la reserva", "error");
      }
    }
  };

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

        {propiedad && (
          <Card elevation={1} sx={{ mb: 4, borderRadius: 3, display: "flex" }}>
            <CardMedia
              component="img"
              sx={{ width: 300, height: "100%", objectFit: "cover" }}
              image={
                propiedad.imagenBase64 ||
                "https://via.placeholder.com/400x300?text=Sin+imagen"
              }
              alt="Imagen propiedad"
            />
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {propiedad.titulo}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {propiedad.descripcion}
              </Typography>
              <Typography variant="h6" color="primary">
                ${propiedad.precioPorNoche} / noche
              </Typography>
            </CardContent>
          </Card>
        )}

        <Paper elevation={1} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Detalles de la Reserva
          </Typography>

          <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fecha de inicio"
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
                  label="Fecha de fin"
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
                  label="Cantidad de personas"
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
                  Confirmar Reserva
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ReservaPropiedad;
