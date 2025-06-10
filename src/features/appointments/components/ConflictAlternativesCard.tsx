import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

interface AlternativeSlot {
  roomId: string;
  slot: string;
  therapistId: string;
  reason: string;
  roomName?: string;
  therapistName?: string;
}

interface ConflictAlternativesCardProps {
  conflict: { date: string; slot: string; therapistIds: string[] };
  alternatives: AlternativeSlot[];
  onSelectAlternative: (alt: AlternativeSlot) => void;
}

const ConflictAlternativesCard: React.FC<ConflictAlternativesCardProps> = ({ conflict, alternatives, onSelectAlternative }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.conflictTitle}>
        Conflict: {conflict.date} @ {conflict.slot}
      </Text>
      <Text style={styles.subtitle}>Alternatives:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
        {alternatives.length === 0 ? (
          <Text style={{ color: 'red', marginRight: 16 }}>No alternatives found</Text>
        ) : (
          alternatives.map((alt, idx) => (
            <TouchableOpacity
              key={alt[APPOINTMENT_PARAM_KEYS.ROOM_ID] + alt.slot + alt.therapistId + idx}
              style={styles.altCard}
              onPress={() => onSelectAlternative(alt)}
            >
              <Text style={styles.altText}>{alt.slot} | {alt.roomName || alt[APPOINTMENT_PARAM_KEYS.ROOM_ID]}</Text>
              <Text style={styles.altText}>{alt.therapistName || alt.therapistId}</Text>
              <Text style={styles.reason}>{alt.reason === 'same therapist' ? 'Preferred' : alt.reason === 'same gender' ? 'Same Gender' : 'Other'}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  conflictTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 4,
  },
  subtitle: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
  },
  altCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  altText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  reason: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});

export default ConflictAlternativesCard;
