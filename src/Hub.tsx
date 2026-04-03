import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STYLE_ID = 'hub-style';

const css = `
/* fonts loaded via index.html <link> */

.hub {
  --bg: #1c1917;
  --surface: #231f1c;
  --border: #362f2a;
  --text: #e8ddd0;
  --text-muted: #9b8e7e;
  --accent: #d4817a;
  --accent-warm: #c4a882;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'Kalam', cursive;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow-x: hidden;
}

/* ---- Paper grain ---- */
.hub::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}

/* ---- Decorative scribbles ---- */
.hub-deco {
  position: absolute;
  color: var(--text-muted);
  opacity: 0.06;
  pointer-events: none;
}

/* ---- Header ---- */
.hub-header {
  text-align: center;
  padding: 5rem 2rem 2rem;
  max-width: 700px;
  position: relative;
  z-index: 1;
}

.hub-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.hub-logo-heart {
  display: inline-block;
  animation: hub-heartbeat 1.5s ease-in-out infinite;
}

@keyframes hub-heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.18); }
  28% { transform: scale(1); }
  42% { transform: scale(1.1); }
  56% { transform: scale(1); }
}

.hub-title {
  font-family: 'Caveat', cursive;
  font-size: 4.5rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -1px;
}

.hub-tagline {
  font-size: 1.15rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.hub-tagline strong {
  color: var(--accent);
  font-weight: 700;
}

.hub-description {
  font-size: 0.9rem;
  color: var(--text-muted);
  opacity: 0.7;
  margin-top: 0.5rem;
}

/* ---- Divider scribble ---- */
.hub-divider {
  width: 120px;
  height: 2px;
  margin: 2rem auto;
  position: relative;
  z-index: 1;
}

.hub-divider svg {
  width: 100%;
  height: 20px;
  overflow: visible;
}

/* ---- Tools grid ---- */
.hub-tools {
  max-width: 900px;
  width: 100%;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.hub-tools-heading {
  font-family: 'Caveat', cursive;
  font-size: 1.6rem;
  color: var(--text-muted);
  text-align: center;
  margin-bottom: 1.5rem;
}

.hub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

/* ---- Tool card ---- */
.hub-card {
  display: block;
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 2rem 1.75rem;
  text-decoration: none;
  color: var(--text);
  transition: all 0.35s ease;
  position: relative;
  overflow: hidden;
}

.hub-card::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  background: radial-gradient(circle at 50% 0%, rgba(212,129,122,0.08), transparent 70%);
  transition: opacity 0.35s;
}

.hub-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.3);
}

.hub-card:hover::before {
  opacity: 1;
}

.hub-card-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  color: var(--accent);
}

.hub-card-icon svg {
  width: 100%;
  height: 100%;
}

.hub-card-name {
  font-family: 'Caveat', cursive;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.3rem;
}

.hub-card-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.hub-card-tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  background: rgba(212,129,122,0.12);
  color: var(--accent);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.hub-card-tag.soon {
  background: rgba(196,168,130,0.12);
  color: var(--accent-warm);
}

/* Coming soon card is dimmed */
.hub-card.coming-soon {
  opacity: 0.5;
  cursor: default;
}

.hub-card.coming-soon:hover {
  border-color: var(--border);
  transform: none;
  box-shadow: none;
}

.hub-card.coming-soon:hover::before {
  opacity: 0;
}

/* ---- Footer ---- */
.hub-footer {
  margin-top: auto;
  padding: 3rem 2rem 2rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.82rem;
  position: relative;
  z-index: 1;
}

.hub-footer a {
  color: var(--accent);
  text-decoration: none;
}

.hub-author {
  font-family: 'Caveat', cursive;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

/* ---- Fade-in animation ---- */
.hub-fade {
  opacity: 0;
  transform: translateY(12px);
  animation: hub-fade-in 0.6s ease forwards;
}

@keyframes hub-fade-in {
  to { opacity: 1; transform: translateY(0); }
}

.hub-fade:nth-child(1) { animation-delay: 0.1s; }
.hub-fade:nth-child(2) { animation-delay: 0.18s; }
.hub-fade:nth-child(3) { animation-delay: 0.26s; }
.hub-fade:nth-child(4) { animation-delay: 0.34s; }
.hub-fade:nth-child(5) { animation-delay: 0.42s; }
.hub-fade:nth-child(6) { animation-delay: 0.5s; }

/* ---- Responsive ---- */
@media (max-width: 600px) {
  .hub-title { font-size: 3rem; }
  .hub-header { padding: 3rem 1.25rem 1.5rem; }
  .hub-tools { padding: 0 1.25rem; }
  .hub-grid { grid-template-columns: 1fr; }
}
`;

