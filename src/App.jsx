/* Importaciones */
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Components/Security/ProtectedRoute";
import NotFound from "./Layouts/Errors/NotFound";
import AlertMessage from "./Components/AlertMessage";
import Home from "./Layouts/Home/Home";
import DetallePropiedad from "./Layouts/Properties/DetallePropiedad";
import ReservaPropiedad from "./Layouts/Properties/ReservarPropiedad";
import AuthModal from "./Layouts/Auth/AuthModal";
import MiCuenta from "./Layouts/Account/MiCuenta";
import Publicar from "./Layouts/Properties/Publicar";
import MisPropiedades from "./Layouts/Properties/MisPropiedades"; // o la ruta correcta
import TokenRefresher from "./Components/Security/TokenRefresher";
/* Fin Importaciones */

const App = () => {
  return (
    <Router>
      <AlertMessage />
      <TokenRefresher />
      <AuthModal open={false} onClose={() => {}} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/propiedad/:id" element={<DetallePropiedad />} />
        <Route
          path="/reservar/:id"
          element={
            <ProtectedRoute>
              <ReservaPropiedad />
            </ProtectedRoute>
          }
        />
        <Route
          path="/publicar"
          element={
            <ProtectedRoute>
              <Publicar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mi-cuenta"
          element={
            <ProtectedRoute>
              <MiCuenta />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-propiedades"
          element={
            <ProtectedRoute>
              <MisPropiedades />
            </ProtectedRoute>
          }
        />

        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
