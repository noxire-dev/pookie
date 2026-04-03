import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STYLE_ID = 'vibes-mkt-style';

const css = `
*, *::before, *::after { box-sizing: border-box; }

.vm {
  --bg: #1c1917;
  --surface: #231f1c;
  --ink: #e8ddd0;
  --pencil: #9b8e7e;
  --accent: #d4817a;
  --accent-light: rgba(212, 129, 122, 0.12);
  --accent-warm: #c4a882;
  --green: #7eb08a;
  --border: #362f2a;
  --font-hand: 'Caveat', cursive;
  --font-body: 'Kalam', cursive;

  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.7;
  overflow-x: hidden;
  min-height: 100vh;
  position: relative;
}

/* Paper grain */
.vm::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}

/* Nav */
.vm-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 48px;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(28, 25, 23, 0.92);
  backdrop-filter: blur(14px);
  border-bottom: 1.5px solid var(--border);
}

.vm-logo {
  font-family: var(--font-hand);
  font-size: 34px;
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.vm-logo-heart {
  display: inline-block;
  animation: vm-heartbeat 1.5s ease-in-out infinite;
}

@keyframes vm-heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.15); }
  28% { transform: scale(1); }
  42% { transform: scale(1.08); }
  56% { transform: scale(1); }
}

.vm-nav-links {
  display: flex;
  gap: 32px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.vm-nav-links a {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--pencil);
  text-decoration: none;
  transition: color 0.3s;
}
.vm-nav-links a:hover { color: var(--accent); }

/* Hero */
.vm-hero {
  padding: 100px 48px 80px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.vm-hero-badge {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--accent);
  background: var(--accent-light);
  display: inline-block;
  padding: 5px 18px;
  border-radius: 3px;
  border: 1.5px solid rgba(212, 129, 122, 0.25);
  margin-bottom: 28px;
}

.vm-hero h1 {
  font-family: var(--font-hand);
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 24px;
}

.vm-hero h1 span { color: var(--accent); }

.vm-hero-sub {
  font-size: 1.1rem;
  color: var(--pencil);
  max-width: 500px;
  margin: 0 auto 40px;
  line-height: 1.7;
}

.vm-btn {
  font-family: var(--font-hand);
  font-size: 22px;
  font-weight: 600;
  background: var(--accent);
  color: var(--bg);
  border: 2px solid var(--ink);
  border-radius: 4px;
  padding: 12px 36px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  display: inline-block;
}
.vm-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--ink);
}

/* Features */
.vm-features {
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 48px 80px;
  position: relative;
  z-index: 1;
}

.vm-features-title {
  font-family: var(--font-hand);
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
}

.vm-features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.vm-feature-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 2rem 1.5rem;
  text-align: center;
}

.vm-feature-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: var(--accent);
}

.vm-feature-name {
  font-family: var(--font-hand);
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.vm-feature-desc {
  font-size: 0.9rem;
  color: var(--pencil);
  line-height: 1.6;
}

/* How it works */
.vm-how {
  max-width: 700px;
  margin: 0 auto;
  padding: 40px 48px 80px;
  position: relative;
  z-index: 1;
}

.vm-how-title {
  font-family: var(--font-hand);
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
}

.vm-steps {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.vm-step {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
}

.vm-step-num {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--accent-light);
  color: var(--accent);
  font-family: var(--font-hand);
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid rgba(212,129,122,0.25);
}

.vm-step-text h3 {
  font-family: var(--font-hand);
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.vm-step-text p {
  font-size: 0.9rem;
  color: var(--pencil);
}

/* Privacy */
.vm-privacy {
  max-width: 700px;
  margin: 0 auto;
  padding: 0 48px 80px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.vm-privacy-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 2.5rem 2rem;
}

.vm-privacy-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: var(--green);
}

.vm-privacy-title {
  font-family: var(--font-hand);
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.vm-privacy-desc {
  font-size: 0.95rem;
  color: var(--pencil);
  max-width: 440px;
  margin: 0 auto;
  line-height: 1.7;
}

/* CTA */
.vm-cta {
  text-align: center;
  padding: 0 48px 100px;
  position: relative;
  z-index: 1;
}

.vm-cta h2 {
  font-family: var(--font-hand);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.vm-cta p {
  font-size: 1rem;
  color: var(--pencil);
  margin-bottom: 2rem;
}

/* Footer */
.vm-footer {
  text-align: center;
  padding: 2rem;
  color: var(--pencil);
  font-size: 0.82rem;
  position: relative;
  z-index: 1;
  border-top: 1px solid var(--border);
}

.vm-footer a {
  color: var(--accent);
  text-decoration: none;
}

.vm-author {
  font-family: var(--font-hand);
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

/* Responsive */
@media (max-width: 600px) {
  .vm-nav { padding: 14px 20px; }
  .vm-nav-links { display: none; }
  .vm-hero { padding: 60px 20px 50px; }
  .vm-features { padding: 40px 20px 60px; }
  .vm-how { padding: 20px 20px 60px; }
  .vm-privacy { padding: 0 20px 60px; }
  .vm-cta { padding: 0 20px 60px; }
  .vm-features-grid { grid-template-columns: 1fr; }
}
`;

