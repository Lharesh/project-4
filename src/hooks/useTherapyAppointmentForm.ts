import { useState } from 'react';

interface UseTherapyAppointmentFormProps {
  initialDate?: string;
}

export function useTherapyAppointmentForm({ initialDate = '2025-05-20' }: UseTherapyAppointmentFormProps = {}) {
  // Validation state
  const [touched, setTouched] = useState({
    patient: false,
    therapy: false,
    therapists: false,
    date: false,
    time: false,
    duration: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Matrix state
  const [selectedDate, setSelectedDate] = useState(initialDate);

  // Patient
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | null>(null);
  const [patientInputFocused, setPatientInputFocused] = useState(false);

  // Therapy
  const [therapySearch, setTherapySearch] = useState('');
  const [selectedTherapy, setSelectedTherapy] = useState<string | null>(null);
  const [therapyInputFocused, setTherapyInputFocused] = useState(false);

  // Therapists
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>([]);
  const [therapistSearch, setTherapistSearch] = useState('');
  const [showAllTherapists, setShowAllTherapists] = useState(false);
  const [therapistInputFocused, setTherapistInputFocused] = useState(false);

  // Date & Time
  const [startDate, setStartDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Duration
  const [duration, setDuration] = useState<number | null>(7);
  const [customDuration, setCustomDuration] = useState('');
  const [customMode, setCustomMode] = useState(false);

  // Room
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Notes
  const [notes, setNotes] = useState('');

  return {
    // Validation
    touched, setTouched, submitAttempted, setSubmitAttempted,
    // Matrix
    selectedDate, setSelectedDate,
    // Patient
    patientSearch, setPatientSearch, selectedPatient, setSelectedPatient, patientGender, setPatientGender, patientInputFocused, setPatientInputFocused,
    // Therapy
    therapySearch, setTherapySearch, selectedTherapy, setSelectedTherapy, therapyInputFocused, setTherapyInputFocused,
    // Therapists
    selectedTherapists, setSelectedTherapists, therapistSearch, setTherapistSearch, showAllTherapists, setShowAllTherapists, therapistInputFocused, setTherapistInputFocused,
    // Date & Time
    startDate, setStartDate, timeSlot, setTimeSlot, showTimePicker, setShowTimePicker,
    // Duration
    duration, setDuration, customDuration, setCustomDuration, customMode, setCustomMode,
    // Room
    selectedRoom, setSelectedRoom,
    // Notes
    notes, setNotes,
  };
}
