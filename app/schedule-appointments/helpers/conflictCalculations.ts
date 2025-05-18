export function getTherapistConflicts(
  appointments: any[],
  date: string,
  slot: string,
  therapistIds: string[]
): string[] {
  // Returns array of therapistIds that are double-booked for this date/slot
  return therapistIds.filter(tid =>
    appointments.some((apt: any) =>
      apt.date === date &&
      apt.time === slot &&
      apt.tab === 'Therapy' &&
      apt.therapistIds && apt.therapistIds.includes(tid)
    )
  );
}

export function getRecurringConflicts(
  appointments: any[],
  startDate: string,
  days: number,
  slot: string,
  therapistIds: string[],
  addDays: (dateStr: string, days: number) => string
): Array<{ date: string, slot: string, therapistIds: string[] }> {
  const conflicts: Array<{ date: string, slot: string, therapistIds: string[] }> = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const conflictTherapists = getTherapistConflicts(appointments, date, slot, therapistIds);
    if (conflictTherapists.length > 0) {
      conflicts.push({ date, slot, therapistIds: conflictTherapists });
    }
  }
  return conflicts;
}
