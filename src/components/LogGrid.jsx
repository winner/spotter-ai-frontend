/**
 * LogGrid - FMCSA-style graph grid visualization.
 * Renders a 24-hour duty status chart matching the paper Driver's Daily Log format.
 */

const STATUS_ROWS = [
  { key: "OFF", label: "1. Off Duty" },
  { key: "SB", label: "2. Sleeper Berth" },
  { key: "D", label: "3. Driving" },
  { key: "ON", label: "4. On Duty" },
];

const HOURS = Array.from({ length: 25 }, (_, i) => i);
const GRID_LEFT = 130;
const GRID_TOP = 30;
const HOUR_WIDTH = 30;
const ROW_HEIGHT = 40;
const GRID_WIDTH = 24 * HOUR_WIDTH;
const TOTAL_WIDTH = GRID_LEFT + GRID_WIDTH + 60;
const TOTAL_HEIGHT = GRID_TOP + STATUS_ROWS.length * ROW_HEIGHT + 10;

const STATUS_COLORS = {
  OFF: "#4ade80",
  SB: "#60a5fa",
  D: "#f87171",
  ON: "#fbbf24",
};

export default function LogGrid({ statuses, totalHours }) {
  const statusIndex = Object.fromEntries(STATUS_ROWS.map((r, i) => [r.key, i]));

  return (
    <div className="log-grid-wrapper">
      <svg viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`} className="log-grid-svg">
        {/* Header hours */}
        {HOURS.map((h) => (
          <text
            key={h}
            x={GRID_LEFT + h * HOUR_WIDTH}
            y={GRID_TOP - 8}
            textAnchor="middle"
            className="grid-hour-label"
          >
            {h === 0 ? "M" : h === 12 ? "N" : h === 24 ? "M" : h > 12 ? h - 12 : h}
          </text>
        ))}

        {/* Row labels */}
        {STATUS_ROWS.map((row, i) => (
          <text
            key={row.key}
            x={GRID_LEFT - 8}
            y={GRID_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2 + 4}
            textAnchor="end"
            className="grid-row-label"
          >
            {row.label}
          </text>
        ))}

        {/* Grid lines - horizontal */}
        {STATUS_ROWS.map((_, i) => (
          <g key={i}>
            <line
              x1={GRID_LEFT}
              y1={GRID_TOP + i * ROW_HEIGHT}
              x2={GRID_LEFT + GRID_WIDTH}
              y2={GRID_TOP + i * ROW_HEIGHT}
              stroke="#cbd5e1"
              strokeWidth={0.5}
            />
            <line
              x1={GRID_LEFT}
              y1={GRID_TOP + (i + 1) * ROW_HEIGHT}
              x2={GRID_LEFT + GRID_WIDTH}
              y2={GRID_TOP + (i + 1) * ROW_HEIGHT}
              stroke="#cbd5e1"
              strokeWidth={0.5}
            />
          </g>
        ))}

        {/* Grid lines - vertical (every hour) */}
        {HOURS.map((h) => (
          <line
            key={h}
            x1={GRID_LEFT + h * HOUR_WIDTH}
            y1={GRID_TOP}
            x2={GRID_LEFT + h * HOUR_WIDTH}
            y2={GRID_TOP + STATUS_ROWS.length * ROW_HEIGHT}
            stroke={h % 12 === 0 ? "#94a3b8" : "#e2e8f0"}
            strokeWidth={h % 12 === 0 ? 1.5 : 0.5}
          />
        ))}

        {/* Quarter-hour tick marks */}
        {Array.from({ length: 96 }, (_, i) => i).map((q) => {
          const x = GRID_LEFT + (q / 4) * HOUR_WIDTH;
          if (q % 4 === 0) return null;
          return (
            <line
              key={`q${q}`}
              x1={x}
              y1={GRID_TOP}
              x2={x}
              y2={GRID_TOP + 4}
              stroke="#cbd5e1"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Duty status bars */}
        {statuses.map((s, idx) => {
          const rowIdx = statusIndex[s.status];
          if (rowIdx === undefined) return null;
          const x = GRID_LEFT + s.start_hour * HOUR_WIDTH;
          const w = (s.end_hour - s.start_hour) * HOUR_WIDTH;
          const y = GRID_TOP + rowIdx * ROW_HEIGHT;

          return (
            <g key={idx}>
              {/* Filled bar */}
              <rect
                x={x}
                y={y + 4}
                width={w}
                height={ROW_HEIGHT - 8}
                fill={STATUS_COLORS[s.status]}
                opacity={0.7}
                rx={2}
              />
              {/* Horizontal line through center */}
              <line
                x1={x}
                y1={y + ROW_HEIGHT / 2}
                x2={x + w}
                y2={y + ROW_HEIGHT / 2}
                stroke={STATUS_COLORS[s.status]}
                strokeWidth={2.5}
              />
              {/* Vertical connectors */}
              {idx > 0 && (() => {
                const prev = statuses[idx - 1];
                const prevRowIdx = statusIndex[prev.status];
                if (prevRowIdx === undefined || prevRowIdx === rowIdx) return null;
                const connX = x;
                const y1 = GRID_TOP + Math.min(prevRowIdx, rowIdx) * ROW_HEIGHT + ROW_HEIGHT / 2;
                const y2 = GRID_TOP + Math.max(prevRowIdx, rowIdx) * ROW_HEIGHT + ROW_HEIGHT / 2;
                return (
                  <line x1={connX} y1={y1} x2={connX} y2={y2} stroke="#334155" strokeWidth={1.5} />
                );
              })()}
            </g>
          );
        })}

        {/* Total hours column */}
        <text
          x={GRID_LEFT + GRID_WIDTH + 8}
          y={GRID_TOP - 8}
          className="grid-hour-label"
          fontWeight="bold"
        >
          Total
        </text>
        {totalHours &&
          STATUS_ROWS.map((row, i) => (
            <text
              key={row.key}
              x={GRID_LEFT + GRID_WIDTH + 30}
              y={GRID_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2 + 4}
              textAnchor="middle"
              className="grid-total"
            >
              {(totalHours[row.key] || 0).toFixed(1)}
            </text>
          ))}
      </svg>

      <div className="grid-legend">
        {STATUS_ROWS.map((row) => (
          <span key={row.key} className="legend-item">
            <span className="legend-color" style={{ background: STATUS_COLORS[row.key] }} />
            {row.label}
          </span>
        ))}
      </div>
    </div>
  );
}
