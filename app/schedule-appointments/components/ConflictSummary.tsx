import React from 'react';

interface ConflictSummaryProps {
  conflicts: Array<{ date: string; slot: string; therapistIds: string[] }>; 
  therapists: Array<{ id: string; name: string }>;
}

const ConflictSummary: React.FC<ConflictSummaryProps> = ({ conflicts, therapists }) => {
  if (conflicts.length === 0) return null;
  return (
    <div style={{ margin: '12px 0', padding: 10, background: '#fff3f3', border: '1px solid #e57373', borderRadius: 6 }}>
      <strong style={{ color: '#d32f2f' }}>Conflicts Detected:</strong>
      <ul style={{ marginTop: 8 }}>
        {conflicts.map((c, idx) => (
          <li key={idx} style={{ color: '#d32f2f' }}>
            {c.date} @ {c.slot}: {c.therapistIds.map(id => therapists.find(t => t.id === id)?.name || id).join(', ')} already booked
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConflictSummary;
