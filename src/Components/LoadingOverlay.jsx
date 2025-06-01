import CircularProgress from "@mui/material/CircularProgress";
import "../styles/index.css";

const LoadingOverlay = () => {
  return (
    <div className="overlay">
      <CircularProgress
        size={24}
        sx={{
          color: "var(--blanco)",
        }}
      />
    </div>
  );
};

export default LoadingOverlay;
