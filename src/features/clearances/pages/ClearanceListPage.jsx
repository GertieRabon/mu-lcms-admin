// ClearanceListPage.jsx
// Purpose: Displays a list of clearance requests pulled from Supabase
import React, { useEffect, useState } from "react";
import { fetchClearances } from "../services/clearanceService";
import "../clearances.css";

const getStatusClass = (status) => {
  if (!status) return "status-pending";

  switch (status.toUpperCase()) {
    case "CLEARED":
    case "APPROVED":
      return "status-approved";
    case "REJECTED":
      return "status-rejected";
    case "EXPIRED":
      return "status-expired";
    default:
      // Covers "NOT CLEARED" and any other custom values
      return "status-pending";
  }
};

const formatDateTime = (isoString) => {
  if (!isoString) return "N/A";

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;

  return date.toLocaleString();
};

export default function ClearanceListPage() {
  const [clearances, setClearances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadClearances = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchClearances();
        setClearances(data);
      } catch (err) {
        console.error("Failed to load clearances:", err);
        setError(err.message || "Failed to load clearance requests.");
      } finally {
        setLoading(false);
      }
    };

    loadClearances();
  }, []);

  const hasData = !loading && !error && clearances.length > 0;

  return (
    <div className="clearance-container">
      <h2>Clearance Requests</h2>

      {loading && (
        <div className="empty-state">
          <h3>Loading clearance requests...</h3>
          <p>Please wait while we fetch the latest student logs.</p>
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <h3>Unable to load clearance requests</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && clearances.length === 0 && (
        <div className="empty-state">
          <h3>No clearance requests yet</h3>
          <p>New student logs from Supabase will appear here once submitted.</p>
        </div>
      )}

      {hasData && (
        <div className="clearance-list">
          {clearances.map((item) => {
            const student = item.student || {};
            const fullName = [
              student.first_name,
              student.middle_name,
              student.last_name,
            ]
              .filter(Boolean)
              .join(" ");

            const statusClass = getStatusClass(item.clearance_status);

            return (
              <div
                key={item.clearance_id || `${student.student_id}-${item.data_logged}`}
                className="clearance-item"
              >
                <div className="clearance-info">
                  <h4>{fullName || "Unnamed student"}</h4>
                  <p>Student No.: {student.student_number || "—"}</p>
                  <p>Program: {student.program || "—"}</p>
                  <p>Purpose: {student.purpose_of_clearance || "—"}</p>
                  <p>Logged at: {formatDateTime(item.data_logged)}</p>
                </div>
                <div className="clearance-status">
                  <span className={`status-badge ${statusClass}`}>
                    {item.clearance_status || "UNKNOWN"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
