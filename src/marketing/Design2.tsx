import { useEffect, useRef, useState, useCallback } from 'react';
import { dummyData } from './dummyData';

const STYLE_ID = 'd2-style';

/* ── 30 mini doodle icon paths (viewBox 0 0 24 24) ── */
const doodlePaths = [
  /* heart */       'M12 21 C5 15 1 11 1 7 A5 5 0 0 1 12 6 A5 5 0 0 1 23 7 C23 11 19 15 12 21Z',
  /* chat bubble */ 'M4 4 H20 V16 H10 L6 20 V16 H4 Z',
  /* envelope */    'M2 6 L12 13 L22 6 M2 6 V18 H22 V6',
  /* clock */       'M12 2 A10 10 0 1 0 12 22 A10 10 0 1 0 12 2 M12 6 V12 L16 14',
  /* camera */      'M9 3 L7 6 H3 V20 H21 V6 H17 L15 3 Z M12 10 A4 4 0 1 0 12 18 A4 4 0 1 0 12 10',
  /* music note */  'M8 18 A3 3 0 1 1 8 12 V4 L18 2 V14 A3 3 0 1 1 18 8',
  /* star */        'M12 2 L14.5 9 L22 9 L16 14 L18 21 L12 17 L6 21 L8 14 L2 9 L9.5 9 Z',
  /* paper plane */ 'M2 12 L22 3 L16 22 L12 14 Z M12 14 L22 3',
  /* phone */       'M5 2 H19 V22 H5 Z M9 19 H15',
  /* lock */        'M6 11 V8 A6 6 0 0 1 18 8 V11 M4 11 H20 V22 H4 Z',
  /* smile */       'M12 2 A10 10 0 1 0 12 22 A10 10 0 1 0 12 2 M8 14 Q12 18 16 14 M9 9 V10 M15 9 V10',
  /* gift */        'M3 8 H21 V12 H3 Z M3 12 H21 V21 H3 Z M12 8 V21 M12 8 C12 5 8 3 7 5 C6 6 7 8 12 8 M12 8 C12 5 16 3 17 5 C18 6 17 8 12 8',
  /* sparkle */     'M12 2 L13.5 8.5 L20 6 L15.5 11 L22 12 L15.5 13 L20 18 L13.5 15.5 L12 22 L10.5 15.5 L4 18 L8.5 13 L2 12 L8.5 11 L4 6 L10.5 8.5 Z',
  /* book */        'M4 3 Q12 1 12 5 Q12 1 20 3 V19 Q12 17 12 21 Q12 17 4 19 Z M12 5 V21',
  /* compass */     'M12 2 A10 10 0 1 0 12 22 A10 10 0 1 0 12 2 M16 8 L10 14 L8 16 L14 10 Z',
  /* sun */         'M12 7 A5 5 0 1 0 12 17 A5 5 0 1 0 12 7 M12 1 V4 M12 20 V23 M1 12 H4 M20 12 H23 M4.2 4.2 L6.3 6.3 M17.7 17.7 L19.8 19.8 M19.8 4.2 L17.7 6.3 M6.3 17.7 L4.2 19.8',
  /* moon */        'M21 12.79 A9 9 0 1 1 11.21 3 A7 7 0 0 0 21 12.79Z',
  /* cloud */       'M18 10 A4 4 0 0 0 10 9 A6 6 0 0 0 6 15 A3 3 0 0 0 6 21 H18 A4 4 0 0 0 18 10Z',
  /* coffee */      'M3 6 H17 V14 A4 4 0 0 1 13 18 H7 A4 4 0 0 1 3 14 Z M17 9 H19 A2 2 0 0 1 19 13 H17 M3 22 H17',
  /* leaf */        'M12 22 Q3 16 3 10 A9 9 0 0 1 21 10 Q21 16 12 22Z M12 22 C12 16 7 12 3 10',
  /* lightning */   'M13 2 L5 14 H11 L10 22 L19 10 H13 Z',
  /* diamond */     'M12 2 L22 10 L12 22 L2 10 Z M2 10 H22',
  /* infinity */    'M8 12 C8 8 2 8 2 12 C2 16 8 16 12 12 C16 8 22 8 22 12 C22 16 16 16 12 12',
  /* paintbrush */  'M4 20 Q6 16 10 14 L18 4 L20 6 L10 14 Q8 18 4 20Z',
  /* lightbulb */   'M9 21 H15 M10 21 V22 H14 V21 M12 2 A7 7 0 0 0 9 14 Q9 17 9 18 H15 Q15 17 15 14 A7 7 0 0 0 12 2Z',
  /* trophy */      'M8 21 H16 M12 17 V21 M5 3 H19 V8 A7 7 0 0 1 12 17 A7 7 0 0 1 5 8 Z M5 5 H2 V9 H5 M19 5 H22 V9 H19',
  /* puzzle */      'M4 4 H10 V8 A2 2 0 1 1 10 12 V16 H4 Z M10 4 V8 M10 12 V16 H16 V12 A2 2 0 1 1 20 12 V4 H10',
  /* rocket */      'M4 16 L8 20 M8 20 L12 16 M12 2 C12 8 8 12 4 16 L8 20 C12 16 16 12 12 2Z M10 14 A2 2 0 1 0 14 14',
  /* flower */      'M12 22 V12 M12 12 A3 3 0 1 0 12 6 A3 3 0 1 0 17 10 A3 3 0 1 0 15 16 A3 3 0 1 0 9 16 A3 3 0 1 0 7 10 A3 3 0 1 0 12 6',
  /* key */         'M21 3 L14 10 M16 7 L14 10 M3 18 A3 3 0 1 0 9 18 A3 3 0 1 0 3 18 M9 16 L14 10',
];

