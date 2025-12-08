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

            <th>Soap Dispenser Enabled</th>
            <th>Air Freshener Enabled</th>
            <th>Clean Index Enabled</th>
            <th>Heat Map Enabled</th>
            <th>Scheduler Enabled</th>
            <th>People Count Enabled</th>

            <th>Typical High Value</th>
            <th>Cleaning Threshold</th>
            <th>Analytics Weekend Flag</th>
            <th>Traffic Sensor</th>

            <th>App View Type</th>
            <th>Feedback Alert Config</th>

            <th>Beacon Time Interval</th>
            <th>Soap Shots</th>
            <th>Pump Percentage</th>
            <th>Soap Prediction Enabled</th>

            <th>Label Flag</th>
            <th>Weather Enabled</th>
            <th>Language</th>

            <th>Occupancy Duration Limit</th>
            <th>Password Rotation Interval</th>
            <th>MFA Flag</th>
            <th>Page Reload Interval</th>

            <th>Inspection Type</th>
            <th>Comments Limit</th>
            <th>Janitor Schedule Flag</th>
            <th>Publisher Type</th>

            <th>Available Sensors</th>
            <th>Updated Time</th>
            <th>Feedback Alert Order</th>
            <th>Feedback Default Timeout</th>

            <th>Overview Start Time</th>
            <th>Canned Chart Period</th>
            <th>Data Posting Type</th>

            {/* STICKY ACTION HEADER */}
            <th className="sticky-col">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => {
            const cid = r.clientId;

            return (
              <tr key={r.id}>
                <td>#{cid || r.id}</td>
                <td>{r.clientName || "-"}</td>

                <td>{r.baseClient || "-"}</td>
                <td>{r.dbName || "-"}</td>

                <td>{r.medianFlag}</td>
                <td>{r.stateMaintainHours}</td>
                <td>{r.recentAlertHours}</td>
                <td>{r.notificationListHours}</td>

                <td>{r.trashEnabled}</td>
                <td>{r.paperEnabled}</td>
                <td>{r.hvacEnabled}</td>
                <td>{r.waterFlowEnabled}</td>
                <td>{r.feedbackEnabled}</td>

                <td>{r.soapDispenserEnabled}</td>
                <td>{r.airFreshenerEnabled}</td>
                <td>{r.cleanIndexEnabled}</td>
                <td>{r.heatMapEnabled}</td>
                <td>{r.schedulerEnabled}</td>
                <td>{r.peopleCountEnabled}</td>

                <td>{r.typicalHighValue}</td>
                <td>{r.cleaningThreshold}</td>
                <td>{r.analyticsWeekEndRestrictionFlag}</td>
                <td>{r.trafficSensor}</td>

                <td>{r.appViewType}</td>
                <td>{r.feedbackAlertConfig}</td>

                <td>{r.beaconTimeInterval}</td>
                <td>{r.soapShots}</td>
                <td>{r.pumpPercentage}</td>
                <td>{r.soapPredictionIsEnabled}</td>

                <td>{r.labelFlag}</td>
                <td>{r.weatherEnabled}</td>
                <td>{r.language}</td>

                <td>{r.occupancyDurationLimit}</td>
                <td>{r.passwordRotationInterval}</td>
                <td>{r.mfaFlag}</td>
                <td>{r.pageReloadInterval}</td>

                <td>{r.inspectionType}</td>
                <td>{r.commentsLimit}</td>
                <td>{r.janitorScheduleFlag}</td>
                <td>{r.publisherType}</td>

                <td>{r.availableSensors}</td>
                <td>{r.updatedTime}</td>
                <td>{r.feedbackAlertOrder}</td>
                <td>{r.feedbackDefaultTimeout}</td>

                <td>{r.overViewStartTime}</td>
                <td>{r.cannedChartPeriod}</td>
                <td>{r.dataPostingType}</td>

                {/* STICKY COLUMN */}
                <td className="sticky-col">
                  <Link to={`/edit-client/${cid}`} className="btn hollow edit-btn">
                    Edit
                  </Link>
                </td>
              </tr>
            );
          })}

          {rows.length === 0 && (
            <tr>
              <td colSpan={100} style={{ textAlign: "center", padding: 16 }}>
                No client detail records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
