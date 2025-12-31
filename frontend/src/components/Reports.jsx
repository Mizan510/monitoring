import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function Reports() {
  // Function to get today's date in local YYYY-MM-DD format
  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // Month is 0-based
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const [start, setStart] = useState(getToday());
  const [end, setEnd] = useState(getToday());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loggedUser, setLoggedUser] = useState(null);

  // Fetch logged-in user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setLoggedUser(res.data);
      } catch (err) {
        console.error("Failed to fetch logged-in user:", err);
      }
    };
    fetchUser();
  }, []);

  // Fetch users under logged-in admin
  useEffect(() => {
    const fetchUsers = async () => {
      if (!loggedUser) return;
      try {
        const res = await api.get(`/auth/users?adminId=${loggedUser._id}`);
        const filteredUsers = res.data.users.filter(
          (u) => u.role !== "admin" && u._id !== loggedUser._id
        );
        setUsers(filteredUsers || []);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, [loggedUser]);

  // Fetch records based on filters
  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedUser) params.append("userId", selectedUser);
      if (start) params.append("start", start);
      if (end) params.append("end", end);

      const res = await api.get("/records?" + params.toString());
      setRecords(res.data.records || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  // Reset filters and records
  const handleReset = () => {
    setStart(getToday());
    setEnd(getToday());
    setSelectedUser("");
    setRecords([]);
  };

  // Export records to Excel
  const exportExcel = async () => {
    if (!records.length) {
      alert("No records to export");
      return;
    }

    try {
      const params = new URLSearchParams();
      if (selectedUser) params.append("userId", selectedUser);
      if (start) params.append("start", start);
      if (end) params.append("end", end);

      const res = await api.get("/records/export?" + params.toString(), {
        responseType: "blob",
      });

      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${selectedUser || "all"}_${getToday()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.msg || "Export failed");
    }
  };

  // Mapping field names to human-readable labels
  const fieldLabels = {
    // Forecast
    salesForecast: "Sales Forecast",
    strategicRxForecast: "Strategic Rx Forecast",
    focusRxForecast: "Focus Rx Forecast",
    emergingRxForecast: "Emerging Rx Forecast",
    newProductRxForecast: "New Product Rx Forecast",
    opdRxForecast: "OPD Rx Forecast",
    gpRxForecast: "GP Rx Forecast",
    dischargeRxForecast: "Discharge Rx Forecast",
    totalRxForecast: "Total Rx Forecast",

    // Rx Section
    totalStrategicBasketRx: "Total Strategic Basket Rx",
    totalFocusBasketRx: "Total Focus Basket Rx",
    totalEmergingBasketRx: "Total Emerging Basket Rx",
    totalNewProductRx: "Total New Product Rx",

    totalBasketandNewProductRx: "Total Basket and New Product Rx",
    opdRx: "OPD Rx",
    dischargeRx: "Discharge Rx",
    gpRx: "GP Rx",

    SBUCRxWithoutBasketandNewProductRx: "SBU-C Rx (Without Basket and New product)",
    totalRxs: "Total Rxs",

    // Order Section
    SBUCOrderRouteName: "SBUC Order Route Name",
    noOfPartySBUCOrderRoute: "No of Party SBUC Order Route",
    noOfCollectedOrderSBUC: "No of Collected Orders SBUC",
    noOfNotGivingOrderParty: "No of Not Giving Orders Party",
    causeOfNotGivingOrder: "Cause of Not Giving Orders",
    marketTotalOrder: "Market Total Order",

    // Strategic Basket
    NeuroBOrder: "Neuro-B Order",
    CalboralDDXOrder: "Calboral D/DX Order",
    ToraxOrder: "Torax Order",
    AceAceplusOrder: "Ace, Ace plus Order",

    // Focus Basket
    ZimaxOrder: "Zimax Order",
    CalboDOrder: "Calbo-D Order",
    AnadolAnadolplusOrder: "Anadol, Anadol plus Order",

    // Emerging Basket
    SafyronOrder: "Safyron Order",
    DBalanceOrder: "D-Balance Order",
    TezoOrder: "Tezo Order",
    ContilexContilexTSOrder: "Contilex, Contilex TS Order",
    MaxrinMaxrinDOrder: "Maxrin, Maxrin D Order",

    // Survey
    rxSendInDIDS: "Rx Send in DIDS",
    writtenRxInSurveyPad: "Written Rx in Survey Pad",
    indoorSurvey: "Indoor Survey",
  };

  // Dynamic table columns
  const dynamicFields = records[0]
    ? Object.keys(records[0]).filter((k) => k !== "_id" && k !== "userId")
    : [];

  // Compute totals for numeric columns
  const totals = {};
  const numericFields = [];

  if (records.length > 0) {
    dynamicFields.forEach((f) => {
      if (records.every((r) => !isNaN(parseFloat(r[f])) && r[f] !== null && r[f] !== undefined)) {
        numericFields.push(f);
      }
    });

    numericFields.forEach((f) => {
      totals[f] = records.reduce((sum, r) => sum + parseFloat(r[f] || 0), 0);
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Reports</h2>

      <div className="flex gap-4 mb-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-sm">Start</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">End</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="border p-2 rounded"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm">User</label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select User</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div className="self-end flex gap-2">
          <button onClick={fetchReports} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? "Loading..." : "View"}
          </button>
          <button onClick={handleReset} className="bg-yellow-700 text-white px-4 py-2 rounded">
            Reset
          </button>
          <button onClick={exportExcel} className="bg-indigo-600 text-white px-4 py-2 rounded">
            Export Excel
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Created At</th>
              {dynamicFields.map((f) => (
                <th key={f} className="p-2 text-left">
                  {fieldLabels[f] || f} {/* Show human-readable label */}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? (
              records.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-2 text-sm">{new Date(r.createdAt).toLocaleString()}</td>
                  {dynamicFields.map((f) => (
                    <td key={f} className="p-2">
                      {r[f] ?? ""}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={dynamicFields.length + 1} className="p-4 text-center text-gray-500">
                  Please filter records
                </td>
              </tr>
            )}

            {records.length > 0 && (
              <tr className="bg-gray-200 font-semibold border-t">
                <td className="p-2">Total</td>
                {dynamicFields.map((f) => (
                  <td key={f} className="p-2">
                    {numericFields.includes(f) ? totals[f] : ""}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
