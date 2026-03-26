import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    try {
      await getCurrentUser();
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  if (isAuthenticated === null) {
    return <div className="text-center mt-10">Проверка аутентификации...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}