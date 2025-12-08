import React from "react";
import { Link } from "react-router-dom";

export default function FullClientTable({
  clients = [],
  handleSort,
  getSortArrow,
}) {
  return (
    <div className="client-table-container">
      <table className="client-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>ID {getSortArrow("id")}</th>
            <th onClick={() => handleSort("clientName")}>
              Client Name {getSortArrow("clientName")}
            </th>

            <th>Default Language</th>
            <th>List Of Language</th>

            <th>Default Display Language</th>
            <th>Display Language List</th>

            <th>Header Logo</th>
            <th>Powered By Logo</th>

            <th>Menu Color</th>
            <th>Sub Menu Color</th>
            <th>Text Color</th>
            <th>Mobile Header Color</th>
            <th>Mobile Menu BG</th>

            <th>Header Text</th>
            <th>Welcome Text</th>
            <th>Welcome Body</th>

            <th>Product Logo</th>
            <th>Home BG Color</th>
            <th>Home Launcher Logo</th>

            {/* STICKY ACTION HEADER */}
            <th className="sticky-col">Actions</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((r) => (
            <tr key={r.id}>
              <td>#{r.id}</td>
              <td>{r.clientName}</td>

              <td>{r.defaultLanguage}</td>
              <td>
                {Array.isArray(r.listOfLanguage)
                  ? r.listOfLanguage.join(", ")
                  : r.listOfLanguage}
              </td>

              <td>{r.defaultDisplayLanguage}</td>
              <td>
                {Array.isArray(r.listOfDisplayLanguage)
                  ? r.listOfDisplayLanguage.join(", ")
                  : r.listOfDisplayLanguage}
              </td>

              <td>{r.headerLogo}</td>
              <td>{r.poweredByLogo}</td>

              <td>{r.menuColor}</td>
              <td>{r.subMenuColor}</td>
              <td>{r.textColor}</td>
              <td>{r.mobileHeaderColor}</td>
              <td>{r.mobileMenuBgColor}</td>

              <td>{r.headerText}</td>
              <td>{r.welcomeText}</td>
              <td>{r.welcomeBody}</td>

              <td>{r.productLogo}</td>
              <td>{r.homeBgColor}</td>
              <td>{r.homeLauncherLogo}</td>

              {/* STICKY COLUMN CELL */}
              <td className="sticky-col">
                <Link
                  to={`/edit-client/${r.id}`}
                  className="btn hollow edit-btn"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}

          {clients.length === 0 && (
            <tr>
              <td colSpan={30} style={{ textAlign: "center", padding: 16 }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
