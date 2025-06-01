import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AuthModal from "../../Layouts/Auth/AuthModal";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setShowModal(true);
    }
  }, [location]);

  if (!isAuthenticated && showModal) {
    return <AuthModal open={true} onClose={() => setShowModal(false)} />;
  }

  return children;
};

export default ProtectedRoute;