export default function VibesMarketing() {
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
    return () => { document.getElementById(STYLE_ID)?.remove(); };
  }, []);

  return (
    <div className="vm" style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.15s ease' }}>
      {/* Nav */}
      <nav className="vm-nav">
        <Link to="/" className="vm-logo">
          <span className="vm-logo-heart">
            <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
              <path d="M20 36 C8 24 2 18 2 11 A8 8 0 0 1 20 9 A8 8 0 0 1 38 11 C38 18 32 24 20 36Z" fill="#d4817a" opacity="0.8" />
            </svg>
          </span>
          pookie.sh
        </Link>
        <ul className="vm-nav-links">
          <li><a href="#features">features</a></li>
          <li><a href="#how">how it works</a></li>
          <li><a href="#privacy">privacy</a></li>
        </ul>
      </nav>

      {/* Hero */}
      <section className="vm-hero">
        <div className="vm-hero-badge">for couples</div>
        <h1>share your <span>vibes</span> with your pookie</h1>
        <p className="vm-hero-sub">
          log how you're feeling, see your partner's mood in real time, and keep a shared vibe diary — all end-to-end encrypted.
        </p>
        <Link to="/vibes/app" className="vm-btn">open vibes</Link>
      </section>

      {/* Features */}
      <section className="vm-features" id="features">
        <h2 className="vm-features-title">what you get</h2>
        <div className="vm-features-grid">
          <div className="vm-feature-card">
            <div className="vm-feature-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="24" cy="24" r="18" />
                <path d="M16 20 Q24 30 32 20" />
                <circle cx="17" cy="17" r="2" fill="currentColor" />
                <circle cx="31" cy="17" r="2" fill="currentColor" />
              </svg>
            </div>
            <h3 className="vm-feature-name">mood logging</h3>
            <p className="vm-feature-desc">
              pick from hand-drawn mood icons and add a note. see each other's moods update in real time.
            </p>
          </div>

          <div className="vm-feature-card">
            <div className="vm-feature-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 8 L24 4 L40 8 V32 L24 44 L8 32Z" />
                <path d="M24 4 V44 M8 8 L40 8" />
                <path d="M16 24 L22 30 L32 18" />
              </svg>
            </div>
            <h3 className="vm-feature-name">E2E encrypted</h3>
            <p className="vm-feature-desc">
              your moods are encrypted before they leave your device. the server only sees gibberish — only you two can read it.
            </p>
          </div>

          <div className="vm-feature-card">
            <div className="vm-feature-icon">
              <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 24 A18 18 0 1 1 42 24 A18 18 0 1 1 6 24" />
                <path d="M24 14 V24 L30 28" />
                <path d="M18 38 L24 42 L30 38" />
              </svg>
            </div>
            <h3 className="vm-feature-name">real-time sync</h3>
            <p className="vm-feature-desc">
              log a mood and your partner sees it instantly. no refreshing, no waiting — it just appears.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="vm-how" id="how">
        <h2 className="vm-how-title">how it works</h2>
        <div className="vm-steps">
          <div className="vm-step">
            <div className="vm-step-num">1</div>
            <div className="vm-step-text">
              <h3>create a room</h3>
              <p>pick a shared password that only you two know. you'll get a 6-letter room code.</p>
            </div>
          </div>
          <div className="vm-step">
            <div className="vm-step-num">2</div>
            <div className="vm-step-text">
              <h3>share the code</h3>
              <p>send the room code and password to your partner — in person, text, however you want.</p>
            </div>
          </div>
          <div className="vm-step">
            <div className="vm-step-num">3</div>
            <div className="vm-step-text">
              <h3>start vibing</h3>
              <p>log how you're feeling, read your partner's mood, and stay connected throughout the day.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="vm-privacy" id="privacy">
        <div className="vm-privacy-card">
          <div className="vm-privacy-icon">
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="10" y="22" width="28" height="20" rx="3" />
              <path d="M16 22 V14 A8 8 0 0 1 32 14 V22" />
              <circle cx="24" cy="33" r="3" />
              <path d="M24 36 V39" />
            </svg>
          </div>
          <h3 className="vm-privacy-title">your feelings stay yours</h3>
          <p className="vm-privacy-desc">
            everything is end-to-end encrypted using AES-256. your password never leaves your device — the server stores only encrypted blobs it can't read. no accounts, no tracking, no ads.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="vm-cta">
        <h2>ready to share vibes?</h2>
        <p>it's free, private, and takes 10 seconds to set up.</p>
        <Link to="/vibes/app" className="vm-btn">open vibes</Link>
      </section>

      {/* Footer */}
      <footer className="vm-footer">
        <p className="vm-author">a solo project by <a href="https://github.com/noxire-dev" target="_blank" rel="noopener noreferrer">Noxire</a></p>
        <p>&copy; {new Date().getFullYear()} <a href="/">pookie.sh</a></p>
      </footer>
    </div>
  );
}
