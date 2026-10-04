import { useEffect, useMemo, useState } from 'react';

/** Client-side pagination for already-loaded collection data. */
export const usePagination = (items = [], itemsPerPage = 10, resetKey = '') => {
  const [currentPage, setCurrentPage] = useState(1);
  const safeItems = Array.isArray(items) ? items : [];
  const totalItems = safeItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [resetKey, totalItems]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return safeItems.slice(start, start + itemsPerPage);
  }, [safeItems, currentPage, itemsPerPage]);

  return { paginatedItems, currentPage, totalPages, totalItems, itemsPerPage, setCurrentPage };
};

export default usePagination;
