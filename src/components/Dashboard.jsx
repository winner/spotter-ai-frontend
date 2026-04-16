import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";
import LogGrid from "./LogGrid";

export default function Dashboard({ driver }) {
  const [logs, setLogs] = useState([]);
  const [violations, setViolations] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    if (!driver) return;
    api.getLogs(driver.id).then((res) => {
      const list = res.results || res;
      setLogs(list);
      if (list.length > 0) {
        setSelectedLog(list[0]);
        api.getViolations(list[0].id).then(setViolations).catch(() => {});
        api.getRemaining(list[0].id).then(setRemaining).catch(() => {});
      }
    }).catch(() => {});
  }, [driver]);

  if (!driver) {
    return (
      <div className="empty-state">
        <h2>Welcome to ELD HOS Tracker</h2>
        <p>Start by <Link to="/driver/new">adding a driver</Link>.</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>
            {driver.first_name} {driver.last_name}
          </h1>
          <p className="subtitle">
            {driver.carrier_name} &middot; License: {driver.license_number} &middot; Cycle:{" "}
            {driver.cycle_type === "70_8" ? "70h/8-day" : "60h/7-day"}
          </p>
        </div>
        <Link to="/log/new" className="btn btn-primary">
          + New Daily Log
        </Link>
      </div>

      {remaining && (
        <div className="remaining-cards">
          <div className="card">
            <span className="card-value">{remaining.driving_remaining}h</span>
            <span className="card-label">Driving Left</span>
          </div>
          <div className="card">
            <span className="card-value">{remaining.window_remaining}h</span>
            <span className="card-label">Window Left</span>
          </div>
          <div className="card">
            <span className="card-value">{remaining.break_remaining}h</span>
            <span className="card-label">Until Break</span>
          </div>
          <div className="card">
            <span className="card-value">{remaining.total_driving_today}h</span>
            <span className="card-label">Driven Today</span>
          </div>
        </div>
      )}

      {violations && (violations.daily.length > 0 || violations.cycle.length > 0) && (
        <div className="violations-panel">
          <h3>⚠ Violations</h3>
          {[...violations.daily, ...violations.cycle].map((v, i) => (
            <div key={i} className={`violation ${v.severity}`}>
              <strong>{v.rule}</strong>: {v.description}
            </div>
          ))}
        </div>
      )}

      {selectedLog && selectedLog.statuses && selectedLog.statuses.length > 0 && (
        <div className="grid-section">
          <h2>Daily Log — {selectedLog.date}</h2>
          <LogGrid statuses={selectedLog.statuses} totalHours={selectedLog.total_hours} />
        </div>
      )}

      <div className="logs-list">
        <h2>Recent Logs</h2>
        {logs.length === 0 ? (
          <p>No logs yet. <Link to="/log/new">Create your first log</Link>.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Truck</th>
                <th>Miles</th>
                <th>Driving</th>
                <th>On Duty</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className={selectedLog?.id === log.id ? "selected" : ""}
                  onClick={() => {
                    setSelectedLog(log);
                    api.getViolations(log.id).then(setViolations).catch(() => {});
                    api.getRemaining(log.id).then(setRemaining).catch(() => {});
                  }}
                >
                  <td>{log.date}</td>
                  <td>{log.truck_number || "—"}</td>
                  <td>{log.total_miles_driving}</td>
                  <td>{log.total_hours?.D?.toFixed(1) || "0.0"}h</td>
                  <td>{log.total_hours?.ON?.toFixed(1) || "0.0"}h</td>
                  <td>
                    {log.signed ? (
                      <span className="badge green">Signed</span>
                    ) : (
                      <span className="badge gray">Draft</span>
                    )}
                  </td>
                  <td>
                    <Link to={`/log/${log.id}/edit`} className="btn btn-sm">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
