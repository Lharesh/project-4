import { useState } from 'react';

export function useInventoryFilters(initialSearch = '', initialFilters = {}) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [columnFilters, setColumnFilters] = useState(initialFilters);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSetFilter = (field: string, value: string) => {
    setColumnFilters((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleClearFilter = (field: string) => {
    setColumnFilters((prev: any) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  return {
    searchQuery,
    setSearchQuery: handleSearch,
    columnFilters,
    setColumnFilter: handleSetFilter,
    clearColumnFilter: handleClearFilter,
  };
}
