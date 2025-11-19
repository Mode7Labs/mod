import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import './FileUpload.css';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept = 'audio/*', label = 'Choose File' }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="file-upload">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="file-upload-input"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="file-upload-button"
      >
        <Upload size={14} />
        <span>{label}</span>
      </button>
    </div>
  );
};
