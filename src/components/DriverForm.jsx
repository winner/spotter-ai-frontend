import { useState } from "react";
import { api } from "../api/api";

export default function DriverForm({ onSave }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    license_number: "",
    carrier_name: "",
    main_office_address: "",
    home_terminal_address: "",
    cycle_type: "70_8",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const driver = await api.createDriver(form);
      onSave(driver);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="driver-form" onSubmit={handleSubmit}>
      <h2>Add Driver</h2>
      {error && <div className="error-msg">{error}</div>}

      <div className="form-grid">
        <label>
          First Name *
          <input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
        </label>
        <label>
          Last Name *
          <input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
        </label>
        <label>
          License Number *
          <input required value={form.license_number} onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
        </label>
        <label>
          Carrier Name *
          <input required value={form.carrier_name} onChange={(e) => setForm({ ...form, carrier_name: e.target.value })} />
        </label>
        <label>
          Main Office Address
          <input value={form.main_office_address} onChange={(e) => setForm({ ...form, main_office_address: e.target.value })} />
        </label>
        <label>
          Home Terminal Address
          <input value={form.home_terminal_address} onChange={(e) => setForm({ ...form, home_terminal_address: e.target.value })} />
        </label>
        <label>
          HOS Cycle
          <select value={form.cycle_type} onChange={(e) => setForm({ ...form, cycle_type: e.target.value })}>
            <option value="70_8">70-Hour / 8-Day</option>
            <option value="60_7">60-Hour / 7-Day</option>
          </select>
        </label>
      </div>

      <button type="submit" className="btn btn-primary">Add Driver</button>
    </form>
  );
}
