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
} from "@mui/material";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../Services/Apis";
import { showAlert } from "../../components/AlertMessage";

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
      formData.append("propiedadId", propiedadId); // 👈 este es el nombre correcto
      formData.append("imagen", imagen);

      console.log("📤 Enviando FormData:", {
        propiedadId: propiedadId,
        imagenNombre: imagen?.name,
        imagenTipo: imagen?.type,
      });

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
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        Publicar Alojamiento
      </Typography>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Card sx={{ mt: 4, p: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              {[
                { name: "titulo", label: "Título" },
                { name: "descripcion", label: "Descripción" },
                { name: "direccion", label: "Dirección" },
                { name: "ciudad", label: "Ciudad" },
                {
                  name: "capacidadMaxima",
                  label: "Capacidad Máxima",
                  type: "number",
                },
                { name: "habitaciones", label: "Habitaciones", type: "number" },
                { name: "camas", label: "Camas", type: "number" },
                { name: "banos", label: "Baños", type: "number" },
                {
                  name: "precioPorNoche",
                  label: "Precio por Noche (₡)",
                  type: "number",
                },
              ].map(({ name, label, type }) => (
                <Grid item xs={12} sm={6} key={name}>
                  <TextField
                    name={name}
                    label={label}
                    value={form[name]}
                    onChange={handleChange}
                    fullWidth
                    type={type || "text"}
                    error={!!errors[name]}
                    helperText={errors[name] || ""}
                  />
                </Grid>
              ))}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.tipoPropiedadId}>
                  <InputLabel id="tipo-label">Tipo de Propiedad</InputLabel>
                  <Select
                    labelId="tipo-label"
                    name="tipoPropiedadId"
                    value={form.tipoPropiedadId}
                    label="Tipo de Propiedad"
                    onChange={handleChange}
                  >
                    <MenuItem value={1}>Casa</MenuItem>
                    <MenuItem value={2}>Apartamento</MenuItem>
                    <MenuItem value={3}>Cabaña</MenuItem>
                  </Select>
                  {errors.tipoPropiedadId && (
                    <Typography variant="caption" color="error">
                      {errors.tipoPropiedadId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography mb={1}>Seleccioná ubicación en el mapa:</Typography>
                <Box height={300} border="1px solid #ccc">
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
                  <Typography variant="caption" color="error">
                    {errors.latlong}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && (
        <Card sx={{ mt: 4, p: 3 }}>
          <CardContent>
            <Typography mb={2}>
              Seleccioná una imagen para tu propiedad:
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImagen(e.target.files[0])}
            />
          </CardContent>
        </Card>
      )}

      <Box mt={4}>
        <Button variant="contained" color="primary" onClick={handleNext}>
          {activeStep === 0 ? "Siguiente" : "Publicar"}
        </Button>
      </Box>
    </Box>
  );
};

export default Publicar;
