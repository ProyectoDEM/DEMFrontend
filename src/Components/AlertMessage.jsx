import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Función utilitaria movida fuera del componente
const showAlert = (message, type = "info", duration = 3000) => {
  const toastOptions = {
    autoClose: duration,
    position: "top-right",
  };

  switch (type) {
    case "success":
      toast.success(message, toastOptions);
      break;
    case "error":
      toast.error(message, toastOptions);
      break;
    case "warning":
      toast.warn(message, toastOptions);
      break;
    default:
      toast.info(message, toastOptions);
  }
};

// Componente React
const AlertMessage = () => {
  return <ToastContainer toastClassName="custom-toast" />;
};

// Asignar la función como propiedad estática del componente
AlertMessage.showAlert = showAlert;

// Exports compatibles con Fast Refresh
export { showAlert };
export default AlertMessage;
