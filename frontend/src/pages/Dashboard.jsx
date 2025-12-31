import React, { useEffect, useState } from "react";
import SubmitForm from "../components/SubmitForm";
import Reports from "../components/Reports";
import api, { setAuthToken } from "../api/api";
import { useNavigate } from "react-router-dom";

// =================== Auto Logout Hook ===================
function useAutoLogout(onLogout, timeout = 3 * 60 * 1000) {
  const navigate = useNavigate();

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        // Clear auth and redirect
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        setAuthToken(null);
        if (onLogout) onLogout();
        navigate("/login", { replace: true });
      }, timeout);
    };

    // Reset timer on activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // start timer initially

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, [navigate, onLogout, timeout]);
}

// =================== Dashboard Component ===================
const Dashboard = ({ onLogout }) => {
  const [user, setUser] = useState(null);

  // Apply auto logout
  useAutoLogout(onLogout, 3 * 60 * 1000); // 5 minutes

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);

    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me"); // fetch logged-in user
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    fetchUser();
  }, []);

  const role = user?.role?.toLowerCase();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow relative">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {role === "admin" ? "Admin Dashboard" : "User Dashboard"}
            </h1>

            {user ? (
              <p className="text-gray-600 text-sm mt-1 capitalize">
                Welcome {role} (
                <span className="font-medium text-blue-600">{user.name}</span>) 👋
              </p>
            ) : (
              <p className="text-gray-600 text-sm mt-1">Loading...</p>
            )}
          </div>

          <button
            className="text-blue-600 hover:underline"
            onClick={() => {
              localStorage.removeItem("token");
              sessionStorage.removeItem("token");
              setAuthToken(null);
              onLogout();
            }}
          >
            Logout
          </button>
        </div>

        {/* Conditional Sections */}
        {role === "admin" ? (
          <Reports />
        ) : (
          <>
            <div className="mb-6">
              <SubmitForm />
            </div>
            <Reports />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