export default function Hub() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement('style');
      el.id = STYLE_ID;
      el.textContent = css;
      document.head.appendChild(el);
    }
    document.body.offsetHeight;
    setReady(true);

    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);

  return (
    <div className="hub" style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.15s ease' }}>
      {/* Decorative scribbles */}
      <svg className="hub-deco" style={{ top: 60, left: '5%', width: 100, height: 100 }} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M20 80 Q30 20 50 50 Q70 80 80 20" />
      </svg>
      <svg className="hub-deco" style={{ top: 200, right: '8%', width: 70, height: 70 }} viewBox="0 0 70 70" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M35 5 A30 30 0 1 1 34 5" />
        <path d="M35 15 A20 20 0 1 1 34 15" />
      </svg>
      <svg className="hub-deco" style={{ bottom: 120, left: '10%', width: 80, height: 80 }} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M10 40 L30 10 L50 40 L70 10" />
        <path d="M10 60 L30 30 L50 60 L70 30" />
      </svg>
      <svg className="hub-deco" style={{ top: '40%', right: '4%', width: 60, height: 60 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <path d="M12 21 C5 15 1 11 1 7 A5 5 0 0 1 12 6 A5 5 0 0 1 23 7 C23 11 19 15 12 21Z" />
      </svg>

      {/* Header */}
      <header className="hub-header hub-fade">
        <div className="hub-logo">
          <span className="hub-logo-heart">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 36 C8 24 2 18 2 11 A8 8 0 0 1 20 9 A8 8 0 0 1 38 11 C38 18 32 24 20 36Z" fill="#d4817a" opacity="0.75" />
            </svg>
          </span>
          <h1 className="hub-title">pookie.sh</h1>
        </div>
        <p className="hub-tagline">
          tools made to use with <strong>your pookie</strong>
        </p>
        <p className="hub-description">
          fun, free, privacy-first tools for couples. everything runs locally — your data never leaves your device.
        </p>
      </header>

      {/* Divider */}
      <div className="hub-divider hub-fade">
        <svg viewBox="0 0 120 20" fill="none" stroke="#9b8e7e" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4">
          <path d="M0 10 Q30 0 60 10 Q90 20 120 10" />
        </svg>
      </div>

      {/* Tools */}
      <section className="hub-tools">
        <p className="hub-tools-heading hub-fade">our tools</p>
        <div className="hub-grid">
          {/* Pulse — live */}
          <Link to="/pulse" className="hub-card hub-fade">
            <div className="hub-card-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 24 L14 24 L18 10 L24 38 L30 18 L34 24 L44 24" />
              </svg>
            </div>
            <div className="hub-card-name">Pulse</div>
            <p className="hub-card-desc">
              Drop your WhatsApp chat export and get a beautiful breakdown — who texts first, love stats, emoji habits, fun facts, and way more.
            </p>
            <span className="hub-card-tag">live</span>
          </Link>

          {/* Vibes — live */}
          <Link to="/vibes" className="hub-card hub-fade">
            <div className="hub-card-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="24" cy="24" r="18" />
                <path d="M18 20 Q24 28 30 20" />
                <circle cx="18" cy="16" r="2" fill="currentColor" />
                <circle cx="30" cy="16" r="2" fill="currentColor" />
              </svg>
            </div>
            <div className="hub-card-name">Vibes</div>
            <p className="hub-card-desc">
              For couples: log how you're feeling, see your partner's mood in real time — end-to-end encrypted and totally private.
            </p>
            <span className="hub-card-tag">live</span>
          </Link>

          {/* Coming soon #1 */}
          <div className="hub-card coming-soon hub-fade">
            <div className="hub-card-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="10" width="36" height="28" rx="4" />
                <path d="M6 18 H42 M16 10 V6 M32 10 V6" />
                <circle cx="24" cy="28" r="3" />
              </svg>
            </div>
            <div className="hub-card-name">Timeline</div>
            <p className="hub-card-desc">
              Build a gorgeous visual timeline of your relationship from photos, screenshots, and chat highlights.
            </p>
            <span className="hub-card-tag soon">coming soon</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="hub-footer hub-fade">
        <p className="hub-author">a solo project by <a href="https://github.com/noxire-dev" target="_blank" rel="noopener noreferrer">Noxire</a></p>
        <p>&copy; {new Date().getFullYear()} <a href="https://pookie.sh">pookie.sh</a></p>
      </footer>
    </div>
  );
}
