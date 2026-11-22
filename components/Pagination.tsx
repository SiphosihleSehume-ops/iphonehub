interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

/** 1 … 4 5 6 … 12 : always the first, last and the pages around the current one */
function pageList(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const nums = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pager" aria-label="Pagination">
      <button
        className="pager__btn"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        &lsaquo; Previous
      </button>

      {pageList(page, totalPages).map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} className="pager__gap" aria-hidden="true">
            &hellip;
          </span>
        ) : (
          <button
            key={n}
            className={`pager__num ${n === page ? "is-on" : ""}`}
            onClick={() => onChange(n)}
            aria-label={`Page ${n}`}
            aria-current={n === page ? "page" : undefined}
          >
            {n}
          </button>
        )
      )}

      <button
        className="pager__btn"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
      >
        Next &rsaquo;
      </button>
    </nav>
  );
}