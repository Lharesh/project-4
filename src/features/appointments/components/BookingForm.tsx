import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import React, { useState, useMemo } from 'react';
import { Platform } from 'react-native';
import { COLORS } from '@/theme/constants/theme';
import transformTherapyFormToAppointment from '../helpers/transformTherapyFormToAppointment';

// Only import these on native
let View: any, Text: any, TextInput: any, Button: any, TouchableOpacity: any, ScrollView: any, MaterialIcon: any;
if (Platform.OS !== 'web') {
  // @ts-ignore
  View = require('react-native').View;
  // @ts-ignore
  Text = require('react-native').Text;
  // @ts-ignore
  TextInput = require('react-native').TextInput;
  // @ts-ignore
  Button = require('react-native').Button;
  // @ts-ignore
  TouchableOpacity = require('react-native').TouchableOpacity;
  // @ts-ignore
  ScrollView = require('react-native').ScrollView;
  MaterialIcon = require('react-native-vector-icons/MaterialIcons').default;
}

let DateTimePicker: any;
if (Platform.OS !== 'web') {
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch { }
}

// Only import react-icons for web
let MdPerson: React.ComponentType<any> | undefined, MdPhone: React.ComponentType<any> | undefined, MdEvent: React.ComponentType<any> | undefined, MdSchedule: React.ComponentType<any> | undefined, MdClose: React.ComponentType<any> | undefined;
if (Platform.OS === 'web') {
  // @ts-ignore
  ({ MdPerson, MdPhone, MdEvent, MdSchedule, MdClose } = require('react-icons/md'));
}

interface BookingFormProps {
  initialValues: any;
  therapies: any[];
  availableRooms: any[];
  availableTherapists: any[];
  onSubmit: (values: any) => void;
  genderFlag: boolean;
  clientGender: string;
  error?: string;
  onCancel?: () => void;
  mode?: 'reschedule' | 'booking';
}

const DURATION_OPTIONS = [1, 3, 7, 14, 21];

function validate(values: any) {
  const errors: any = {};
  if (!values.selectedTherapy) errors.selectedTherapy = 'Therapy is required';
  if (!values.selectedRoom) errors.selectedRoom = 'Room is required';
  if (!values.selectedTherapists || values.selectedTherapists.length === 0) errors.selectedTherapists = 'Therapist is required';
  if (!values.startDate) errors.startDate = 'Date is required';
  if (!values.timeSlot) errors.timeSlot = 'Time is required';
  if (!values.duration) errors.duration = 'Duration is required';
  return errors;
}

function isFormValid(values: any, errors: any) {
  return (
    values.selectedTherapy &&
    values.selectedRoom &&
    values.selectedTherapists && values.selectedTherapists.length > 0 &&
    values.startDate &&
    values.timeSlot &&
    values.duration &&
    Object.values(errors).every((e) => !e)
  );
}

