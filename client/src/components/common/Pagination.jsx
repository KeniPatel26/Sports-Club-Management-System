import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1 && totalItems <= itemsPerPage) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 0.25rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}
    >
      <div>
        Showing <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{startItem}</span> to{' '}
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{endItem}</span> of{' '}
        <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{totalItems}</span> results
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button
          type="button"
          aria-label="Go to first page"
          title="First page"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 1 ? 0.5 : 1, transition: 'var(--transition)',
          }}
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 1 ? 0.5 : 1,
            transition: 'var(--transition)',
          }}
        >
          <ChevronLeft size={16} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
          .map((p, idx, arr) => {
            const isCurrent = p === currentPage;
            const prevPage = arr[idx - 1];
            const hasGap = prevPage && p - prevPage > 1;

            return (
              <React.Fragment key={p}>
                {hasGap && <span style={{ padding: '0 4px', color: 'var(--text-muted)' }}>...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(p)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    border: isCurrent ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: isCurrent ? 'var(--primary)' : 'var(--bg-card)',
                    color: isCurrent ? '#ffffff' : 'var(--text-main)',
                    fontWeight: isCurrent ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                >
                  {p}
                </button>
              </React.Fragment>
            );
          })}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages ? 0.5 : 1,
            transition: 'var(--transition)',
          }}
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          aria-label="Go to last page"
          title="Last page"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages ? 0.5 : 1, transition: 'var(--transition)',
          }}
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
