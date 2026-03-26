import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ProductsList from "./components/ProductsList";
import ProductDetail from "./components/ProductDetail";
import ProductForm from "./components/ProductForm";
import UsersList from "./components/UsersList";
import UserForm from "./components/UserForm";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProductsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <UsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserForm />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;