const BookingForm: React.FC<BookingFormProps> = ({
  initialValues,
  therapies,
  availableRooms,
  availableTherapists,
  onSubmit,
  genderFlag,
  clientGender,
  error,
  onCancel,
  mode,
}) => {
  const [values, setValues] = useState({ ...initialValues, duration: initialValues.duration || 1 });
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [therapySearch, setTherapySearch] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filter therapies for search
  const filteredTherapies = useMemo(() => {
    if (!therapySearch) return therapies;
    return therapies.filter((t: any) => t.name.toLowerCase().includes(therapySearch.toLowerCase()));
  }, [therapySearch, therapies]);

  // Most used therapies (mock: first 3)
  const quickPickTherapies = useMemo(() => therapies.slice(0, 3), [therapies]);

  // Gender filter for therapists
  const filteredTherapists = useMemo(() => {
    if (genderFlag && clientGender) {
      return availableTherapists.filter((t: any) => t.gender === clientGender);
    }
    return availableTherapists;
  }, [availableTherapists, genderFlag, clientGender]);

  // Auto-select first therapist if none selected
  React.useEffect(() => {
    if ((!values.selectedTherapists || values.selectedTherapists.length === 0) && filteredTherapists.length > 0) {
      setValues((prev: any) => ({ ...prev, selectedTherapists: [filteredTherapists[0].id] }));
    }
  }, [filteredTherapists]);

  // Prefill therapySearch with the selected therapy's name on mount or when initialValues.selectedTherapy changes
  React.useEffect(() => {
    const selected = therapies.find((t: any) => t.id === initialValues.selectedTherapy);
    setTherapySearch(selected ? selected.name : '');
  }, [initialValues.selectedTherapy, therapies]);

  // Handle field change
  const handleChange = (field: string, value: any) => {
    setValues((prev: any) => ({ ...prev, [field]: value }));
    setTouched((prev: any) => ({ ...prev, [field]: true }));
    // Validate immediately on change
    const newVals = { ...values, [field]: value };
    const newErrors = validate(newVals);
    setErrors(newErrors);
  };

  // Handle blur/touch
  const handleBlur = (field: string) => {
    setTouched((prev: any) => ({ ...prev, [field]: true }));
    const newErrors = validate(values);
    setErrors((prev: any) => ({ ...prev, [field]: newErrors[field] }));
  };

  // Handle submit
  const handleSubmit = () => {
    const newErrors = validate(values);
    setErrors(newErrors);
    setTouched({ selectedTherapy: true, selectedRoom: true, selectedTherapists: true, startDate: true, timeSlot: true, duration: true });
    console.log('[BookingForm] handleSubmit values:', values);
    console.log('[BookingForm] handleSubmit validation errors:', newErrors);
    if (isFormValid(values, newErrors)) {
      console.log('[BookingForm] onSubmit about to be called with:', values);
      onSubmit(values);
    }
  };

  const formValid = isFormValid(values, errors);

  React.useEffect(() => {
    setValues({ ...initialValues, duration: initialValues.duration || 1 });
  }, [initialValues, clientGender]);

  React.useEffect(() => {
    if (error) {
      setToastMessage(error);
      setShowToast(true);
      // Auto-dismiss after 3s
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (Platform.OS === 'web') {
    // Get the selected therapy object
    const selectedTherapyObj = therapies.find((t: any) => t.id === values.selectedTherapy);
    // Show filtered therapies if searching, else show all
    const showDropdown = therapySearch && filteredTherapies.length > 0 && !selectedTherapyObj;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100vw', background: 'rgba(0,0,0,0.04)' }}>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSubmit();
          }}
          style={{ padding: 16, maxWidth: 420, width: '100%', background: '#fff', borderRadius: 12, boxShadow: '0 2px 24px 0 rgba(0,0,0,0.08)' }}
        >
          {/* Toast/Error Banner */}
          {showToast && toastMessage && (
            <div style={{ background: '#ffe8e6', color: '#b71c1c', border: '1px solid #f44336', borderRadius: 6, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>{toastMessage}</span>
              <button type="button" onClick={() => setShowToast(false)} style={{ background: 'none', border: 'none', color: '#b71c1c', fontSize: 18, marginLeft: 12, cursor: 'pointer' }}>×</button>
            </div>
          )}
          {/* Client Info */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, background: '#f5f5f5', borderRadius: 8, padding: 12 }}>
            {MdPerson && <MdPerson size={28} color={COLORS.vata[700]} style={{ marginRight: 8 }} />}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ fontWeight: 600, textAlign: 'left' }}>{values.clientName || <span style={{ color: '#aaa' }}>No Name</span>}</div>
              <div style={{ color: '#666', fontSize: 14, textAlign: 'left' }}>{MdPhone && <MdPhone size={18} color={COLORS.vata[700]} style={{ verticalAlign: 'middle' }} />} {values.clientMobile || <span style={{ color: '#aaa' }}>No Phone</span>}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: 12 }}>
              <span style={{ fontWeight: 500, background: '#e0e0e0', borderRadius: '50%', padding: '10px 16px', fontSize: 16, color: COLORS.vata[700], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{values.clientId || <span style={{ color: '#aaa' }}>No ID</span>}</span>
            </div>
          </div>
          {/* Therapy Smart Search */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Select therapy"
              value={selectedTherapyObj ? selectedTherapyObj.name : therapySearch}
              onChange={e => {
                setTherapySearch(e.target.value);
                handleChange('selectedTherapy', '');
              }}
              onBlur={() => handleBlur('selectedTherapy')}
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', outline: errors.selectedTherapy && touched.selectedTherapy ? '2px solid red' : undefined }}
            />
            {therapySearch && (
              <button type="button" onClick={() => { setTherapySearch(''); handleChange('selectedTherapy', ''); }} style={{ position: 'absolute', right: 8, top: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 18 }}>
                {MdClose && <MdClose size={20} color="#888" />}
              </button>
            )}
            {/* Quick Picks */}
            <div style={{ display: 'flex', marginTop: 8, gap: 8 }}>
              {therapies.slice(0, 3).map((t: any) => (
                <button
                  type="button"
                  key={t.id}
                  style={{ background: values.selectedTherapy === t.id ? '#1976d2' : '#eee', color: values.selectedTherapy === t.id ? '#fff' : '#222', borderRadius: 4, padding: '6px 14px', border: 'none', marginRight: 8, cursor: 'pointer' }}
                  onClick={() => {
                    handleChange('selectedTherapy', t.id);
                    setTherapySearch(t.name);
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>
            {/* Dropdown for filtered therapies */}
            {showDropdown && (
              <div style={{ position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid #eee', borderRadius: 4, width: '100%', maxHeight: 120, overflowY: 'auto', marginTop: 4 }}>
                {filteredTherapies.map((t: any) => (
                  <div
                    key={t.id}
                    style={{ padding: 6, background: values.selectedTherapy === t.id ? '#1976d2' : 'transparent', color: values.selectedTherapy === t.id ? '#fff' : '#222', cursor: 'pointer' }}
                    onMouseDown={() => {
                      handleChange('selectedTherapy', t.id);
                      setTherapySearch(t.name);
                    }}
                  >
                    {t.name}
                  </div>
                ))}
              </div>
            )}
            {touched.selectedTherapy && errors.selectedTherapy && <div style={{ color: 'red', fontSize: 12 }}>{errors.selectedTherapy}</div>}
          </div>
          {/* Rooms */}
          <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}>
            {availableRooms.map((r: any) => (
              <button type="button" key={r.id} style={{ background: values.selectedRoom === r.id ? '#1976d2' : '#eee', color: values.selectedRoom === r.id ? '#fff' : '#222', borderRadius: 4, padding: '6px 14px', border: 'none', marginRight: 8, cursor: 'pointer' }} onClick={() => handleChange('selectedRoom', r.id)}>{r.name}</button>
            ))}
            {touched.selectedRoom && errors.selectedRoom && <div style={{ color: 'red', fontSize: 12 }}>{errors.selectedRoom}</div>}
          </div>
          {/* Therapists */}
          <div style={{ marginBottom: 12, overflowX: 'auto', whiteSpace: 'nowrap' }}>
            {filteredTherapists.map((t: any) => {
              const selected = (values.selectedTherapists || []).includes(t.id);
              return (
                <button
                  type="button"
                  key={t.id}
                  style={{ background: selected ? '#1976d2' : '#eee', color: selected ? '#fff' : '#222', borderRadius: 4, padding: '6px 14px', border: 'none', marginRight: 8, cursor: 'pointer' }}
                  onClick={() => {
                    handleChange(
                      'selectedTherapists',
                      selected
                        ? values.selectedTherapists.filter((id: string) => id !== t.id)
                        : [...values.selectedTherapists, t.id]
                    );
                  }}
                >
                  {t.name}
                </button>
              );
            })}
            {touched.selectedTherapists && errors.selectedTherapists && <div style={{ color: 'red', fontSize: 12 }}>{errors.selectedTherapists}</div>}
          </div>
          {/* Date & Time Row */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              {MdEvent && <MdEvent size={20} color={COLORS.vata[700]} style={{ position: 'absolute', left: 8, pointerEvents: 'none' }} />}
              <input
                type="date"
                value={values.startDate || ''}
                onChange={e => handleChange('startDate', e.target.value)}
                onBlur={() => handleBlur('startDate')}
                style={{ width: '100%', padding: '8px 8px 8px 36px', borderRadius: 6, border: '1px solid #ccc', outline: errors.startDate && touched.startDate ? '2px solid red' : undefined }}
              />
              {touched.startDate && errors.startDate && <div style={{ color: 'red', fontSize: 12, position: 'absolute', top: 40 }}>{errors.startDate}</div>}
            </div>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              {MdSchedule && <MdSchedule size={20} color={COLORS.vata[700]} style={{ position: 'absolute', left: 8, pointerEvents: 'none' }} />}
              <input
                type="time"
                value={values.timeSlot || ''}
                onChange={e => {
                  const val = e.target.value;
                  const [hh, mm] = val.split(':');
                  if (["00", "15", "30", "45"].includes(mm)) {
                    handleChange('timeSlot', val);
                  } else {
                    // Snap to nearest allowed minute
                    const mins = parseInt(mm, 10);
                    const allowed = [0, 15, 30, 45];
                    const nearest = allowed.reduce((prev, curr) => Math.abs(curr - mins) < Math.abs(prev - mins) ? curr : prev, 0);
                    const snapped = `${hh}:${nearest.toString().padStart(2, '0')}`;
                    handleChange('timeSlot', snapped);
                  }
                }}
                onBlur={() => handleBlur('timeSlot')}
                step={900} // 15 min steps
                style={{ width: '100%', padding: '8px 8px 8px 36px', borderRadius: 6, border: '1px solid #ccc', outline: errors.timeSlot && touched.timeSlot ? '2px solid red' : undefined }}
              />
              {touched.timeSlot && errors.timeSlot && <div style={{ color: 'red', fontSize: 12, position: 'absolute', top: 40 }}>{errors.timeSlot}</div>}
            </div>
          </div>
          {/* Duration Quick-Picks */}
          <div style={{ marginBottom: 12 }}>
            {DURATION_OPTIONS.map(opt => (
              <button type="button" key={opt} style={{ marginRight: 8, background: values.duration === opt ? '#1976d2' : '#eee', color: values.duration === opt ? '#fff' : '#222', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }} onClick={() => handleChange('duration', opt)}>{opt}d</button>
            ))}
            <input
              type="number"
              min={1}
              placeholder="Custom"
              value={values.duration && !DURATION_OPTIONS.includes(values.duration) ? values.duration : ''}
              onChange={e => handleChange('duration', Number(e.target.value))}
              onBlur={() => handleBlur('duration')}
              style={{ width: 60, marginLeft: 8 }}
            />
            {touched.duration && errors.duration && <div style={{ color: 'red', fontSize: 12 }}>{errors.duration}</div>}
          </div>
          {/* Notes */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              value={values.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Notes (optional)"
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: 0, marginTop: 24 }}>
            <button type="button" onClick={onCancel} style={{ background: '#eee', color: '#222', borderRadius: 6, padding: '10px 0', border: 'none', fontWeight: 600, fontSize: 16, flex: 1, width: '50%', marginRight: 0, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: mode === 'reschedule' ? '#FF9800' : COLORS.vata[700], color: '#fff', borderRadius: 6, padding: '10px 0', border: 'none', fontWeight: 600, fontSize: 16, flex: 1, width: '50%', marginLeft: 12, cursor: 'pointer' }}>{mode === 'reschedule' ? 'Reschedule' : 'Book'}</button>
          </div>
        </form>
      </div>
    );
  }

  // --- REACT NATIVE RENDERING ---
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {/* Toast/Error Banner */}
      {showToast && toastMessage && (
        <View style={{ zIndex: 1000 }}>
          {require('@/components/ui/Toast').Toast && (
            React.createElement(require('@/components/ui/Toast').Toast, {
              visible: showToast,
              type: 'error',
              message: toastMessage,
              onDismiss: () => setShowToast(false),
              duration: 3000,
            })
          )}
        </View>
      )}
      {/* Client Info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 }}>
        <MaterialIcon name="person" size={28} style={{ marginRight: 8, color: COLORS.vata[700] }} />
        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
          <Text style={{ fontWeight: '600', textAlign: 'left' }}>{values.clientName || <Text style={{ color: '#aaa' }}>No Name</Text>}</Text>
          <Text style={{ color: '#666', fontSize: 14, textAlign: 'left' }}><MaterialIcon name="phone" size={18} color={COLORS.vata[700]} /> {values.clientMobile || <Text style={{ color: '#aaa' }}>No Phone</Text>}</Text>
        </View>
        <View style={{ marginLeft: 12, backgroundColor: '#e0e0e0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontWeight: '500', fontSize: 16, color: COLORS.vata[700] }}>{values.clientId || <Text style={{ color: '#aaa' }}>No ID</Text>}</Text>
        </View>
      </View>
      {/* Therapy Smart Search */}
      <View style={{ position: 'relative', marginBottom: 12 }}>
        <TextInput
          placeholder="Select therapy"
          value={therapySearch}
          onChangeText={(text: string) => { setTherapySearch(text); handleChange('selectedTherapy', ''); }}
          onBlur={() => handleBlur('selectedTherapy')}
          style={{ width: '100%', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: errors.selectedTherapy && touched.selectedTherapy ? 'red' : '#ccc' }}
        />
        {therapySearch ? (
          <TouchableOpacity onPress={() => { setTherapySearch(''); handleChange('selectedTherapy', ''); }} style={{ position: 'absolute', right: 8, top: 8 }}>
            <MaterialIcon name="close" size={20} color="#888" />
          </TouchableOpacity>
        ) : null}
        <ScrollView horizontal style={{ marginTop: 8 }} showsHorizontalScrollIndicator={false}>
          {quickPickTherapies.map((t: any) => (
            <TouchableOpacity key={t.id} style={{ backgroundColor: '#eee', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8 }} onPress={() => { handleChange('selectedTherapy', t.id); setTherapySearch(t.name); }}>
              <Text>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Dropdown only if typing and not selected */}
        {therapySearch && !values.selectedTherapy && (
          <ScrollView style={{ maxHeight: 120, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 4, marginTop: 4 }}>
            {filteredTherapies.map((t: any) => (
              <TouchableOpacity key={t.id} style={{ padding: 6, backgroundColor: values.selectedTherapy === t.id ? '#1976d2' : 'transparent' }} onPress={() => { handleChange('selectedTherapy', t.id); setTherapySearch(t.name); }}>
                <Text style={{ color: values.selectedTherapy === t.id ? '#fff' : '#222' }}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {touched.selectedTherapy && errors.selectedTherapy && <Text style={{ color: 'red', fontSize: 12 }}>{errors.selectedTherapy}</Text>}
      </View>
      {/* Rooms */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {availableRooms.map((r: any) => (
          <TouchableOpacity key={r.id} style={{ backgroundColor: values.selectedRoom === r.id ? '#1976d2' : '#eee', borderRadius: 4, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, marginBottom: 8 }} onPress={() => handleChange('selectedRoom', r.id)}>
            <Text style={{ color: values.selectedRoom === r.id ? '#fff' : '#222' }}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {touched.selectedRoom && errors.selectedRoom && <Text style={{ color: 'red', fontSize: 12 }}>{errors.selectedRoom}</Text>}
      {/* Therapists */}
      <ScrollView horizontal style={{ marginBottom: 12 }} showsHorizontalScrollIndicator={false}>
        {filteredTherapists.map((t: any) => {
          const selected = values.selectedTherapists.includes(t.id);
          return (
            <TouchableOpacity
              key={t.id}
              style={{ backgroundColor: selected ? '#1976d2' : '#eee', borderRadius: 4, paddingHorizontal: 14, paddingVertical: 6, marginRight: 8 }}
              onPress={() => {
                handleChange(
                  'selectedTherapists',
                  selected
                    ? values.selectedTherapists.filter((id: string) => id !== t.id)
                    : [...values.selectedTherapists, t.id]
                );
              }}
            >
              <Text style={{ color: selected ? '#fff' : '#222' }}>{t.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {touched.selectedTherapists && errors.selectedTherapists && <Text style={{ color: 'red', fontSize: 12 }}>{errors.selectedTherapists}</Text>}
      {/* Date & Time Row */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <View style={{ flex: 1, position: 'relative', flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcon name="event" size={20} color={COLORS.vata[700]} style={{ position: 'absolute', left: 8, pointerEvents: 'none' }} />
          {DateTimePicker ? (
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ width: '100%' }}>
              <TextInput
                value={values.startDate || ''}
                editable={false}
                placeholder="YYYY-MM-DD"
                style={{ width: '100%', paddingLeft: 32, borderRadius: 6, borderWidth: 1, borderColor: errors.startDate && touched.startDate ? 'red' : '#ccc' }}
              />
            </TouchableOpacity>
          ) : (
            <TextInput
              value={values.startDate || ''}
              onChangeText={(text: string) => handleChange('startDate', text)}
              onBlur={() => handleBlur('startDate')}
              placeholder="YYYY-MM-DD"
              style={{ width: '100%', paddingLeft: 32, borderRadius: 6, borderWidth: 1, borderColor: errors.startDate && touched.startDate ? 'red' : '#ccc' }}
            />
          )}
          {showDatePicker && DateTimePicker && (
            <DateTimePicker
              value={values.startDate ? new Date(values.startDate) : new Date()}
              mode="date"
              display="default"
              onChange={(event: any, selectedDate: Date) => {
                setShowDatePicker(false);
                if (selectedDate) handleChange('startDate', selectedDate.toISOString().slice(0, 10));
              }}
            />
          )}
          {touched.startDate && errors.startDate && <Text style={{ color: 'red', fontSize: 12, position: 'absolute', top: 40 }}>{errors.startDate}</Text>}
        </View>
        <View style={{ flex: 1, position: 'relative', flexDirection: 'row', alignItems: 'center' }}>
          <MaterialIcon name="schedule" size={20} color={COLORS.vata[700]} style={{ position: 'absolute', left: 8, pointerEvents: 'none' }} />
          {DateTimePicker ? (
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ width: '100%' }}>
              <TextInput
                value={values.timeSlot || ''}
                editable={false}
                placeholder="HH:MM"
                style={{ width: '100%', paddingLeft: 32, borderRadius: 6, borderWidth: 1, borderColor: errors.timeSlot && touched.timeSlot ? 'red' : '#ccc' }}
              />
            </TouchableOpacity>
          ) : (
            <TextInput
              value={values.timeSlot || ''}
              onChangeText={(text: string) => handleChange('timeSlot', text)}
              onBlur={() => handleBlur('timeSlot')}
              placeholder="HH:MM"
              style={{ width: '100%', paddingLeft: 32, borderRadius: 6, borderWidth: 1, borderColor: errors.timeSlot && touched.timeSlot ? 'red' : '#ccc' }}
            />
          )}
          {showTimePicker && DateTimePicker && (
            <DateTimePicker
              value={values.timeSlot ? new Date(`1970-01-01T${values.timeSlot}:00`) : new Date()}
              mode="time"
              display="clock"
              onChange={(event: any, selectedTime: Date) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  const hh = String(selectedTime.getHours()).padStart(2, '0');
                  const mm = selectedTime.getMinutes();
                  const allowed = [0, 15, 30, 45];
                  const nearest = allowed.reduce((prev, curr) => Math.abs(curr - mm) < Math.abs(prev - mm) ? curr : prev, 0);
                  const snapped = `${hh}:${nearest.toString().padStart(2, '0')}`;
                  handleChange('timeSlot', snapped);
                }
              }}
            />
          )}
          {touched.timeSlot && errors.timeSlot && <Text style={{ color: 'red', fontSize: 12, position: 'absolute', top: 40 }}>{errors.timeSlot}</Text>}
        </View>
      </View>
      {/* Duration Quick-Picks */}
      <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center' }}>
        {DURATION_OPTIONS.map(opt => (
          <TouchableOpacity key={opt} style={{ marginRight: 8, backgroundColor: values.duration === opt ? '#1976d2' : '#eee', borderRadius: 4, paddingHorizontal: 12, paddingVertical: 4 }} onPress={() => handleChange('duration', opt)}>
            <Text style={{ color: values.duration === opt ? '#fff' : '#222' }}>{opt}d</Text>
          </TouchableOpacity>
        ))}
        <TextInput
          value={values.duration && !DURATION_OPTIONS.includes(values.duration) ? String(values.duration) : ''}
          onChangeText={(text: string) => handleChange('duration', Number(text))}
          onBlur={() => handleBlur('duration')}
          placeholder="Custom"
          keyboardType="numeric"
          style={{ width: 60, marginLeft: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 4 }}
        />
        {touched.duration && errors.duration && <Text style={{ color: 'red', fontSize: 12 }}>{errors.duration}</Text>}
      </View>
      {/* Notes */}
      <View style={{ marginBottom: 12 }}>
        <TextInput
          value={values.notes}
          onChangeText={(text: string) => handleChange('notes', text)}
          placeholder="Notes (optional)"
          style={{ width: '100%', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc' }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
        <TouchableOpacity onPress={onCancel} style={{ backgroundColor: '#eee', borderRadius: 6, paddingVertical: 12, flex: 1, marginRight: 0, alignItems: 'center' }}>
          <Text style={{ color: '#222', fontWeight: '600', fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={{ backgroundColor: mode === 'reschedule' ? '#FF9800' : COLORS.vata[700], borderRadius: 6, paddingVertical: 12, flex: 1, marginLeft: 12, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>{mode === 'reschedule' ? 'Reschedule' : 'Book'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default BookingForm;
