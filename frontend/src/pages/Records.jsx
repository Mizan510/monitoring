import React, { useState } from 'react';
import FilterPanel from '../components/FilterPanel';
import api from '../api/api';

const Reports = () => {
  const [filter, setFilter] = useState({});

  const handleFilter = async ({ userId, start, end }) => {
    setFilter({ userId, start, end });

    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (start) params.append('start', start);
    if (end) params.append('end', end);

    const url = `/records/export?${params.toString()}`;
    window.open(`${api.defaults.baseURL}${url}`, '_blank');
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">📊 Export Reports</h1>
      <FilterPanel onFilter={handleFilter} />
    </div>
  );
};

export default Reports;
