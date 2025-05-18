import React from 'react';

interface Therapist {
  id: string;
  name: string;
  gender: string;
  availability: Record<string, string[]>;
}

interface TherapistPickerProps {
  therapists: Therapist[];
  selectedTherapists: string[];
  setSelectedTherapists: (ids: string[]) => void;
  therapistSearch: string;
  setTherapistSearch: (s: string) => void;
  showAllTherapists: boolean;
  setShowAllTherapists: (b: boolean) => void;
  therapistInputFocused: boolean;
  setTherapistInputFocused: (b: boolean) => void;
  patientGender: string | null;
  touched: boolean;
  setTouched: (t: any) => void;
}

const TherapistPicker: React.FC<TherapistPickerProps> = ({
  therapists,
  selectedTherapists,
  setSelectedTherapists,
  therapistSearch,
  setTherapistSearch,
  showAllTherapists,
  setShowAllTherapists,
  therapistInputFocused,
  setTherapistInputFocused,
  patientGender,
  touched,
  setTouched,
}) => {
  console.log('[TherapistPicker] therapists prop:', therapists);

  // Defensive: always treat selectedTherapists as array
  const safeSelectedTherapists = Array.isArray(selectedTherapists) ? selectedTherapists : [];
  // Improved gender + search filter logic
  let filteredTherapists = therapists;
  if (therapistSearch) {
    filteredTherapists = therapists.filter(t => {
      const matchesName = t.name.toLowerCase().includes(therapistSearch.toLowerCase());
      const matchesGender = !patientGender || showAllTherapists || t.gender === patientGender;
      return matchesName && matchesGender;
    });
  } else if (patientGender && !showAllTherapists) {
    filteredTherapists = therapists.filter(t => t.gender === patientGender);
  }

  const toggleTherapist = (id: string) => {
    let newSelected: string[];
    if (safeSelectedTherapists.includes(id)) {
      newSelected = safeSelectedTherapists.filter((t: string) => t !== id);
    } else {
      newSelected = [...safeSelectedTherapists, id];
    }
    setSelectedTherapists(newSelected);
  };

  // Quick-pick chips: top 5 by name (or all if <5), filtered by gender/search
  const quickPickTherapists = filteredTherapists.slice(0, 5);

  // 'Select All' quick pick
  const handleSelectAll = () => {
    setSelectedTherapists(filteredTherapists.map(t => t.id));
    setTouched(true);
  };

  return (
    <>
      <div style={{ overflowX: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Therapist(s)</label>
      <div style={{ position: 'relative', marginBottom: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <input
          style={{ width: '100%', maxWidth: '100%', border: '1.5px solid #1976d2', borderRadius: 8, padding: 10, fontSize: 16, outline: therapistInputFocused ? '2px solid #1976d2' : 'none', boxSizing: 'border-box' }}
          placeholder="Search or select therapist..."
          value={therapistInputFocused ? therapistSearch : safeSelectedTherapists.map(id => therapists.find(t => t.id === id)?.name || '').filter(Boolean).join(', ')}
          onFocus={() => setTherapistInputFocused(true)}
          onBlur={() => { setTimeout(() => setTherapistInputFocused(false), 120); setTouched(true); }}
          onChange={e => {
            setTherapistSearch(e.target.value);
            if (e.target.value === '') setSelectedTherapists([]);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && filteredTherapists.length > 0) {
              const t = filteredTherapists[0];
              toggleTherapist(t.id);
              setTherapistSearch('');
              setTherapistInputFocused(false);
            }
          }}
        />
        {safeSelectedTherapists.length > 0 && (
          <span
            role="button"
            aria-label="Clear therapist selection"
            tabIndex={0}
            onClick={() => { setSelectedTherapists([]); setTherapistSearch(''); setTherapistInputFocused(true); }}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (setSelectedTherapists([]), setTherapistSearch(''), setTherapistInputFocused(true))}
            style={{ position: 'absolute', right: 12, top: 12, cursor: 'pointer', color: '#888', fontSize: 18, background: 'none', border: 'none' }}
          >
            ×
          </span>
        )}
        {therapistInputFocused && therapistSearch.length > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 5000, background: '#fff', border: '1.5px solid #1976d2', borderRadius: 8, boxShadow: '0 2px 16px #0002', maxHeight: 200, overflowY: 'auto', marginTop: 2 }}>
            {filteredTherapists.length === 0 ? (
              <div style={{ padding: 14, color: '#888' }}>No therapists found</div>
            ) : filteredTherapists.map(t => (
              <div
                key={t.id}
                style={{ padding: 12, borderBottom: '1px solid #eee', cursor: 'pointer', background: safeSelectedTherapists.includes(t.id) ? '#e3f0fc' : '#fff', fontWeight: safeSelectedTherapists.includes(t.id) ? 700 : 400 }}
                onMouseDown={() => {
                  toggleTherapist(t.id);
                  setTouched(true);
                  setTherapistSearch('');
                  setTherapistInputFocused(false);
                }}
              >
                <span style={{ color: safeSelectedTherapists.includes(t.id) ? '#1976d2' : '#222' }}>{t.name}</span>
                <span style={{ display: 'block', color: '#bbb', fontSize: 11, fontWeight: 400 }}>
                  {Object.keys(t.availability).slice(0, 2).map(day => `${day} (${(t.availability as Record<string, string[]>)[day]?.join(', ') || ''})`).join('; ')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick-pick chips below input */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        <span
          key="select-all"
          style={{
            background: '#e3f0fc',
            color: '#1976d2',
            borderRadius: 16,
            padding: '4px 14px',
            fontWeight: 600,
            cursor: 'pointer',
            border: '2px solid #1976d2',
            fontSize: 15,
          }}
          onClick={handleSelectAll}
        >
          Select All
        </span>
        {quickPickTherapists.map(t => (
          <span
            key={t.id}
            style={{
              background: safeSelectedTherapists.includes(t.id) ? '#e3f0fc' : '#f0f0f0',
              color: safeSelectedTherapists.includes(t.id) ? '#1976d2' : '#222',
              borderRadius: 16,
              padding: '4px 14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: safeSelectedTherapists.includes(t.id) ? '2px solid #1976d2' : '1px solid #ccc',
              transition: 'background 0.2s, color 0.2s',
              fontSize: 15,
            }}
            onClick={() => { toggleTherapist(t.id); setTouched(true); }}
          >
            {t.name}
          </span>
        ))}
      </div>
      {selectedTherapists.length === 0 && touched && (
        <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please select at least one therapist.</div>
      )}
    </div>
  </>
  );
};

export default TherapistPicker;
