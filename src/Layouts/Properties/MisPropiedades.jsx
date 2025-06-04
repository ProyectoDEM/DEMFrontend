import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Stack,
} from "@mui/material";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useApi } from "../../Services/Apis";
import NavigationBar from "../../components/NavigationBar";

const MisPropiedades = () => {
  const [propiedades, setPropiedades] = useState([]);
  const navigate = useNavigate();
  const { getRequest } = useApi();

  useEffect(() => {
    const fetchMisPropiedades = async () => {
      try {
        const response = await getRequest("/api/propiedad/mis-propiedades");
        setPropiedades(response.data || []);
      } catch (error) {
        console.error("Error al cargar propiedades del usuario", error);
      }
    };

    fetchMisPropiedades();
  }, []);

  const handlePublicarClick = () => {
    navigate("/publicar");
  };

  const handleVolverClick = () => {
    navigate(-1);
  };

  const handleEditar = (id) => {
    alert(`Editar propiedad ID: ${id}`);
  };

  const handleEliminar = (id) => {
    alert(`Eliminar propiedad ID: ${id}`);
  };

  return (
    <>
      <NavigationBar />
      <Box p={4}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4">Mis propiedades</Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleVolverClick}
          >
            Volver
          </Button>
        </Box>

        {!propiedades.length ? (
          <Box textAlign="center" mt={10}>
            <Typography variant="h5" gutterBottom>
              Aún no has publicado ninguna propiedad.
            </Typography>
            <Typography variant="body1" gutterBottom>
              ¿Te gustaría empezar ahora?
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddHomeWorkIcon />}
              onClick={handlePublicarClick}
            >
              Publicar alojamiento
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {propiedades.map((prop) => (
              <Grid item xs={12} sm={6} md={4} key={prop.id}>
                <Card>
                  {prop.imagenUrl && (
                    <CardMedia
                      component="img"
                      height="180"
                      image={prop.imagenUrl}
                      alt={prop.titulo}
                    />
                  )}
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {prop.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {prop.descripcion}
                    </Typography>
                    <Typography variant="body2" mt={1}>
                      {prop.direccion}, {prop.ciudad}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={2}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEditar(prop.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleEliminar(prop.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
};

export default MisPropiedades;
