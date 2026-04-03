import { useState } from 'react';

export interface MoodOption {
  id: string;
  label: string;
  svg: string; // SVG path data (viewBox 0 0 32 32)
  color: string; // CSS color variable
}

export const MOODS: MoodOption[] = [
  {
    id: 'happy',
    label: 'Happy',
    color: 'var(--accent-warm)',
    svg: 'M16 3 A13 13 0 1 0 16 29 A13 13 0 1 0 16 3 M10 20 Q16 26 22 20 M11 12 A1.5 1.5 0 1 0 11 15 A1.5 1.5 0 1 0 11 12 M21 12 A1.5 1.5 0 1 0 21 15 A1.5 1.5 0 1 0 21 12',
  },
  {
    id: 'loving',
    label: 'Loving',
    color: 'var(--accent)',
    svg: 'M16 28 C8 22 3 17 3 11 A6.5 6.5 0 0 1 16 10 A6.5 6.5 0 0 1 29 11 C29 17 24 22 16 28Z',
  },
  {
    id: 'excited',
    label: 'Excited',
    color: 'var(--accent-warm)',
    svg: 'M16 2 L17.5 10.5 L26 8 L20 14.5 L28 16 L20 17.5 L26 24 L17.5 21.5 L16 30 L14.5 21.5 L6 24 L12 17.5 L4 16 L12 14.5 L6 8 L14.5 10.5Z',
  },
  {
    id: 'peaceful',
    label: 'Peaceful',
    color: 'var(--green)',
    svg: 'M16 3 A13 13 0 1 0 16 29 A13 13 0 1 0 16 3 M10 20 Q16 24 22 20 M10 13 L14 13 M18 13 L22 13',
  },
  {
    id: 'grateful',
    label: 'Grateful',
    color: 'var(--green)',
    svg: 'M16 3 A13 13 0 1 0 16 29 A13 13 0 1 0 16 3 M10 19 Q16 25 22 19 M11 11 A1.5 1.5 0 1 0 11 14 A1.5 1.5 0 1 0 11 11 M21 11 A1.5 1.5 0 1 0 21 14 A1.5 1.5 0 1 0 21 11 M9 11 L14 9 M18 9 L23 11',
  },
  {
    id: 'thinking',
    label: 'Thinking',
    color: 'var(--pencil)',
    svg: 'M16 3 A13 13 0 1 0 16 29 A13 13 0 1 0 16 3 M12 20 Q16 22 22 20 M11 12 A1.5 1.5 0 1 0 11 15 A1.5 1.5 0 1 0 11 12 M21 12 A1.5 1.5 0 1 0 21 15 A1.5 1.5 0 1 0 21 12 M9 10 L14 11 M23 10 L18 11',
  },
  {
    id: 'meh',
    label: 'Meh',
    color: 'var(--pencil)',
    svg: 'M16 3 A13 13 0 1 0 16 29 A13 13 0 1 0 16 3 M11 20 L21 20 M11 12 A1.5 1.5 0 1 0 11 15 A1.5 1.5 0 1 0 11 12 M21 12 A1.5 1.5 0 1 0 21 15 A1.5 1.5 0 1 0 21 12',
  },
  {
    id: 'tired',
    label: 'Tired',
    color: 'var(--pencil)',
    svg: 'M16 3 A13 13 0 1 0 16 29 A13 13 0 1 0 16 3 M12 21 Q16 19 20 21 M10 13 L14 13 M18 13 L22 13 M12 17 Q14 16 16 17',
  },
  {
    id: 'sad',
    label: 'Sad',
    color: 'var(--accent)',
    svg: 'M16 3 A13 13 0 1 0 16 29 A13 13 0 1 0 16 3 M10 22 Q16 17 22 22 M11 12 A1.5 1.5 0 1 0 11 15 A1.5 1.5 0 1 0 11 12 M21 12 A1.5 1.5 0 1 0 21 15 A1.5 1.5 0 1 0 21 12',
  },
  {
    id: 'anxious',
    label: 'Anxious',
    color: 'var(--accent)',
    svg: 'M16 3 A13 13 0 1 0 16 29 A13 13 0 1 0 16 3 M13 20 A3 2.5 0 1 0 19 20 A3 2.5 0 1 0 13 20 M11 11 A1.5 1.5 0 1 0 11 14 A1.5 1.5 0 1 0 11 11 M21 11 A1.5 1.5 0 1 0 21 14 A1.5 1.5 0 1 0 21 11 M9 9 L14 11 M23 9 L18 11',
  },
  {
    id: 'frustrated',
    label: 'Frustrated',
    color: 'var(--accent)',
    svg: 'M16 3 A13 13 0 1 0 16 29 A13 13 0 1 0 16 3 M10 22 Q16 18 22 22 M11 12 A1.5 1.5 0 1 0 11 15 A1.5 1.5 0 1 0 11 12 M21 12 A1.5 1.5 0 1 0 21 15 A1.5 1.5 0 1 0 21 12 M9 10 L14 12 M23 10 L18 12',
  },
  {
    id: 'unwell',
    label: 'Unwell',
    color: 'var(--pencil)',
    svg: 'M16 3 A13 13 0 1 0 16 29 A13 13 0 1 0 16 3 M11 21 Q16 19 21 21 M11 12 A1.5 1.5 0 1 0 11 15 A1.5 1.5 0 1 0 11 12 M21 12 A1.5 1.5 0 1 0 21 15 A1.5 1.5 0 1 0 21 12 M8 4 L11 7 M8 7 L11 4',
  },
];

export function getMoodById(id: string): MoodOption | undefined {
  return MOODS.find((m) => m.id === id);
}

interface Props {
  onSubmit: (mood: string, note: string) => void;
  disabled?: boolean;
  currentMood?: string | null;
}

export default function MoodPicker({ onSubmit, disabled, currentMood }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    onSubmit(selected, note.trim());
    setSelected(null);
    setNote('');
    setOpen(false);
  };

  if (!open) {
    const currentData = currentMood ? getMoodById(currentMood) : null;
    return (
      <button className="mood-set-btn" onClick={() => setOpen(true)} disabled={disabled}>
        {currentData ? (
          <svg viewBox="0 0 32 32" fill="none" stroke={currentData.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mood-set-btn-icon">
            <path d={currentData.svg} />
          </svg>
        ) : (
          <svg viewBox="0 0 32 32" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mood-set-btn-icon">
            <circle cx="16" cy="16" r="13" />
            <path d="M10 14 L16 20 L22 14" />
          </svg>
        )}
        {currentMood ? 'change your vibe' : 'set your vibe'}
      </button>
    );
  }

  return (
    <div className="mood-picker">
      <p className="mood-picker-label">how are you feeling?</p>
      <div className="mood-grid">
        {MOODS.map((m) => (
          <button
            key={m.id}
            className={`mood-btn${selected === m.id ? ' mood-btn-active' : ''}`}
            onClick={() => setSelected(m.id)}
            disabled={disabled}
            title={m.label}
          >
            <svg viewBox="0 0 32 32" fill="none" stroke={m.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mood-icon">
              <path d={m.svg} />
            </svg>
            <span className="mood-btn-label">{m.label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="mood-note-area">
          <input
            type="text"
            className="mood-note-input"
            placeholder="add a little note... (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button className="mood-submit-btn" onClick={handleSubmit} disabled={disabled}>
            set it
          </button>
        </div>
      )}
      <button className="mood-cancel-btn" onClick={() => { setOpen(false); setSelected(null); setNote(''); }}>
        cancel
      </button>
    </div>
  );
}
