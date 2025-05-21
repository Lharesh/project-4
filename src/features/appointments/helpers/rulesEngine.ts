export type Booking = {
  id: string;
  date: string;
  slot: string;
  time?: string;
  roomNumber: string;
  therapistIds: string[];
  clientId: string;
};

export function isTherapistAvailable(
  therapistId: string,
  date: string,
  slot: string,
  appointments: Booking[],
  availability?: { [therapistId: string]: { [date: string]: string[] } }
): boolean {
  const staticallyAvailable = availability?.[therapistId]?.[date]?.includes(slot) ?? true;
  const notBooked = !appointments.some(
    (apt) =>
      apt.therapistIds.includes(therapistId) &&
      apt.date === date &&
      (apt.slot === slot || apt.time === slot)
  );
  return staticallyAvailable && notBooked;
}

export function isRoomAvailable(
  roomNumber: string,
  date: string,
  slot: string,
  appointments: Booking[],
  availability?: { [roomNumber: string]: { [date: string]: string[] } }
): boolean {
  const staticallyAvailable = availability?.[roomNumber]?.[date]?.includes(slot) ?? true;
  const notBooked = !appointments.some(
    (apt) =>
      apt.roomNumber === roomNumber &&
      apt.date === date &&
      (apt.slot === slot || apt.time === slot)
  );
  return staticallyAvailable && notBooked;
}

export function canBookAppointment({
  therapistIds,
  roomNumber,
  date,
  slot,
  appointments,
  patientId,
  therapistAvailability,
  roomAvailability,
}: {
  therapistIds: string[];
  roomNumber?: string;
  date: string;
  slot: string;
  appointments: Booking[];
  patientId?: string;
  therapistAvailability?: { [therapistId: string]: { [date: string]: string[] } };
  roomAvailability?: { [roomNumber: string]: { [date: string]: string[] } };
}): boolean {
  const matchesSlot = (aptSlot: string | undefined) => aptSlot === slot;

  // Room availability check
  let staticallyUnavailable = false;
  if (roomNumber && roomAvailability) {
    staticallyUnavailable = !roomAvailability[roomNumber]?.[date]?.includes(slot);
  }

  if (staticallyUnavailable) {
    console.warn(`[Blocked] Room ${roomNumber} is statically unavailable at ${slot} on ${date}`);
    return false;
  }

  // Room double-booking check
  let isRoomBooked = false;
  if (roomNumber) {
    isRoomBooked = appointments.some(
      apt =>
        apt.roomNumber === roomNumber &&
        apt.date === date &&
        (matchesSlot(apt.slot) || matchesSlot(apt.time))
    );
  }
  if (isRoomBooked) {
    console.warn(`[Blocked] Room ${roomNumber} is already booked at ${slot} on ${date}`);
    return false;
  }

  // Therapist availability + booking check
  for (const therapistId of Array.isArray(therapistIds) ? therapistIds : []) {
    const isUnavailable =
      therapistAvailability &&
      !therapistAvailability[therapistId]?.[date]?.includes(slot);

    const isBooked = appointments.some(
      apt =>
        Array.isArray(apt.therapistIds) && apt.therapistIds.includes(therapistId) &&
        apt.date === date &&
        (matchesSlot(apt.slot) || matchesSlot(apt.time))
    );

    if (isUnavailable) {
      console.warn(`[Blocked] Therapist ${therapistId} is statically unavailable at ${slot} on ${date}`);
      return false;
    }
    if (isBooked) {
      console.warn(`[Blocked] Therapist ${therapistId} is already booked at ${slot} on ${date}`);
      return false;
    }
  }

  // Patient double-booking check
  if (patientId) {
    const isPatientBooked = appointments.some(
      apt =>
        apt.clientId === patientId &&
        apt.date === date &&
        (matchesSlot(apt.slot) || matchesSlot(apt.time))
    );
    if (isPatientBooked) {
      console.warn(`[Blocked] Patient ${patientId} already has an appointment at ${slot} on ${date}`);
      return false;
    }
  }

  return true;
}