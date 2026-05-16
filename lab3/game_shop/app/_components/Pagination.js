'use client';

export default function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  for (let i = left; i <= right; i++) pages.push(i);

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onChange(1)}
        disabled={current === 1}
      >
        «
      </button>
      <button
        className="pagination-btn"
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
      >
        ‹
      </button>

      {left > 1 && (
        <>
          <button className="pagination-btn" onClick={() => onChange(1)}>1</button>
          {left > 2 && <span className="pagination-info">…</span>}
        </>
      )}

      {pages.map(p => (
        <button
          key={p}
          className={`pagination-btn${p === current ? ' active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}

      {right < total && (
        <>
          {right < total - 1 && <span className="pagination-info">…</span>}
          <button className="pagination-btn" onClick={() => onChange(total)}>{total}</button>
        </>
      )}

      <button
        className="pagination-btn"
        onClick={() => onChange(current + 1)}
        disabled={current === total}
      >
        ›
      </button>
      <button
        className="pagination-btn"
        onClick={() => onChange(total)}
        disabled={current === total}
      >
        »
      </button>

      <span className="pagination-info">Strona {current} z {total}</span>
    </div>
  );
}
