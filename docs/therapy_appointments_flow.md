# Therapy Appointments Logic: Design, User Flow, Data Flow & Booking Rules

## 1. Purpose & Overview
The Therapy Appointments system allows users to book recurring therapy sessions, ensuring:
- No double-booking (patient, therapist, room)
- Seamless alternatives suggestion
- Accurate, up-to-date availability display
- Mobile-first, React Native UI only

---

## 2. High-Level Design Diagram
```
+-------------------+      +---------------------+      +-------------------+
| TherapyAppointments| ---> |   Helper Functions  | ---> |  Data/State Store |
|   (Screen/Modal)  |      | (rulesEngine, etc.) |      | (Redux/Context)   |
+-------------------+      +---------------------+      +-------------------+
         |                          |                             |
         v                          v                             v
+-------------------+      +---------------------+      +-------------------+
|   UI Components   |<-----|   Availability      |<-----|  Appointments DB  |
| (Picker, Matrix,  |      |   Calculations      |      | (in-memory/store) |
|  Alternatives)    |      +---------------------+      +-------------------+
+-------------------+
```

---

## 3. User Flow Diagram
```
[User selects patient/therapy/therapist/room/slot]
        |
        v
[TherapyAppointments updates local state]
        |
        v
[On every change or booking attempt:]
        |
        v
[rulesEngine & dynamicAvailability called]
        |
        v
[Availability/alternatives calculated]
        |
        v
[UI updates: show available slots, booked status, valid alternatives, error messages]
        |
        v
[User confirms booking -> Save to Appointments DB]
```

---

## 4. Data Flow Diagram
```
User Input (Selections)
      |
      v
TherapyAppointments.tsx
      |
      v
+-------------------------------+
| Calls Helper Functions:       |
| - rulesEngine                 |
| - recurringSlotAlternatives   |
| - dynamicAvailability         |
+-------------------------------+
      |
      v
Helpers use:
- availabilityUtils (core checks)
- conflictCalculations (recurring conflicts)
      |
      v
All helpers access Appointments DB/Store
      |
      v
Results (availability, conflicts, alternatives)
      |
      v
Back to TherapyAppointments.tsx for UI rendering
```

---

## 5. Purpose of Each File

| File                                   | Purpose                                                                                   |
|----------------------------------------|------------------------------------------------------------------------------------------|
| `TherapyAppointments.tsx`               | Main UI/controller. Handles user interaction, triggers helpers, updates UI.              |
| `rulesEngine.ts`                        | Core logic for slot/room/therapist/patient availability, reason messages, alternatives.  |
| `recurringSlotAlternatives.ts`          | Suggests alternative slots/rooms/therapists for recurring bookings.                      |
| `dynamicAvailability.ts`                | Dynamically computes up-to-date slot/room/therapist availability for given date.         |
| `buildScheduleMatrix.ts`                | Builds the UI matrix of rooms/therapists/slots, showing booked/available status.         |
| `availabilityUtils.ts`                  | Core helpers for all availability checks (therapist, room, patient).                     |
| `conflictCalculations.ts`               | Advanced recurring conflict checks for therapists/rooms/patients.                        |

---

## 6. Step-by-Step Flow for Booking

1. **User makes a selection (patient, therapy, therapist, room, slot)**
2. **TherapyAppointments.tsx** updates state and calls:
   - `rulesEngine` to check if booking is valid and get reason/alternatives.
   - `dynamicAvailability` to update available slots/rooms/therapists.
   - `buildScheduleMatrix` to update the UI matrix.
3. **Helpers** use `availabilityUtils` and `conflictCalculations` to ensure no double-booking and accurate alternatives.
4. **UI updates** with the latest valid slots, alternatives, and error messages.
5. **On booking confirmation**, appointment is saved and all helpers re-run to reflect the new state.

---

## 7. Booking Rules

**All of the following rules MUST be enforced for every booking attempt:**

1. **No double-booking:**
   - A patient cannot have two appointments at the same date/slot.
   - A therapist cannot be booked for two appointments at the same date/slot.
   - A room cannot be booked for two appointments at the same date/slot.
2. **Slot must not be in the past.**
3. **Allowed reason messages (for unavailability):**
   - 'Time Slot is in the past' (if the slot is before the current time)
   - 'Selected Room is not available' (if the selected room is already booked; if alternate rooms are free and therapists are available, show those as alternatives)
   - 'Therapists are busy' (if all therapists of the patient's gender are unavailable)
4. **Alternatives:**
   - Always suggest alternatives in `slot-roomNumber` format.
   - Prefer the same slot with an alternative therapist (same gender as patient) or another room.
   - Only if that is not possible, suggest the next nearest available time slot (with both therapist and room available).
5. **Patient gender:**
   - Fetch from the PATIENTS array using patientId for therapist filtering.
6. **UI/UX:**
   - Use React Native components only (no web/HTML elements).
   - Alternatives dropdown must work on both mobile and web, using the correct separator and display format.

---

## 8. Validation Checklist

- [ ] TherapyAppointments calls all helpers on every relevant state change or booking attempt
- [ ] Matrix and alternatives always use up-to-date data
- [ ] No double-booking for patient, therapist, or room
- [ ] Only allowed reason messages are ever shown
- [ ] Alternatives are always valid and correctly formatted
- [ ] UI never shows obsolete rooms or slots
- [ ] All helpers use the same core logic for availability

---

*This document is the single source of truth for developers working on therapy appointment booking logic and UI. Always validate your changes against this flow and these rules.*