/* Deterministic scatter layout: 7 cols x 6 rows = 42 icons */
function generateDoodleGrid() {
  const cols = 7, rows = 6;
  const items: { x: number; y: number; rot: number; pathIdx: number; scale: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = r * cols + c;
      const offsetX = ((seed * 37 + 13) % 20) - 10;
      const offsetY = ((seed * 53 + 7) % 20) - 10;
      items.push({
        x: (c / cols) * 100 + (100 / cols / 2) + offsetX * 0.3,
        y: (r / rows) * 100 + (100 / rows / 2) + offsetY * 0.3,
        rot: ((seed * 67) % 60) - 30,
        pathIdx: seed % doodlePaths.length,
        scale: 0.8 + ((seed * 29) % 5) * 0.1,
      });
    }
  }
  return items;
}

const doodleGrid = generateDoodleGrid();

const css = `
/* fonts loaded via index.html <link> */

*, *::before, *::after { box-sizing: border-box; }

.d2 {
  --bg: #1c1917;
  --surface: #231f1c;
  --surface-hover: #2a2521;
  --ink: #e8ddd0;
  --pencil: #9b8e7e;
  --accent: #d4817a;
  --accent-light: rgba(212, 129, 122, 0.12);
  --accent-glow: rgba(212, 129, 122, 0.06);
  --warm: #c4a882;
  --green: #7eb08a;
  --green-light: rgba(126, 176, 138, 0.1);
  --border: #362f2a;
  --border-light: #2e2824;
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
.d2::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}

.d2 svg.d2-filters { position: absolute; width: 0; height: 0; }

/* ---- DOODLE WALLPAPER ---- */
.d2-wallpaper {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  will-change: transform;
}

.d2-wallpaper-icon {
  position: absolute;
  pointer-events: auto;
  cursor: default;
  opacity: 0.035;
  color: var(--pencil);
  transition: opacity 0.5s ease, color 0.5s ease;
}

.d2-wallpaper-icon:hover {
  opacity: 0.22;
  color: var(--accent);
}

/* ---- CONTENT LAYER ---- */
.d2-content {
  position: relative;
  z-index: 1;
}

/* ---- NAV ---- */
.d2-nav {
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

.d2-logo {
  font-family: var(--font-hand);
  font-size: 34px;
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.d2-logo-heart {
  display: inline-block;
  animation: d2-heartbeat 1.5s ease-in-out infinite;
}

@keyframes d2-heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.15); }
  28% { transform: scale(1); }
  42% { transform: scale(1.08); }
  56% { transform: scale(1); }
}

.d2-nav-links {
  display: flex;
  gap: 32px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.d2-nav-links a {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--pencil);
  text-decoration: none;
  transition: color 0.3s;
}

.d2-nav-links a:hover { color: var(--accent); }

.d2-btn {
  font-family: var(--font-hand);
  font-size: 22px;
  font-weight: 600;
  background: var(--accent);
  color: var(--bg);
  border: 2px solid var(--ink);
  border-radius: 4px;
  padding: 10px 28px;
  cursor: pointer;
  filter: url(#d2-rough);
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  display: inline-block;
}

.d2-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--ink);
}

.d2-btn-outline {
  font-family: var(--font-hand);
  font-size: 22px;
  font-weight: 600;
  background: transparent;
  color: var(--ink);
  border: 2px solid var(--ink);
  border-radius: 4px;
  padding: 10px 28px;
  cursor: pointer;
  filter: url(#d2-rough);
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  display: inline-block;
}

.d2-btn-outline:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--ink);
  background: var(--accent-light);
}

/* ---- HERO ---- */
.d2-hero {
  padding: 100px 48px 80px;
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
  position: relative;
}

.d2-hero-badge {
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

.d2-hero h1 {
  font-family: var(--font-hand);
  font-size: clamp(48px, 7vw, 82px);
  font-weight: 700;
  line-height: 1.1;
  margin: 0 0 24px;
}

.d2-highlight {
  color: var(--accent);
  position: relative;
  display: inline-block;
}

.d2-highlight::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: -4px;
  right: -4px;
  height: 10px;
  background: var(--accent-light);
  border-radius: 2px;
  z-index: -1;
  transform: rotate(-1deg);
}

.d2-hero-sub {
  font-size: 20px;
  color: var(--pencil);
  max-width: 520px;
  margin: 0 auto 40px;
}

.d2-hero-btns {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Scribble decorations (hoverable) */
.d2-scribble-deco {
  display: block;
  margin: 0 auto;
  opacity: 0.06;
  transition: opacity 0.5s ease, color 0.5s ease;
  color: var(--pencil);
  cursor: default;
}

.d2-scribble-deco:hover {
  opacity: 0.2;
  color: var(--accent);
}

/* Margin doodles near titles */
.d2-margin-doodle {
  position: absolute;
  opacity: 0.05;
  pointer-events: auto;
  cursor: default;
  transition: opacity 0.5s ease, color 0.5s ease;
  color: var(--pencil);
}

.d2-margin-doodle:hover {
  opacity: 0.2;
  color: var(--accent);
}

/* Easter egg: carved initials */
.d2-carved {
  position: absolute;
  pointer-events: auto;
  cursor: default;
  user-select: none;
  opacity: 0.18;
  font-family: var(--font-hand);
  color: var(--pencil);
  transition: opacity 0.5s ease, color 0.5s ease;
}

.d2-carved:hover {
  opacity: 0.55;
  color: var(--accent);
}

/* ---- STATS ---- */
.d2-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border-top: 1.5px solid var(--border);
  border-bottom: 1.5px solid var(--border);
  margin: 0 48px;
}

.d2-stat {
  text-align: center;
  padding: 36px 20px;
  border-right: 1.5px solid var(--border);
  transition: background 0.3s;
}

.d2-stat:last-child { border-right: none; }
.d2-stat:hover { background: var(--accent-glow); }

.d2-stat-num {
  font-family: var(--font-hand);
  font-size: 44px;
  font-weight: 700;
  color: var(--accent);
  display: block;
  line-height: 1.1;
}

.d2-stat-label {
  font-size: 14px;
  color: var(--pencil);
  margin-top: 4px;
  display: block;
}

/* ---- SCRIBBLE UNDERLINE ---- */
.d2-scribble { position: relative; }

.d2-scribble::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 0;
  right: 0;
  height: 8px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 8'%3E%3Cpath d='M0 5 Q25 0 50 5 T100 5 T150 5 T200 5' stroke='%23d4817a' stroke-width='2.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: repeat-x;
  background-size: 100px 8px;
}

/* ---- SECTION HELPERS ---- */
.d2-section-title {
  font-family: var(--font-hand);
  font-size: 44px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 12px;
  position: relative;
}

.d2-section-sub {
  text-align: center;
  color: var(--pencil);
  margin: 0 0 52px;
  font-size: 18px;
}

/* ---- FEATURES ---- */
.d2-features {
  max-width: 1060px;
  margin: 0 auto;
  padding: 80px 48px;
  position: relative;
}

.d2-features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.d2-feature-card {
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 4px;
  padding: 28px 24px;
  filter: url(#d2-rough);
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.3s;
}

.d2-feature-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 rgba(232, 221, 208, 0.08);
  border-color: var(--accent);
}

.d2-feature-icon {
  width: 36px;
  height: 36px;
  margin-bottom: 14px;
  color: var(--accent);
}

.d2-feature-card h3 {
  font-family: var(--font-hand);
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--ink);
}

.d2-feature-card p {
  color: var(--pencil);
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

/* ---- SAMPLE PREVIEW ---- */
.d2-preview {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 48px 80px;
}

.d2-preview-card {
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  filter: url(#d2-rough);
}

.d2-preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  border-bottom: 1.5px solid var(--border);
  background: rgba(0,0,0,0.15);
}

.d2-preview-dot { width: 10px; height: 10px; border-radius: 50%; }

.d2-preview-title {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--pencil);
  margin-left: 8px;
}

.d2-preview-body { padding: 28px; }

.d2-preview-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.d2-preview-row:last-child { margin-bottom: 0; }

.d2-preview-mini-card {
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 4px;
  padding: 18px;
}

.d2-preview-mini-label {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--pencil);
  margin-bottom: 6px;
  display: block;
}

.d2-preview-mini-val {
  font-family: var(--font-hand);
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}

.d2-preview-bar-group { display: flex; flex-direction: column; gap: 8px; }

.d2-preview-bar-row { display: flex; align-items: center; gap: 10px; }

.d2-preview-bar-name {
  font-family: var(--font-body);
  font-size: 12px;
  color: var(--pencil);
  width: 50px;
  text-align: right;
}

.d2-preview-bar-track {
  flex: 1;
  height: 10px;
  background: var(--border);
  border-radius: 5px;
  overflow: hidden;
}

.d2-preview-bar-fill {
  height: 100%;
  border-radius: 5px;
  background: var(--accent);
  transition: width 1s ease;
}

.d2-preview-bar-fill.d2-bar-warm { background: var(--warm); }

/* ---- HOW ---- */
.d2-how {
  max-width: 1060px;
  margin: 0 auto;
  padding: 80px 48px;
  position: relative;
}

.d2-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.d2-step {
  text-align: center;
  position: relative;
  padding: 0 12px;
}

.d2-step-num {
  font-family: var(--font-hand);
  font-size: 60px;
  font-weight: 700;
  color: var(--accent);
  opacity: 0.2;
  line-height: 1;
}

.d2-step h3 {
  font-family: var(--font-hand);
  font-size: 28px;
  font-weight: 600;
  margin: 4px 0 8px;
}

.d2-step p { color: var(--pencil); font-size: 15px; }

.d2-step-arrow {
  position: absolute;
  right: -18px;
  top: 36px;
  color: var(--pencil);
  opacity: 0.15;
}

/* ---- PRIVACY ---- */
.d2-privacy {
  max-width: 720px;
  margin: 0 auto;
  padding: 80px 48px;
  text-align: center;
}

.d2-privacy-box {
  background: var(--green-light);
  border: 2px solid rgba(126, 176, 138, 0.2);
  border-radius: 4px;
  padding: 44px;
  filter: url(#d2-rough);
}

.d2-privacy-icon {
  width: 40px;
  height: 40px;
  color: var(--green);
  margin: 0 auto 16px;
}

.d2-privacy-box h2 { font-family: var(--font-hand); font-size: 36px; margin: 0 0 12px; }

.d2-privacy-box p { color: var(--pencil); font-size: 17px; max-width: 500px; margin: 0 auto; }

/* ---- FAQ ---- */
.d2-faq { max-width: 700px; margin: 0 auto; padding: 80px 48px; }

.d2-faq-list { display: flex; flex-direction: column; gap: 0; }

.d2-faq-item { border-bottom: 1.5px solid var(--border); overflow: hidden; }

.d2-faq-q {
  font-family: var(--font-hand);
  font-size: 24px;
  font-weight: 600;
  padding: 20px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--ink);
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  transition: color 0.2s;
}

.d2-faq-q:hover { color: var(--accent); }

.d2-faq-arrow {
  font-size: 18px;
  color: var(--pencil);
  transition: transform 0.3s;
  flex-shrink: 0;
  margin-left: 12px;
}

.d2-faq-arrow.d2-open { transform: rotate(180deg); }

.d2-faq-a {
  max-height: 0;
  opacity: 0;
  transition: max-height 0.4s ease, opacity 0.3s ease, padding 0.3s ease;
  color: var(--pencil);
  font-size: 16px;
  padding: 0;
  overflow: hidden;
}

.d2-faq-a.d2-expanded {
  max-height: 200px;
  opacity: 1;
  padding: 0 0 20px;
}

/* ---- FINAL CTA ---- */
.d2-final-cta {
  text-align: center;
  padding: 100px 48px 80px;
  position: relative;
}

.d2-final-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 50% 60% at 50% 50%, var(--accent-glow), transparent 70%);
  pointer-events: none;
}

.d2-final-cta h2 {
  font-family: var(--font-hand);
  font-size: clamp(38px, 5vw, 52px);
  font-weight: 700;
  margin: 0 0 16px;
  position: relative;
}

.d2-final-cta p { color: var(--pencil); font-size: 19px; margin: 0 0 36px; position: relative; }

/* ---- FOOTER ---- */
.d2-footer {
  text-align: center;
  padding: 36px 48px;
  border-top: 1.5px solid var(--border);
  color: var(--pencil);
  font-size: 15px;
  position: relative;
}

.d2-footer a { color: var(--accent); text-decoration: none; }

.d2-footer-egg {
  position: absolute;
  bottom: 10px;
  right: 24px;
  font-family: var(--font-hand);
  color: var(--pencil);
  transition: color 0.5s ease, opacity 0.5s ease;
  opacity: 0.22;
  cursor: default;
  user-select: none;
}

.d2-footer-egg:hover { color: var(--accent); opacity: 0.6; }

/* ---- REVEAL ---- */
.d2-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.d2-reveal.d2-visible { opacity: 1; transform: translateY(0); }

/* ---- RESPONSIVE ---- */
@media (max-width: 900px) {
  .d2-features-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .d2-nav { padding: 16px 20px; }
  .d2-nav-links { display: none; }
  .d2-hero { padding: 60px 20px 48px; }
  .d2-features, .d2-how, .d2-privacy, .d2-faq, .d2-final-cta { padding: 48px 20px; }
  .d2-stats { margin: 0 20px; grid-template-columns: repeat(2, 1fr); }
  .d2-stat { border-right: none; border-bottom: 1.5px solid var(--border); }
  .d2-stat:nth-child(odd) { border-right: 1.5px solid var(--border); }
  .d2-stat:nth-child(n+3) { border-bottom: none; }
  .d2-features-grid { grid-template-columns: 1fr; }
  .d2-steps { grid-template-columns: 1fr; gap: 16px; }
  .d2-step-arrow { display: none; }
  .d2-preview { padding: 0 20px 48px; }
  .d2-preview-row { grid-template-columns: 1fr; }
  .d2-margin-doodle { display: none; }
  .d2-wallpaper-icon { pointer-events: none; }
}
`;

