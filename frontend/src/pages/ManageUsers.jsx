import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]); // ✅ for submitted data
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("users"); // ✅ toggle between "users" & "records"
  const navigate = useNavigate();

  // ✅ Fetch all users (no login required)
  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users-public");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch all submitted data
  const fetchRecords = async () => {
    try {
      const res = await api.get("/admin/all-records-public"); // <-- Create this API endpoint on backend
      setRecords(res.data);
    } catch (err) {
      console.error("Failed to fetch records:", err);
      alert("Failed to fetch records");
    }
  };

  // ✅ Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users-public/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Delete failed");
    }
  };

  // ✅ Delete record
  const deleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await api.delete(`/admin/all-records-public/${id}`);
      setRecords(records.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Failed to delete record:", err);
      alert("Delete failed");
    }
  };

  // ✅ Update user role
  const toggleRole = async (id, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      await api.put(`/admin/users-public/${id}`, { role: newRole });
      setUsers(
        users.map((u) => (u._id === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Update failed");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="p-6">
      {/* ✅ Header and Buttons */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {viewMode === "users" ? "Manage Users" : "All Submitted Data"}
        </h2>

        <div className="space-x-2">
          {viewMode === "users" ? (
            <button
              onClick={() => {
                fetchRecords();
                setViewMode("records");
              }}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              View All Submitted Data
            </button>
          ) : (
            <button
              onClick={() => setViewMode("users")}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ← Back to Users
            </button>
          )}

          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Back to Login
          </button>
        </div>
      </div>

      {/* ✅ Conditional Table */}
      {viewMode === "users" ? (
        <table className="w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{user.name}</td>
                  <td className="p-2 border">{user.email}</td>
                  <td className="p-2 border capitalize">{user.role}</td>
                  <td className="p-2 border text-center space-x-2">
                    <button
                      onClick={() => toggleRole(user._id, user.role)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {user.role === "admin" ? "Make User" : "Make Admin"}
                    </button>
                    <button
                      onClick={() => deleteUser(user._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <table className="w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Created Data</th>
              <th className="p-2 border">User Name</th>
              <th className="p-2 border">User Role</th>
              <th className="p-2 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-4 text-gray-500">
                  No submitted data found.
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50">
                  <td className="p-2 border">{r.createdAt?.slice(0, 10)}</td>
                  <td className="p-2 border">{r.userName || "Unknown"}</td>
                  <td className="p-2 border capitalize">{r.userRole || "user"}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => deleteRecord(r._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageUsers;
