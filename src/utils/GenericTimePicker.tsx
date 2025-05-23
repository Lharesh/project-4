import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface GenericTimePickerProps {
  label?: string;
  value: string; // ISO time string: HH:mm
  onChange: (val: string) => void;
  hourLabel?: string;
  minuteLabel?: string;
  minHour?: number;
  maxHour?: number;
  minMinute?: number;
  maxMinute?: number;
  style?: any;
  inputStyle?: any;
}

const windowHeight = Dimensions.get('window').height;

const GenericTimePicker: React.FC<GenericTimePickerProps> = ({
  label,
  value,
  onChange,
  hourLabel = 'Hour',
  minuteLabel = 'Minute',
  minHour = 1,
  maxHour = 24,
  minMinute = 0,
  maxMinute = 59,
  style,
  inputStyle,
}) => {
  const hourScrollRef = React.useRef<ScrollView>(null);
  const minuteScrollRef = React.useRef<ScrollView>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempHour, setTempHour] = useState<string>(() => {
    const [h] = value.split(':');
    return h && !isNaN(Number(h)) ? h.padStart(2, '0') : '';
  });
  const [tempMinute, setTempMinute] = useState<string>(() => {
    const [, m] = value.split(':');
    return m && !isNaN(Number(m)) ? m.padStart(2, '0') : '';
  });
  const [inputValue, setInputValue] = useState<string>(() => (value ? value : ''));
  const userTypingRef = React.useRef(false);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      setTempHour(h && !isNaN(Number(h)) ? h.padStart(2, '0') : '');
      setTempMinute(m && !isNaN(Number(m)) ? m.padStart(2, '0') : '');
      if (!userTypingRef.current) {
        setInputValue(value);
      }
    }
  }, [value]);

  useEffect(() => {
    if (modalVisible) {
      // On open, sync inputValue to tempHour/tempMinute
      userTypingRef.current = false;
      setInputValue(tempHour && tempMinute ? `${tempHour}:${tempMinute}` : '');
    }
  }, [modalVisible]);

  // When pickers change, update inputValue (but not if user is typing)
  useEffect(() => {
    if (!userTypingRef.current) {
      if (tempHour && tempMinute) {
        setInputValue(`${tempHour}:${tempMinute}`);
      } else if (tempHour) {
        setInputValue(`${tempHour}:`);
      } else {
        setInputValue('');
      }
    }
  }, [tempHour, tempMinute]);

  // When user types a valid input, update pickers
  useEffect(() => {
    if (userTypingRef.current) {
      const match = inputValue.match(/^(\d{2}):(\d{2})$/);
      if (match) {
        const [_, hh, mm] = match;
        const hNum = Number(hh);
        const mNum = Number(mm);
        if (hNum >= minHour && hNum <= maxHour && mNum >= minMinute && mNum <= maxMinute) {
          setTempHour(hh);
          setTempMinute(mm);
          onChange(`${hh}:${mm}`);
          userTypingRef.current = false;
        }
      }
    }
  }, [inputValue]);

  // Scroll hour/minute pickers to the selected value (centered on 3rd row)
  React.useEffect(() => {
    // Each item is 40px tall, as per snapToInterval
    setTimeout(() => {
      if (hourScrollRef.current && tempHour) {
        const hourIdx = hourOptions.findIndex(h => h === tempHour);
        if (hourIdx >= 0) {
          const y = Math.max((hourIdx - 2) * 40, 0);
          hourScrollRef.current.scrollTo({ y, animated: false });
        }
      }
      if (minuteScrollRef.current && tempMinute) {
        const minIdx = minuteOptions.findIndex(m => m === tempMinute);
        if (minIdx >= 0) {
          const y = Math.max((minIdx - 2) * 40, 0);
          minuteScrollRef.current.scrollTo({ y, animated: false });
        }
      }
    }, 0);
  }, [tempHour, tempMinute]);

  const displayText = tempHour && tempMinute ? `${tempHour} : ${tempMinute}` : 'HH : MM';

  const handleConfirm = () => {
    setModalVisible(false);
    if (tempHour && tempMinute) {
      onChange(`${tempHour}:${tempMinute}`);
    }
  };

  // For scrollable pickers
  const hourOptions = Array.from({ length: maxHour - minHour + 1 }, (_, i) => (minHour + i).toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: maxMinute - minMinute + 1 }, (_, i) => (minMinute + i).toString().padStart(2, '0'));

  return (
    <View style={[styles.timePickerContainer, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.timeField}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.timeText, !tempHour || !tempMinute ? styles.placeholder : undefined]}>{displayText}</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Select Time</Text>
            {/* Time Entry Input */}
            <View style={{ width: '70%', marginBottom: 12 }}>
              <TextInput
                style={styles.timeInput}
                placeholder="HH:MM"
                value={inputValue}
                maxLength={5}
                keyboardType="numeric"
                onChangeText={(raw: string) => {
                  userTypingRef.current = true;
                  // Only allow numbers
                  let digits = raw.replace(/\D/g, '');
                  if (digits.length > 4) digits = digits.slice(0, 4);
                  let display = '';
                  if (digits.length === 0) display = '';
                  else if (digits.length <= 2) display = digits + ':';
                  else display = digits.slice(0,2) + ':' + digits.slice(2);
                  setInputValue(display);
                }}
                selection={(() => {
                  // Place cursor at the end or after the colon if needed
                  if (!inputValue) return { start: 0, end: 0 };
                  if (inputValue.length <= 2) return { start: inputValue.length, end: inputValue.length };
                  if (inputValue.length === 3) return { start: 4, end: 4 };
                  return { start: inputValue.length, end: inputValue.length };
                })()}

              />
            </View>
            <View style={styles.scrollPickerRow}>
              {/* Hour Picker */}
              <View style={styles.scrollPickerCol}>
                <Text style={styles.pickerLabel}>{hourLabel}</Text>
                <View style={{ position: 'relative' }}>
                  <ScrollView
                    ref={hourScrollRef}
                    style={styles.scrollPicker}
                    contentContainerStyle={{ alignItems: 'center' }}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={40}
                    decelerationRate="fast"
                  >
                    {hourOptions.map(h => (
                      <TouchableOpacity
                        key={h}
                        style={[styles.scrollPickerItem, tempHour === h && styles.scrollPickerItemActive]}
                        onPress={() => {
                          setTempHour(h);
                          setTimeout(() => {
                            if (hourScrollRef.current) {
                              const hourIdx = hourOptions.findIndex(opt => opt === h);
                              if (hourIdx >= 0) hourScrollRef.current.scrollTo({ y: Math.max((hourIdx - 2) * 40, 0), animated: true });
                            }
                          }, 0);
                        }}
                      >
                        <Text style={[styles.scrollPickerText, tempHour === h && styles.scrollPickerTextActive]}>{h}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <View style={{
                    position: 'absolute',
                    top: 80,
                    left: 0,
                    right: 0,
                    height: 40,
                    borderTopWidth: 2,
                    borderBottomWidth: 2,
                    borderColor: '#007AFF',
                    pointerEvents: 'none',
                  }} />
                </View>
              </View>
              <Text style={styles.colon}>:</Text>
              {/* Minute Picker */}
              <View style={styles.scrollPickerCol}>
                <Text style={styles.pickerLabel}>{minuteLabel}</Text>
                <View style={{ position: 'relative' }}>
                  <ScrollView
                    ref={minuteScrollRef}
                    style={styles.scrollPicker}
                    contentContainerStyle={{ alignItems: 'center' }}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={40}
                    decelerationRate="fast"
                  >
                    {minuteOptions.map(m => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.scrollPickerItem, tempMinute === m && styles.scrollPickerItemActive]}
                        onPress={() => {
                          setTempMinute(m);
                          setTimeout(() => {
                            if (minuteScrollRef.current) {
                              const minIdx = minuteOptions.findIndex(opt => opt === m);
                              if (minIdx >= 0) minuteScrollRef.current.scrollTo({ y: Math.max((minIdx - 2) * 40, 0), animated: true });
                            }
                          }, 0);
                        }}
                      >
                        <Text style={[styles.scrollPickerText, tempMinute === m && styles.scrollPickerTextActive]}>{m}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <View style={{
                    position: 'absolute',
                    top: 80,
                    left: 0,
                    right: 0,
                    height: 1,
                    backgroundColor: '#e3a857',
                  }} />
                </View>
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !(tempHour && tempMinute) && { opacity: 0.6 }]}
                onPress={handleConfirm}
                disabled={!(tempHour && tempMinute)}
                accessibilityState={{ disabled: !(tempHour && tempMinute) }}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  timePickerContainer: {
    marginBottom: 14,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 15,
    color: '#1a2233',
  },
  timeField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d6dbe6',
    backgroundColor: '#fafbfc',
    marginBottom: 4,
    paddingHorizontal: 18,
  },
  timeText: {
    fontSize: 20,
    letterSpacing: 2,
    color: '#1a2233',
  },
  placeholder: {
    color: '#b0b7c3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1a2233',
  },
  scrollPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scrollPickerCol: {
    alignItems: 'center',
    width: 80,
  },
  pickerLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    color: '#1a2233',
  },
  scrollPicker: {
    maxHeight: 200,
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#f6f7f9',
    paddingVertical: 8,
  },
  scrollPickerItem: {
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  scrollPickerItemActive: {
    backgroundColor: '#e3a857',
  },
  scrollPickerText: {
    fontSize: 22,
    color: '#1a2233',
    fontWeight: '400',
  },
  scrollPickerTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  colon: {
    fontSize: 28,
    fontWeight: '700',
    marginHorizontal: 10,
    color: '#1a2233',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#e3e7ed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 6,
  },
  cancelBtnText: {
    color: '#e3a857',
    fontWeight: '700',
    fontSize: 16,
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#e3a857',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 6,
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#d6dbe6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    fontSize: 18,
    color: '#1a2233',
    backgroundColor: '#f6f7f9',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 2,
  },
});

export default GenericTimePicker;
