import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/api";
import LogGrid from "./LogGrid";

export default function LogDetail() {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [violations, setViolations] = useState(null);
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    api.getLog(id).then(setLog);
    api.getViolations(id).then(setViolations).catch(() => {});
    api.getRemaining(id).then(setRemaining).catch(() => {});
  }, [id]);

  if (!log) return <p>Loading...</p>;

  return (
    <div className="log-detail">
      <div className="detail-header">
        <h2>Daily Log — {log.date}</h2>
        <Link to={`/log/${id}/edit`} className="btn btn-primary">Edit</Link>
      </div>

      <div className="detail-info">
        <p><strong>Truck:</strong> {log.truck_number || "—"}</p>
        <p><strong>Trailer:</strong> {log.trailer_number || "—"}</p>
        <p><strong>Miles Driven:</strong> {log.total_miles_driving}</p>
        <p><strong>Signed:</strong> {log.signed ? "Yes" : "No"}</p>
      </div>

      {remaining && (
        <div className="remaining-cards">
          <div className="card"><span className="card-value">{remaining.driving_remaining}h</span><span className="card-label">Driving Left</span></div>
          <div className="card"><span className="card-value">{remaining.window_remaining}h</span><span className="card-label">Window Left</span></div>
          <div className="card"><span className="card-value">{remaining.break_remaining}h</span><span className="card-label">Until Break</span></div>
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

      {log.statuses?.length > 0 && (
        <LogGrid statuses={log.statuses} totalHours={log.total_hours} />
      )}

      {log.remarks && (
        <div className="remarks-section">
          <h3>Remarks</h3>
          <p>{log.remarks}</p>
        </div>
      )}
    </div>
  );
}