/* ── Feature card icons ── */
const featureIcons = [
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 31 C7 22 2 16 2 11 A7 7 0 0 1 18 9 A7 7 0 0 1 34 11 C34 16 29 22 18 31Z"/></svg>,
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="18" cy="18" r="14"/><path d="M18 9 L18 18 L25 22"/></svg>,
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="18" cy="18" r="14"/><path d="M12 22 Q18 28 24 22"/><circle cx="13" cy="14" r="1.3" fill="currentColor"/><circle cx="23" cy="14" r="1.3" fill="currentColor"/></svg>,
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M7 5 L7 33"/><path d="M7 5 L29 11 L7 18"/></svg>,
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="7" y="16" width="22" height="15" rx="3"/><path d="M12 16 V11 A6 6 0 0 1 24 11 V16"/></svg>,
  <svg viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 3 L22 14 L33 14 L24 22 L28 33 L18 26 L8 33 L12 22 L3 14 L14 14 Z"/></svg>,
];

const faqs = [
  { q: 'Is this really free?', a: 'Yes, completely free. No hidden charges, no premium tier, no catch.' },
  { q: 'How do I export my WhatsApp chat?', a: 'Open WhatsApp, go to the chat, tap the three dots, select "Export Chat", choose "Without Media", and save the .txt file.' },
  { q: 'What happens to my data?', a: 'Your chat file is processed on our servers to generate insights, then permanently deleted. We never store, read, or share your conversations.' },
  { q: 'Does it work with group chats?', a: 'Pulse is designed for 1-on-1 couple chats. Group chats may produce unexpected results.' },
  { q: 'How long does the analysis take?', a: 'Usually a few seconds. Larger chats (100k+ messages) might take a bit longer.' },
];

