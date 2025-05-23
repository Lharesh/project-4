// InventoryTable.tsx
// Displays the inventory list as a table with color-coded alerts and actions.
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Platform, StyleSheet, TouchableOpacity, Dimensions, ViewStyle, TextStyle } from 'react-native';
import { DataTable, IconButton, TextInput, Button, Portal, Dialog, Checkbox, Menu, Modal, Provider as PaperProvider } from 'react-native-paper';
import { Calendar } from 'lucide-react-native'; // Calendar icon
import { InventoryItem } from '../types/inventory';
// NOTE: Remove EditableRow and lucide-react-native imports, use only react-native-paper UI.
import type { FieldDescriptor } from '@/components/ui/EditableRow';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

// Define column width constants based on screen width
const screenWidth = Dimensions.get('window').width;
const ACTIONS_COLUMN_WIDTH = 80;  // Reduced width for actions
const ACTIVE_COLUMN_WIDTH = 60;   // Reduced width for checkbox
const SKU_COLUMN_WIDTH = 100;     // Fixed width for SKU
const NAME_COLUMN_WIDTH = 200;    // Width for Name column
const BRAND_COLUMN_WIDTH = 150;   // Adjusted width for Brand
const TYPE_COLUMN_WIDTH = 120;    // Increased width for Type
const UNIT_COLUMN_WIDTH = 100;    // Width for Unit
const NUMBER_COLUMN_WIDTH = 80;   // Reduced width for numbers
const DATE_COLUMN_WIDTH = 120;    // Width for dates

// Extend the InventoryItem type to include SKU
// ExtendedInventoryItem is now identical to InventoryItem (sku, id, all fields are present)
type ExtendedInventoryItem = InventoryItem;

