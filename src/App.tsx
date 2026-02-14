import { useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { FileUpload } from './components/FileUpload';
import { ProgressBar } from './components/ProgressBar';
import { Results } from './components/Results';
import { useAnalyzer } from './workers/useAnalyzer';
import { NameProvider } from './contexts/NameContext';
import './App.css';

// ---- Export helpers ----

/** Temporarily widen the results container for a wider capture, then restore */
async function captureWide(el: HTMLElement): Promise<HTMLCanvasElement> {
  // Save original styles
  const origMaxW = el.style.maxWidth;
  const origW = el.style.width;
  const origPos = el.style.position;
  const origLeft = el.style.left;
  const origTop = el.style.top;

  // Expand to 1600px and position off-screen to avoid visual jump
  el.style.maxWidth = '1600px';
  el.style.width = '1600px';
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  el.style.top = '0';

  // Force reflow
  el.offsetHeight;

  const canvas = await html2canvas(el, {
    backgroundColor: '#1c1917',
    scale: 2,
    useCORS: true,
    logging: false,
    width: 1600,
  });

  // Restore
  el.style.maxWidth = origMaxW;
  el.style.width = origW;
  el.style.position = origPos;
  el.style.left = origLeft;
  el.style.top = origTop;

  return canvas;
}

async function exportAsImage(el: HTMLElement) {
  const canvas = await captureWide(el);
  const link = document.createElement('a');
  link.download = 'pulse-analysis.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

async function exportAsPDF(el: HTMLElement) {
  const canvas = await captureWide(el);
  const imgData = canvas.toDataURL('image/png');
  const imgW = canvas.width;
  const imgH = canvas.height;
  // Use A4 landscape for wider layout
  const pdfW = 297; // mm (A4 landscape width)
  const pdfH = (imgH * pdfW) / imgW;
  const pdf = new jsPDF({
    orientation: pdfH > pdfW ? 'portrait' : 'landscape',
    unit: 'mm',
    format: [pdfW, Math.min(pdfH, 10000)],
  });
  pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
  pdf.save('pulse-analysis.pdf');
}

function exportAsHTML(el: HTMLElement) {
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(s => s.outerHTML)
    .join('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pulse Analysis</title>${styles}</head>
<body style="margin:0;background:#1c1917"><div style="max-width:1600px;margin:0 auto;padding:2rem">${el.innerHTML}</div></body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  link.download = 'pulse-analysis.html';
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

function App() {
  const { state, analyze, reset } = useAnalyzer();
  const resultsRef = useRef<HTMLDivElement>(null);

  // ---- Name overrides ----
  const [nameOverrides, setNameOverrides] = useState<Record<string, string>>({});

  const displayName = useCallback(
    (name: string) => nameOverrides[name] || name,
    [nameOverrides]
  );

  const handleNameChange = useCallback((original: string, value: string) => {
    setNameOverrides(prev => ({
      ...prev,
      [original]: value,
    }));
  }, []);

  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileLoad = (content: string) => {
    setUploadError(null);
    setNameOverrides({});
    analyze(content);
  };

  const handleUploadError = (message: string) => {
    setUploadError(message);
  };

  const handleReset = () => {
    setUploadError(null);
    setNameOverrides({});
    reset();
  };

  return (
    <div className="app">
      <Link to="/pulse" className="app-back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        back
      </Link>

      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-heart">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 28s-12-7.5-12-16C4 7 7 4 11 4c2.5 0 4.5 1.5 5 3 .5-1.5 2.5-3 5-3 4 0 7 3 7 8 0 8.5-12 16-12 16z" fill="#d4817a" opacity="0.7"/>
            </svg>
          </span>
          <h1 className="app-title">pulse</h1>
        </div>
        <p className="app-subtitle">your data never leaves your device</p>
      </header>

      <main className="app-main">
        {state.status === 'idle' && (
          <>
            {uploadError && (
              <div className="upload-error" role="alert">
                {uploadError}
              </div>
            )}
            <FileUpload onFileLoad={handleFileLoad} onError={handleUploadError} />
          </>
        )}

        {state.status === 'analyzing' && (
          <div className="analyzing-section">
            <ProgressBar progress={state.progress} step={state.progressStep} />
          </div>
        )}

        {state.status === 'error' && (
          <div className="error-section">
            <div className="error-message">
              <h3>Something went wrong</h3>
              <p>{state.error}</p>
            </div>
            <button className="reset-btn" onClick={handleReset}>try again</button>
          </div>
        )}

        {state.status === 'done' && state.result && state.chat && (
          <NameProvider value={displayName}>
            <div className="done-actions">
              <button className="reset-btn" onClick={handleReset}>analyze another chat</button>
            </div>

            {/* Name editing */}
            <div className="name-editor">
              <p className="name-editor-label">rename participants:</p>
              <div className="name-editor-inputs">
                {state.chat.participants.map((original, i) => (
                  <div key={original} className="name-editor-row">
                    <span className="name-editor-original">{original}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    <input
                      className={`name-editor-input ${i === 0 ? 'accent-1' : 'accent-2'}`}
                      type="text"
                      placeholder={original}
                      value={nameOverrides[original] || ''}
                      onChange={(e) => handleNameChange(original, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Export bar */}
            <div className="share-bar">
              <span className="share-label">share:</span>
              <button className="share-btn" onClick={() => resultsRef.current && exportAsImage(resultsRef.current)} title="Download as image">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15 L16 10 L5 21"/></svg>
                PNG
              </button>
              <button className="share-btn" onClick={() => resultsRef.current && exportAsPDF(resultsRef.current)} title="Download as PDF">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2 H6 A2 2 0 0 0 4 4 V20 A2 2 0 0 0 6 22 H18 A2 2 0 0 0 20 20 V8 Z"/><path d="M14 2 V8 H20"/><path d="M10 13 H14 M10 17 H14"/></svg>
                PDF
              </button>
              <button className="share-btn" onClick={() => resultsRef.current && exportAsHTML(resultsRef.current)} title="Download as HTML">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 18 L22 12 L16 6 M8 6 L2 12 L8 18"/></svg>
                HTML
              </button>
            </div>

            <div ref={resultsRef}>
              <Results result={state.result} chat={state.chat} />
            </div>
          </NameProvider>
        )}
      </main>

      <footer className="app-footer">
        <p>all processing happens locally in your browser — no data is sent anywhere</p>
        <p style={{ marginTop: 4 }}>made with care by <a href="https://pookie.sh">pookie.sh</a></p>
      </footer>
    </div>
  );
}

export default App;
