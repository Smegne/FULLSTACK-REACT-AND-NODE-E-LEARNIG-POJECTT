import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Updated to named import

const PrivateRoute = ({ children, allowedRoles = ["admin"] }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch (err) {
    console.error('Invalid token:', err);
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;