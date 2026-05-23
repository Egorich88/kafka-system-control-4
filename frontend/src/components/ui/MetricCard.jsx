/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

export default function MetricCard({
  title,
  value,
  icon,
  status
}) {
  return (
    <div className="metric-card">
      <div className="metric-card-top">
        <div className="metric-card-icon">
          {icon}
        </div>
        <div
          className={`metric-status ${status}`}
        />
      </div>
      <div className="metric-card-content">
        <span className="metric-title">
          {title}
        </span>
        <h2>{value}</h2>
      </div>
    </div>
  );
}