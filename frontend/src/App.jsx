import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { setAuthToken } from "./api/api";
import ManageUsers from "./pages/ManageUsers";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthToken(null);
  };

  return (
    <Router>
      
        <div className="bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">Monitoring App</h1>

          <Routes>
            {/* Home / Landing page */}
            <Route path="/" element={<Home />} />

            {/* Login page */}
            <Route
              path="/login"
              element={
                token ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login onLogin={(t) => setToken(t)} />
                )
              }
            />

            {/* Register page */}
            <Route
              path="/register"
              element={
                token ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Register onLogin={(t) => setToken(t)} />
                )
              }
            />

            {/* Dashboard page (protected) */}
            <Route
              path="/dashboard"
              element={
                token ? (
                  <Dashboard onLogout={logout} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            <Route path="/manage-users" element={<ManageUsers />} />

            {/* Redirect unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      
    </Router>
  );
}

export default App;
