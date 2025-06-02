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
import NavigationBar from "../../components/NavigationBar";
import { useApi } from "../../Services/Apis";
import { showAlert } from "../../components/AlertMessage";

const DetallePropiedad = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRequest } = useApi();
  const [propiedad, setPropiedad] = useState(null);

  useEffect(() => {
    const fetchPropiedad = async () => {
      try {
        const data = await getRequest("/api/propiedad/propiedades");
        const propiedadData = data.propiedades.find(
          (p) => p.propiedadId.toString() === id
        );
        setPropiedad(propiedadData);
      } catch (err) {
        showAlert("Error al cargar los datos de la propiedad", "error");
      }
    };

    fetchPropiedad();
  }, [id, getRequest]);

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
          {propiedad.imagenBase64 ? (
            <Grid item xs={12}>
              <img
                src={propiedad.imagenBase64}
                alt="Imagen de la propiedad"
                style={{ width: "100%", borderRadius: 10 }}
              />
            </Grid>
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
