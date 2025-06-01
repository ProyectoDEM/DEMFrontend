import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import NavigationBar from "../../Components/NavigationBar";

const API_BASE_URL = "https://backend-service-135144276966.us-central1.run.app";

const DetallePropiedad = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [propiedad, setPropiedad] = useState(null);
  const [imagenes, setImagenes] = useState([]);

  useEffect(() => {
    const fetchPropiedad = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/propiedad/propiedades`, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "346FD0B5-32D2-40BF-AFD7-07A4DA00A9F0",
          },
        });
        const data = await res.json();
        const propiedadData = data.propiedades.find(
          (p) => p.propiedadId.toString() === id
        );
        setPropiedad(propiedadData);

        const imagenRes = await fetch(
          `${API_BASE_URL}/api/propiedad/imagenes/${id}`,
          {
            headers: {
              "x-api-key": "346FD0B5-32D2-40BF-AFD7-07A4DA00A9F0",
            },
          }
        );
        const imagenData = await imagenRes.json();
        setImagenes(imagenData.imagenes || []);
      } catch (err) {
        console.error("Error cargando detalle de propiedad", err);
      }
    };

    fetchPropiedad();
  }, [id]);

  if (!propiedad) return null;

  return (
    <>
      <NavigationBar />
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          {propiedad.titulo}
        </Typography>

        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          {propiedad.direccion}, {propiedad.ciudad}, {propiedad.pais}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          {imagenes.length > 0 ? (
            imagenes.map((img, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <img
                  src={img.imagenBase64}
                  alt={`propiedad-${index}`}
                  style={{ width: "100%", borderRadius: 10 }}
                />
              </Grid>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ pl: 2 }}>
              Esta propiedad no tiene imágenes disponibles.
            </Typography>
          )}
        </Grid>

        <Box mt={3}>
          <Typography variant="body1" paragraph>
            {propiedad.descripcion}
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip label={`Tipo: ${propiedad.tipoPropiedadDescripcion}`} />
            <Chip label={`Capacidad: ${propiedad.capacidadMaxima} personas`} />
            <Chip label={`${propiedad.habitaciones} habitaciones`} />
            <Chip label={`${propiedad.camas} camas`} />
            <Chip label={`${propiedad.banos} baños`} />
            <Chip
              label={`$${propiedad.precioPorNoche} / noche`}
              color="primary"
            />
          </Box>

          <Box mt={4} display="flex" gap={2}>
            <Button
              variant="outlined"
              size="large"
              color="secondary"
              onClick={() => navigate(-1)}
            >
              Volver
            </Button>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={() => navigate(`/reservar/${propiedad.propiedadId}`)}
            >
              Reservar esta propiedad
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default DetallePropiedad;
