// Appointment and Slot Status Constants
export const APPOINTMENT_STATUS = {
    SCHEDULED: 'scheduled',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    RESCHEDULED: 'rescheduled',
    PENDING: 'pending',
};

export const SLOT_STATUS = {
    AVAILABLE: 'available',
    NOT_AVAILABLE: 'notAvailable',
    BREAK: 'break',
    THERAPIST_UNAVAILABLE: 'therapistUnavailable',
    CANCELLED_AVAILABLE: 'cancelledAvailable', // For "Cancelled & Available" slots
    SCHEDULED: 'scheduled', // Use for booked slots in UI
};

export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];
export type SlotStatus = typeof SLOT_STATUS[keyof typeof SLOT_STATUS]; 