import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { setAuthToken } from "../api/api.js";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const navigate = useNavigate();

  // Load saved email on first render
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");
    const savedRemember = localStorage.getItem("rememberMe") === "true";

    if (savedRemember && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ Start loading
    try {
      const res = await api.post("/auth/login", { email, password });

      onLogin(res.data.token);
      setAuthToken(res.data.token);

      if (rememberMe) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("rememberMe", "true");
        localStorage.setItem("rememberEmail", email);
      } else {
        sessionStorage.setItem("token", res.data.token);
        localStorage.removeItem("rememberMe");
        localStorage.removeItem("rememberEmail");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      alert(err.response?.data?.errors?.[0]?.msg || err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Remember Me */}
        <label className="flex items-center text-sm text-gray-700 gap-2">
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember Me
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span>Logging in...</span>
            </>
          ) : (
            "Login"
          )}
        </button>

        <p className="text-sm text-gray-700 text-center mt-2">
          Don’t have an account?{" "}
          <Link className="text-blue-600 hover:underline" to="/register">
            Register
          </Link>
        </p>
      </form>

      <div className="text-center mt-4">
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-blue-600 underline text-sm"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default Login;
