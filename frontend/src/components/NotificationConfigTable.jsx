import React from "react";
import { Link } from "react-router-dom";

export default function NotificationConfigTable({
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

            <th>Push</th>
            <th>Time Restriction</th>
            <th>Weekend Restriction</th>
            <th>Alert Interval</th>
            <th>Janitor Issue Interval</th>
            <th>Maintenance Issue Interval</th>
            <th>Feedback Duplicate Filter Interval</th>
            <th>Feedback Filter Count</th>
            <th>Device Email Flag</th>
            <th>Feedback Combined Flag</th>
            <th>Feedback Email Flag</th>
            <th>Feedback Text Flag</th>

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>#{r.id}</td>
              <td>{r.clientName}</td>
              <td>{r.push}</td>
              <td>{r.timeRestriction}</td>
              <td>{r.weekendRestriction}</td>
              <td>{r.alertInterval}</td>
              <td>{r.janitorIssueInterval}</td>
              <td>{r.maintenanceIssueInterval}</td>
              <td>{r.feedbackDuplicateFilterInterval}</td>
              <td>{r.feedbackFilterCount}</td>
              <td>{r.deviceEmailFlag}</td>
              <td>{r.feedbackCombinedFlag}</td>
              <td>{r.feedbackEmailFlag}</td>
              <td>{r.feedbackTextFlag}</td>

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
