import React, { useState } from 'react';

interface DurationPickerProps {
  duration: number;
  setDuration: (d: number) => void;
  durationOptions?: number[];
  touched: boolean;
  setTouched: (t: any) => void;
}

const DEFAULT_OPTIONS = [1, 3, 5, 7, 14, 21, 28];

const DurationPicker: React.FC<DurationPickerProps> = ({
  duration,
  setDuration,
  durationOptions = DEFAULT_OPTIONS,
  touched,
  setTouched,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const handleCustomChange = (val: string) => {
    setCustomInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setDuration(num);
      setTouched(true);
    }
  };

  return (
    <div style={{ marginBottom: 12, boxSizing: 'border-box', width: '100%', maxWidth: '100%' }}>
      <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Duration (Days)</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8, width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'auto' }}>
        {durationOptions.map(opt => (
          <button
            key={opt}
            type="button"
            style={{
              padding: '10px 18px',
              background: duration === opt ? '#1a73e8' : '#eee',
              color: duration === opt ? '#fff' : '#222',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 15,
              marginRight: 4,
              marginBottom: 4,
              cursor: 'pointer',
              outline: duration === opt ? '2px solid #1976d2' : 'none',
              transition: 'background 0.2s',
            }}
            onClick={() => {
              setDuration(opt);
              setCustomInput('');
              setTouched(true);
            }}
          >
            {opt}
          </button>
        ))}
        <input
          type="number"
          min={1}
          style={{
            border: '1.5px solid ' + (inputFocused ? '#1a73e8' : '#ccc'),
            borderRadius: 6,
            padding: 10,
            width: 80,
            background: '#fff',
            fontSize: 15,
            marginLeft: 4,
            outline: inputFocused ? '2px solid #1976d2' : 'none',
          }}
          placeholder="Custom"
          value={customInput}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onChange={e => handleCustomChange(e.target.value)}
        />
      </div>
      {(!duration || duration <= 0) && touched && (
        <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please enter a valid duration.</div>
      )}
    </div>
  );
};

export default DurationPicker;