/* ── Scribble divider SVGs ── */
function ScribbleDivider({ variant }: { variant: number }) {
  const shared = { className: 'd2-scribble-deco', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeWidth: 1.8 };
  switch (variant) {
    case 1: /* heart + arrow */
      return <svg {...shared} width="200" height="28" viewBox="0 0 200 28"><path d="M10 14 H70" strokeDasharray="4 4"/><path d="M88 14 C88 8 100 4 100 12 C100 4 112 8 112 14 C112 20 100 26 100 26 C100 26 88 20 88 14Z"/><path d="M130 14 H190" strokeDasharray="4 4"/></svg>;
    case 2: /* spiral */
      return <svg {...shared} width="180" height="30" viewBox="0 0 180 30"><path d="M10 15 H60"/><path d="M70 15 C78 5 92 5 98 15 C104 25 90 28 86 18 C82 10 92 8 95 15"/><path d="M110 15 H170"/></svg>;
    case 3: /* zigzag */
      return <svg {...shared} width="220" height="24" viewBox="0 0 220 24"><path d="M10 12 L40 12 L50 4 L60 20 L70 4 L80 20 L90 4 L100 20 L110 12 L210 12"/></svg>;
    case 4: /* dots */
      return <svg {...shared} width="160" height="16" viewBox="0 0 160 16">{[0,1,2,3,4,5,6,7,8,9,10].map(i => <circle key={i} cx={10 + i * 14} cy="8" r="2.5" fill="currentColor" opacity={0.6}/>)}</svg>;
    case 5: /* small stars */
      return <svg {...shared} width="200" height="24" viewBox="0 0 200 24"><path d="M10 12 H60"/>{[80,100,120].map(x => <path key={x} d={`M${x} 4 L${x+2} 10 L${x+8} 10 L${x+3} 14 L${x+5} 20 L${x} 16 L${x-5} 20 L${x-3} 14 L${x-8} 10 L${x-2} 10 Z`}/>)}<path d="M140 12 H190"/></svg>;
    default: /* wavy */
      return <svg {...shared} width="240" height="16" viewBox="0 0 240 16"><path d="M0 8 Q15 2 30 8 T60 8 T90 8 T120 8 T150 8 T180 8 T210 8 T240 8"/></svg>;
  }
}

