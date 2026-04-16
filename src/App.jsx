import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { api } from "./api/api";
import Dashboard from "./components/Dashboard";
import LogForm from "./components/LogForm";
import LogDetail from "./components/LogDetail";
import DriverForm from "./components/DriverForm";

export default function App() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getDrivers().then((res) => {
      setDrivers(res.results || res);
      if ((res.results || res).length > 0) {
        setSelectedDriver((res.results || res)[0]);
      }
    }).catch(() => {});
  }, []);

  const refreshDrivers = () => {
    api.getDrivers().then((res) => {
      const list = res.results || res;
      setDrivers(list);
      if (!selectedDriver && list.length > 0) setSelectedDriver(list[0]);
    });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">◉</span> ELD HOS Tracker
          </Link>
          <nav>
            <Link to="/">Dashboard</Link>
            <Link to="/log/new">New Log</Link>
            <Link to="/driver/new">Add Driver</Link>
          </nav>
          {drivers.length > 0 && (
            <select
              className="driver-select"
              value={selectedDriver?.id || ""}
              onChange={(e) => {
                const d = drivers.find((d) => d.id === Number(e.target.value));
                setSelectedDriver(d);
              }}
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.first_name} {d.last_name}
                </option>
              ))}
            </select>
          )}
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard driver={selectedDriver} />} />
          <Route
            path="/log/new"
            element={
              <LogForm
                driver={selectedDriver}
                onSave={() => navigate("/")}
              />
            }
          />
          <Route path="/log/:id" element={<LogDetail />} />
          <Route
            path="/log/:id/edit"
            element={<LogForm driver={selectedDriver} onSave={() => navigate("/")} />}
          />
          <Route
            path="/driver/new"
            element={<DriverForm onSave={(d) => { refreshDrivers(); setSelectedDriver(d); navigate("/"); }} />}
          />
        </Routes>
      </main>
    </div>
  );
}
