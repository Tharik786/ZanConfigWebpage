import React from "react";
import { Link } from "react-router-dom";

export default function NotificationConfigTable({
  rows = [],
  handleSort,
  getSortArrow,
}) {
  return (
    <div className="client-table-container">
      <table className="client-table">
        <thead>
          <tr>
            <th onClick={() => handleSort("id")}>
              ID {getSortArrow("id")}
            </th>

            <th onClick={() => handleSort("clientName")}>
              Client Name {getSortArrow("clientName")}
            </th>

            <th>Push</th>
            <th>Time Restriction</th>
            <th>Weekend Restriction</th>
            <th>Alert Interval</th>

            <th>Janitor Issue Interval</th>
            <th>Maintenance Issue Interval</th>

            <th>Feedback Duplicate Filter</th>
            <th>Feedback Filter Count</th>

            <th>Device Email Flag</th>
            <th>Feedback Combined Flag</th>
            <th>Feedback Email Flag</th>
            <th>Feedback Text Flag</th>
            <th>Device Text Flag</th>

            <th>QR Janitor Push</th>
            <th>QR Janitor Text Flag</th>
            <th>QR Janitor Email Flag</th>

            <th>Open Area Traffic Flag</th>

            <th>Escalation Type</th>
            <th>Escalation L1</th>
            <th>Escalation L2</th>
            <th>Not Clean Escalation</th>

            <th>Cleaning Schedule Flag</th>
            <th>Dispatched Interval</th>

            <th>Device Data Time Interval</th>
            <th>Toilet Paper Threshold</th>
            <th>Paper Towel Threshold</th>
            <th>Trash Threshold</th>
            <th>Area Alert Threshold</th>

            <th>Traffic Alert</th>

            {/* STICKY ACTION HEADER */}
            <th className="sticky-col">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => {
            const cid = r.clientId;

            return (
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
                <td>{r.deviceTextFlag}</td>

                <td>{r.qrJanitorpush}</td>
                <td>{r.qrJanitorTextFlag}</td>
                <td>{r.qrJanitorEmailFlag}</td>

                <td>{r.openAreaTrafficFlag}</td>

                <td>{r.escalationType}</td>
                <td>{r.escalationLevel1Interval}</td>
                <td>{r.escalationLevel2Interval}</td>
                <td>{r.notCleanEscalationInterval}</td>

                <td>{r.cleaningScheduleFlag}</td>
                <td>{r.dispatchedInterval}</td>

                <td>{r.deviceDataTimeInterval}</td>
                <td>{r.toiletPaperThreshold}</td>
                <td>{r.paperTowelThreshold}</td>
                <td>{r.trashThreshold}</td>
                <td>{r.areaAlertThreshold}</td>

                <td>{r.trafficAlert}</td>

                {/* STICKY ACTION COLUMN */}
                <td className="sticky-col">
                  <Link
                    to={`/edit-client/${cid}`}
                    className="btn hollow edit-btn"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td colSpan={40} style={{ padding: 16, textAlign: "center" }}>
                No notification configuration records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
