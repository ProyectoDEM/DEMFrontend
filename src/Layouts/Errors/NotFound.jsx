import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box, Paper } from "@mui/material";

const NotFound = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
        <Typography variant="h2" fontWeight="bold" color="primary" gutterBottom>
          404
        </Typography>
        <Typography variant="h6" gutterBottom>
          ¡Vaya! No encontramos lo que buscabas.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Haz clic en el botón para volver al inicio.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRedirect}
          sx={{ textTransform: "none", borderRadius: 2 }}
        >
          Volver al inicio
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFound;
