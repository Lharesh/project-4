import React from 'react';
import { Platform, Dimensions, ScrollView, View, Text } from 'react-native';
import InventoryHeader from './InventoryHeader';
import InventoryTable from './InventoryTable';
import Pagination from '@/components/ui/Pagination';
import { inventoryTableStyles, TABLE_MIN_WIDTH } from './InventoryTable.styles';

interface InventoryCardAndTableProps {
  searchQuery: string;
  handleSearch: (text: string) => void;
  handleAdd: () => void;
  onUpload: () => void;
  paginatedItems: any[];
  schema: any[];
  editRowId: string | null;
  newRow: any;
  editRowData?: any;
  errors: any;
  handleChange: (id: string, field: string, value: any) => void;
  handleSave: (row: any) => void;
  handleCancel: () => void;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
  showDatePickerFor: string | null;
  setShowDatePickerFor: (id: string | null) => void;
  typeOptions: string[];
  unitOptions: string[];
  COLUMN_WIDTH: number;
  NUM_COLUMNS: number;
  columnFilters: Record<string, string>;
  onFilterChange: (field: string, value: string) => void;
  onClearFilter: (field: string) => void;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

const InventoryCardAndTable: React.FC<InventoryCardAndTableProps> = ({
  searchQuery,
  handleSearch,
  handleAdd,
  onUpload,
  paginatedItems,
  schema,
  editRowId,
  newRow,
  editRowData,
  errors,
  handleChange,
  handleSave,
  handleCancel,
  handleEdit,
  handleDelete,
  showDatePickerFor,
  setShowDatePickerFor,
  typeOptions,
  unitOptions,
  COLUMN_WIDTH,
  NUM_COLUMNS,
  columnFilters,
  onFilterChange,
  onClearFilter,
  sortBy,
  sortDirection,
  onSort,
  currentPage,
  totalPages,
  setCurrentPage,
  pageSize,
  setPageSize,
}) => {
  const tableMinWidth = COLUMN_WIDTH * NUM_COLUMNS;
  const deviceWidth = Dimensions.get('window').width;

  if (Platform.OS === 'web') {
    return (
      <View style={{ marginTop: 0, alignItems: 'center', width: '100%', flex: 1 }}>
        <InventoryHeader
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          handleAdd={handleAdd}
          onUpload={onUpload}
        />
        <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}>
          <ScrollView
            style={{ width: tableMinWidth, maxWidth: '100%', minWidth: tableMinWidth }}
            horizontal={true}
            contentContainerStyle={{ minWidth: tableMinWidth }}
          >
            <InventoryTable
              items={paginatedItems}
              schema={schema}
              editRowId={editRowId}
              newRow={newRow}
              editRowData={editRowData}
              errors={errors}
              handleChange={handleChange}
              handleSave={handleSave}
              handleCancel={handleCancel}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              showDatePickerFor={showDatePickerFor}
              setShowDatePickerFor={setShowDatePickerFor}
              typeOptions={typeOptions}
              unitOptions={unitOptions}
              COLUMN_WIDTH={COLUMN_WIDTH}
              onFilterChange={onFilterChange}
              columnFilters={columnFilters}
              onClearFilter={onClearFilter}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={onSort}
            />
          </ScrollView>
        </ScrollView>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      </View>
    );
  }

  // Mobile
  return (
    <ScrollView style={{ flex: 1, width: '100%', backgroundColor: '#fffde7' }} contentContainerStyle={{ flexGrow: 1, padding: 0, margin: 0 }} horizontal={false}>
      <InventoryHeader
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        handleAdd={handleAdd}
        onUpload={onUpload}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: 320 }} style={{ marginTop: 8 }}>
        <View style={{ width: Math.max(deviceWidth, 320) }}>
          <InventoryTable
            items={paginatedItems}
            schema={schema}
            editRowId={editRowId}
            newRow={newRow}
            editRowData={editRowData}
            errors={errors}
            handleChange={handleChange}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            showDatePickerFor={showDatePickerFor}
            setShowDatePickerFor={setShowDatePickerFor}
            typeOptions={typeOptions}
            unitOptions={unitOptions}
            COLUMN_WIDTH={COLUMN_WIDTH}
            onFilterChange={onFilterChange}
            columnFilters={columnFilters}
            onClearFilter={onClearFilter}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSort={onSort}
          />
        </View>
      </ScrollView>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />
    </ScrollView>
  );
};

export default InventoryCardAndTable;
