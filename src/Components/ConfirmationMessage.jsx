import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import Icon from "@mdi/react";
import { mdiAlert, mdiClose, mdiCancel, mdiCheck } from "@mdi/js";
import "../styles/Panel.css";

const ConfirmationMessage = ({
  titulo,
  mensaje,
  warning = false,
  onConfirmation,
  onCancel,
}) => {
  const MENSAJE = "Si deseo continuar";
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");
  const [errors, setErrors] = useState({
    mensajeConfirmacion: "",
  });

  const validarMensajeConfirmacion = (mensajeIngresado) => {
    if (!mensajeIngresado) {
      setErrors({
        mensajeConfirmacion: "Debe ingresar el mensaje de confirmación.",
      });
      return false;
    }
    if (mensajeIngresado !== MENSAJE) {
      setErrors({
        mensajeConfirmacion:
          "El mensaje de confirmación debe ser exactamente igual.",
      });
      return false;
    }
    setErrors({ mensajeConfirmacion: "" });
    return true;
  };

  const onConfirmationWarning = () => {
    const isValid = validarMensajeConfirmacion(mensajeConfirmacion);
    if (isValid) {
      onConfirmation();
    }
  };

  const handleConfirmClick = () => {
    if (warning) {
      onConfirmationWarning();
    } else {
      onConfirmation();
    }
  };

  return (
    <Dialog
      open={Boolean(mensaje)}
      onClose={onCancel}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "0rem",
        },
      }}
    >
      <DialogTitle
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "1.4rem",
          paddingTop: "2rem",
          paddingBottom: "1rem",
          backgroundColor: warning ? "var(--rojo)" : "inherit",
          borderBottom: warning
            ? ".1rem solid var(--rojo)"
            : ".2rem solid var(--gris)",
          color: warning ? "var(--blanco)" : "var(--negro)",
        }}
      >
        <Box display="flex" alignItems="center" gap="1rem">
          {warning && <Icon path={mdiAlert} size={1.5} />}
          <Typography variant="h1" fontWeight={"400"} fontSize={25}>
            {titulo}
          </Typography>
        </Box>

        <Icon
          path={mdiClose}
          style={{ cursor: "pointer", color: warning ? "white" : "inherit" }}
          onClick={onCancel}
          size={1}
        />
      </DialogTitle>

      <DialogContent>
        <DialogContentText
          className="dialog-content-text"
          sx={{
            fontSize: "1.6rem !important",
            color: "rgba(0, 0, 0, 0.7)",
          }}
        >
          {mensaje}
        </DialogContentText>

        {warning && (
          <DialogContentText
            className="dialog-content-text"
            sx={{
              fontSize: "1.3rem",
              color: "rgba(0, 0, 0, 0.7)",
              marginTop: "1.5rem",
            }}
          >
            <b>NOTA: </b> Esta acción es <b>irrevocable</b>, para continuar, por
            favor escribe "Si deseo continuar"
            <TextField
              size="medium"
              value={mensajeConfirmacion}
              onChange={(e) => {
                setMensajeConfirmacion(e.target.value);
                validarMensajeConfirmacion(e.target.value);
              }}
              error={!!errors.mensajeConfirmacion}
              helperText={errors.mensajeConfirmacion}
              required
              margin="normal"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderRadius: "0",
                },
                "& .MuiInputBase-input": {
                  fontSize: "1.3rem",
                },
                "& .MuiFormHelperText-root": {
                  fontSize: "1rem",
                },
              }}
            />
          </DialogContentText>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "flex-end",
          padding: "16px 24px",
        }}
      >
        <button
          onClick={onCancel}
          className={warning ? "button-primary" : "button-secondary"}
          style={{
            display: "flex",
            alignContent: "center",
            alignItems: "center",
            gap: ".5rem",
          }}
        >
          <Icon path={mdiCancel} size={1} />
          Cancelar
        </button>
        <button
          onClick={handleConfirmClick}
          className={warning ? "button-secondary" : "button-primary"}
          style={{
            display: "flex",
            alignContent: "center",
            alignItems: "center",
            gap: ".5rem",
          }}
        >
          <Icon path={mdiCheck} size={1} />
          Confirmar
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationMessage;
