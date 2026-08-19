export default function SkeletonPage({ title }) {
  return (
    <main className="skeleton-page" aria-label={`${title} skeleton`} aria-busy="true">
      <span className="visually-hidden">{title} is a frontend skeleton.</span>
      <section className="skeleton-heading">
        <div className="skeleton-line skeleton-line--eyebrow" />
        <div className="skeleton-line skeleton-line--title" />
        <div className="skeleton-line skeleton-line--copy" />
      </section>
      <section className="skeleton-stats" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <article className="skeleton-card skeleton-stat" key={index}>
            <div className="skeleton-line skeleton-line--label" />
            <div className="skeleton-line skeleton-line--value" />
            <div className="skeleton-line skeleton-line--short" />
          </article>
        ))}
      </section>
      <section className="skeleton-grid" aria-hidden="true">
        <article className="skeleton-card skeleton-panel">
          <div className="skeleton-line skeleton-line--section" />
          <div className="skeleton-chart"><i /><i /><i /><i /><i /><i /><i /></div>
        </article>
        <article className="skeleton-card skeleton-list">
          <div className="skeleton-line skeleton-line--section" />
          {Array.from({ length: 5 }, (_, index) => (
            <div className="skeleton-row" key={index}>
              <span className="skeleton-dot" /><span className="skeleton-line" />
              <span className="skeleton-line skeleton-line--tiny" />
            </div>
          ))}
        </article>
      </section>
    </main>
  );
}
