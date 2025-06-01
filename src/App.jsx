/* Importaciones */
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/Security/ProtectedRoute";
import NotFound from "./Layouts/Errors/NotFound";
import AlertMessage from "./components/AlertMessage";
import Home from "./Layouts/Home/Home";
import DetallePropiedad from "./Layouts/Properties/DetallePropiedad";
import ReservaPropiedad from "./Layouts/Properties/ReservarPropiedad";
import AuthModal from "./Layouts/Auth/AuthModal";
import MiCuenta from "./Layouts/Account/MiCuenta";
/* Fin Importaciones */

const App = () => {
  return (
    <Router>
      <AlertMessage />
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
          path="/mi-cuenta"
          element={
            <ProtectedRoute>
              <MiCuenta />
            </ProtectedRoute>
          }
        />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
