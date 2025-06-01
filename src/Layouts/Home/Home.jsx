import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  MenuItem,
  Select,
  InputBase,
  Typography,
} from "@mui/material";
import {
  styled,
  alpha,
  createTheme,
  ThemeProvider,
} from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import NavigationBar from "../../components/NavigationBar";

const API_BASE_URL = "https://backend-service-135144276966.us-central1.run.app";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ff385c",
    },
    secondary: {
      main: "#008489",
    },
  },
});

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  transition: "transform 0.3s ease",
  cursor: "pointer",
  ":hover": {
    transform: "scale(1.02)",
  },
}));

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.black, 0.1),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "30ch",
    },
  },
}));

const Home = () => {
  const navigate = useNavigate();
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [propiedades, setPropiedades] = useState([]);

  useEffect(() => {
    const fetchPropiedadesConImagen = async () => {
      try {
        const propiedadesRes = await fetch(
          `${API_BASE_URL}/api/propiedad/propiedades`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": "346FD0B5-32D2-40BF-AFD7-07A4DA00A9F0",
            },
          }
        );
        const data = await propiedadesRes.json();

        const props = data.propiedades || [];

        const propsConImagenes = await Promise.all(
          props.map(async (p) => {
            try {
              const imagenesRes = await fetch(
                `${API_BASE_URL}/api/propiedad/imagenes/${p.propiedadId}`,
                {
                  headers: {
                    "x-api-key": "346FD0B5-32D2-40BF-AFD7-07A4DA00A9F0",
                  },
                }
              );
              const imagenesData = await imagenesRes.json();
              const imagenBase64 = imagenesData?.imagenes?.[0]?.imagenBase64;
              const imagenUrl = imagenBase64 || null;
              return { ...p, imagenUrl };
            } catch {
              return { ...p, imagenUrl: null };
            }
          })
        );

        setPropiedades(propsConImagenes);
      } catch (err) {
        console.error("Error cargando propiedades:", err);
      }
    };

    fetchPropiedadesConImagen();
  }, []);

  const propiedadesFiltradas = propiedades.filter(
    (prop) =>
      (!filtroTipo || prop.tipoPropiedadDescripcion === filtroTipo) &&
      (prop.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        prop.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleReservar = (id) => {
    const token = localStorage.getItem("token");
    if (token) navigate(`/reservar/${id}`);
    else navigate("/login");
  };

  const handleCardClick = (id) => {
    navigate(`/propiedad/${id}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <NavigationBar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          mb={4}
        >
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Buscar por título o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Search>

          <Select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            displayEmpty
            sx={{ minWidth: 180, bgcolor: "white", borderRadius: 2 }}
          >
            <MenuItem value="">Todos los tipos</MenuItem>
            <MenuItem value="Apartamento">Apartamento</MenuItem>
            <MenuItem value="Casa">Casa</MenuItem>
            <MenuItem value="Cabaña">Cabaña</MenuItem>
          </Select>
        </Box>

        <Grid container spacing={4}>
          {propiedadesFiltradas.map((prop) => (
            <Grid item key={prop.propiedadId} xs={12} sm={6} md={4}>
              <StyledCard onClick={() => handleCardClick(prop.propiedadId)}>
                <CardMedia
                  component="img"
                  height="200"
                  image={prop.imagenUrl || "/default-image.jpg"}
                  alt={prop.titulo}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {prop.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {prop.ciudad}, {prop.pais} - {prop.tipoPropiedadDescripcion}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{ justifyContent: "space-between", px: 2, pb: 2 }}
                >
                  <Typography variant="subtitle1" fontWeight="medium">
                    ${prop.precioPorNoche} / noche
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ borderRadius: "20px" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReservar(prop.propiedadId);
                    }}
                  >
                    Reservar
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ThemeProvider>
  );
};

export default Home;