export default function Design2() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const wallpaperRef = useRef<HTMLDivElement | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleScroll = useCallback(() => {
    if (wallpaperRef.current) {
      const y = window.scrollY * 0.12;
      wallpaperRef.current.style.transform = `translateY(${-y}px)`;
    }
  }, []);

  const [stylesReady, setStylesReady] = useState(false);

  useEffect(() => {
    if (!document.getElementById(STYLE_ID)) {
      const el = document.createElement('style');
      el.id = STYLE_ID;
      el.textContent = css;
      document.head.appendChild(el);
    }
    // Force a layout reflow so styles apply before we reveal
    document.body.offsetHeight;
    setStylesReady(true);

    observerRef.current = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('d2-visible'); }); },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.d2-reveal').forEach((el) => observerRef.current?.observe(el));

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.getElementById(STYLE_ID)?.remove();
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="d2" style={{ opacity: stylesReady ? 1 : 0, transition: 'opacity 0.15s ease' }}>
      <svg className="d2-filters" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="d2-rough">
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" />
          </filter>
        </defs>
      </svg>

      {/* ===== DOODLE WALLPAPER ===== */}
      <div className="d2-wallpaper" ref={wallpaperRef}>
        {doodleGrid.map((d, i) => (
          <svg
            key={i}
            className="d2-wallpaper-icon"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              transform: `rotate(${d.rot}deg) scale(${d.scale})`,
            }}
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={doodlePaths[d.pathIdx]} />
          </svg>
        ))}
      </div>

      {/* ===== CONTENT LAYER ===== */}
      <div className="d2-content">

        {/* ===== NAV ===== */}
        <nav className="d2-nav">
          <a href="#" className="d2-logo">
            <span className="d2-logo-heart">
              <svg width="26" height="26" viewBox="0 0 40 40" fill="none" stroke="#d4817a" strokeWidth="3" strokeLinecap="round"><path d="M20 34 C8 24 2 18 2 12 A8 8 0 0 1 20 10 A8 8 0 0 1 38 12 C38 18 32 24 20 34Z"/></svg>
            </span>
            pulse
          </a>
          <ul className="d2-nav-links">
            <li><a href="#features">features</a></li>
            <li><a href="#how">how it works</a></li>
            <li><a href="#privacy">privacy</a></li>
            <li><a href="#faq">faq</a></li>
          </ul>
          <a href="/pulse/app" className="d2-btn" style={{ fontSize: 17, padding: '8px 24px' }}>try it free</a>
        </nav>

        {/* ===== HERO ===== */}
        <section className="d2-hero">
          <div className="d2-hero-badge">for couples who love data</div>
          <h1>
            Uncover the story<br />
            <span className="d2-highlight">hidden in your chats</span>
          </h1>
          <p className="d2-hero-sub">{dummyData.description}</p>
          <div className="d2-hero-btns">
            <a href="/pulse/app" className="d2-btn">upload your chat</a>
            <a href="#how" className="d2-btn-outline">how it works</a>
          </div>

          {/* Margin doodle: spiral */}
          <svg className="d2-margin-doodle" style={{ left: 10, top: '28%' }} width="70" height="70" viewBox="0 0 70 70" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M35 12 C50 12 56 26 51 36 C46 46 24 48 19 38 C14 28 24 20 35 22 C44 24 46 34 40 37" />
          </svg>
          {/* Margin doodle: arrow pointing down */}
          <svg className="d2-margin-doodle" style={{ right: 14, bottom: '5%' }} width="50" height="70" viewBox="0 0 50 70" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="4 4">
            <path d="M25 5 V55 M15 45 L25 58 L35 45" />
          </svg>

          {/* Easter egg: S heart E */}
          <div
            className="d2-carved"
            style={{ right: 52, top: '18%', transform: 'rotate(8deg)' }}
            title="who carved this here?"
          >
            <svg width="72" height="36" viewBox="0 0 72 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="2" y="26" fontFamily="Caveat, cursive" fontSize="22" fontWeight="700" fill="currentColor">S</text>
              <path d="M26 18 C26 12 36 8 36 16 C36 8 46 12 46 18 C46 24 36 30 36 30 C36 30 26 24 26 18Z" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
              <text x="52" y="26" fontFamily="Caveat, cursive" fontSize="22" fontWeight="700" fill="currentColor">E</text>
            </svg>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <div className="d2-stats d2-reveal">
          {([
            [dummyData.totalMessages, 'messages analyzed'],
            [dummyData.daysTogether, 'days together'],
            [dummyData.longestStreak, 'day streak'],
            [dummyData.loveMessages, 'love messages'],
          ] as const).map(([num, label], i) => (
            <div className="d2-stat" key={i}>
              <span className="d2-stat-num">{Number(num).toLocaleString()}</span>
              <span className="d2-stat-label">{label}</span>
            </div>
          ))}
        </div>

        {/* ---- scribble divider: heart+arrow ---- */}
        <div style={{ textAlign: 'center', padding: '20px 0' }}><ScribbleDivider variant={1} /></div>

        {/* ===== FEATURES ===== */}
        <section className="d2-features" id="features">
          {/* Margin doodle: tiny star cluster */}
          <svg className="d2-margin-doodle" style={{ right: -10, top: 60 }} width="50" height="50" viewBox="0 0 50 50" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <path d="M25 5 L27 15 L35 10 L30 18 L40 20 L30 22 L35 30 L27 25 L25 35 L23 25 L15 30 L20 22 L10 20 L20 18 L15 10 L23 15 Z" />
          </svg>
          <h2 className="d2-section-title d2-reveal">
            What you'll <span className="d2-scribble">discover</span>
          </h2>
          <p className="d2-section-sub d2-reveal">Every conversation holds hidden stories. Here's what Pulse finds.</p>
          <div className="d2-features-grid">
            {dummyData.features.map((f, i) => (
              <div key={i} className="d2-feature-card d2-reveal" style={{ transitionDelay: `${i * 0.07}s` }}>
                <div className="d2-feature-icon">{featureIcons[i]}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- scribble divider: spiral ---- */}
        <div style={{ textAlign: 'center', padding: '10px 0' }}><ScribbleDivider variant={2} /></div>

        {/* ===== SAMPLE PREVIEW ===== */}
        <div className="d2-preview d2-reveal">
          <div className="d2-preview-card">
            <div className="d2-preview-header">
              <div className="d2-preview-dot" style={{ background: '#d4817a' }} />
              <div className="d2-preview-dot" style={{ background: '#c4a882' }} />
              <div className="d2-preview-dot" style={{ background: '#7eb08a' }} />
              <span className="d2-preview-title">pulse — {dummyData.partner1} & {dummyData.partner2}</span>
            </div>
            <div className="d2-preview-body">
              <div className="d2-preview-row">
                <div className="d2-preview-mini-card">
                  <span className="d2-preview-mini-label">total messages</span>
                  <span className="d2-preview-mini-val">{dummyData.totalMessages.toLocaleString()}</span>
                </div>
                <div className="d2-preview-mini-card">
                  <span className="d2-preview-mini-label">avg. per day</span>
                  <span className="d2-preview-mini-val">{dummyData.avgMessagesPerDay}</span>
                </div>
              </div>
              <div className="d2-preview-mini-card">
                <span className="d2-preview-mini-label">messages by person</span>
                <div className="d2-preview-bar-group" style={{ marginTop: 10 }}>
                  <div className="d2-preview-bar-row">
                    <span className="d2-preview-bar-name">{dummyData.partner1}</span>
                    <div className="d2-preview-bar-track"><div className="d2-preview-bar-fill" style={{ width: '58%' }} /></div>
                  </div>
                  <div className="d2-preview-bar-row">
                    <span className="d2-preview-bar-name">{dummyData.partner2}</span>
                    <div className="d2-preview-bar-track"><div className="d2-preview-bar-fill d2-bar-warm" style={{ width: '42%' }} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---- scribble divider: zigzag ---- */}
        <div style={{ textAlign: 'center', padding: '10px 0' }}><ScribbleDivider variant={3} /></div>

        {/* ===== HOW ===== */}
        <section className="d2-how" id="how">
          {/* Margin doodle: arrow curling left */}
          <svg className="d2-margin-doodle" style={{ left: 0, top: 50 }} width="60" height="50" viewBox="0 0 60 50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 4">
            <path d="M50 40 C30 40 10 30 15 15 C18 5 35 5 40 15" /><path d="M35 8 L40 15 L32 17" />
          </svg>
          <h2 className="d2-section-title d2-reveal">
            Three simple <span className="d2-scribble">steps</span>
          </h2>
          <p className="d2-section-sub d2-reveal">No signup. No install. Just upload and explore.</p>
          <div className="d2-steps">
            {dummyData.steps.map((s, i) => (
              <div key={i} className="d2-step d2-reveal" style={{ transitionDelay: `${i * 0.12}s` }}>
                <div className="d2-step-num">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < dummyData.steps.length - 1 && (
                  <span className="d2-step-arrow">
                    <svg width="24" height="16" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 8 H18 M15 3 L21 8 L15 13"/></svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ---- scribble divider: dots ---- */}
        <div style={{ textAlign: 'center', padding: '16px 0' }}><ScribbleDivider variant={4} /></div>

        {/* ===== PRIVACY ===== */}
        <section className="d2-privacy" id="privacy">
          <div className="d2-privacy-box d2-reveal">
            <div className="d2-privacy-icon">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <rect x="8" y="18" width="24" height="16" rx="3"/><path d="M14 18 V12 A6 6 0 0 1 26 12 V18"/>
              </svg>
            </div>
            <h2>Your chats stay yours</h2>
            <p>
              Pulse processes everything server-side, then permanently deletes your data.
              No storage. No accounts. No tracking. Just insights, then gone.
            </p>
          </div>
        </section>

        {/* ---- scribble divider: stars ---- */}
        <div style={{ textAlign: 'center', padding: '10px 0' }}><ScribbleDivider variant={5} /></div>

        {/* ===== FAQ ===== */}
        <section className="d2-faq" id="faq">
          <h2 className="d2-section-title d2-reveal">
            Got <span className="d2-scribble">questions</span>?
          </h2>
          <p className="d2-section-sub d2-reveal">Here are the ones we get asked most.</p>
          <div className="d2-faq-list">
            {faqs.map((f, i) => (
              <div key={i} className="d2-faq-item d2-reveal" style={{ transitionDelay: `${i * 0.06}s` }}>
                <button className="d2-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <span className={`d2-faq-arrow ${openFaq === i ? 'd2-open' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6 L8 10 L12 6"/></svg>
                  </span>
                </button>
                <div className={`d2-faq-a ${openFaq === i ? 'd2-expanded' : ''}`}>{f.a}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ---- scribble divider: wavy ---- */}
        <div style={{ textAlign: 'center', padding: '16px 0' }}><ScribbleDivider variant={0} /></div>

        {/* ===== FINAL CTA ===== */}
        <section className="d2-final-cta d2-reveal">
          <h2>Ready to decode your <span className="d2-highlight">love story</span>?</h2>
          <p>Upload your WhatsApp chat and discover something beautiful.</p>
          <a href="/pulse/app" className="d2-btn">get started — it's free</a>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="d2-footer">
          <p>made with care by <a href="https://pookie.sh">pookie.sh</a> · pulse · {new Date().getFullYear()}</p>
          <span className="d2-footer-egg" title=";)">
            <svg width="100" height="44" viewBox="0 0 100 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <text x="2" y="32" fontFamily="Caveat, cursive" fontSize="30" fontWeight="700" fill="currentColor">N</text>
              <path d="M34 22 C34 14 46 9 46 19 C46 9 58 14 58 22 C58 30 46 37 46 37 C46 37 34 30 34 22Z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <text x="68" y="32" fontFamily="Caveat, cursive" fontSize="30" fontWeight="700" fill="currentColor">R</text>
            </svg>
          </span>
        </footer>

      </div>{/* end .d2-content */}
    </div>
  );
}
