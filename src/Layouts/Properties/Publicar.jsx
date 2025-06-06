import React, { useState } from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Typography,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Card,
  CardContent,
  Grid,
  Paper,
  Divider,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/Apis";
import { showAlert } from "../../Components/AlertMessage";
import NavigationBar from "../../Components/NavigationBar";

const MarcadorUbicacion = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
};

const Publicar = () => {
  const { postRequest } = useApi();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [propiedadId, setPropiedadId] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [errors, setErrors] = useState({});
  const [ubicacion, setUbicacion] = useState(null);
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    direccion: "",
    ciudad: "",
    pais: "Costa Rica",
    tipoPropiedadId: "",
    capacidadMaxima: "",
    habitaciones: "",
    camas: "",
    banos: "",
    precioPorNoche: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validarCampos = () => {
    const newErrors = {};
    Object.entries(form).forEach(([key, val]) => {
      if (!val) newErrors[key] = "Este campo es requerido.";
    });
    if (!ubicacion)
      newErrors.latlong = "Debes seleccionar una ubicación en el mapa.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!validarCampos()) return;
      try {
        const res = await postRequest("/api/propiedad/crear", {
          ...form,
          latitud: ubicacion.lat,
          longitud: ubicacion.lng,
          tipoPropiedadId: parseInt(form.tipoPropiedadId),
          capacidadMaxima: parseInt(form.capacidadMaxima),
          habitaciones: parseInt(form.habitaciones),
          camas: parseInt(form.camas),
          banos: parseInt(form.banos),
          precioPorNoche: parseFloat(form.precioPorNoche),
        });
        const nuevaId = res.data?.propiedadId;
        if (!nuevaId)
          throw new Error("No se pudo obtener el ID de la propiedad");
        setPropiedadId(nuevaId);
        showAlert("Propiedad registrada correctamente", "success");
        setActiveStep(1);
      } catch (err) {
        console.error("Error al registrar propiedad:", err);
        showAlert("Error al registrar propiedad", "error");
      }
    } else {
      if (!imagen) {
        showAlert("Debes seleccionar una imagen antes de continuar", "warning");
        return;
      }

      const formData = new FormData();
      formData.append("propiedadId", propiedadId);
      formData.append("imagen", imagen);

      try {
        await postRequest("/api/propiedad/guardar-imagen", formData);
        showAlert("Imagen subida correctamente", "success");
        navigate("/");
      } catch (err) {
        console.error("Error al subir imagen:", err);
        showAlert("Error al subir imagen", "error");
      }
    }
  };

  const steps = ["Datos del alojamiento", "Subir imagen"];

  return (
    <>
    <NavigationBar />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          py: 4,
          px: 2,
        }}
      >
        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {/* Header */}
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography
                variant="h4"
                align="center"
                sx={{
                  fontWeight: 600,
                  color: "#1e293b",
                  mb: 1,
                }}
              >
                Publicar Alojamiento
              </Typography>
              <Typography
                variant="body1"
                align="center"
                color="text.secondary"
                sx={{ mb: 4 }}
              >
                Completa la información de tu propiedad para comenzar a recibir
                huéspedes
              </Typography>

              <Stepper
                activeStep={activeStep}
                alternativeLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    fontWeight: 500,
                  },
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Form Content */}
          {activeStep === 0 && (
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                {/* Botón Volver */}
                <Box sx={{ mb: 3 }}>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/")}
                    sx={{
                      color: "#64748b",
                      textTransform: "none",
                      fontWeight: 500,
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                      },
                    }}
                  >
                    Volver
                  </Button>
                </Box>

                <Box component="form" noValidate autoComplete="off">
                  {/* Información Básica */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 4,
                      backgroundColor: "#f8fafc",
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, fontWeight: 600, color: "#374151" }}
                    >
                      📋 Información Básica
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Título del alojamiento"
                          name="titulo"
                          value={form.titulo}
                          onChange={handleChange}
                          error={!!errors.titulo}
                          helperText={errors.titulo}
                          placeholder="Ej: Hermosa casa cerca de la playa"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl
                          fullWidth
                          error={!!errors.tipoPropiedadId}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              width: "200px",
                            },
                          }}
                        >
                          <InputLabel id="tipo-label">
                            Tipo de Propiedad
                          </InputLabel>
                          <Select
                            labelId="tipo-label"
                            name="tipoPropiedadId"
                            value={form.tipoPropiedadId}
                            label="Tipo de Propiedad"
                            onChange={handleChange}
                          >
                            <MenuItem value={1}>🏠 Casa</MenuItem>
                            <MenuItem value={2}>🏢 Apartamento</MenuItem>
                            <MenuItem value={3}>🏕️ Cabaña</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Precio por Noche"
                          name="precioPorNoche"
                          type="number"
                          value={form.precioPorNoche}
                          onChange={handleChange}
                          error={!!errors.precioPorNoche}
                          helperText={errors.precioPorNoche}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">$</InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Descripción"
                          name="descripcion"
                          value={form.descripcion}
                          onChange={handleChange}
                          multiline
                          rows={4}
                          error={!!errors.descripcion}
                          helperText={errors.descripcion}
                          placeholder="Describe tu alojamiento, sus características especiales y lo que lo hace único..."
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              width: "650px",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Capacidad y Características */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 4,
                      backgroundColor: "#f8fafc",
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, fontWeight: 600, color: "#374151" }}
                    >
                      🏡 Capacidad y Características
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Huéspedes"
                          name="capacidadMaxima"
                          type="number"
                          value={form.capacidadMaxima}
                          onChange={handleChange}
                          error={!!errors.capacidadMaxima}
                          helperText={errors.capacidadMaxima}
                          InputProps={{
                            inputProps: { min: 1 },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Habitaciones"
                          name="habitaciones"
                          type="number"
                          value={form.habitaciones}
                          onChange={handleChange}
                          error={!!errors.habitaciones}
                          helperText={errors.habitaciones}
                          InputProps={{
                            inputProps: { min: 1 },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Camas"
                          name="camas"
                          type="number"
                          value={form.camas}
                          onChange={handleChange}
                          error={!!errors.camas}
                          helperText={errors.camas}
                          InputProps={{
                            inputProps: { min: 1 },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          fullWidth
                          label="Baños"
                          name="banos"
                          type="number"
                          value={form.banos}
                          onChange={handleChange}
                          error={!!errors.banos}
                          helperText={errors.banos}
                          InputProps={{
                            inputProps: { min: 1 },
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Ubicación */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 4,
                      backgroundColor: "#f8fafc",
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, fontWeight: 600, color: "#374151" }}
                    >
                      📍 Ubicación
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={8}>
                        <TextField
                          fullWidth
                          label="Dirección"
                          name="direccion"
                          value={form.direccion}
                          onChange={handleChange}
                          error={!!errors.direccion}
                          helperText={errors.direccion}
                          placeholder="Dirección completa de la propiedad"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                              width: "500px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Ciudad"
                          name="ciudad"
                          value={form.ciudad}
                          onChange={handleChange}
                          error={!!errors.ciudad}
                          helperText={errors.ciudad}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "white",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Mapa */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      mb: 4,
                      backgroundColor: "#f8fafc",
                      borderRadius: 2,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 2, fontWeight: 600, color: "#374151" }}
                    >
                      🗺️ Ubicación en el Mapa
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Haz clic en el mapa para marcar la ubicación exacta de tu
                      propiedad
                    </Typography>
                    <Box
                      sx={{
                        height: 350,
                        borderRadius: 2,
                        overflow: "hidden",
                        border: "2px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    >
                      <MapContainer
                        center={[9.9, -84]}
                        zoom={8}
                        style={{ height: "100%" }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MarcadorUbicacion onSelect={setUbicacion} />
                        {ubicacion && (
                          <Marker
                            position={ubicacion}
                            icon={L.icon({
                              iconUrl:
                                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                              iconSize: [25, 41],
                              iconAnchor: [12, 41],
                            })}
                          />
                        )}
                      </MapContainer>
                    </Box>
                    {errors.latlong && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ mt: 1, display: "block" }}
                      >
                        {errors.latlong}
                      </Typography>
                    )}
                    {ubicacion && (
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ mt: 2 }}
                      >
                        ✅ Ubicación seleccionada: {ubicacion.lat.toFixed(6)},{" "}
                        {ubicacion.lng.toFixed(6)}
                      </Typography>
                    )}
                  </Paper>

                  {/* Botón Siguiente */}
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleNext}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        textTransform: "none",
                        fontSize: "1.1rem",
                      }}
                    >
                      Continuar →
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Paso 2: Subir Imagen */}
          {activeStep === 1 && (
            <Card elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  📸 Agregar Imagen Principal
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Selecciona una imagen atractiva que represente tu alojamiento
                </Typography>

                <Box
                  sx={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: 2,
                    p: 4,
                    mb: 3,
                    backgroundColor: "#f8fafc",
                    "&:hover": {
                      borderColor: "#94a3b8",
                      backgroundColor: "#f1f5f9",
                    },
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImagen(e.target.files[0])}
                    style={{ display: "none" }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      size="large"
                      sx={{
                        px: 4,
                        py: 2,
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "1.1rem",
                      }}
                    >
                      Seleccionar Imagen
                    </Button>
                  </label>
                  {imagen && (
                    <Typography
                      variant="body2"
                      color="success.main"
                      sx={{ mt: 2 }}
                    >
                      ✅ Imagen seleccionada: {imagen.name}
                    </Typography>
                  )}
                </Box>

                <Box display="flex" justifyContent="center" gap={2}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => setActiveStep(0)}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                    }}
                  >
                    ← Volver
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleNext}
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "1.1rem",
                    }}
                  >
                    Publicar Alojamiento 🎉
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Publicar;
