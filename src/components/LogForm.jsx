import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/api";

const EMPTY_STATUS = { status: "OFF", start_hour: 0, end_hour: 0, location: "", remarks: "" };

export default function LogForm({ driver, onSave }) {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    truck_number: "",
    trailer_number: "",
    total_miles_driving: 0,
    shipping_documents: "",
    shipper_commodity: "",
    remarks: "",
    signed: false,
  });

  const [statuses, setStatuses] = useState([
    { status: "OFF", start_hour: 0, end_hour: 24, location: "", remarks: "" },
  ]);

  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.getLog(id).then((log) => {
        setForm({
          date: log.date,
          truck_number: log.truck_number,
          trailer_number: log.trailer_number,
          total_miles_driving: log.total_miles_driving,
          shipping_documents: log.shipping_documents,
          shipper_commodity: log.shipper_commodity,
          remarks: log.remarks,
          signed: log.signed,
        });
        if (log.statuses?.length > 0) setStatuses(log.statuses);
      });
    }
  }, [id, isEdit]);

  const updateStatus = (i, field, value) => {
    const updated = [...statuses];
    updated[i] = { ...updated[i], [field]: field.includes("hour") ? parseFloat(value) || 0 : value };
    setStatuses(updated);
  };

  const addStatus = () => {
    const last = statuses[statuses.length - 1];
    setStatuses([...statuses, { ...EMPTY_STATUS, start_hour: last?.end_hour || 0 }]);
  };

  const removeStatus = (i) => {
    if (statuses.length <= 1) return;
    setStatuses(statuses.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate statuses cover 0-24 and don't overlap
    const sorted = [...statuses].sort((a, b) => a.start_hour - b.start_hour);
    for (const s of sorted) {
      if (s.start_hour >= s.end_hour) {
        setError("Each status entry must have end_hour > start_hour.");
        return;
      }
      if (s.start_hour < 0 || s.end_hour > 24) {
        setError("Hours must be between 0 and 24.");
        return;
      }
    }

    const data = {
      driver: driver.id,
      ...form,
      statuses: sorted.map(({ id, duration_hours, ...rest }) => rest),
    };

    try {
      if (isEdit) {
        await api.updateLog(id, data);
      } else {
        await api.createLog(data);
      }
      onSave();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!driver) return <p>Select a driver first.</p>;

  return (
    <form className="log-form" onSubmit={handleSubmit}>
      <h2>{isEdit ? "Edit" : "New"} Daily Log</h2>
      {error && <div className="error-msg">{error}</div>}

      <div className="form-grid">
        <label>
          Date
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </label>
        <label>
          Truck #
          <input value={form.truck_number} onChange={(e) => setForm({ ...form, truck_number: e.target.value })} />
        </label>
        <label>
          Trailer #
          <input value={form.trailer_number} onChange={(e) => setForm({ ...form, trailer_number: e.target.value })} />
        </label>
        <label>
          Total Miles Driving
          <input type="number" step="0.1" value={form.total_miles_driving} onChange={(e) => setForm({ ...form, total_miles_driving: e.target.value })} />
        </label>
        <label>
          Shipping Documents
          <input value={form.shipping_documents} onChange={(e) => setForm({ ...form, shipping_documents: e.target.value })} />
        </label>
        <label>
          Shipper & Commodity
          <input value={form.shipper_commodity} onChange={(e) => setForm({ ...form, shipper_commodity: e.target.value })} />
        </label>
      </div>

      <h3>Duty Statuses</h3>
      <p className="help-text">Enter duty periods covering the full 24-hour day (0.0 = midnight, 12.0 = noon, 24.0 = midnight end).</p>

      <div className="statuses-table">
        <div className="status-header">
          <span>Status</span>
          <span>Start (h)</span>
          <span>End (h)</span>
          <span>Location</span>
          <span>Remarks</span>
          <span></span>
        </div>
        {statuses.map((s, i) => (
          <div key={i} className="status-row">
            <select value={s.status} onChange={(e) => updateStatus(i, "status", e.target.value)}>
              <option value="OFF">Off Duty</option>
              <option value="SB">Sleeper Berth</option>
              <option value="D">Driving</option>
              <option value="ON">On Duty (Not Driving)</option>
            </select>
            <input type="number" step="0.25" min="0" max="24" value={s.start_hour} onChange={(e) => updateStatus(i, "start_hour", e.target.value)} />
            <input type="number" step="0.25" min="0" max="24" value={s.end_hour} onChange={(e) => updateStatus(i, "end_hour", e.target.value)} />
            <input value={s.location} onChange={(e) => updateStatus(i, "location", e.target.value)} placeholder="City, State" />
            <input value={s.remarks} onChange={(e) => updateStatus(i, "remarks", e.target.value)} />
            <button type="button" className="btn btn-sm btn-danger" onClick={() => removeStatus(i)}>✕</button>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-secondary" onClick={addStatus}>+ Add Status Period</button>

      <div className="form-footer">
        <label className="checkbox-label">
          <input type="checkbox" checked={form.signed} onChange={(e) => setForm({ ...form, signed: e.target.checked })} />
          Sign this log
        </label>
        <label>
          Remarks
          <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} rows={2} />
        </label>
        <button type="submit" className="btn btn-primary">{isEdit ? "Update" : "Create"} Log</button>
      </div>
    </form>
  );
}
