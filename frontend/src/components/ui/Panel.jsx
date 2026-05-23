/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

export default function Panel({
  title,
  children,
  action
}) {

  return (
    <div className="ksc-panel">
      <div className="ksc-panel-header">
        <h3>{title}</h3>
        {action && (
          <div>{action}</div>
        )}
      </div>
      <div className="ksc-panel-body">
        {children}
      </div>
    </div>
  );
}