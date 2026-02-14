import { useCallback, useRef, useState } from 'react';

interface FileUploadProps {
  onFileLoad: (content: string) => void;
  disabled?: boolean;
}

export function FileUpload({ onFileLoad, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onFileLoad(text);
    };
    reader.readAsText(file, 'utf-8');
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      className={`file-upload ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={disabled ? undefined : handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.zip"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <div className="file-upload-content">
        <div className="file-upload-icon">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 18c0-3 2-5 5-5h12l6 6h18c3 0 5 2 5 5v22c0 3-2 5-5 5H13c-3 0-5-2-5-5V18z" />
            <path d="M24 36v-8M20 32l4-4 4 4" />
          </svg>
        </div>
        {fileName ? (
          <p className="file-upload-name">{fileName}</p>
        ) : (
          <>
            <p className="file-upload-title">Drop your WhatsApp chat export here</p>
            <p className="file-upload-subtitle">or click to browse (.txt file)</p>
          </>
        )}
      </div>
    </div>
  );
}
