import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../api/authApi";

export default function ProtectedRoute({ children, requiredRole }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      setIsAuthenticated(false);
      return;
    }
    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      if (requiredRole) {
        const roleHierarchy = { user: 1, seller: 2, admin: 3 };
        if (roleHierarchy[userData.role] < roleHierarchy[requiredRole]) {
          setIsAuthenticated(false);
          return;
        }
      }
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