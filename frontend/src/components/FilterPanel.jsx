import React, { useState, useEffect } from 'react';
import api from '../api/api';

const FilterPanel = ({ onFilter }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };
    fetchUsers();
  }, []);

  const handleFilter = () => {
    onFilter({ userId: selectedUser, start, end });
  };

  return (
    <div className="bg-white shadow-md p-4 rounded-lg mb-6 flex flex-wrap items-end gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Select User</label>
        <select
          className="border border-gray-300 rounded-md px-3 py-2"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>{u.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Start Date</label>
        <input
          type="date"
          className="border border-gray-300 rounded-md px-3 py-2"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">End Date</label>
        <input
          type="date"
          className="border border-gray-300 rounded-md px-3 py-2"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>

      <button
        onClick={handleFilter}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Apply Filter
      </button>
    </div>
  );
};

export default FilterPanel;
