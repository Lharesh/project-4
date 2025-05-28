import { useState } from 'react';

interface UseTherapyAppointmentFormProps {
  initialDate?: string;
}

type UseTherapyAppointmentFormReturn = {
  // Validation
  touched: {
    patient: boolean;
    therapy: boolean;
    therapists: boolean;
    date: boolean;
    time: boolean;
    duration: boolean;
  };
  setTouched: React.Dispatch<React.SetStateAction<{
    patient: boolean;
    therapy: boolean;
    therapists: boolean;
    date: boolean;
    time: boolean;
    duration: boolean;
  }>>;
  submitAttempted: boolean;
  setSubmitAttempted: React.Dispatch<React.SetStateAction<boolean>>;
  // Matrix
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  // Patient
  patientSearch: string;
  setPatientSearch: React.Dispatch<React.SetStateAction<string>>;
  selectedPatient: string | null;
  setSelectedPatient: React.Dispatch<React.SetStateAction<string | null>>;
  patientGender: 'male' | 'female' | null;
  setPatientGender: React.Dispatch<React.SetStateAction<'male' | 'female' | null>>;
  patientInputFocused: boolean;
  setPatientInputFocused: React.Dispatch<React.SetStateAction<boolean>>;
  // Therapy
  therapySearch: string;
  setTherapySearch: React.Dispatch<React.SetStateAction<string>>;
  selectedTherapy: string | null;
  setSelectedTherapy: React.Dispatch<React.SetStateAction<string | null>>;
  therapyInputFocused: boolean;
  setTherapyInputFocused: React.Dispatch<React.SetStateAction<boolean>>;
  // Therapists
  selectedTherapists: string[];
  setSelectedTherapists: React.Dispatch<React.SetStateAction<string[]>>;
  therapistSearch: string;
  setTherapistSearch: React.Dispatch<React.SetStateAction<string>>;
  showAllTherapists: boolean;
  setShowAllTherapists: React.Dispatch<React.SetStateAction<boolean>>;
  therapistInputFocused: boolean;
  setTherapistInputFocused: React.Dispatch<React.SetStateAction<boolean>>;
  // Date & Time
  startDate: string;
  setStartDate: React.Dispatch<React.SetStateAction<string>>;
  timeSlot: string;
  setTimeSlot: React.Dispatch<React.SetStateAction<string>>;
  showTimePicker: boolean;
  setShowTimePicker: React.Dispatch<React.SetStateAction<boolean>>;
  // Duration
  duration: number | null;
  setDuration: React.Dispatch<React.SetStateAction<number | null>>;
  customDuration: string;
  setCustomDuration: React.Dispatch<React.SetStateAction<string>>;
  customMode: boolean;
  setCustomMode: React.Dispatch<React.SetStateAction<boolean>>;
  // Room
  selectedRoom: string | null;
  setSelectedRoom: React.Dispatch<React.SetStateAction<string | null>>;
  // Notes
  notes: string;
  setNotes: React.Dispatch<React.SetStateAction<string>>;
};

export function useTherapyAppointmentForm({ initialDate = '2025-05-20' }: UseTherapyAppointmentFormProps = {}): UseTherapyAppointmentFormReturn {
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
