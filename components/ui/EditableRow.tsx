// components/ui/EditableRow.tsx (Final Refactored Version with Cross-Platform Date Picker)

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { Check, X, Edit2, Calendar } from 'lucide-react-native';

export interface FieldDescriptor {
  field: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date';
  required?: boolean;
  optionsKey?: 'typeOptions' | 'unitOptions';
}

export interface EditableRowProps {
  schema: FieldDescriptor[];
  rowData: Record<string, any>;
  isEditing: boolean;
  errors: Record<string, string>;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showDatePicker?: boolean;
  onDateChange?: (date: string) => void;
  onDatePress?: () => void;
  isNew?: boolean;
  typeOptions?: string[];
  unitOptions?: string[];
  cellStyle?: any;
  rowWidth?: number;
  dataCellTextAlign?: 'left' | 'center' | 'right';
  columnWidth?: number;
}

const EditableRow: React.FC<EditableRowProps> = ({
  schema,
  rowData,
  isEditing,
  errors,
  onChange,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  showDatePicker,
  onDateChange,
  onDatePress,
  isNew,
  typeOptions = [],
  unitOptions = [],
  cellStyle,
  rowWidth,
  dataCellTextAlign,
  columnWidth
}) => {
  const getOptions = (key: string) => {
    if (key === 'typeOptions') return typeOptions;
    if (key === 'unitOptions') return unitOptions;
    return [];
  };

  const getCellWidth = () => columnWidth || 100;

  return (
    <View style={styles.row}> 
      <View key="actions" style={[styles.cellContainer, { width: getCellWidth(), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }]}> 
        {isEditing ? (
          <>
            <TouchableOpacity onPress={onSave} style={styles.icon} accessibilityLabel="Save">
              <Check size={20} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onCancel} style={styles.icon} accessibilityLabel="Cancel">
              <X size={20} color="#E57373" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={onEdit} style={styles.icon} accessibilityLabel="Edit">
              <Edit2 size={20} color="#1976D2" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.icon} accessibilityLabel="Delete">
              <X size={20} color="#E57373" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {schema.map((col, idx) => {
        const value = rowData[col.field];
        const error = errors[col.field];
        const isLast = idx === schema.length - 1;
        const cellBaseStyle = [cellStyle || styles.cellContainer];

        if (col.type === 'date') {
  // New rows should always be editable, regardless of isEditing
  if (!isEditing && !isNew) {
    return (
      <View key={col.field} style={[...cellBaseStyle, { width: getCellWidth(), borderRightWidth: 1, borderColor: '#eee', backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center' }]}> 
        <Text
          style={[styles.cell, { textAlign: 'center', marginRight: 4, flex: 1, flexShrink: 1 }]} 
          numberOfLines={2} 
          ellipsizeMode="tail"
        >
          {value ? dayjs(value).format('YYYY-MM-DD') : '—'}
        </Text>
        <Calendar size={18} color="#1976D2" style={{ marginLeft: 0 }} />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }
  // Editable: normal picker logic
  return (
    <View key={col.field} style={[...cellBaseStyle, { width: getCellWidth(), borderRightWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }]}> 
      {Platform.OS === 'web' ? (
        <input
          type="date"
          style={styles.cellInput as any}
          value={value || ''}
          onChange={(e) => {
            onChange(col.field, e.target.value);
            if (onDateChange) onDateChange(e.target.value);
          }}
        />
      ) : (
        <>
          <TouchableOpacity onPress={onDatePress} style={[styles.cellInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}> 
            <Text>{value ? dayjs(value).format('YYYY-MM-DD') : 'Select Date'}</Text>
            <Calendar size={18} color="#1976D2" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={value ? new Date(value) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selected) => {
                if (event.type === 'set' && selected) {
                  const iso = dayjs(selected).format('YYYY-MM-DD');
                  onChange(col.field, iso);
                  if (onDateChange) onDateChange(iso);
                }
                if (onDatePress) onDatePress();
              }}
              minimumDate={new Date(2000, 0, 1)}
              maximumDate={new Date(2100, 11, 31)}
            />
          )}
        </>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

        if (!isEditing) {
          return (
            <View style={[...cellBaseStyle, { width: getCellWidth(), borderRightWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }]} key={col.field}>
              <Text style={[styles.cell, { textAlign: dataCellTextAlign || 'left' }]}>{String(value ?? '')}</Text>
              {error && <Text style={styles.error}>{error}</Text>}
            </View>
          );
        }

        switch (col.type) {
          case 'text':
            return (
              <View style={[cellBaseStyle, { width: getCellWidth(), borderRightWidth: 1, borderColor: '#eee', backgroundColor: '#fff' }]} key={col.field}>
                <TextInput
                  style={styles.cellInput}
                  value={typeof value === 'string' ? value : ''}
                  onChangeText={(val) => onChange(col.field, val)}
                />
                {error && <Text style={styles.error}>{error}</Text>}
              </View>
            );
          case 'number':
            return (
              <View key={col.field} style={[styles.cellContainer, { width: getCellWidth() }]}> 
                <TextInput
                  style={styles.cellInput}
                  value={typeof value === 'number' && !isNaN(value) ? String(value) : ''}
                  keyboardType="numeric"
                  onChangeText={(val) => {
                    if (/^\d*\.?\d*$/.test(val)) {
                      onChange(col.field, val === '' ? '' : parseFloat(val));
                    }
                  }}
                />
                {error && <Text style={styles.error}>{error}</Text>}
              </View>
            );
          case 'select':
            const options = getOptions(col.optionsKey || '');
            return (
              <View key={col.field} style={[styles.cellContainer, { width: getCellWidth() }]}> 
                {Platform.OS === 'web' ? (
                  <select
                    style={styles.cellInput as any}
                    value={value || ''}
                    onChange={(e) => onChange(col.field, e.target.value)}
                  >
                    <option value="">Select {col.label}</option>
                    {options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <Picker
                    selectedValue={value}
                    style={styles.cellInput}
                    onValueChange={(val) => onChange(col.field, val)}
                  >
                    <Picker.Item label={`Select ${col.label}`} value="" />
                    {options.map(opt => (
                      <Picker.Item key={opt} label={opt} value={opt} />
                    ))}
                  </Picker>
                )}
                {error && <Text style={styles.error}>{error}</Text>}
              </View>
            );
        }
      })}
    </View>
  );
};

// (No extra cell or border after last column)

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    flex: 1,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  normalCell: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  expiryCell: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  cell: {
    width: '100%',
    overflow: 'hidden',
    padding: 5
  },
  cellContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 5
  },
  cellInput: {
    width: '100%',
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 4,
    padding: 6,
    textAlign: 'center'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 4
  },
  error: {
    color: 'red',
    fontSize: 11,
    marginTop: 2
  },
  disabledDateCell: {
    backgroundColor: '#f2f2f2',
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7
  },
  disabledDateText: {
    color: '#bbb',
    fontStyle: 'italic',
    marginRight: 4
  }
});

export default EditableRow;