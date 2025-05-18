import React from 'react';

interface Therapy {
  id: string;
  name: string;
}

interface TherapyPickerProps {
  therapies: Therapy[];
  selectedTherapy: string | null;
  setSelectedTherapy: (id: string | null) => void;
  therapySearch: string;
  setTherapySearch: (s: string) => void;
  therapyInputFocused: boolean;
  setTherapyInputFocused: (b: boolean) => void;
  touched: any;
  setTouched: (t: any) => void;
}

const TherapyPicker: React.FC<TherapyPickerProps> = ({
  therapies,
  selectedTherapy,
  setSelectedTherapy,
  therapySearch,
  setTherapySearch,
  therapyInputFocused,
  setTherapyInputFocused,
  touched,
  setTouched,
}: TherapyPickerProps) => {
  // Keep therapySearch in sync with selectedTherapy
  React.useEffect(() => {
    if (!therapyInputFocused && selectedTherapy) {
      const found = therapies.find(t => t.id === selectedTherapy);
      if (found && therapySearch !== found.name) {
        setTherapySearch(found.name);
      }
    }
    if (!selectedTherapy && !therapyInputFocused && therapySearch !== '') {
      setTherapySearch('');
    }
  }, [selectedTherapy, therapyInputFocused, therapies]);
  console.log('TherapyPicker therapies:', therapies);
  const filteredTherapies = therapies.filter((t: Therapy) => t.name.toLowerCase().includes(therapySearch.toLowerCase()));
  return (
    <>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Therapy Name</label>
      <div style={{ position: 'relative', marginBottom: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <input
          style={{ width: '100%', maxWidth: '100%', border: '1.5px solid #1976d2', borderRadius: 8, padding: 10, fontSize: 16, outline: therapyInputFocused ? '2px solid #1976d2' : 'none', boxSizing: 'border-box' }}
          placeholder="Search or select therapy..."
          value={therapyInputFocused ? therapySearch : (selectedTherapy ? (therapies.find(t => t.id === selectedTherapy)?.name || '') : '')}
          onFocus={() => {
            setTherapyInputFocused(true);
          }}
          onBlur={() => {
            setTimeout(() => setTherapyInputFocused(false), 120);
            setTouched((touch: any) => ({ ...touch, therapy: true }));
          }}
          onChange={e => {
            setTherapySearch(e.target.value);
            setSelectedTherapy(null);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && filteredTherapies.length > 0) {
              const t = filteredTherapies[0];
              setSelectedTherapy(t.id);
              setTherapySearch(t.name);
              setTherapyInputFocused(false);
            }
          }}
        />
        {selectedTherapy && (
          <span
            role="button"
            aria-label="Clear therapy selection"
            tabIndex={0}
            onClick={() => { setSelectedTherapy(null); setTherapySearch(''); setTherapyInputFocused(true); }}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && (setSelectedTherapy(null), setTherapySearch(''), setTherapyInputFocused(true))}
            style={{ position: 'absolute', right: 12, top: 12, cursor: 'pointer', color: '#888', fontSize: 18, background: 'none', border: 'none' }}
          >
            ×
          </span>
        )}
        {therapyInputFocused && !selectedTherapy && therapySearch.length > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 2000, background: '#fff', border: '1.5px solid #1976d2', borderRadius: 8, boxShadow: '0 2px 16px #0002', maxHeight: 200, overflowY: 'auto', marginTop: 2 }}>
            {therapySearch.length === 0
              ? therapies.slice(0, 5).map(t => (
                  <div
                    key={t.id}
                    style={{ padding: 12, borderBottom: '1px solid #eee', cursor: 'pointer', background: selectedTherapy === t.id ? '#e3f0fc' : '#fff', fontWeight: selectedTherapy === t.id ? 700 : 400 }}
                    onMouseDown={() => {
                      setSelectedTherapy(t.id);
                      setTherapySearch(t.name);
                      setTherapyInputFocused(false);
                      setTouched((touch: any) => ({ ...touch, therapy: true }));
                    }}
                  >
                    <span style={{ color: selectedTherapy === t.id ? '#1976d2' : '#222' }}>{t.name}</span>
                  </div>
                ))
              : filteredTherapies.length === 0
                ? <div style={{ padding: 14, color: '#888' }}>No therapies found</div>
                : filteredTherapies.map(t => (
                    <div
                      key={t.id}
                      style={{ padding: 12, borderBottom: '1px solid #eee', cursor: 'pointer', background: selectedTherapy === t.id ? '#e3f0fc' : '#fff', fontWeight: selectedTherapy === t.id ? 700 : 400 }}
                      onMouseDown={() => {
                        setSelectedTherapy(t.id);
                        setTherapySearch(t.name);
                        setTherapyInputFocused(false);
                        setTouched((touch: any) => ({ ...touch, therapy: true }));
                      }}
                    >
                      <span style={{ color: selectedTherapy === t.id ? '#1976d2' : '#222' }}>{t.name}</span>
                    </div>
                  ))}
          </div>
        )}
      </div>
      {!selectedTherapy && touched && (
        <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please select a therapy.</div>
      )}
    </>
  );
};

export default TherapyPicker;
