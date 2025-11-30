import React from "react";
import { Link } from "react-router-dom";

export default function FullClientTable({
  clients = [],
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

            <th>Default Language</th>
            <th>List of Languages</th>
            <th>Default Display Language</th>
            <th>List of Display Languages</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((c) => (
            <tr key={c.id}>
              <td>#{c.id}</td>
              <td>{c.clientName}</td>
              <td>{c.defaultLanguage}</td>
              <td>{c.listOfLanguage}</td>
              <td>{c.defaultDisplayLanguage}</td>
              <td>{c.listOfDisplayLanguage}</td>

              <td>
                <Link to={`/edit-client/${c.id}`} className="btn hollow">
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
