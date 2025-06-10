import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ConflictSummaryProps {
  conflicts: Array<{ date: string; slot: string; therapistIds: string[] }>; 
  therapists: Array<{ id: string; name: string }>;
}

const ConflictSummary: React.FC<ConflictSummaryProps> = ({ conflicts, therapists }) => {
  if (conflicts.length === 0) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Conflicts Detected:</Text>
      <View style={styles.list}>
        {conflicts.map((c, idx) => (
          <View key={idx} style={styles.listItem}>
            <Text style={styles.conflictText}>
              {c.date} @ {c.slot}: {c.therapistIds.map(id => therapists.find(t => t.id === id)?.name || id).join(', ')} already booked
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    padding: 10,
    backgroundColor: '#fff3f3',
    borderWidth: 1,
    borderColor: '#e57373',
    borderRadius: 6,
  },
  header: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  list: {
    marginTop: 8,
  },
  listItem: {
    marginTop: 4,
  },
  conflictText: {
    color: '#d32f2f',
    fontSize: 15,
  },
});

export default ConflictSummary;