interface InventoryTableProps {
  items: ExtendedInventoryItem[];
  schema: FieldDescriptor[];
  editRowId: string | null;
  newRow: ExtendedInventoryItem | null;
  editRowData?: ExtendedInventoryItem | null;
  errors: Record<string, Record<string, string>>;
  handleChange: (id: string, field: string, value: any) => void;
  handleSave: (row: ExtendedInventoryItem) => void;
  handleCancel: () => void;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
  showDatePickerFor: string | null;
  setShowDatePickerFor: (id: string | null) => void;
  typeOptions: string[];
  unitOptions: string[];
  COLUMN_WIDTH: number;
  onFilterChange?: (field: 'brand' | 'type' | 'unit', value: string) => void;
  columnFilters?: { [key: string]: string };
  onClearFilter?: (field: 'brand' | 'type' | 'unit') => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

// Theme colors with opacity values for better visual hierarchy
const theme = {
  vata: {
    light: 'rgba(230, 232, 240, 0.5)',
    main: 'rgba(142, 151, 201, 0.9)',
    dark: '#464F86'
  },
  pitta: {
    light: 'rgba(255, 232, 224, 0.5)',
    main: 'rgba(255, 151, 118, 0.9)',
    dark: '#D65F3A'
  },
  kapha: {
    light: 'rgba(224, 238, 231, 0.5)',
    main: 'rgba(127, 180, 159, 0.9)',
    dark: '#426B5D'
  },
  background: '#FDFBF7', // Soft, natural background
  text: '#2D3748',      // Deep, readable text color
  border: 'rgba(226, 232, 240, 0.8)',     // Subtle border color
  error: '#E53E3E'
};

type ValidationRule = {
  required: boolean;
  message: string;
  validate?: (value: string) => true | string;
};

type ValidationRules = {
  [key: string]: ValidationRule;
};

// Add input validation helpers
const isValidNumber = (value: string) => /^\d+$/.test(value);
const isValidPrice = (value: string) => /^\d+(\.\d{0,2})?$/.test(value);
const isValidDate = (value: string) => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

// Update validation rules
const validationRules: ValidationRules = {
  sku: {
    required: true,
    message: 'SKU is required',
    validate: (value: string) => {
      if (!value.trim()) return 'SKU cannot be empty';
      if (value.length < 3) return 'SKU must be at least 3 characters';
      return true;
    }
  },
  name: {
    required: true,
    message: 'Name is required'
  },
  brand: {
    required: true,
    message: 'Brand is required'
  },
  type: {
    required: true,
    message: 'Type is required'
  },
  unit: {
    required: true,
    message: 'Unit is required'
  },
  stock: {
    required: true,
    message: 'Stock is required',
    validate: (value: string) => {
      if (!isValidNumber(value)) return 'Stock must be a whole number';
      if (parseInt(value) < 0) return 'Stock cannot be negative';
      return true;
    }
  },
  mrp: {
    required: true,
    message: 'MRP is required',
    validate: (value: string) => {
      if (!isValidPrice(value)) return 'MRP must be a valid price (e.g., 99.99)';
      if (parseFloat(value) < 0) return 'MRP cannot be negative';
      return true;
    }
  },
  buy_price: {
    required: true,
    message: 'Buy Price is required',
    validate: (value: string) => {
      if (!isValidPrice(value)) return 'Buy Price must be a valid price (e.g., 99.99)';
      if (parseFloat(value) < 0) return 'Buy Price cannot be negative';
      return true;
    }
  },
  gst: {
    required: true,
    message: 'GST is required',
    validate: (value: string) => {
      if (!isValidNumber(value)) return 'GST must be a whole number';
      const gstValue = parseInt(value);
      if (gstValue < 0 || gstValue > 100) return 'GST must be between 0 and 100';
      return true;
    }
  },
  expiry: {
    required: true,
    message: 'Expiry date is required',
    validate: (value: string) => {
      if (!isValidDate(value)) return 'Invalid date format';
      const expiryDate = new Date(value);
      const today = new Date();
      if (expiryDate < today) return 'Expiry date cannot be in the past';
      return true;
    }
  }
};

// Field type definitions
const NUMERIC_FIELDS = ['stock', 'mrp', 'buy_price', 'gst'];
const TEXT_FIELDS = ['name', 'brand', 'sku'];
const CENTER_ALIGNED_FIELDS = ['type', 'unit', 'expiry'];
const LEFT_ALIGNED_FIELDS = ['sku', 'name', 'brand'];
const CENTER_ALIGNED_HEADERS = ['type', 'unit', 'stock', 'mrp', 'buy_price', 'gst', 'expiry'];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  table: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  row: {
    height: 84,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.background,
    alignItems: 'center',
    flexDirection: 'row',
    padding: 0,
  },
  editableRow: {
    backgroundColor: theme.vata.light,
    minHeight: 84,
  },
  dataCell: {
    height: 84,
    justifyContent: 'flex-start',
    borderRightWidth: 1,
    borderRightColor: theme.border,
    padding: 0,
    flex: 1,
    position: 'relative',
  },
  cellInner: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    height: 84,
    position: 'relative',
    paddingTop: 12,
  },
  cellText: {
    fontSize: 14,
    color: theme.text,
    paddingVertical: 0,
    width: '100%',
    lineHeight: 20,
  },
  errorMessage: {
    color: theme.error,
    fontSize: 11,
    position: 'absolute',
    bottom: 4,
    left: 8,
    right: 8,
  },
  inputContainer: {
    width: '100%',
    height: 36,
    marginBottom: 20,
  },
  newRowInput: {
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.border,
  },
  dropdownButton: {
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 32,
    width: '100%',
    position: 'relative',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -8 }],
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.border,
    paddingLeft: 8,
    paddingRight: 32,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  calendarIcon: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numericInput: {
    textAlign: 'right',
    paddingRight: 8,
    minWidth: 60,
  },
  header: {
    backgroundColor: theme.kapha.main,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    height: 48,
  },
  headerCell: {
    height: 48,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: theme.border,
    padding: 8,
  },
  actionCell: {
    height: 84,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  checkboxCell: {
    height: 84,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 12,
  },
  headerContent: {
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingRight: 24,
  },
  headerText: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    width: '100%',
  },
  headerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  headerLabel: {
    color: theme.text,
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  required: {
    color: theme.error,
    marginLeft: 2,
    position: 'absolute',
    right: -8,
    top: '50%',
    transform: [{ translateY: -8 }],
    fontSize: 14,
  },
  filterButton: {
    position: 'absolute',
    right: 4,
    height: 24,
    width: 24,
    margin: 0,
    padding: 0,
    zIndex: 1,
  },
  input: {
    height: 32,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    width: '100%',
  },
  iconButton: {
    margin: 0,
    padding: 0,
    width: 24,
    height: 24,
  },
  dropdownText: {
    fontSize: 14,
    color: theme.text,
    flex: 1,
    paddingVertical: 4,
  },
  dropdownContent: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    maxHeight: 300,
    width: NAME_COLUMN_WIDTH,
    position: 'absolute',
    left: '50%',
    top: Platform.OS === 'web' ? '30%' : '40%',
    transform: Platform.OS === 'web' ? [{ translateX: '-50%' }, { translateY: '-50%' }] : undefined,
    elevation: 5,
    shadowColor: theme.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  dropdownItemSelected: {
    backgroundColor: theme.vata.light,
  },
  cellWithError: {
    borderColor: theme.error,
  },
  placeholderText: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 14,
  },
  errorContainer: {
    position: 'absolute',
    top: '100%',
    left: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: '#fff',
    paddingVertical: 2,
  },
  scrollViewContainer: {
    flex: 1,
    width: '100%'
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  dropdownItemText: {
    fontSize: 14,
    color: theme.text,
    paddingVertical: 4
  },
  numericCell: {
    alignItems: 'flex-end'
  },
  centerAlignedCell: {
    alignItems: 'center'
  },
  skuText: {
    fontSize: 14,
    color: theme.text,
    textAlign: 'right',
    width: '100%',
    paddingVertical: 8,
  },
});

