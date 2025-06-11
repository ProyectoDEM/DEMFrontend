"use client";

import { useEffect, useState, useRef } from "react";
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
  Chip,
  Divider,
  Paper,
  Avatar,
  CardActions,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BedIcon from "@mui/icons-material/Bed";
import BathtubIcon from "@mui/icons-material/Bathtub";
import PeopleIcon from "@mui/icons-material/People";
import HotelIcon from "@mui/icons-material/Hotel";
import HomeIcon from "@mui/icons-material/Home";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ImageIcon from "@mui/icons-material/Image";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useApi } from "../../Services/Apis";
import NavigationBar from "../../Components/NavigationBar";

const MisPropiedades = () => {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState({
    open: false,
    propiedad: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    propiedadId: null,
  });
  const [imageDialog, setImageDialog] = useState({
    open: false,
    propiedadId: null,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [menuAnchor, setMenuAnchor] = useState({
    element: null,
    propiedadId: null,
  });
  const [loadingActions, setLoadingActions] = useState({});

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { getRequest, deleteRequest, putRequest, postRequest } = useApi();

  useEffect(() => {
    fetchMisPropiedades();
  }, []);

  const fetchMisPropiedades = async () => {
    setLoading(true);
    try {
      const response = await getRequest("/api/propiedad/mis-propiedades");
      if (response.data && response.data.propiedades) {
        setPropiedades(response.data.propiedades || []);
      } else {
        setPropiedades([]);
        console.error("Formato de respuesta inesperado:", response.data);
      }
    } catch (error) {
      console.error("Error al cargar propiedades del usuario", error);
      setPropiedades([]);
      showSnackbar("Error al cargar las propiedades", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const setActionLoading = (propiedadId, isLoading) => {
    setLoadingActions((prev) => ({
      ...prev,
      [propiedadId]: isLoading,
    }));
  };

  // Eliminar propiedad
  const handleEliminar = async (propiedadId) => {
    setActionLoading(propiedadId, true);

    try {
      const res = await deleteRequest(
        `/api/propiedad/eliminar-propiedad/${propiedadId}`
      );

      // Si el backend responde con 200 pero incluye mensaje de error
      if (res?.data?.detalleUsuario || res?.data?.errores?.length) {
        const mensaje = res.data.detalleUsuario || res.data.errores[0];
        showSnackbar(mensaje, "warning");
      } else {
        // Eliminarla del estado local
        setPropiedades((prev) =>
          prev.filter(
            (prop) => String(prop.propiedadId) !== String(propiedadId)
          )
        );

        showSnackbar("Propiedad eliminada correctamente", "success");
      }

      setDeleteDialog({ open: false, propiedadId: null });
    } catch (error) {
      console.error("Error al eliminar propiedad:", error);

      const errorData = error?.response?.data;

      if (errorData?.detalleUsuario) {
        showSnackbar(errorData.detalleUsuario, "error");
      } else if (
        Array.isArray(errorData?.errores) &&
        errorData.errores.length
      ) {
        showSnackbar(errorData.errores[0], "error");
      } else {
        showSnackbar("Error al eliminar la propiedad", "error");
      }
    } finally {
      setActionLoading(propiedadId, false);

      fetchMisPropiedades();
    }
  };

  // Actualizar propiedad
  const handleActualizar = async (propiedadData) => {
    setActionLoading(propiedadData.propiedadId, true);
    try {
      const response = await postRequest(
        "/api/propiedad/actualizar",
        propiedadData
      );

      // Actualizar la lista local
      setPropiedades((prev) =>
        prev.map((prop) =>
          prop.propiedadId === propiedadData.propiedadId
            ? { ...prop, ...propiedadData }
            : prop
        )
      );

      showSnackbar("Propiedad actualizada correctamente", "success");
      setEditDialog({ open: false, propiedad: null });
    } catch (error) {
      console.error("Error al actualizar propiedad:", error);
      showSnackbar("Error al actualizar la propiedad", "error");
    } finally {
      setActionLoading(propiedadData.propiedadId, false);
    }
  };

  // Cambiar disponibilidad
  const handleCambiarDisponibilidad = async (
    propiedadId,
    nuevaDisponibilidad
  ) => {
    setActionLoading(propiedadId, true);
    try {
      await putRequest("/api/propiedad/cambiar-disponibilidad", {
        propiedadId,
        disponibilidad: nuevaDisponibilidad,
      });

      // Actualizar la lista local
      setPropiedades((prev) =>
        prev.map((prop) =>
          prop.propiedadId === propiedadId
            ? { ...prop, disponibilidad: nuevaDisponibilidad }
            : prop
        )
      );

      showSnackbar(
        `Propiedad ${
          nuevaDisponibilidad ? "activada" : "desactivada"
        } correctamente`,
        "success"
      );
    } catch (error) {
      console.error("Error al cambiar disponibilidad:", error);
      showSnackbar("Error al cambiar la disponibilidad", "error");
    } finally {
      setActionLoading(propiedadId, false);
    }
  };

  // Eliminar imagen
  const handleEliminarImagen = async (imagenId, propiedadId) => {
    setActionLoading(propiedadId, true);
    try {
      await deleteRequest(`/api/propiedad/eliminar-imagen/${imagenId}`);

      // Actualizar la propiedad local para quitar la imagen
      setPropiedades((prev) =>
        prev.map((prop) =>
          prop.propiedadId === propiedadId
            ? { ...prop, imagenBase64: null, imagenId: null }
            : prop
        )
      );

      showSnackbar("Imagen eliminada correctamente", "success");
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      showSnackbar("Error al eliminar la imagen", "error");
    } finally {
      setActionLoading(propiedadId, false);
    }
  };

  // Guardar imagen
  const handleGuardarImagen = async () => {
    if (!selectedImage || !imageDialog.propiedadId) {
      showSnackbar("Debes seleccionar una imagen", "error");
      return;
    }

    setActionLoading(imageDialog.propiedadId, true);

    try {
      // Crear FormData para enviar la imagen
      const formData = new FormData();
      formData.append("propiedadId", imageDialog.propiedadId);
      formData.append("imagen", selectedImage);

      // Enviar la imagen al servidor
      const response = await postRequest(
        "/api/propiedad/guardar-imagen",
        formData
      );

      // Si la API devuelve la imagen en base64, actualizar la propiedad
      if (response.data && response.data.imagenBase64) {
        setPropiedades((prev) =>
          prev.map((prop) =>
            prop.propiedadId === imageDialog.propiedadId
              ? {
                  ...prop,
                  imagenBase64: response.data.imagenBase64,
                  imagenId: response.data.imagenId,
                }
              : prop
          )
        );
      } else {
        // Si no devuelve la imagen, recargar las propiedades
        await fetchMisPropiedades();
      }

      showSnackbar("Imagen guardada correctamente", "success");
      handleCloseImageDialog();
    } catch (error) {
      console.error("Error al guardar la imagen:", error);
      showSnackbar("Error al guardar la imagen", "error");
    } finally {
      setActionLoading(imageDialog.propiedadId, false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);

      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenImageDialog = (propiedadId) => {
    setImageDialog({ open: true, propiedadId });
    setSelectedImage(null);
    setImagePreview(null);
    handleMenuClose();
  };

  const handleCloseImageDialog = () => {
    setImageDialog({ open: false, propiedadId: null });
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handlePublicarClick = () => {
    navigate("/publicar");
  };

  const handleVolverClick = () => {
    navigate(-1);
  };

  const handleVerDetalles = (id) => {
    navigate(`/propiedad/${id}`);
  };

  const handleMenuClick = (event, propiedadId) => {
    setMenuAnchor({ element: event.currentTarget, propiedadId });
  };

  const handleMenuClose = () => {
    setMenuAnchor({ element: null, propiedadId: null });
  };

  const openEditDialog = (propiedad) => {
    setEditDialog({ open: true, propiedad: { ...propiedad } });
    handleMenuClose();
  };

  const openDeleteDialog = (propiedadId) => {
    setDeleteDialog({ open: true, propiedadId });
    handleMenuClose();
  };

  // Función para truncar texto largo
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Función para formatear precio
  const formatPrice = (price) => {
    if (!price && price !== 0) return "Precio no disponible";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
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

  // Función para obtener el color del badge según el tipo de propiedad
  const getTipoColor = (tipo) => {
    if (!tipo) return "default";

    const tipoLower = tipo.toLowerCase();
    if (tipoLower.includes("casa")) return "primary";
    if (tipoLower.includes("apartamento")) return "secondary";
    if (tipoLower.includes("cabaña")) return "warning";
    if (tipoLower.includes("hotel")) return "info";
    return "default";
  };

  return (
    <>
      <NavigationBar />
      <Box sx={{ bgcolor: "#f5f5f5", minHeight: "100vh", pb: 6 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 0,
            py: 3,
            px: 4,
            mb: 4,
            bgcolor: "white",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            maxWidth="1200px"
            mx="auto"
          >
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Mis propiedades
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Administra tus alojamientos publicados
                {propiedades.length > 0 && (
                  <Typography component="span" sx={{ ml: 1, fontWeight: 500 }}>
                    ({propiedades.length}{" "}
                    {propiedades.length === 1 ? "propiedad" : "propiedades"})
                  </Typography>
                )}
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={handleVolverClick}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Volver
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddHomeWorkIcon />}
                onClick={handlePublicarClick}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  boxShadow: 2,
                }}
              >
                Publicar nuevo
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Box maxWidth="1200px" mx="auto" px={3}>
          {loading ? (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              minHeight="300px"
            >
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" mt={2}>
                Cargando tus propiedades...
              </Typography>
            </Box>
          ) : !propiedades.length ? (
            <Paper
              elevation={2}
              sx={{
                textAlign: "center",
                py: 8,
                px: 4,
                borderRadius: 3,
                bgcolor: "white",
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "primary.light",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <AddHomeWorkIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Aún no has publicado ninguna propiedad
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 500, mx: "auto", mb: 4 }}
              >
                Comienza a publicar tus alojamientos para que los huéspedes
                puedan encontrarlos y realizar reservas.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AddHomeWorkIcon />}
                onClick={handlePublicarClick}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  px: 4,
                  py: 1.5,
                  boxShadow: 3,
                }}
              >
                Publicar mi primer alojamiento
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {propiedades.map((prop) => (
                <Grid item xs={12} sm={6} md={4} key={prop.propiedadId}>
                  <Card
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: 6,
                      },
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      opacity: loadingActions[prop.propiedadId] ? 0.7 : 1,
                    }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={
                          prop.imagenBase64 ||
                          "/placeholder.svg?height=200&width=400"
                        }
                        alt={prop.titulo}
                        sx={{ objectFit: "cover" }}
                      />

                      {/* Botón para cambiar imagen */}
                      <Tooltip title="Cambiar imagen">
                        <IconButton
                          sx={{
                            position: "absolute",
                            bottom: 12,
                            left: 12,
                            bgcolor: "rgba(255,255,255,0.9)",
                            "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                          }}
                          onClick={() =>
                            handleOpenImageDialog(prop.propiedadId)
                          }
                        >
                          <AddPhotoAlternateIcon />
                        </IconButton>
                      </Tooltip>

                      {/* Chips de estado y tipo */}
                      <Box
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        <Chip
                          label={
                            prop.disponibilidad ? "Disponible" : "No disponible"
                          }
                          color={prop.disponibilidad ? "success" : "error"}
                          size="small"
                          sx={{
                            fontWeight: 500,
                            boxShadow: 1,
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            handleCambiarDisponibilidad(
                              prop.propiedadId,
                              !prop.disponibilidad
                            )
                          }
                        />
                        <Chip
                          icon={
                            <HomeIcon sx={{ fontSize: "0.8rem !important" }} />
                          }
                          label={prop.tipoPropiedadDescripcion}
                          color={getTipoColor(prop.tipoPropiedadDescripcion)}
                          size="small"
                          sx={{
                            fontWeight: 500,
                            boxShadow: 1,
                            "& .MuiChip-label": { px: 0.5 },
                            "& .MuiChip-icon": { ml: 0.5 },
                          }}
                        />
                      </Box>

                      {/* Menú de opciones */}
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          bgcolor: "rgba(255,255,255,0.9)",
                          "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                        }}
                        onClick={(e) => handleMenuClick(e, prop.propiedadId)}
                      >
                        <MoreVertIcon />
                      </IconButton>

                      {/* Precio */}
                      {prop.precioPorNoche !== undefined && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: "rgba(0,0,0,0.6)",
                            color: "white",
                            p: 1,
                            px: 2,
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <AttachMoneyIcon
                            sx={{ fontSize: 18, mr: 0.5, opacity: 0.9 }}
                          />
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{ textShadow: "0px 1px 2px rgba(0,0,0,0.5)" }}
                          >
                            {formatPrice(prop.precioPorNoche)}
                            <Typography
                              component="span"
                              variant="caption"
                              sx={{ ml: 0.5, opacity: 0.9 }}
                            >
                              / noche
                            </Typography>
                          </Typography>
                        </Box>
                      )}

                      {/* Loading overlay */}
                      {loadingActions[prop.propiedadId] && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: "rgba(255,255,255,0.8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <CircularProgress size={30} />
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Typography
                        variant="h6"
                        fontWeight={600}
                        gutterBottom
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {prop.titulo}
                      </Typography>

                      <Box
                        display="flex"
                        alignItems="center"
                        mb={1.5}
                        sx={{ color: "text.secondary" }}
                      >
                        <LocationOnIcon
                          sx={{ fontSize: 16, mr: 0.5, color: "primary.main" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {prop.direccion}, {prop.ciudad}, {prop.pais}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          mb: 2,
                          height: "40px",
                        }}
                      >
                        {truncateText(prop.descripcion, 100)}
                      </Typography>

                      <Divider sx={{ my: 1.5 }} />

                      <Grid container spacing={1} sx={{ mt: 0.5 }}>
                        <Grid item xs={4}>
                          <Box
                            display="flex"
                            alignItems="center"
                            title="Habitaciones"
                          >
                            <BedIcon
                              sx={{
                                fontSize: 18,
                                mr: 0.5,
                                color: "text.secondary",
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {prop.habitaciones || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box display="flex" alignItems="center" title="Baños">
                            <BathtubIcon
                              sx={{
                                fontSize: 18,
                                mr: 0.5,
                                color: "text.secondary",
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {prop.banos || 0}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box display="flex" alignItems="center" title="Camas">
                            <HotelIcon
                              sx={{
                                fontSize: 18,
                                mr: 0.5,
                                color: "text.secondary",
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {prop.camas || 0}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box
                        display="flex"
                        alignItems="center"
                        mt={1.5}
                        title="Capacidad máxima"
                      >
                        <PeopleIcon
                          sx={{
                            fontSize: 18,
                            mr: 0.5,
                            color: "text.secondary",
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {prop.capacidadMaxima || 0}{" "}
                          {prop.capacidadMaxima === 1 ? "persona" : "personas"}{" "}
                          máx.
                        </Typography>
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={1.5}
                      >
                        Publicado: {formatDate(prop.fechaCreacion)}
                      </Typography>
                    </CardContent>

                    <CardActions
                      sx={{
                        justifyContent: "center",
                        px: 2,
                        pb: 2,
                        pt: 0,
                      }}
                    >
                      <Button
                        fullWidth
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleVerDetalles(prop.propiedadId)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 500,
                        }}
                      >
                        Ver detalles
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Menú contextual */}
        <Menu
          anchorEl={menuAnchor.element}
          open={Boolean(menuAnchor.element)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem
            onClick={() => {
              const propiedad = propiedades.find(
                (p) => p.propiedadId === menuAnchor.propiedadId
              );
              openEditDialog(propiedad);
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Editar propiedad</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => handleOpenImageDialog(menuAnchor.propiedadId)}
          >
            <ListItemIcon>
              <AddPhotoAlternateIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cambiar imagen</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              const propiedad = propiedades.find(
                (p) => p.propiedadId === menuAnchor.propiedadId
              );
              handleCambiarDisponibilidad(
                propiedad.propiedadId,
                !propiedad.disponibilidad
              );
            }}
          >
            <ListItemIcon>
              {propiedades.find((p) => p.propiedadId === menuAnchor.propiedadId)
                ?.disponibilidad ? (
                <ToggleOffIcon fontSize="small" />
              ) : (
                <ToggleOnIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {propiedades.find((p) => p.propiedadId === menuAnchor.propiedadId)
                ?.disponibilidad
                ? "Marcar como no disponible"
                : "Marcar como disponible"}
            </ListItemText>
          </MenuItem>

          {propiedades.find((p) => p.propiedadId === menuAnchor.propiedadId)
            ?.imagenId && (
            <MenuItem
              onClick={() => {
                const propiedad = propiedades.find(
                  (p) => p.propiedadId === menuAnchor.propiedadId
                );
                handleEliminarImagen(propiedad.imagenId, propiedad.propiedadId);
              }}
            >
              <ListItemIcon>
                <ImageIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Eliminar imagen</ListItemText>
            </MenuItem>
          )}

          <Divider />

          <MenuItem
            onClick={() => openDeleteDialog(menuAnchor.propiedadId)}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Eliminar propiedad</ListItemText>
          </MenuItem>
        </Menu>

        {/* Dialog de edición */}
        <Dialog
          open={editDialog.open}
          onClose={() => setEditDialog({ open: false, propiedad: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Editar Propiedad</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Título"
                value={editDialog.propiedad?.titulo || ""}
                onChange={(e) =>
                  setEditDialog((prev) => ({
                    ...prev,
                    propiedad: { ...prev.propiedad, titulo: e.target.value },
                  }))
                }
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Descripción"
                multiline
                rows={3}
                value={editDialog.propiedad?.descripcion || ""}
                onChange={(e) =>
                  setEditDialog((prev) => ({
                    ...prev,
                    propiedad: {
                      ...prev.propiedad,
                      descripcion: e.target.value,
                    },
                  }))
                }
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Precio por noche"
                type="number"
                value={editDialog.propiedad?.precioPorNoche || ""}
                onChange={(e) =>
                  setEditDialog((prev) => ({
                    ...prev,
                    propiedad: {
                      ...prev.propiedad,
                      precioPorNoche: Number.parseFloat(e.target.value),
                    },
                  }))
                }
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={editDialog.propiedad?.disponibilidad || false}
                    onChange={(e) =>
                      setEditDialog((prev) => ({
                        ...prev,
                        propiedad: {
                          ...prev.propiedad,
                          disponibilidad: e.target.checked,
                        },
                      }))
                    }
                  />
                }
                label="Disponible"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setEditDialog({ open: false, propiedad: null })}
              startIcon={<CancelIcon />}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleActualizar(editDialog.propiedad)}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loadingActions[editDialog.propiedad?.propiedadId]}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog para subir imagen */}
        <Dialog
          open={imageDialog.open}
          onClose={handleCloseImageDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Cambiar imagen de la propiedad</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                pt: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {imagePreview ? (
                <Box sx={{ mb: 3, width: "100%", position: "relative" }}>
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Vista previa"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "300px",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "rgba(255,255,255,0.8)",
                    }}
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                    }}
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "200px",
                    border: "2px dashed",
                    borderColor: "divider",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                    cursor: "pointer",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PhotoCameraIcon
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    gutterBottom
                  >
                    Haz clic para seleccionar una imagen
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    JPG, PNG o GIF (máx. 5MB)
                  </Typography>
                </Box>
              )}

              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleImageChange}
              />

              <Button
                variant="outlined"
                startIcon={<AddPhotoAlternateIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mt: 2 }}
                fullWidth
              >
                {imagePreview ? "Cambiar imagen" : "Seleccionar imagen"}
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseImageDialog} startIcon={<CancelIcon />}>
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarImagen}
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={
                !selectedImage || loadingActions[imageDialog.propiedadId]
              }
            >
              Guardar imagen
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de confirmación de eliminación */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, propiedadId: null })}
        >
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent>
            <Typography>
              ¿Estás seguro de que deseas eliminar esta propiedad? Esta acción
              no se puede deshacer.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setDeleteDialog({ open: false, propiedadId: null })
              }
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleEliminar(deleteDialog.propiedadId)}
              color="error"
              variant="contained"
              disabled={loadingActions[deleteDialog.propiedadId]}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

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
      </Box>
    </>
  );
};

export default MisPropiedades;
