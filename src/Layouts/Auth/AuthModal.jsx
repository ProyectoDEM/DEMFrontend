import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Grid,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { postRequest } from "../../Services/Apis";
import { showAlert } from "../../components/AlertMessage";
import { useNavigate } from "react-router-dom";

const AuthModal = ({ open, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nombre1: "",
    apellido1: "",
    telefono: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateFields = () => {
    const requiredFields = isLogin
      ? ["email", "password"]
      : ["email", "password", "nombre1", "apellido1", "telefono"];

    for (const field of requiredFields) {
      if (!formData[field]) {
        showAlert(`El campo "${field}" es obligatorio.`, "warning");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateFields()) return;

    const url = isLogin ? "/api/sesion/login" : "/api/usuario/crear";
    const payload = isLogin
      ? {
          email: formData.email,
          contrasenaHash: formData.password,
        }
      : {
          email: formData.email,
          contrasenaHash: formData.password,
          nombre1: formData.nombre1,
          apellido1: formData.apellido1,
          telefono: formData.telefono,
        };

    try {
      const res = await postRequest(url, payload);
      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("nombre1", res.data.nombre1 || "Usuario");
        localStorage.setItem("apellido1", res.data.apellido1 || "");
        showAlert("Bienvenido", "success");
        navigate("/");
        if (onSuccess) {
          onSuccess({
            token: res.data.token,
            nombre1: res.data.nombre1 || "Usuario",
            apellido1: res.data.apellido1 || "",
          });
        }
        onClose();
      } else {
        showAlert("Cuenta creada con éxito", "success");
        setIsLogin(true);
      }
    } catch (err) {
      showAlert("Error de autenticación", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogContent sx={{ p: 0, minHeight: 420 }}>
        <Grid container>
          <Grid
            item
            xs={5}
            sx={{
              backgroundColor: "primary.main",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 3,
            }}
          >
            <Typography variant="h5" fontWeight="bold">
              {isLogin ? "Inicia sesión" : "Crea tu cuenta"}
            </Typography>
            <Typography variant="body2" mt={1}>
              {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes una cuenta?"}
              <Button
                variant="text"
                color="inherit"
                onClick={() => setIsLogin(!isLogin)}
                sx={{ ml: 1 }}
              >
                {isLogin ? "Regístrate" : "Inicia sesión"}
              </Button>
            </Typography>
          </Grid>

          <Grid item xs={7} sx={{ p: 4 }}>
            {!isLogin && (
              <TextField
                fullWidth
                label="Nombre"
                name="nombre1"
                margin="dense"
                onChange={handleChange}
              />
            )}
            {!isLogin && (
              <TextField
                fullWidth
                label="Apellido"
                name="apellido1"
                margin="dense"
                onChange={handleChange}
              />
            )}
            {!isLogin && (
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                margin="dense"
                onChange={handleChange}
              />
            )}
            <TextField
              fullWidth
              label="Correo electrónico"
              name="email"
              margin="dense"
              onChange={handleChange}
            />
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              margin="dense"
              onChange={handleChange}
            />

            <Box mt={3}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                {isLogin ? "Ingresar" : "Registrarse"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
