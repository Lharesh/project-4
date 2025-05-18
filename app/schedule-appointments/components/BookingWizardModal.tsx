import React, { useState } from 'react';
import TherapyPicker from './TherapyPicker';
import DurationPicker from './DurationPicker';
import TherapistPicker from './TherapistPicker';
import PatientPicker from './PatientPicker';



interface Patient {
  id: string;
  name: string;
  gender: string;
}
interface Therapy {
  id: string;
  name: string;
}

interface Therapist {
  id: string;
  name: string;
  gender: string;
  availability: Record<string, string[]>;
}

interface BookingWizardModalProps {
  open: boolean;
  roomNumber: string;
  slot: string;
  matrix: any[];
  patients: Patient[];
  therapies: Therapy[];
  therapistsWithAvailability: Therapist[];
  selectedTherapy?: string;
  selectedTherapists?: string[];
  selectedPatient?: string;
  selectedPatientName?: string;
  selectedPatientMobile?: string;
  onClose: () => void;
  onSaveWizard: (booking: any) => void;
  getRecommendedSlots: (params: any) => any[];
  checkCanBook: (date: string, slot: string, therapistIds: string[], duration: number) => boolean;
}

const DURATION_OPTIONS = [1, 3, 5, 7, 14];

export const BookingWizardModal: React.FC<BookingWizardModalProps> = (props) => {
  const {
    open,
    roomNumber,
    slot,
    matrix,
    patients,
    therapies,
    therapistsWithAvailability,
    selectedTherapy: initialTherapy,
    selectedTherapists: initialTherapists,
    selectedPatient,
    selectedPatientName,
    selectedPatientMobile,
    onClose,
    onSaveWizard,
    getRecommendedSlots,
    checkCanBook,
  }: BookingWizardModalProps = props;

  console.log('BookingWizardModal patients prop:', patients);
  console.log('BookingWizardModal therapies prop:', therapies);

  const [step, setStep] = useState(0);
  // Reset wizard state on open or slot change
  React.useEffect(() => {
    if (open) {
      setStep(0);
      setSelectedPatientId(selectedPatient || null);
      // Set patientSearch to selected patient's name if present
      if (selectedPatient && patients && patients.length > 0) {
        const found = patients.find(p => p.id === selectedPatient);
        setPatientSearch(found ? found.name : '');
      } else {
        setPatientSearch('');
      }
      // Set therapySearch to selected therapy's name if present
      if (initialTherapy && therapies && therapies.length > 0) {
        const found = therapies.find(t => t.id === initialTherapy);
        setTherapySearch(found ? found.name : '');
      } else {
        setTherapySearch('');
      }
      setPatientInputFocused(false);
      setSelectedTherapy(initialTherapy || null);
      setTherapyInputFocused(false);
      setTouched({});
      setStartDate('');
      setDuration(1);
      setSelectedTherapists(initialTherapists || []);
      setTherapistSearch('');
      setTherapistInputFocused(false);
      setShowAllTherapists(false);
      setPatientGender(null);
      setConflict(false);
      setSuggestions([]);
    }
  }, [open, slot, roomNumber, selectedPatient, initialTherapy, patients, therapies]);
  // Patient Picker logic
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientInputFocused, setPatientInputFocused] = useState(false);

  const [selectedTherapy, setSelectedTherapy] = useState<string | null>(null);
  const [therapySearch, setTherapySearch] = useState('');
  const [therapyInputFocused, setTherapyInputFocused] = useState(false);

  const [touched, setTouched] = useState<any>({});
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState(1);

  const [selectedTherapists, setSelectedTherapists] = useState<string[]>(initialTherapists || []);
  const [therapistSearch, setTherapistSearch] = useState('');
  const [therapistInputFocused, setTherapistInputFocused] = useState(false);
  const [showAllTherapists, setShowAllTherapists] = useState(false);
  const [patientGender, setPatientGender] = useState<string | null>(null);

  const [conflict, setConflict] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Responsive: disable Save if not all fields are valid or conflict exists
  const isSaveEnabled =
    selectedTherapy && startDate && duration > 0 && selectedTherapists.length > 0 && !conflict;

  const handleNext = () => {
    if (step === 2) {
      // Conflict check step
      let hasConflict = false;
      for (let i = 0; i < duration; i++) {
        // Expand each day, call checkCanBook
        const date = startDate; // TODO: addDays(startDate, i)
        if (!checkCanBook(date, slot, selectedTherapists, 1)) {
          hasConflict = true;
          break;
        }
      }
      setConflict(hasConflict);
      if (hasConflict) {
        const suggestions = getRecommendedSlots({ date: startDate, slot, therapistIds: selectedTherapists, matrix });
        setSuggestions(suggestions);
      }
    }
    setStep(step + 1);
  };

  const handleSave = () => {
    if (!isSaveEnabled || saving) return;
    setSaving(true);
    // Parent should close modal after updating appointments
    onSaveWizard({
      roomNumber,
      slot,
      selectedTherapy,
      startDate,
      duration, // days
      selectedTherapists,
      selectedPatient,
    onDone: () => {
      setSaving(false);
      onClose();
    }
  });
  };

  const [saving, setSaving] = useState(false);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 18, width: '98vw', maxWidth: 440, minWidth: 320, padding: 0, boxShadow: '0 4px 32px #0003', maxHeight: '98vh', overflow: 'auto', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        {/* Cancel (X) icon, top right */}
        <div style={{ position: 'absolute', top: 18, right: 18, zIndex: 10 }}>
          <span
            role="button"
            aria-label="Cancel"
            tabIndex={0}
            onClick={onClose}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClose()}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6', color: '#222', cursor: 'pointer', fontSize: 22, boxShadow: '0 1px 8px #0001', border: 'none', transition: 'background 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.background = '#e0e0e0')}
            onMouseOut={e => (e.currentTarget.style.background = '#f3f4f6')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#222" strokeWidth="2" strokeLinecap="round"/></svg>
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 22, padding: '20px 20px 12px 20px', borderBottom: '1px solid #e0e0e0', textAlign: 'center', background: '#fafbfc', boxSizing: 'border-box', width: '100%', maxWidth: '100%' }}>
          Book Therapy Slot
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12, boxSizing: 'border-box', width: '100%', maxWidth: '100%' }}>
          {/* Stepper indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
            {[0, 1, 2, 3].map(idx => (
              <div key={idx} style={{ width: 13, height: 13, borderRadius: 7, background: step === idx ? '#1976d2' : '#e0e0e0', transition: 'background 0.2s' }} />
            ))}
          </div>
          {step === 0 && (
            <div>
              <PatientPicker
                patients={patients}
                selectedPatient={selectedPatientId}
                setSelectedPatient={id => { setSelectedPatientId(id); setTouched((t: any) => ({ ...t, patient: true })); }}
                patientSearch={patientSearch}
                setPatientSearch={setPatientSearch}
                patientInputFocused={patientInputFocused}
                setPatientInputFocused={setPatientInputFocused}
                setPatientGender={setPatientGender}
                touched={!!touched.patient}
                setTouched={setTouched}
              />
              <TherapyPicker
                therapies={therapies}
                selectedTherapy={selectedTherapy || ''}
                setSelectedTherapy={id => { setSelectedTherapy(id); setTouched((t: any) => ({ ...t, therapy: true })); }}
                therapySearch={therapySearch}
                setTherapySearch={setTherapySearch}
                therapyInputFocused={therapyInputFocused}
                setTherapyInputFocused={setTherapyInputFocused}
                touched={!!touched.therapy}
                setTouched={setTouched}
              />
              <DurationPicker
                duration={duration}
                setDuration={d => { setDuration(d); setTouched((t: any) => ({ ...t, duration: true })); }}
                durationOptions={DURATION_OPTIONS}
                touched={!!touched.duration}
                setTouched={setTouched}
              />
            </div>
          )}
          {step === 1 && (
            <div>
              <label style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: 10, marginTop: 8, borderRadius: 8, border: '1px solid #D3D3D3', fontSize: 16 }} />
            </div>
          )}
          {step === 2 && (
            <div>
              <TherapistPicker
                therapists={therapistsWithAvailability}
                selectedTherapists={selectedTherapists}
                setSelectedTherapists={ids => { setSelectedTherapists(ids); setTouched((t: any) => ({ ...t, therapists: true })); }}
                therapistSearch={therapistSearch}
                setTherapistSearch={setTherapistSearch}
                showAllTherapists={showAllTherapists}
                setShowAllTherapists={setShowAllTherapists}
                therapistInputFocused={therapistInputFocused}
                setTherapistInputFocused={setTherapistInputFocused}
                patientGender={patientGender}
                touched={!!touched.therapists}
                setTouched={setTouched}
              />
            </div>
          )}
          {step === 3 && (
            <div>
              <label style={{ fontWeight: 600 }}>Conflict Check</label>
              {conflict ? (
                <div style={{ color: 'red', marginTop: 12, fontWeight: 600 }}>
                  Conflict detected for at least one day!
                  <div style={{ marginTop: 12, color: '#444', fontWeight: 400 }}>
                    <b>Suggested Alternatives:</b>
                    <ul style={{ marginTop: 6 }}>
                      {suggestions.map((s, i) => (
                        <li key={i}>{s.roomNumber} - {s.slot}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div style={{ color: 'green', marginTop: 14, fontWeight: 600 }}>No conflicts detected for selected days.</div>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginTop: 18, marginBottom: 6, width: '100%' }}>
          {/* Previous Arrow */}
          {step > 0 && (
            <span
              role="button"
              aria-label="Previous"
              tabIndex={0}
              onClick={() => setStep(step - 1)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setStep(step - 1)}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: '#f3f4f6', color: '#1976d2', cursor: 'pointer', fontSize: 28, border: 'none', boxShadow: '0 1px 8px #0001', transition: 'background 0.2s, color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.background = '#e0e0e0')}
              onMouseOut={e => (e.currentTarget.style.background = '#f3f4f6')}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M18 6l-8 8 8 8" stroke="#1976d2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          )}
          {/* Next Arrow */}
          {step < 3 && (
            <span
              role="button"
              aria-label="Next"
              tabIndex={0}
              onClick={handleNext}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleNext()}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: '#1976d2', color: '#fff', cursor: ((step === 0 && !selectedTherapy) || (step === 1 && (!startDate || !duration)) || (step === 2 && selectedTherapists.length === 0)) ? 'not-allowed' : 'pointer', fontSize: 28, border: 'none', boxShadow: '0 1px 8px #0001', transition: 'background 0.2s, color 0.2s', opacity: ((step === 0 && !selectedTherapy) || (step === 1 && (!startDate || !duration)) || (step === 2 && selectedTherapists.length === 0)) ? 0.5 : 1 }}
              aria-disabled={((step === 0 && !selectedTherapy) || (step === 1 && (!startDate || !duration)) || (step === 2 && selectedTherapists.length === 0))}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M10 22l8-8-8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          )}
          {/* Save Checkmark */}
          {step === 3 && (
            <span
              role="button"
              aria-label="Save"
              tabIndex={0}
              onClick={handleSave}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleSave()}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: isSaveEnabled ? '#1976d2' : '#a5b6cf', color: '#fff', cursor: isSaveEnabled && !saving ? 'pointer' : 'not-allowed', fontSize: 28, border: 'none', boxShadow: '0 1px 8px #0001', transition: 'background 0.2s, color 0.2s', opacity: isSaveEnabled && !saving ? 1 : 0.6 }}
              aria-disabled={!isSaveEnabled || saving}
            >
              {saving ? (
                <svg width="28" height="28" viewBox="0 0 50 50" style={{ margin: 0 }}><circle cx="25" cy="25" r="20" stroke="#fff" strokeWidth="5" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.8s" repeatCount="indefinite"/></circle></svg>
              ) : (
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M7 15l5 5 9-9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingWizardModal;
