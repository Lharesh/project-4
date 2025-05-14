import { useState, useMemo } from 'react';
import type { InventoryItem } from '../types/inventory';

export function useInventoryPagination(items: InventoryItem[], initialPageSize = 20) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => Math.ceil(items.length / pageSize), [items.length, pageSize]);

  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return items.slice(startIdx, startIdx + pageSize);
  }, [items, currentPage, pageSize]);

  // Reset to first page if pageSize changes
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalPages,
    paginatedItems,
  };
}
