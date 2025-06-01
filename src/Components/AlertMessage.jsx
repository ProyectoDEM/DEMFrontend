import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AlertMessage = () => {
  return <ToastContainer toastClassName="custom-toast" />;
};

export const showAlert = (message, type = "info", duration = 3000) => {
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

export default AlertMessage;
