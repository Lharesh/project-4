import React from 'react';

interface Patient {
  id: string;
  name: string;
  gender: string;
}

interface PatientPickerProps {
  patients: Patient[];
  selectedPatient: string | null;
  setSelectedPatient: (id: string | null) => void;
  patientSearch: string;
  setPatientSearch: (s: string) => void;
  patientInputFocused: boolean;
  setPatientInputFocused: (b: boolean) => void;
  setPatientGender: (g: 'male' | 'female') => void;
  touched: any;
  setTouched: (t: any) => void;
}

const PatientPicker: React.FC<PatientPickerProps> = ({
  patients,
  selectedPatient,
  setSelectedPatient,
  patientSearch,
  setPatientSearch,
  patientInputFocused,
  setPatientInputFocused,
  setPatientGender,
  touched,
  setTouched,
}) => {
  // Keep patientSearch in sync with selectedPatient
  React.useEffect(() => {
    if (!patientInputFocused && selectedPatient) {
      const found = patients.find(p => p.id === selectedPatient);
      if (found && patientSearch !== found.name) {
        setPatientSearch(found.name);
      }
    }
    if (!selectedPatient && !patientInputFocused && patientSearch !== '') {
      setPatientSearch('');
    }
  }, [selectedPatient, patientInputFocused, patients]);
  console.log('PatientPicker patients:', patients);
  const filteredPatients = patients.filter((p: Patient) => p.name.toLowerCase().includes(patientSearch.toLowerCase()));
  return (
    <>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Patient</label>
      <div style={{ position: 'relative', marginBottom: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <input
          style={{ width: '100%', maxWidth: '100%', border: '1.5px solid #1976d2', borderRadius: 8, padding: 10, fontSize: 16, outline: patientInputFocused ? '2px solid #1976d2' : 'none', boxSizing: 'border-box' }}
          placeholder="Search or select patient..."
          value={patientInputFocused ? patientSearch : (selectedPatient ? (patients.find(p => p.id === selectedPatient)?.name || '') : '')}
          onFocus={() => {
            setPatientInputFocused(true);
          }}
          onBlur={() => {
            setTimeout(() => setPatientInputFocused(false), 120);
            setTouched((t: any) => ({ ...t, patient: true }));
          }}
          onChange={e => {
            setPatientSearch(e.target.value);
            setSelectedPatient(null);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && filteredPatients.length > 0) {
              const p = filteredPatients[0];
              setSelectedPatient(p.id);
              setPatientSearch(p.name);
              setPatientGender(p.gender as 'male' | 'female');
              setPatientInputFocused(false);
            }
          }}
        />
        {selectedPatient && (
          <span
            role="button"
            aria-label="Clear patient selection"
            tabIndex={0}
            onClick={() => { setSelectedPatient(null); setPatientSearch(''); setPatientInputFocused(true); }}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (setSelectedPatient(null), setPatientSearch(''), setPatientInputFocused(true))}
            style={{ position: 'absolute', right: 12, top: 12, cursor: 'pointer', color: '#888', fontSize: 18, background: 'none', border: 'none' }}
          >
            ×
          </span>
        )}
        {patientInputFocused && !selectedPatient && patientSearch.length > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 2000, background: '#fff', border: '1.5px solid #1976d2', borderRadius: 8, boxShadow: '0 2px 16px #0002', maxHeight: 200, overflowY: 'auto', marginTop: 2 }}>
            {filteredPatients.length === 0 ? (
              <div style={{ padding: 14, color: '#888' }}>No patients found</div>
            ) : filteredPatients.map(p => (
              <div
                key={p.id}
                style={{ padding: 12, borderBottom: '1px solid #eee', cursor: 'pointer', background: selectedPatient === p.id ? '#e3f0fc' : '#fff', fontWeight: selectedPatient === p.id ? 700 : 400 }}
                onMouseDown={() => {
                  setSelectedPatient(p.id);
                  setPatientSearch(p.name);
                  setPatientGender(p.gender as 'male' | 'female');
                  setPatientInputFocused(false);
                }}
              >
                <span style={{ color: selectedPatient === p.id ? '#1976d2' : '#222' }}>{p.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {!selectedPatient && touched && (
        <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please select a patient.</div>
      )}
    </>
  );
};

export default PatientPicker;
