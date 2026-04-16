const BASE = "/api";

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || res.statusText);
  }
  return res.json();
}

export const api = {
  // Drivers
  getDrivers: () => request("/drivers/"),
  createDriver: (data) => request("/drivers/", { method: "POST", body: JSON.stringify(data) }),
  getDriver: (id) => request(`/drivers/${id}/`),

  // Logs
  getLogs: (driverId) => request(`/logs/${driverId ? `?driver=${driverId}` : ""}`),
  getLog: (id) => request(`/logs/${id}/`),
  createLog: (data) => request("/logs/", { method: "POST", body: JSON.stringify(data) }),
  updateLog: (id, data) => request(`/logs/${id}/`, { method: "PUT", body: JSON.stringify(data) }),
  deleteLog: (id) => request(`/logs/${id}/`, { method: "DELETE" }).catch(() => ({})),

  // Violations
  getViolations: (logId) => request(`/logs/${logId}/violations/`),
  getRemaining: (logId) => request(`/logs/${logId}/remaining/`),
};
