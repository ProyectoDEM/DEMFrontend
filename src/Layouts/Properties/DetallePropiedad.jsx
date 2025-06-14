import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  Divider,
  Rating,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  Chip,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import PaymentIcon from "@mui/icons-material/Payment";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
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
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CommentIcon from "@mui/icons-material/Comment";
import RateReviewIcon from "@mui/icons-material/RateReview";
import AddCommentIcon from "@mui/icons-material/AddComment";
import NavigationBar from "../../Components/NavigationBar";
import { useApi } from "../../Services/Apis";
import { showAlert } from "../../Components/AlertMessage";
import GaleriaImagenes from "./GaleriaImagenes";

const DetallePropiedad = () => {
  const location = useLocation();
  const propiedadInicial = location.state?.propiedad;
  const [propiedad, setPropiedad] = useState(propiedadInicial);
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRequest, postRequest } = useApi();
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cantidadPersonas, setCantidadPersonas] = useState(1);
  const [errors, setErrors] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [resenas, setResenas] = useState([]);
  const [misReservas, setMisReservas] = useState([]);
  const [loadingResenas, setLoadingResenas] = useState(false);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [galeriaAbierta, setGaleriaAbierta] = useState(false);
  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    reservaId: null,
    propiedadId: null,
    calificacion: 0,
    comentario: "",
    loading: false,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [metodosPago, setMetodosPago] = useState([]);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState("");
  const [loadingMetodosPago, setLoadingMetodosPago] = useState(false);

  useEffect(() => {
    if (propiedadInicial) {
      // Ya se pasó la propiedad, no es necesario hacer fetch
      fetchResenas(propiedadInicial.propiedadId);
      fetchMisReservas(propiedadInicial.propiedadId);
      fetchMetodosPago();
    } else {
      // Backup: hacer fetch si por alguna razón no vino la propiedad
      const fetchPropiedad = async () => {
        try {
          const { data } = await getRequest("/api/propiedad/propiedades");
          const propiedadData = data.propiedades.find(
            (p) => p.propiedadId.toString() === id
          );
          setPropiedad(propiedadData);

          fetchResenas(propiedadData.propiedadId);
          fetchMisReservas(propiedadData.propiedadId);
          fetchMetodosPago();
        } catch (err) {
          console.error("❌ Error al cargar propiedad:", err);
          showSnackbar("Error al cargar la propiedad", "error");
        }
      };

      fetchPropiedad();
    }
  }, [id]);

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const fetchMetodosPago = async () => {
    setLoadingMetodosPago(true);
    try {
      const response = await getRequest("/api/reserva/listar-metodos-pago");
      console.log("Métodos de pago obtenidos:", response);

      if (response && response.data && response.data.metodosPago) {
        setMetodosPago(response.data.metodosPago);
        // Seleccionar el primer método por defecto
        if (response.data.metodosPago.length > 0) {
          setMetodoPagoSeleccionado(response.data.metodosPago[0].metodoPagoId);
        }
      } else {
        setMetodosPago([]);
        showSnackbar("No se pudieron cargar los métodos de pago", "warning");
      }
    } catch (error) {
      console.error("Error al cargar métodos de pago:", error);
      setMetodosPago([]);
      showSnackbar("Error al cargar los métodos de pago", "error");
    } finally {
      setLoadingMetodosPago(false);
    }
  };

  const fetchResenas = async (propiedadId) => {
    setLoadingResenas(true);
    try {
      const response = await getRequest(
        `/api/resena/listar-resenas/${propiedadId}`
      );

      console.log("RESPONSE RESENA", response);
      if (response?.data?.resenas) {
        setResenas(response.data.resenas);
      } else {
        setResenas([]);
      }
    } catch (error) {
      console.error("Error al cargar reseñas:", error);
      setResenas([]);
    } finally {
      setLoadingResenas(false);
    }
  };

  const fetchMisReservas = async (propiedadId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No hay token, no se pueden cargar reservas");
      return;
    }

    setLoadingReservas(true);
    try {
      // Obtener las reservas del usuario
      const response = await getRequest(`/api/reserva/listar-reservas/${propiedadId}`);
      console.log("Respuesta de reservas:", response);

      if (response && response.data && response.data.reservas) {
        // Filtrar solo las reservas de esta propiedad
        const reservasPropiedad = response.data.reservas.filter(
          (r) => r.propiedadId === Number.parseInt(propiedadId)
        );
        console.log(
          "Reservas filtradas para esta propiedad:",
          reservasPropiedad
        );
        setMisReservas(reservasPropiedad);
      } else {
        console.log("No se encontraron reservas en la respuesta");
        setMisReservas([]);
      }
    } catch (error) {
      console.error("Error al cargar reservas:", error);
      setMisReservas([]);
    } finally {
      setLoadingReservas(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenReviewDialog = (reservaId = null) => {
  if (!misReservas || misReservas.length === 0) {
    // Mostrar alerta o notificación al usuario
    showAlert("No cuentas con ninguna reserva registrada para poder hacer una reseña.", "warning");
    return; // Salir sin abrir el diálogo
  }

  // Selección lógica del ID de reserva
  let selectedReservaId = reservaId;

  if (!selectedReservaId && misReservas.length > 0) {
    selectedReservaId = misReservas[0].reservaId;
  } else if (!selectedReservaId) {
    selectedReservaId = null; // ID por defecto si no hay reservas, aunque este caso ya no se dará
  }

  console.log("Abriendo dialog de reseña con reservaId:", selectedReservaId);

  setReviewDialog({
    open: true,
    reservaId: selectedReservaId,
    propiedadId: Number.parseInt(id),
    calificacion: 0,
    comentario: "",
    loading: false,
  });
};


  const handleCloseReviewDialog = () => {
    setReviewDialog({
      open: false,
      reservaId: null,
      propiedadId: null,
      calificacion: 0,
      comentario: "",
      loading: false,
    });
  };

  const handleReviewChange = (field, value) => {
    setReviewDialog({
      ...reviewDialog,
      [field]: value,
    });
  };

  const handleSubmitReview = async () => {
    console.log("Iniciando envío de reseña...");

    // Validar datos
    if (!reviewDialog.calificacion || reviewDialog.calificacion === 0) {
      showSnackbar("Debes seleccionar una calificación", "error");
      return;
    }

    if (!reviewDialog.comentario || reviewDialog.comentario.trim() === "") {
      showSnackbar("Debes escribir un comentario", "error");
      return;
    }

    if (!reviewDialog.propiedadId) {
      showSnackbar("Error: No se pudo identificar la propiedad", "error");
      return;
    }

    if (!reviewDialog.reservaId) {
      showSnackbar("Error: No se pudo identificar la reserva", "error");
      return;
    }

    setReviewDialog({
      ...reviewDialog,
      loading: true,
    });

    try {
      // Preparar los datos exactamente como los espera la API
      const reviewData = {
        propiedadId: Number.parseInt(reviewDialog.propiedadId),
        reservaId: Number.parseInt(reviewDialog.reservaId),
        calificacion: Number.parseInt(reviewDialog.calificacion),
        comentario: reviewDialog.comentario.trim(),
      };

      console.log("Datos de reseña a enviar:", reviewData);
      console.log("URL de la API:", "/api/resena/crear");

      // Verificar que tenemos token
      const token = localStorage.getItem("token");
      if (!token) {
        showSnackbar("Debes iniciar sesión para dejar una reseña", "error");
        return;
      }

      console.log("Token encontrado, enviando petición...");

      // Enviar reseña a la API
      const response = await postRequest("/api/resena/crear", reviewData);
      const resultado = response.status === 200;
      const detalleUsuario = response.data.detalleUsuario || {};


      console.log("Respuesta de la API:", response);

      if(resultado) {
        // Agregar la nueva reseña a la lista local para mostrarla inmediatamente
        const nuevaResena = {
          resenaId: Date.now(), // ID temporal
          usuarioNombre: localStorage.getItem("nombre1") || "Usuario",
          calificacion: reviewData.calificacion,
          comentario: reviewData.comentario,
          fechaCreacion: new Date().toISOString(),
        };

        setResenas((prevResenas) => [nuevaResena, ...prevResenas]);

        showAlert(detalleUsuario || "¡Reseña enviada correctamente!", "success");
        
        handleCloseReviewDialog();

        

        // Cambiar a la pestaña de reseñas para mostrar la nueva reseña
        setTabValue(0);

        console.log("¿El diálogo está abierto?:", reviewDialog.open);
      }
      else{
        showSnackbar(detalleUsuario || "No se pudo crear la reseña", "error");
      }
      
    } catch (error) {
      console.error("Error completo al enviar reseña:", error);
      console.error("Error response:", error?.response);
      console.error("Error data:", error?.response?.data);

      let errorMessage = "Error al enviar la reseña. Intenta nuevamente.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.detalleUsuario) {
        errorMessage = error.response.data.detalleUsuario;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showSnackbar(errorMessage, "error");
    } finally {
      setReviewDialog((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

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
    if (!metodoPagoSeleccionado)
      newErrors.metodoPago = "Seleccione un método de pago.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showSnackbar("Debes iniciar sesión para reservar", "warning");
      //navigate("/");
      return;
    }

    const reservaData = {
      propiedadId: Number.parseInt(id),
      fechaInicio,
      fechaFin,
      cantidadPersonas: Number.parseInt(cantidadPersonas),
      metodoPagoId: Number.parseInt(metodoPagoSeleccionado),
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
        const detalleUsuario =
          response.data?.detalleUsuario || "Error al crear la reserva";
        showAlert(detalleUsuario, "error");
        // Aquí NO navegas, permitiendo que el usuario corrija en la misma página
      }
    } catch (error) {
      // Error de red u otro inesperado
      showAlert("Error inesperado, intenta de nuevo más tarde", "error");
      console.error(error);
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Función para obtener el color del estado de la reserva
  const getReservaStatusColor = (estado) => {
    if (!estado) return "default";

    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes("confirmada")) return "success";
    if (estadoLower.includes("completada")) return "primary";
    if (estadoLower.includes("cancelada")) return "error";
    if (estadoLower.includes("pendiente")) return "warning";
    return "default";
  };

  const getPaymentIcon = (descripcion) => {
    const desc = descripcion.toLowerCase();
    if (desc.includes("tarjeta") || desc.includes("crédito")) {
      return <CreditCardIcon fontSize="small" />;
    }
    if (desc.includes("paypal")) {
      return <PaymentIcon fontSize="small" />;
    }
    if (desc.includes("transferencia") || desc.includes("bancaria")) {
      return <AccountBalanceIcon fontSize="small" />;
    }
    return <PaymentIcon fontSize="small" />;
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

            <Button
              variant="outlined"
              size="small"
              sx={{ mt: 3, ml: 0 }}
              onClick={() => setGaleriaAbierta(true)}
            >
              Ver todas las imágenes
            </Button>
          </CardContent>
        </Card>

        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 4 }}>
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
            </Box>

            {/* Sección de reseñas y reservas */}
            <Paper elevation={1} sx={{ borderRadius: 2, mt: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2,
                  pt: 2,
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="standard"
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  <Tab
                    label="Reseñas"
                    icon={<CommentIcon />}
                    iconPosition="start"
                  />
                </Tabs>




                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddCommentIcon />}
                  onClick={() => handleOpenReviewDialog()}
                  sx={{ borderRadius: 2, mb: 1, backgroundColor: "#ff385c" }}
                >
                  Dejar reseña
                </Button>





              </Box>

              {/* Panel de Reseñas */}
              {tabValue === 0 && (
                <Box sx={{ p: 3 }}>
                  {loadingResenas ? (
                    <Box display="flex" justifyContent="center" p={3}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : resenas.length > 0 ? (
                    <>
                      {/* Promedio general */}
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Rating
                          value={
                            resenas.reduce(
                              (sum, r) => sum + r.calificacion,
                              0
                            ) / resenas.length
                          }
                          precision={0.1}
                          readOnly
                          size="medium"
                        />
                        <Typography variant="body2" color="text.secondary">
                          ({resenas.length} reseña
                          {resenas.length > 1 ? "s" : ""})
                        </Typography>
                      </Box>

                      {/* Distribución */}
                      <Box mb={2}>
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = resenas.filter(
                            (r) => r.calificacion === star
                          ).length;
                          return (
                            <Box
                              key={star}
                              display="flex"
                              alignItems="center"
                              gap={1}
                              mb={0.5}
                            >
                              <Rating value={star} readOnly size="small" />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {count} reseña{count !== 1 ? "s" : ""}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>

                      {/* Lista de reseñas */}
                      <List>
                        {resenas.map((resena, index) => (
                          <React.Fragment key={resena.resenaId || index}>
                            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                              <Box sx={{ width: "100%" }}>
                                <Box
                                  display="flex"
                                  justifyContent="space-between"
                                  alignItems="center"
                                >
                                  <Box display="flex" alignItems="center">
                                    <Avatar
                                      sx={{
                                        bgcolor: "primary.main",
                                        width: 32,
                                        height: 32,
                                        mr: 1,
                                      }}
                                    >
                                      {resena.usuarioNombre?.charAt(0) || "U"}
                                    </Avatar>
                                    <Typography variant="subtitle2">
                                      {resena.usuarioNombre || "Usuario"}{" "}
                                      {resena.usuarioApellido || ""}
                                    </Typography>
                                  </Box>
                                  <Rating
                                    value={resena.calificacion}
                                    readOnly
                                    size="small"
                                    emptyIcon={
                                      <StarBorderIcon fontSize="inherit" />
                                    }
                                  />
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{ mt: 1, ml: 5 }}
                                >
                                  {resena.comentario}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ mt: 0.5, ml: 5, display: "block" }}
                                >
                                  {formatDate(resena.fechaCreacion)}
                                </Typography>
                              </Box>
                            </ListItem>
                            {index < resenas.length - 1 && (
                              <Divider component="li" />
                            )}
                          </React.Fragment>
                        ))}
                      </List>
                    </>
                  ) : (
                    <Box textAlign="center" py={3}>
                      <CommentIcon
                        sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                      />
                      <Typography variant="body1" color="text.secondary">
                        Por el momento no hay reseñas disponibles para esta
                        propiedad.
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Sé el primero en compartir tu experiencia con otros
                        viajeros.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* Panel de Mis Reservas */}
              {tabValue === 1 && (
                <Box sx={{ p: 3 }}>
                  {loadingReservas ? (
                    <Box display="flex" justifyContent="center" p={3}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : misReservas.length > 0 ? (
                    <List>
                      {misReservas.map((reserva, index) => (
                        <React.Fragment key={reserva.reservaId || index}>
                          <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                            <Box sx={{ width: "100%" }}>
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Chip
                                  label={reserva.estadoReservaDescripcion}
                                  color={getReservaStatusColor(
                                    reserva.estadoReservaDescripcion
                                  )}
                                  size="small"
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Reserva #{reserva.reservaId}
                                </Typography>
                              </Box>

                              <Box sx={{ mt: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <EventIcon fontSize="small" color="action" />
                                  {formatDate(reserva.fechaInicio)} -{" "}
                                  {formatDate(reserva.fechaFin)}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    mt: 0.5,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <PeopleIcon fontSize="small" color="action" />
                                  {reserva.cantidadPersonas}{" "}
                                  {reserva.cantidadPersonas === 1
                                    ? "persona"
                                    : "personas"}
                                </Typography>
                              </Box>

                              {/* Botón para dejar reseña para cualquier reserva */}
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<RateReviewIcon />}
                                onClick={() =>
                                  handleOpenReviewDialog(reserva.reservaId)
                                }
                                sx={{ mt: 1.5, borderRadius: 2 }}
                              >
                                Dejar reseña
                              </Button>
                            </Box>
                          </ListItem>
                          {index < misReservas.length - 1 && (
                            <Divider component="li" />
                          )}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box textAlign="center" py={3}>
                      <EventIcon
                        sx={{ fontSize: 40, color: "text.secondary", mb: 1 }}
                      />
                      <Typography variant="body1" color="text.secondary">
                        No tienes reservas para esta propiedad
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Puedes dejar una reseña usando el botón de arriba
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
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
                  <FormControl
                    fullWidth
                    error={Boolean(errors.metodoPago)}
                    disabled={loadingMetodosPago}
                  >
                    <InputLabel>Método de pago</InputLabel>
                    <Select
                      value={metodoPagoSeleccionado}
                      label="Método de pago"
                      onChange={(e) =>
                        setMetodoPagoSeleccionado(e.target.value)
                      }
                      sx={{
                        bgcolor: "background.paper",
                        width: "250px",
                        borderRadius: 2,
                        "& .MuiSelect-select": {
                          paddingLeft: 2,
                          paddingY: 1.5,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      {metodosPago.map((metodo) => (
                        <MenuItem
                          key={metodo.metodoPagoId}
                          value={metodo.metodoPagoId}
                        >
                          <ListItemIcon>
                            {getPaymentIcon(metodo.descripcion)}
                          </ListItemIcon>
                          <ListItemText primary={metodo.descripcion} />
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.metodoPago && (
                      <FormHelperText>{errors.metodoPago}</FormHelperText>
                    )}
                    {loadingMetodosPago && (
                      <FormHelperText>
                        Cargando métodos de pago...
                      </FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {fechaInicio && fechaFin && propiedad.precioPorNoche && (
                  <Grid item xs={12}>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Resumen de la reserva:
                      </Typography>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="body2">
                          {Math.ceil(
                            (new Date(fechaFin) - new Date(fechaInicio)) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          noche(s) × ${propiedad.precioPorNoche}
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="primary.main"
                        >
                          $
                          {(
                            Math.ceil(
                              (new Date(fechaFin) - new Date(fechaInicio)) /
                                (1000 * 60 * 60 * 24)
                            ) * propiedad.precioPorNoche
                          ).toLocaleString()}
                        </Typography>
                      </Box>
                      {metodoPagoSeleccionado && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: "block" }}
                        >
                          Método de pago:{" "}
                          {
                            metodosPago.find(
                              (m) => m.metodoPagoId === metodoPagoSeleccionado
                            )?.descripcion
                          }
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ borderRadius: 2, textTransform: "none", backgroundColor: "#ff385c" }}
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

      {/* Dialog para crear reseña */}
      <Dialog
        open={reviewDialog.open}
        onClose={handleCloseReviewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <RateReviewIcon />
            Dejar una reseña
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Selector de Reserva */}
            <FormControl fullWidth>
              <InputLabel id="reserva-select-label">Selecciona una reserva</InputLabel>
              <Select
                labelId="reserva-select-label"
                value={reviewDialog.reservaId || ""}
                label="Selecciona una reserva"
                onChange={(e) => {
                  const selectedId = e.target.value;
                  console.log("Reserva seleccionada:", selectedId);
                  setReviewDialog((prev) => ({
                    ...prev,
                    reservaId: selectedId,
                  }));
                }}
                disabled={misReservas.length === 0}
              >
                {misReservas.map((reserva) => (
                  <MenuItem key={reserva.reservaId} value={reserva.reservaId}>
                    Reserva #{reserva.reservaId} - {reserva.fechaInicio} a {reserva.fechaFin}
                  </MenuItem>
                ))}
              </Select>
              {misReservas.length === 0 && (
                <FormHelperText>No tienes reservas disponibles para reseñar</FormHelperText>
              )}
            </FormControl>

            {/* Calificación */}
            <Box>
              <Typography variant="body1" fontWeight={500} gutterBottom>
                ¿Cómo calificarías tu experiencia?
              </Typography>
              <Rating
                name="calificacion"
                value={reviewDialog.calificacion}
                onChange={(event, newValue) => {
                  console.log("Calificación seleccionada:", newValue);
                  handleReviewChange("calificacion", newValue);
                }}
                precision={1}
                size="large"
                emptyIcon={<StarBorderIcon fontSize="inherit" />}
                sx={{ fontSize: "2rem" }}
              />
              {reviewDialog.calificacion === 0 && (
                <FormHelperText error>
                  Por favor selecciona una calificación
                </FormHelperText>
              )}
            </Box>

            {/* Comentario */}
            <TextField
              label="Comentario"
              multiline
              rows={4}
              fullWidth
              value={reviewDialog.comentario}
              onChange={(e) => {
                console.log("Comentario actualizado:", e.target.value);
                handleReviewChange("comentario", e.target.value);
              }}
              placeholder="Comparte tu experiencia con otros usuarios..."
              error={reviewDialog.comentario.trim() === ""}
              helperText={
                reviewDialog.comentario.trim() === ""
                  ? "Por favor escribe un comentario"
                  : `${reviewDialog.comentario.length}/500 caracteres`
              }
              inputProps={{ maxLength: 500 }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleCloseReviewDialog}
            disabled={reviewDialog.loading}
            size="large"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={
              reviewDialog.loading ||
              reviewDialog.calificacion === 0 ||
              reviewDialog.comentario.trim() === "" ||
              !reviewDialog.reservaId
            }
            startIcon={
              reviewDialog.loading ? (
                <CircularProgress size={20} />
              ) : (
                <RateReviewIcon />
              )
            }
            size="large"
            sx={{ minWidth: 140 }}
          >
            {reviewDialog.loading ? "Enviando..." : "Enviar reseña"}
          </Button>
        </DialogActions>
      </Dialog>


      <GaleriaImagenes
        propiedadId={propiedad?.propiedadId}
        open={galeriaAbierta}
        onClose={() => setGaleriaAbierta(false)}
      />

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DetallePropiedad;
