// Dentro de tu componente DetallePropiedad
import React, { useState, useEffect } from "react";
import {
  Dialog,
  IconButton,
  Box,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useApi } from "../../Services/Apis";

const GaleriaImagenes = ({ propiedadId, open, onClose }) => {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { getRequest } = useApi();

  useEffect(() => {
    if (!open || !propiedadId) return;

    const fetchImagenes = async () => {
      setLoading(true);
      try {
        const res = await getRequest(`/api/propiedad/imagenes/${propiedadId}`);
        setImagenes(res.data?.imagenes || []);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Error cargando imágenes:", err);
        setImagenes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImagenes();
  }, [open, propiedadId]);

  const mostrarAnterior = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const mostrarSiguiente = () => {
    if (currentIndex < imagenes.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      hideBackdrop
      PaperProps={{
        sx: {
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          boxShadow: "none",
        },
      }}
    >
      <Backdrop
        open={true}
        sx={{
          position: "absolute",
          zIndex: 1,
          color: "#fff",
          backgroundColor: "transparent",
        }}
        onClick={onClose}
      />

      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "rgba(255,255,255,0.1)",
          color: "white",
          zIndex: 3,
        }}
      >
        <CloseIcon />
      </IconButton>

      {!loading && imagenes.length > 1 && currentIndex > 0 && (
        <IconButton
          onClick={mostrarAnterior}
          sx={{
            position: "absolute",
            left: 24,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(255,255,255,0.15)",
            color: "white",
            zIndex: 3,
          }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
      )}

      {!loading &&
        imagenes.length > 1 &&
        currentIndex < imagenes.length - 1 && (
          <IconButton
            onClick={mostrarSiguiente}
            sx={{
              position: "absolute",
              right: 24,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(255,255,255,0.15)",
              color: "white",
              zIndex: 3,
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        )}

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
        zIndex={2}
        sx={{ px: 4 }}
      >
        {loading ? (
          <CircularProgress color="inherit" />
        ) : (
          <Box
            component="img"
            src={imagenes[currentIndex]?.imagenBase64}
            alt={imagenes[currentIndex]?.nombreArchivo}
            sx={{
              maxWidth: "90vw",
              maxHeight: "80vh",
              borderRadius: 2,
              boxShadow: 3,
            }}
          />
        )}
      </Box>
    </Dialog>
  );
};

export default GaleriaImagenes;
