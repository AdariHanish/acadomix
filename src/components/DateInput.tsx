import React, { useRef } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface Props {
  value: string; // Should be in dd/mm/yyyy format
  onChange: (formattedValue: string) => void;
  className?: string;
  required?: boolean;
}

export default function DateInput({ value, onChange, className = '', required = false }: Props) {
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  // Auto-formats text entry to DD/MM/YYYY
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/[^0-9]/g, ''); // strip non-numeric
    if (raw.length > 8) raw = raw.slice(0, 8);

    let formatted = '';
    if (raw.length > 0) {
      formatted += raw.slice(0, 2);
    }
    if (raw.length > 2) {
      formatted += '/' + raw.slice(2, 4);
    }
    if (raw.length > 4) {
      formatted += '/' + raw.slice(4, 8);
    }

    onChange(formatted);
  };

  // Trigger native date selector when calendar icon is clicked
  const handleCalendarClick = () => {
    hiddenDateInputRef.current?.showPicker?.();
  };

  // When native date is picked, convert to DD/MM/YYYY
  const handleNativeDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // YYYY-MM-DD
    if (!val) return;
    const [y, m, d] = val.split('-');
    if (y && m && d) {
      onChange(`${d}/${m}/${y}`);
    }
  };

  // Convert DD/MM/YYYY to YYYY-MM-DD for hidden date picker
  const getNativeDateValue = () => {
    const parts = value.split('/');
    if (parts.length === 3 && parts[2].length === 4) {
      const [d, m, y] = parts;
      return `${y}-${m}-${d}`;
    }
    return '';
  };

  return (
    <div className="relative w-full flex items-center">
      <input
        type="text"
        required={required}
        value={value}
        onChange={handleInputChange}
        placeholder="DD/MM/YYYY"
        className={`${className} pr-10`}
      />
      
      {/* Calendar Icon trigger */}
      <button
        type="button"
        onClick={handleCalendarClick}
        className="absolute right-3.5 text-white/30 hover:text-gold transition-colors focus:outline-none"
      >
        <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Hidden native date input to show native calendar */}
      <input
        ref={hiddenDateInputRef}
        type="date"
        value={getNativeDateValue()}
        onChange={handleNativeDateChange}
        className="absolute w-0 h-0 opacity-0 pointer-events-none"
      />
    </div>
  );
}
