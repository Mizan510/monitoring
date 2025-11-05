import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/api";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    adminId: "",
  });
  const [admins, setAdmins] = useState([]); // ✅ store admins here
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessPassword, setAccessPassword] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  // ✅ Handle form input
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Fetch admins from backend
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/auth/admins", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(res.data.admins || []);
      } catch (err) {
        console.error("Error fetching admins:", err);
      }
    };
    fetchAdmins();
  }, []);

  // ✅ Submit registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await api.post("/auth/register", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMsg("✅ Successfully registered!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.msg ||
          "Registration failed"
      );
    }
  };

  // ✅ Access verification
  const handleAccessSubmit = (e) => {
    e.preventDefault();
    if (accessPassword === "11221122") {
      setAccessGranted(true);
      setAccessPassword("");
    } else {
      alert("❌ Invalid access password");
      setAccessPassword("");
    }
  };

  // 🔒 Access gate
  if (!accessGranted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <form
          onSubmit={handleAccessSubmit}
          className="bg-white p-6 rounded-xl shadow-lg w-80 text-center"
        >
          <h2 className="text-lg font-semibold mb-4">🔐 Admin Access</h2>
          <input
            type="password"
            placeholder="Enter Access Password"
            value={accessPassword}
            onChange={(e) => setAccessPassword(e.target.value)}
            className="border p-2 rounded w-full mb-4"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition mb-2"
          >
            Verify
          </button>
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="bg-gray-300 text-gray-700 w-full py-2 rounded hover:bg-gray-400 transition"
          >
            Back to Login
          </button>
        </form>
      </div>
    );
  }

  // 🧾 Registration form
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-md mx-auto mt-10 p-6 bg-white rounded shadow"
    >
      <h2 className="text-xl font-semibold text-center">Register User/Admin</h2>

      {successMsg && (
        <p className="text-green-600 text-center font-medium">{successMsg}</p>
      )}

      <input
        type="text"
        name="name"
        placeholder="Name"
        className="border p-2 rounded w-full"
        value={form.name}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        className="border p-2 rounded w-full"
        value={form.email}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        className="border p-2 rounded w-full"
        value={form.password}
        onChange={handleChange}
        required
      />

      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="border p-2 rounded w-full"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      {/* ✅ Show admin dropdown only if role = user */}
      {form.role === "user" && (
        <select
          name="adminId"
          value={form.adminId}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        >
          <option value="">Select Admin</option>
          {admins.map((admin) => (
            <option key={admin._id} value={admin._id}>
              {admin.name}
            </option>
          ))}
        </select>
      )}

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Register
      </button>

      <button
       onClick={() => navigate("/manage-users")}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
        >      
         Manage Users
      </button>


      <p className="text-sm text-gray-700 text-center mt-2">
        Already have an account?{" "}
        <Link className="text-blue-600" to="/login">
          Login
        </Link>
      </p>
    </form>
  );
};

export default Register;
