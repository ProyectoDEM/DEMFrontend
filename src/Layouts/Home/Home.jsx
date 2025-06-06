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
  Slider,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  styled,
  alpha,
  createTheme,
  ThemeProvider,
} from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import HotelIcon from "@mui/icons-material/Hotel";
import BathtubIcon from "@mui/icons-material/Bathtub";
import NavigationBar from "../../Components/NavigationBar";
import { showAlert } from "../../Components/AlertMessage";
import AuthModal from "../Auth/AuthModal";
import { useApi } from "../../Services/Apis";

const theme = createTheme({
 
  typography: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    button: {
      textTransform: "none",
    },
  },
});

const StyledCard = styled(Card)(() => ({
  borderRadius: 16,
  boxShadow: "0 3px 10px rgba(0,0,0,0.05)",
  transition: "transform 0.2s ease",
  cursor: "pointer",
  ":hover": {
    transform: "scale(1.01)",
  },
}));

const FilterBar = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: 12,
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  backgroundColor: "#fff",
  marginBottom: theme.spacing(3),
  alignItems: "center",
}));

const Home = () => {
  const navigate = useNavigate();
  const { getRequest } = useApi();
  const [filtroTipo, setFiltroTipo] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [capacidad, setCapacidad] = useState("");
  const [habitaciones, setHabitaciones] = useState("");
  const [banos, setBanos] = useState("");
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(999999);
  const [rangoPrecio, setRangoPrecio] = useState([0, 999999]);
  const [propiedades, setPropiedades] = useState([]);
  const [visiblePropiedades, setVisiblePropiedades] = useState([]);
  const [itemsToShow, setItemsToShow] = useState(6);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingReservationId, setPendingReservationId] = useState(null);

  useEffect(() => {
    const fetchPropiedades = async () => {
      try {
        const response = await getRequest("/api/propiedad/propiedades");

        if (
          !response?.data?.propiedades ||
          !Array.isArray(response.data.propiedades)
        ) {
          console.error("⚠️ Formato de respuesta inesperado:", response);
          return;
        }

        const propiedadesData = response.data.propiedades;
        setPropiedades(propiedadesData);
        setVisiblePropiedades(propiedadesData.slice(0, 6));

        const precios = propiedadesData.map((p) => p.precioPorNoche);
        const min = Math.min(...precios);
        const max = Math.max(...precios);
        setPrecioMin(min);
        setPrecioMax(max);
        setRangoPrecio([min, max]);
      } catch (error) {
        console.error("Error al obtener propiedades:", error);
      }
    };

    fetchPropiedades();
  }, []);

  const limpiarFiltros = () => {
    setFiltroTipo("");
    setBusqueda("");
    setCapacidad("");
    setHabitaciones("");
    setBanos("");
    setRangoPrecio([precioMin, precioMax]);
  };

  const propiedadesFiltradas = propiedades.filter(
    (prop) =>
      (!filtroTipo || prop.tipoPropiedadDescripcion === filtroTipo) &&
      (prop.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        prop.descripcion.toLowerCase().includes(busqueda.toLowerCase())) &&
      (!capacidad || prop.capacidadMaxima >= parseInt(capacidad)) &&
      (!habitaciones || prop.habitaciones >= parseInt(habitaciones)) &&
      (!banos || prop.banos >= parseInt(banos)) &&
      prop.precioPorNoche >= rangoPrecio[0] &&
      prop.precioPorNoche <= rangoPrecio[1]
  );

  useEffect(() => {
    const filtradas = propiedades.filter(
      (prop) =>
        (!filtroTipo || prop.tipoPropiedadDescripcion === filtroTipo) &&
        (prop.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
          prop.descripcion.toLowerCase().includes(busqueda.toLowerCase())) &&
        (!capacidad || prop.capacidadMaxima >= parseInt(capacidad)) &&
        (!habitaciones || prop.habitaciones >= parseInt(habitaciones)) &&
        (!banos || prop.banos >= parseInt(banos)) &&
        prop.precioPorNoche >= rangoPrecio[0] &&
        prop.precioPorNoche <= rangoPrecio[1]
    );

    setVisiblePropiedades(filtradas.slice(0, itemsToShow));
  }, [
    propiedades,
    filtroTipo,
    busqueda,
    capacidad,
    habitaciones,
    banos,
    rangoPrecio,
    itemsToShow,
  ]);

  const handleReservar = (id) => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate(`/reservar/${id}`);
    } else {
      showAlert("Debes iniciar sesión para realizar una reserva", "warning");
      setPendingReservationId(id);
      setAuthModalOpen(true);
    }
  };

  const handleCardClick = (id) => {
    const propiedad = propiedades.find((p) => p.propiedadId === id);
    navigate(`/propiedad/${id}`, { state: { propiedad } });
  };

  return (
    <ThemeProvider theme={theme}>
      <NavigationBar />
      <Container maxWidth="lg" sx={{ mt: 3, mb: 4 }}>
        <FilterBar>
          <TextField
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 100) setBusqueda(value);
            }}
            inputProps={{ maxLength: 100 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            size="small"
          />

          <Select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            displayEmpty
            size="small"
          >
            <MenuItem value="">Tipo</MenuItem>
            <MenuItem value="Apartamento">Apartamento</MenuItem>
            <MenuItem value="Casa">Casa</MenuItem>
            <MenuItem value="Cabaña">Cabaña</MenuItem>
          </Select>

          <TextField
            placeholder="Personas"
            type="number"
            value={capacidad}
            onChange={(e) => {
              const value = Math.max(1, parseInt(e.target.value || 1));
              setCapacidad(value.toString());
            }}
            inputProps={{ min: 1 }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PeopleAltIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            placeholder="Habitaciones"
            type="number"
            value={habitaciones}
            onChange={(e) => {
              const value = Math.max(1, parseInt(e.target.value || 1));
              setHabitaciones(value.toString());
            }}
            inputProps={{ min: 1 }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HotelIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            placeholder="Baños"
            type="number"
            value={banos}
            onChange={(e) => {
              const value = Math.max(1, parseInt(e.target.value || 1));
              setBanos(value.toString());
            }}
            inputProps={{ min: 1 }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BathtubIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Box>
            <Typography variant="caption" color="text.secondary">
              Precio por noche
            </Typography>
            <Slider
              value={rangoPrecio}
              onChange={(e, newValue) => setRangoPrecio(newValue)}
              min={precioMin}
              max={precioMax}
              valueLabelDisplay="auto"
              size="small"
            />
          </Box>

          {(filtroTipo ||
            busqueda ||
            capacidad ||
            habitaciones ||
            banos ||
            rangoPrecio[0] !== precioMin ||
            rangoPrecio[1] !== precioMax) && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={limpiarFiltros}
              sx={{ gridColumn: "1 / -1", justifySelf: "end" }}
            >
              Limpiar filtros
            </Button>
          )}
        </FilterBar>

        <Grid container spacing={3}>
          {visiblePropiedades.map((prop) => (
            <Grid item key={prop.propiedadId} xs={12} sm={6} md={4}>
              <StyledCard onClick={() => handleCardClick(prop.propiedadId)}>
                <CardMedia
                  component="img"
                  height="180"
                  image={
                    prop.imagenBase64 ||
                    "https://via.placeholder.com/400x300?text=Sin+imagen"
                  }
                  alt={prop.titulo}
                />
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                    {prop.titulo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {prop.ciudad}, {prop.pais} - {prop.tipoPropiedadDescripcion}
                  </Typography>
                </CardContent>

                <CardActions
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    pb: 1,
                  }}
                >
                  <Typography variant="body2">
                    ${prop.precioPorNoche} / noche
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={
                        prop.disponibilidad ? "Disponible" : "No disponible"
                      }
                      color={prop.disponibilidad ? "success" : "default"}
                      size="small"
                      sx={{
                        marginLeft: 1,
                      }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ borderRadius: "12px", fontSize: "0.75rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReservar(prop.propiedadId);
                      }}
                    >
                      Reservar
                    </Button>
                  </Box>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {visiblePropiedades.length < propiedadesFiltradas.length && (
          <Box mt={4} textAlign="center">
            <Button
              variant="outlined"
              onClick={() => {
                const next = itemsToShow + 6;
                setItemsToShow(next);
              }}
            >
              Ver más propiedades
            </Button>
          </Box>
        )}
      </Container>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(data) => {
          localStorage.setItem("token", data.token);
          localStorage.setItem("nombre1", data.nombre1);
          localStorage.setItem("apellido1", data.apellido1);
          setAuthModalOpen(false);

          if (pendingReservationId) {
            navigate(`/reservar/${pendingReservationId}`);
            setPendingReservationId(null);
          }
        }}
      />
    </ThemeProvider>
  );
};

export default Home;
