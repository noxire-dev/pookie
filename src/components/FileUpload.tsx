import { useCallback, useRef, useState } from 'react';
import JSZip from 'jszip';

interface FileUploadProps {
  onFileLoad: (content: string) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

const ZIP_MIME = 'application/zip';
const ZIP_EXT = '.zip';

function isZipFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(ZIP_EXT) || file.type === ZIP_MIME;
}

/** Find the best .txt in the zip (WhatsApp chat is often "WhatsApp Chat - X.txt" or "chat.txt"). */
function pickChatTxtEntry(zip: JSZip): JSZip.JSZipObject | null {
  const txtEntries: JSZip.JSZipObject[] = [];
  zip.forEach((path, entry) => {
    if (!entry.dir && path.toLowerCase().endsWith('.txt')) {
      txtEntries.push(entry);
    }
  });
  if (txtEntries.length === 0) return null;
  // Prefer names that look like WhatsApp chat
  const preferred = txtEntries.find(
    (e) =>
      /whatsapp\s*chat|chat\.txt|_chat\.txt/i.test(e.name) ||
      e.name.toLowerCase().endsWith('chat.txt')
  );
  return preferred ?? txtEntries[0];
}

export function FileUpload({ onFileLoad, onError, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      setFileName(file.name);

      if (isZipFile(file)) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const buf = e.target?.result as ArrayBuffer;
          if (!buf) {
            onError?.('Could not read the file.');
            return;
          }
          try {
            const zip = await JSZip.loadAsync(buf);
            const entry = pickChatTxtEntry(zip);
            if (!entry) {
              onError?.('This zip doesn’t contain a chat .txt file. Export the chat from WhatsApp and try again.');
              return;
            }
            const text = await entry.async('string');
            onFileLoad(text);
          } catch {
            onError?.('Could not open the zip file. Make sure it’s a valid WhatsApp export.');
            return;
          }
        };
        reader.readAsArrayBuffer(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string) ?? '';
        onFileLoad(text);
      };
      reader.readAsText(file, 'utf-8');
    },
    [onFileLoad, onError]
  );

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
            <p className="file-upload-subtitle">or click to browse (.txt or .zip)</p>
          </>
        )}
        <div className="file-upload-help-wrap">
          <button
            type="button"
            className="file-upload-help-trigger"
            onClick={(e) => {
              e.stopPropagation();
              setShowHelp((v) => !v);
            }}
            aria-expanded={showHelp}
          >
            {showHelp ? 'Hide instructions' : 'How to export from WhatsApp'}
          </button>
          {showHelp && (
            <div className="file-upload-help" onClick={(e) => e.stopPropagation()}>
              <p className="file-upload-help-intro">Export your chat from WhatsApp, then upload the <strong>.txt</strong> file or the <strong>.zip</strong> (we’ll use the chat from inside the zip).</p>
              <div className="file-upload-help-steps">
                <h4>On your phone (Android or iPhone)</h4>
                <ol>
                  <li>Open <strong>WhatsApp</strong> and go to the chat you want to export.</li>
                  <li>Tap the <strong>three dots</strong> (⋮) or <strong>More</strong> in the top right.</li>
                  <li>Choose <strong>Export chat</strong>.</li>
                  <li>Choose <strong>Without media</strong> (faster and smaller) or <strong>Include media</strong> (you get a .zip with the chat .txt inside — we only need the chat text).</li>
                  <li>Save or share the file. You’ll get either a <strong>.txt</strong> file or a <strong>.zip</strong> — both work here.</li>
                </ol>
                <p className="file-upload-help-note">Then drag that file here or click above to select it. Your data is processed only on your device and is never sent to our servers.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
