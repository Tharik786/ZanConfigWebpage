import React from "react";
import { Link } from "react-router-dom";

export default function ClientDetailsTable({
  rows = [],
  onDelete,
  handleSort,
  getSortArrow,
}) {
  return (
    <div className="client-table-container">
      <table className="client-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
              ID {getSortArrow("id")}
            </th>

            <th
              onClick={() => handleSort("clientName")}
              style={{ cursor: "pointer" }}
            >
              Client Name {getSortArrow("clientName")}
            </th>

            <th>Base Client</th>
            <th>DB Name</th>
            <th>Median Flag</th>
            <th>State Maintain Hours</th>
            <th>Recent Alert Hours</th>
            <th>Notification List Hours</th>
            <th>Trash Enabled</th>
            <th>Paper Enabled</th>
            <th>HVAC Enabled</th>
            <th>Water Flow Enabled</th>
            <th>Feedback Enabled</th>

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>#{r.id}</td>
              <td>{r.clientName}</td>
              <td>{r.baseClient}</td>
              <td>{r.dbName}</td>
              <td>{r.medianFlag}</td>
              <td>{r.stateMaintainHours}</td>
              <td>{r.recentAlertHours}</td>
              <td>{r.notificationListHours}</td>
              <td>{r.trashEnabled}</td>
              <td>{r.paperEnabled}</td>
              <td>{r.hvacEnabled}</td>
              <td>{r.waterFlowEnabled}</td>
              <td>{r.feedbackEnabled}</td>

              <td>
                <Link to={`/edit-client/${r.clientId}`} className="btn hollow">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
