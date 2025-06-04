import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { showAlert } from "../../Components/AlertMessage";
import { useNavigate } from "react-router-dom";
import DEMLogo from "../../assets/DEMLogo.png";
import { useApi } from "../../Services/Apis";

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
  const { postRequest } = useApi();

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
      if (err?.response?.data?.detalleUsuario) {
        showAlert(err.response.data.detalleUsuario, "error");
      } else if (err?.response?.data?.errores?.length) {
        showAlert(err.response.data.errores[0], "error");
      } else {
        showAlert("Ocurrió un error inesperado", "error");
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 0, position: "relative" }}>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          minHeight={480}
        >
          <Box
            sx={{
              flex: 1,
              backgroundColor: "primary.main",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 3,
              gap: 2,
              textAlign: "center",
            }}
          >
            <img
              src={DEMLogo}
              alt="DEM Logo"
              style={{ height: 150, width: 160, marginBottom: 0 }}
            />
            <Typography variant="h5" fontWeight="bold">
              {isLogin ? "Inicia sesión" : "Crea tu cuenta"}
            </Typography>
            <Typography variant="body2">
              {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes una cuenta?"}
            </Typography>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => setIsLogin(!isLogin)}
              sx={{ textTransform: "none", mt: 1, borderRadius: 2 }}
            >
              {isLogin ? "Regístrate" : "Inicia sesión"}
            </Button>
          </Box>

          <Box
            sx={{
              flex: 1,
              position: "relative",
              p: { xs: 3, sm: 4 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <IconButton
              onClick={onClose}
              sx={{ position: "absolute", top: 8, right: 8 }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            {!isLogin && (
              <>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="nombre1"
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Apellido"
                  name="apellido1"
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                />
              </>
            )}

            <TextField
              fullWidth
              label="Correo electrónico"
              name="email"
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
            <TextField
              fullWidth
              label="Contraseña"
              name="password"
              type="password"
              onChange={handleChange}
              variant="outlined"
              size="small"
            />

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 1, borderRadius: 2, textTransform: "none" }}
              onClick={handleSubmit}
            >
              {isLogin ? "Ingresar" : "Registrarse"}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
