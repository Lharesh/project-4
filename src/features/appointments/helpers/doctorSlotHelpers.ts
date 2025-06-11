// doctorSlotHelpers.ts
// Helpers for generating doctor slots for a given day, using clinicTimings and appointments

/**
 * Generate slots for a doctor for a given day.
 * @param doctor Doctor object
 * @param date Date string (YYYY-MM-DD)
 * @param clinicTimings Clinic timings object
 * @param appointments Array of appointments for this doctor
 * @param slotInterval Slot interval in minutes (default 15)
 * @returns Array of slot objects: { id, time, status, clientName }
 */
export function getDoctorSlotsForDay(
    doctor: any,
    date: string,
    clinicTimings: any,
    appointments: any[],
    slotInterval: number = 15
): Array<{ id: string; time: string; status: string; clientName?: string; appointmentId?: string; clientId?: string; statusReason?: string }> {
    // 1. Get working hours for the date
    const weekday = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayTiming = clinicTimings?.weekdays?.[weekday];
    if (!dayTiming || !dayTiming.isOpen || dayTiming.status === 'holiday' || dayTiming.status === 'weekly_off') {
        return [];
    }
    // 2. Generate all slots for the day
    const slots: Array<{ id: string; time: string; status: string; clientName?: string; appointmentId?: string; clientId?: string; statusReason?: string }> = [];
    let current = dayTiming.start;
    const end = dayTiming.end;
    function addMinutes(time: string, mins: number): string {
        const [h, m] = (time ?? '00:00').split(':').map(Number);
        const dateObj = new Date(0, 0, 0, h, m + mins);
        return dateObj.toTimeString().slice(0, 5);
    }
    const hasBreak = !!dayTiming.breakStart && !!dayTiming.breakEnd;
    while (current < end) {
        // Skip break
        if (hasBreak && current >= dayTiming.breakStart && current < dayTiming.breakEnd) {
            current = dayTiming.breakEnd;
            continue;
        }
        // Find appointment for this doctor/slot
        const appt = appointments.find(
            (a: any) => a.doctorId === doctor.id && a.date === date && (a.time === current || a.slot === current)
        );
        let status = 'available';
        let clientName = undefined;
        let appointmentId = undefined;
        let clientId = undefined;
        let statusReason = undefined;
        if (appt) {
            if (appt.status === 'scheduled') status = 'scheduled';
            else if (appt.status === 'completed') status = 'completed';
            else if (appt.status === 'cancelled') status = 'cancelled';
            else if (appt.status === 'no-showup') status = 'no-showup';
            clientName = appt.clientName;
            appointmentId = appt.id;
            clientId = appt.clientId;
            statusReason = appt.statusReason;
        }
        slots.push({
            id: `${doctor.id}_${date}_${current}`,
            time: current,
            status,
            clientName,
            appointmentId,
            clientId,
            statusReason,
        });
        current = addMinutes(current, slotInterval);
    }
    return slots;
} 