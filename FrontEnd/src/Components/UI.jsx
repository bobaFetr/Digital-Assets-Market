import React from "react";

export function Page({ title, description, eyebrow, actions, children, className = "" }) {
  return (
    <main className={`ui-page ${className}`.trim()}>
      <header className="ui-page-header">
        <div>
          {eyebrow ? <span className="ui-eyebrow">{eyebrow}</span> : null}
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="ui-actions">{actions}</div> : null}
      </header>
      {children}
    </main>
  );
}

export function Section({ title, description, children, className = "" }) {
  return (
    <section className={`ui-section ${className}`.trim()}>
      {title ? <h2>{title}</h2> : null}
      {description ? <p className="ui-section-description">{description}</p> : null}
      {children}
    </section>
  );
}

export function Field({ label, hint, error, children }) {
  return (
    <label className={`ui-field ${error ? "ui-field--error" : ""}`.trim()}>
      <span className="ui-field-label">{label}</span>
      {hint ? <span className="ui-field-hint">{hint}</span> : null}
      {error ? <span className="ui-field-error"><span className="visually-hidden">Error: </span>{error}</span> : null}
      {children}
    </label>
  );
}

export function Notice({ tone = "info", children }) {
  if (!children) return null;
  return <div className={`ui-notice ui-notice--${tone}`} role={tone === "error" ? "alert" : "status"}>{children}</div>;
}

export function Status({ tone = "neutral", children }) {
  return <span className={`ui-status ui-status--${tone}`}>{children}</span>;
}

export function Metric({ label, value, detail, tone = "neutral" }) {
  return <div className={`ui-metric ui-metric--${tone}`}>
    <span className="ui-metric__label">{label}</span>
    <strong className="ui-metric__value">{value}</strong>
    {detail ? <span className="ui-metric__detail">{detail}</span> : null}
  </div>;
}

export function EmptyState({ title = "Nothing here yet", description, action }) {
  return <div className="ui-empty">
    <span className="ui-empty__mark" aria-hidden="true">—</span>
    <div><strong>{title}</strong>{description ? <p>{description}</p> : null}</div>
    {action ? <div className="ui-empty__action">{action}</div> : null}
  </div>;
}
