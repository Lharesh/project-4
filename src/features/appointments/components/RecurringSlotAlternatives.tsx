// DO NOT use Redux selectors or dispatch in this file.
// All data and callbacks must be passed as props from the parent (TherapyAppointments).
// This is a strict project rule for appointments.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Alternative {
  slot: string;
  roomNumber: string;
  therapistIds?: string[];
}

interface Room { id: string; name: string; }
interface Therapist { id: string; name: string; }

interface RecurringSlotAlternativesProps {
  available: boolean;
  reason: string | null;
  alternatives: Alternative[];
  selectedAlternative: string;
  onSelectAlternative: (slot: string) => void;
  rooms: Room[];
  therapists: Therapist[];
}


export const RecurringSlotAlternatives: React.FC<RecurringSlotAlternativesProps> = ({
  available,
  reason,
  alternatives,
  selectedAlternative,
  onSelectAlternative,
  rooms,
  therapists,
}) => {
  if (available) return null;

  return (
    <View style={styles.container}>
      {reason && <Text style={styles.reasonText}>{reason}</Text>}
      <Text style={styles.guidanceText}>Please find the available alternatives.</Text>
      <View style={styles.altContainer}>
        {alternatives.slice(0, 5).map((alt, idx) => {
          const isSelected = alt.slot === selectedAlternative;
          const roomName = rooms.find((r: Room) => r.id === alt.roomNumber)?.name || alt.roomNumber || 'Unknown Room';
          const therapistNames = (alt.therapistIds || [])
            .map((id: string) => therapists.find((t: Therapist) => t.id === id)?.name || id)
            .join(', ') || 'Unknown';
          return (
            <TouchableOpacity
              key={alt.slot + '-' + alt.roomNumber + '-' + idx}
              style={[styles.altBtn, isSelected && styles.altBtnSelected]}
              activeOpacity={0.85}
              accessible accessibilityRole="button"
              accessibilityLabel={`Alternative slot ${alt.slot} in room ${roomName}${isSelected ? ', selected' : ''}`}
              onPress={() => onSelectAlternative(alt.slot)}
            >
              <Text style={[styles.altBtnText, isSelected && styles.altBtnTextSelected]}>
                {alt.slot.replace('-', ' - ')} - {roomName} | Therapist(s): {therapistNames}
                {isSelected ? ' (Selected)' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
    padding: 16,
    backgroundColor: '#f0f7ff', // glossy blue-ish
    borderRadius: 12,
    borderColor: '#a6d5fa',
    borderWidth: 1,
    shadowColor: '#a6d5fa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  reasonText: {
    color: '#1a2233',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  guidanceText: {
    color: '#3a5ea9',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  altContainer: {
    marginTop: 6,
    flexDirection: 'column',
    gap: 8,
  },
  altBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#e9f3fc',
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#b6d9f9',
    alignItems: 'center',
    shadowColor: '#b6d9f9',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  altBtnSelected: {
    backgroundColor: '#1a2233',
    borderColor: '#1a2233',
    shadowColor: '#1a2233',
  },
  altBtnText: {
    color: '#1a2233',
    fontSize: 15,
    fontWeight: '600',
  },
  altBtnTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default RecurringSlotAlternatives;