interface SelectedDateField {
  rowIndex: string;
  field: keyof InventoryItem;
}

const InventoryTable: React.FC<InventoryTableProps> = (props) => {
  const {
    items,
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
    unitOptions = ['tab', 'ml', 'gm', 'bottle', 'pack'],
    COLUMN_WIDTH,
    onFilterChange,
    columnFilters = {},
    onClearFilter,
    sortBy = '',
    sortDirection = 'asc',
    onSort
  } = props;

  const [selected, setSelected] = useState<string[]>([]);
  const [menuVisible, setMenuVisible] = useState<{ id: string, field: string } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<{ id: string, date: Date } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<{ id: string; field: string; options: string[] } | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerContext, setDatePickerContext] = useState<{ id: string; currentDate: Date | null }>({ id: '', currentDate: null });
  const [validationErrors, setValidationErrors] = useState<Record<string, Record<string, string>>>({});
  const [selectedDateField, setSelectedDateField] = useState<SelectedDateField | null>(null);
  const dateButtonRef = React.useRef<View>(null);
  const datePickerRefs = React.useRef<{ [key: string]: View | null }>({});
  const scrollViewRef = React.useRef<ScrollView>(null);

  const toggleSelect = (id: string) => {
    setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };

  const handleInputChange = (id: string, field: string, value: any) => {
    //'Input change called with:', { id, field, value, editRowId });

    // Clear validation errors for this field
    setValidationErrors(prev => {
      const rowErrors = { ...prev[id] };
      delete rowErrors[field];
      return {
        ...prev,
        [id]: rowErrors
      };
    });

    // Use the actual row ID from the row being edited
    const actualId = editRowId || id;
    //'Using actualId for change:', actualId);
    handleChange(actualId, field, value);
  };

  const handleDatePress = (id: string, currentDate: string | null) => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'date';
      input.value = currentDate || new Date().toISOString().split('T')[0];
      input.min = new Date().toISOString().split('T')[0];

      const cell = document.querySelector(`[data-row-id="${id}"][data-field="expiry"]`);
      if (cell) {
        const rect = cell.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;

        input.style.cssText = `
          position: fixed;
          top: ${rect.bottom + scrollY}px;
          left: ${rect.left + scrollX}px;
          z-index: 99999;
          padding: 8px;
          border: 1px solid ${theme.border};
          border-radius: 4px;
          background-color: white;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          font-size: 14px;
          width: ${DATE_COLUMN_WIDTH}px;
        `;
      }

      // Add overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.1);
        z-index: 99998;
      `;

      // Clean up function to safely remove elements and event listeners
      const cleanup = () => {
        if (input && input.parentNode) {
          input.parentNode.removeChild(input);
        }
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('click', handleClickOutside);
      };

      document.body.appendChild(overlay);
      document.body.appendChild(input);

      const handleScroll = () => {
        const cell = document.querySelector(`[data-row-id="${id}"][data-field="expiry"]`);
        if (cell && input && input.parentNode) {
          const rect = cell.getBoundingClientRect();
          const scrollY = window.scrollY || window.pageYOffset;
          const scrollX = window.scrollX || window.pageXOffset;
          input.style.top = `${rect.bottom + scrollY}px`;
          input.style.left = `${rect.left + scrollX}px`;
        }
      };

      window.addEventListener('scroll', handleScroll);

      const handleClickOutside = (e: MouseEvent) => {
        if (e.target !== input) {
          cleanup();
        }
      };

      input.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          handleInputChange(id, 'expiry', target.value);
        }
        cleanup();
      });

      overlay.addEventListener('click', cleanup);

      setTimeout(() => {
        input.showPicker();
        document.addEventListener('click', handleClickOutside);
      }, 100);
    } else {
      setDatePickerVisible(true);
      setDatePickerContext({
        id,
        currentDate: currentDate ? new Date(currentDate) : new Date()
      });
    }
  };

  const handleDateSelect = (event: any, selectedDate?: Date) => {
    console.log('handleDateSelect called with:', { event, selectedDate });
    setDatePickerVisible(false);
    if (selectedDate && datePickerContext.id) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      console.log('Mobile date selected:', { id: datePickerContext.id, date: isoDate });
      handleInputChange(datePickerContext.id, 'expiry', isoDate);
    }
  };

  // Filtering modal state
  const [filterDialog, setFilterDialog] = useState<'brand' | 'type' | 'unit' | null>(null);
  const [filterText, setFilterText] = useState('');
  const brandOptions = Array.from(new Set(items.map(item => item.brand))).filter(Boolean);
  const typeOptionsList = typeOptions;
  const unitOptionsList = unitOptions;

  // Update the options selection logic
  const options = filterDialog === 'brand'
    ? brandOptions
    : filterDialog === 'type'
      ? typeOptionsList
      : unitOptionsList;

  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(filterText.toLowerCase()));

  // Handle filter selection
  const handleSuggestionTap = (value: string) => {
    if (filterDialog && onFilterChange) {
      onFilterChange(filterDialog, value);
      setFilterDialog(null);
      setFilterText('');
    }
  };

  const renderDropdownContent = (id: string, field: string, currentValue: string, options: string[]) => (
    <Portal>
      <Modal
        visible={dropdownOpen?.id === id && dropdownOpen?.field === field}
        onDismiss={() => setDropdownOpen(null)}
        contentContainerStyle={styles.dropdownContent}
      >
        <ScrollView>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.dropdownItem,
                currentValue === option && styles.dropdownItemSelected
              ]}
              onPress={() => {
                handleInputChange(id, field, option);
                setDropdownOpen(null);
              }}
            >
              <Text style={styles.dropdownItemText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Modal>
    </Portal>
  );

  const validateField = (field: string, value: any) => {
    const rule = validationRules[field];
    if (!rule) return true;

    if (rule.required && !value) {
      return rule.message;
    }

    if (rule.validate && typeof value === 'string') {
      const result = rule.validate(value);
      if (result !== true) {
        return result;
      }
    }

    return true;
  };

  const validateRow = (row: ExtendedInventoryItem) => {
    const errors: Record<string, string> = {};

    // Validate SKU
    if (!row.sku?.trim()) {
      errors.sku = 'SKU is required';
    } else if (row.sku.length < 3) {
      errors.sku = 'SKU must be at least 3 characters';
    }

    // Validate other required fields
    Object.keys(validationRules).forEach(field => {
      const value = row[field as keyof ExtendedInventoryItem];
      const result = validateField(field, value);
      if (result !== true) {
        errors[field] = result;
      }
    });

    return errors;
  };

  const handleDateChange = (id: string, value: string) => {
    console.log('handleDateChange called with:', { id, value });
    handleInputChange(id, 'expiry', value);
  };

  const handleSaveClick = (row: ExtendedInventoryItem) => {
    // Ensure both id and sku are present and synchronized
    // IMPORTANT: Always ensure both 'id' and 'sku' are present and synchronized.
    // This is required because validation and backend logic expect both fields,
    // and some rows may only have one of them set (e.g., new or imported rows).
    // Do not remove this logic unless you update all validation and backend code accordingly.
    const rowWithSku: ExtendedInventoryItem = { ...row, sku: row.sku || row.id };

    //'Save clicked for row:', row);

    // Validate the row
    const errors = validateRow(rowWithSku);
    //'Validation errors:', errors);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        [row.id]: errors
      }));
      return;
    }

    // Format dates and ensure all required fields are present
    const updatedRow = {
      ...rowWithSku,
      expiry: rowWithSku.expiry ? new Date(rowWithSku.expiry).toISOString().split('T')[0] : '',
      sku: rowWithSku.sku?.trim() || '',
      stock: Number(rowWithSku.stock) || 0,
      mrp: Number(rowWithSku.mrp) || 0,
      buy_price: Number(rowWithSku.buy_price) || 0,
      gst: Number(rowWithSku.gst) || 0
    };

    //'Saving updated row:', updatedRow);
    handleSave(updatedRow);
    handleCancel(); // Clear edit mode after successful save
  };

  const getColumnStyle = (field: string) => {
    const baseStyle = {
      flex: undefined as number | undefined,
      width: undefined as number | undefined,
      minWidth: undefined as number | undefined,
      maxWidth: undefined as number | undefined,
    };

    switch (field) {
      case 'actions':
        return { ...baseStyle, width: ACTIONS_COLUMN_WIDTH, minWidth: ACTIONS_COLUMN_WIDTH };
      case 'active':
        return { ...baseStyle, width: ACTIVE_COLUMN_WIDTH, minWidth: ACTIVE_COLUMN_WIDTH };
      case 'sku':
        return { width: SKU_COLUMN_WIDTH, minWidth: SKU_COLUMN_WIDTH };
      case 'name':
        return { width: NAME_COLUMN_WIDTH, minWidth: NAME_COLUMN_WIDTH };
      case 'brand':
        return { width: BRAND_COLUMN_WIDTH, minWidth: BRAND_COLUMN_WIDTH };
      case 'type':
        return { width: TYPE_COLUMN_WIDTH, minWidth: TYPE_COLUMN_WIDTH };
      case 'unit':
        return { width: UNIT_COLUMN_WIDTH, minWidth: UNIT_COLUMN_WIDTH };
      case 'expiry':
        return { width: DATE_COLUMN_WIDTH, minWidth: DATE_COLUMN_WIDTH };
      default:
        // For numeric fields (stock, mrp, buy_price, gst)
        return { width: NUMBER_COLUMN_WIDTH, minWidth: NUMBER_COLUMN_WIDTH };
    }
  };

  const renderCell = (id: string, field: string, value: any, isNewRow: boolean = false) => {
    const isEditing = isNewRow || editRowId === id;
    const rowErrors = validationErrors[id] || {};
    const hasError = !!rowErrors[field];
    const isNumericOrSku = NUMERIC_FIELDS.includes(field) || field === 'sku';
    const isDropdownField = field === 'brand' || field === 'type' || field === 'unit';
    const isDateField = field === 'expiry';

    if (!isEditing) {
      return (
        <View style={styles.cellInner}>
          <Text
            style={[
              styles.cellText,
              field === 'sku' && value === 'new' ? styles.skuText : { textAlign: isNumericOrSku ? 'right' : 'left' }
            ]}
            numberOfLines={1}
          >
            {field === 'expiry' && value
              ? format(new Date(value), 'yyyy-MM-dd')
              : String(value || '')}
          </Text>
        </View>
      );
    }

    const renderTextInput = (textAlign: 'left' | 'right', placeholder: string) => (
      <TextInput
        mode="flat"
        value={String(value || '')}
        onChangeText={text => handleInputChange(id, field, text)}
        style={[
          styles.newRowInput,
          { textAlign },
          hasError && styles.cellWithError
        ]}
        placeholder={placeholder}
      />
    );

    const renderDropdown = (options: string[], placeholder: string) => (
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          hasError && styles.cellWithError
        ]}
        onPress={() => setDropdownOpen({
          id,
          field,
          options
        })}
      >
        <Text
          style={[
            styles.dropdownText,
            !value && styles.placeholderText,
            { textAlign: 'left' }
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <View style={styles.dropdownIcon}>
          <IconButton
            icon="chevron-down"
            accessibilityLabel="chevron-down"
            size={16}
            iconColor={theme.text}
          />
        </View>
      </TouchableOpacity>
    );

    if (field === 'expiry') {
      return (
        <View
          style={styles.cellInner}
          data-row-id={id}
          data-field="expiry"
        >
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                hasError && styles.cellWithError
              ]}
              onPress={() => handleDatePress(id, value)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !value && styles.placeholderText,
                  { textAlign: 'left' }
                ]}
                numberOfLines={1}
              >
                {value ? format(new Date(value), 'yyyy-MM-dd') : 'Select date...'}
              </Text>
              <View style={styles.calendarIcon} accessibilityLabel="calendar">
                <Calendar size={18} color={theme.text} />
              </View>
            </TouchableOpacity>
          </View>
          {hasError && <Text style={styles.errorMessage}>{rowErrors[field]}</Text>}
        </View>
      );
    }

    return (
      <View style={styles.cellInner}>
        <View style={[
          styles.inputContainer,
          (isDropdownField || isDateField) && { marginTop: 0 },
          (!isDropdownField && !isDateField) && { marginTop: 0 }
        ]}>
          {field === 'name' && renderTextInput('left', 'Enter name')}
          {field === 'sku' && renderTextInput('left', 'Enter SKU')}
          {field === 'brand' && renderDropdown(brandOptions, 'Select brand...')}
          {field === 'type' && renderDropdown(typeOptions, 'Select type...')}
          {field === 'unit' && renderDropdown(unitOptions, 'Select unit...')}
          {NUMERIC_FIELDS.includes(field) && (
            <TextInput
              mode="flat"
              value={String(value || '')}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9.]/g, '');
                if (field === 'stock' || field === 'gst') {
                  if (/^\d*$/.test(numericText)) {
                    handleInputChange(id, field, numericText);
                  }
                } else {
                  if (/^\d*\.?\d*$/.test(numericText)) {
                    handleInputChange(id, field, numericText);
                  }
                }
              }}
              keyboardType="decimal-pad"
              style={[
                styles.newRowInput,
                { textAlign: 'right' },
                hasError && styles.cellWithError
              ]}
              placeholder="0"
            />
          )}
        </View>
        {hasError && <Text style={styles.errorMessage}>{rowErrors[field]}</Text>}
      </View>
    );
  };

  const renderActions = (row: ExtendedInventoryItem, isNewRow: boolean = false) => {
    const isEditing = isNewRow || editRowId === row.id;
    return (
      <View style={styles.actionCell}>
        {isEditing ? (
          <>
            <IconButton
              icon="check"
              accessibilityLabel="save-row"
              size={18}
              onPress={() => handleSaveClick(row)}
              iconColor={theme.kapha.dark}
              style={styles.iconButton}
            />
            <IconButton
              icon="close"
              accessibilityLabel="cancel-edit"
              size={18}
              onPress={handleCancel}
              iconColor={theme.pitta.dark}
              style={styles.iconButton}
            />
          </>
        ) : (
          <>
            <IconButton
              icon="pencil"
              accessibilityLabel="edit-row"
              size={18}
              onPress={() => handleEdit(row.id)}
              iconColor={theme.vata.dark}
              style={styles.iconButton}
            />
            <IconButton
              icon="delete"
              accessibilityLabel="delete-row"
              size={18}
              onPress={() => handleDelete(row.id)}
              iconColor={theme.pitta.dark}
              style={styles.iconButton}
            />
          </>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Portal>
        <Dialog visible={!!filterDialog} onDismiss={() => setFilterDialog(null)}>
          <Dialog.Title>
            {filterDialog === 'brand'
              ? 'Filter Brand'
              : filterDialog === 'type'
                ? 'Filter Type'
                : 'Filter Unit'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={`Type to filter ${filterDialog === 'brand'
                ? 'brand'
                : filterDialog === 'type'
                  ? 'type'
                  : 'unit'}...`}
              value={filterText}
              onChangeText={setFilterText}
              style={{ marginBottom: 12 }}
              autoFocus
            />
            <ScrollView style={{ maxHeight: 160 }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt: string) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => handleSuggestionTap(opt)}
                  >
                    <Text style={styles.dropdownItemText}>{opt}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: '#888', fontSize: 15, padding: 8 }}>No matches</Text>
              )}
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setFilterDialog(null)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ScrollView style={styles.scrollViewContainer} ref={scrollViewRef}>
        <DataTable style={[styles.table, { width: '100%' }]}> 
          {items.length === 0 && !newRow && (
            <DataTable.Row>
              <DataTable.Cell style={{ justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: '100%', alignItems: 'center', padding: 24 }}>
                  <Text style={{ color: '#888', fontSize: 16, textAlign: 'center' }}>
                    No inventory items found.
                  </Text>
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          )}
          <View style={styles.header}>
            <DataTable.Header style={{ height: 52 }}>
              <DataTable.Title
                style={[styles.headerCell, getColumnStyle('actions')]}
                textStyle={styles.headerText}
              >
                <View style={styles.headerContent}>
                  <Text style={styles.headerText}>Actions</Text>
                </View>
              </DataTable.Title>
              <DataTable.Title
                style={[styles.headerCell, getColumnStyle('active')]}
                textStyle={styles.headerText}
              >
                <View style={styles.headerContent}>
                  <Text style={styles.headerText}>Active</Text>
                </View>
              </DataTable.Title>
              {schema.filter(col => col.field !== 'active').map(col => (
                <DataTable.Title
                  key={col.field}
                  style={[styles.headerCell, getColumnStyle(col.field)]}
                  textStyle={styles.headerText}
                >
                  <View style={styles.headerContent}>
                    <Text style={styles.headerText}>
                      {col.label}
                    </Text>
                    {validationRules[col.field as keyof typeof validationRules]?.required && (
                      <Text style={styles.required}>*</Text>
                    )}
                    {(col.field === 'brand' || col.field === 'type' || col.field === 'unit') && (
                      <IconButton
                        icon={columnFilters[col.field] ? 'close-circle' : 'filter'}
                        accessibilityLabel={columnFilters[col.field] ? `clear-filter-${col.field}` : `filter-${col.field}`}
                        size={16}
                        iconColor={theme.kapha.dark}
                        style={styles.filterButton}
                        onPress={() => {
                          if (columnFilters[col.field] && onClearFilter) {
                            onClearFilter(col.field as 'brand' | 'type' | 'unit');
                          } else {
                            setFilterDialog(col.field as 'brand' | 'type' | 'unit');
                          }
                        }}
                      />
                    )}
                  </View>
                </DataTable.Title>
              ))}
            </DataTable.Header>
          </View>

          {newRow && !editRowId && (
            <DataTable.Row style={[styles.row, styles.editableRow]}>
              <DataTable.Cell style={[styles.dataCell, getColumnStyle('actions')]}>
                <View style={[styles.actionCell, { justifyContent: 'center' }]}>
                  {renderActions(newRow, true)}
                </View>
              </DataTable.Cell>
              <DataTable.Cell style={[styles.dataCell, getColumnStyle('active')]}>
                <View style={[styles.checkboxCell, { justifyContent: 'center' }]}>
                  <Checkbox
                    status={newRow.active ? 'checked' : 'unchecked'}
                    onPress={() => handleInputChange('new', 'active', !newRow.active)}
                    color={theme.vata.dark}
                  />
                </View>
              </DataTable.Cell>
              {schema.filter(col => col.field !== 'active').map(col => (
                <DataTable.Cell
                  key={col.field}
                  style={[
                    styles.dataCell,
                    getColumnStyle(col.field),
                    NUMERIC_FIELDS.includes(col.field) && styles.numericCell,
                    CENTER_ALIGNED_FIELDS.includes(col.field) && styles.centerAlignedCell
                  ]}
                >
                  {renderCell('new', col.field, newRow[col.field as keyof ExtendedInventoryItem], true)}
                </DataTable.Cell>
              ))}
            </DataTable.Row>
          )}

          {items.map(item => {
            const isEditing = editRowId === item.id;
            const rowData = isEditing ? editRowData || item : item;

            return (
              <DataTable.Row
                key={item.id}
                style={[
                  styles.row,
                  isEditing && styles.editableRow
                ]}
              >
                <DataTable.Cell style={[styles.dataCell, getColumnStyle('actions')]}>
                  <View style={styles.actionCell}>
                    {renderActions(rowData)}
                  </View>
                </DataTable.Cell>
                <DataTable.Cell style={[styles.dataCell, getColumnStyle('active')]}>
                  <View style={[styles.checkboxCell, !isEditing && { marginTop: 0 }]}>
                    <Checkbox
                      status={rowData.active ? 'checked' : 'unchecked'}
                      onPress={() => handleInputChange(item.id, 'active', !rowData.active)}
                      color={theme.vata.dark}
                      disabled={!isEditing}
                    />
                  </View>
                </DataTable.Cell>
                {schema.filter(col => col.field !== 'active').map(col => (
                  <DataTable.Cell
                    key={col.field}
                    style={[
                      styles.dataCell,
                      getColumnStyle(col.field),
                      NUMERIC_FIELDS.includes(col.field) && styles.numericCell,
                      CENTER_ALIGNED_FIELDS.includes(col.field) && styles.centerAlignedCell
                    ]}
                  >
                    {renderCell(item.id, col.field, rowData[col.field as keyof ExtendedInventoryItem])}
                  </DataTable.Cell>
                ))}
              </DataTable.Row>
            );
          })}
        </DataTable>
      </ScrollView>

      {dropdownOpen && (
        <Portal>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setDropdownOpen(null)}
            activeOpacity={1}
          >
            <Modal
              visible={true}
              onDismiss={() => setDropdownOpen(null)}
              contentContainerStyle={styles.dropdownContent}
            >
              <ScrollView>
                {dropdownOpen.options.map((option: string) => {
                  const isNewRow = dropdownOpen.id === 'new';
                  const currentValue = isNewRow
                    ? newRow?.[dropdownOpen.field as keyof ExtendedInventoryItem]
                    : items.find(item => item.id === dropdownOpen.id)?.[dropdownOpen.field as keyof ExtendedInventoryItem];

                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.dropdownItem,
                        currentValue === option && { backgroundColor: theme.vata.light }
                      ]}
                      onPress={() => {
                        handleInputChange(dropdownOpen.id, dropdownOpen.field, option);
                        setDropdownOpen(null);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Modal>
          </TouchableOpacity>
        </Portal>
      )}
    </View>
  );
};

export default InventoryTable;