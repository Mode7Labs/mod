import React from 'react';
import './TextInput.css';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ value, onChange, placeholder, label }) => {
  return (
    <div className="text-input-container">
      {label && <label className="text-input-label">{label}</label>}
      <input
        type="text"
        className="text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
};
