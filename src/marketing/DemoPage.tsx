import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { dummyAnalysisResult, dummyChatSummary } from './dummyAnalysis';
import { BasicStatsCard } from '../components/BasicStatsCard';
import { FunStatsCard } from '../components/FunStatsCard';
import { TimelineCard } from '../components/TimelineCard';
import { LoveAnalysisCard } from '../components/LoveAnalysisCard';
import { EmojiAnalysisCard } from '../components/EmojiAnalysisCard';
import { MediaStatsCard } from '../components/MediaStatsCard';
import { MilestonesCard } from '../components/MilestonesCard';
import { WordCloudCard } from '../components/WordCloudCard';
import '../App.css';

const STYLE_ID = 'd2-demo-style';

/* ── Doodle icons (same expanded set as Design2 — 30 paths) ── */
const doodlePaths = [
  'M12 21 C5 15 1 11 1 7 A5 5 0 0 1 12 6 A5 5 0 0 1 23 7 C23 11 19 15 12 21Z',
  'M4 4 H20 V16 H10 L6 20 V16 H4 Z',
  'M2 6 L12 13 L22 6 M2 6 V18 H22 V6',
  'M12 2 A10 10 0 1 0 12 22 A10 10 0 1 0 12 2 M12 6 V12 L16 14',
  'M9 3 L7 6 H3 V20 H21 V6 H17 L15 3 Z M12 10 A4 4 0 1 0 12 18 A4 4 0 1 0 12 10',
  'M8 18 A3 3 0 1 1 8 12 V4 L18 2 V14 A3 3 0 1 1 18 8',
  'M12 2 L14.5 9 L22 9 L16 14 L18 21 L12 17 L6 21 L8 14 L2 9 L9.5 9 Z',
  'M2 12 L22 3 L16 22 L12 14 Z M12 14 L22 3',
  'M5 2 H19 V22 H5 Z M9 19 H15',
  'M6 11 V8 A6 6 0 0 1 18 8 V11 M4 11 H20 V22 H4 Z',
  'M12 2 A10 10 0 1 0 12 22 A10 10 0 1 0 12 2 M8 14 Q12 18 16 14 M9 9 V10 M15 9 V10',
  'M3 8 H21 V12 H3 Z M3 12 H21 V21 H3 Z M12 8 V21 M12 8 C12 5 8 3 7 5 C6 6 7 8 12 8 M12 8 C12 5 16 3 17 5 C18 6 17 8 12 8',
  'M12 2 L13.5 8.5 L20 6 L15.5 11 L22 12 L15.5 13 L20 18 L13.5 15.5 L12 22 L10.5 15.5 L4 18 L8.5 13 L2 12 L8.5 11 L4 6 L10.5 8.5 Z',
  'M4 3 Q12 1 12 5 Q12 1 20 3 V19 Q12 17 12 21 Q12 17 4 19 Z M12 5 V21',
  'M12 2 A10 10 0 1 0 12 22 A10 10 0 1 0 12 2 M16 8 L10 14 L8 16 L14 10 Z',
  'M12 7 A5 5 0 1 0 12 17 A5 5 0 1 0 12 7 M12 1 V4 M12 20 V23 M1 12 H4 M20 12 H23 M4.2 4.2 L6.3 6.3 M17.7 17.7 L19.8 19.8 M19.8 4.2 L17.7 6.3 M6.3 17.7 L4.2 19.8',
  'M21 12.79 A9 9 0 1 1 11.21 3 A7 7 0 0 0 21 12.79Z',
  'M18 10 A4 4 0 0 0 10 9 A6 6 0 0 0 6 15 A3 3 0 0 0 6 21 H18 A4 4 0 0 0 18 10Z',
  'M3 6 H17 V14 A4 4 0 0 1 13 18 H7 A4 4 0 0 1 3 14 Z M17 9 H19 A2 2 0 0 1 19 13 H17 M3 22 H17',
  'M12 22 Q3 16 3 10 A9 9 0 0 1 21 10 Q21 16 12 22Z M12 22 C12 16 7 12 3 10',
  'M13 2 L5 14 H11 L10 22 L19 10 H13 Z',
  'M12 2 L22 10 L12 22 L2 10 Z M2 10 H22',
  'M8 12 C8 8 2 8 2 12 C2 16 8 16 12 12 C16 8 22 8 22 12 C22 16 16 16 12 12',
  'M4 20 Q6 16 10 14 L18 4 L20 6 L10 14 Q8 18 4 20Z',
  'M9 21 H15 M10 21 V22 H14 V21 M12 2 A7 7 0 0 0 9 14 Q9 17 9 18 H15 Q15 17 15 14 A7 7 0 0 0 12 2Z',
  'M8 21 H16 M12 17 V21 M5 3 H19 V8 A7 7 0 0 1 12 17 A7 7 0 0 1 5 8 Z M5 5 H2 V9 H5 M19 5 H22 V9 H19',
  'M4 4 H10 V8 A2 2 0 1 1 10 12 V16 H4 Z M10 4 V8 M10 12 V16 H16 V12 A2 2 0 1 1 20 12 V4 H10',
  'M4 16 L8 20 M8 20 L12 16 M12 2 C12 8 8 12 4 16 L8 20 C12 16 16 12 12 2Z M10 14 A2 2 0 1 0 14 14',
  'M12 22 V12 M12 12 A3 3 0 1 0 12 6 A3 3 0 1 0 17 10 A3 3 0 1 0 15 16 A3 3 0 1 0 9 16 A3 3 0 1 0 7 10 A3 3 0 1 0 12 6',
  'M21 3 L14 10 M16 7 L14 10 M3 18 A3 3 0 1 0 9 18 A3 3 0 1 0 3 18 M9 16 L14 10',
];

function generateDoodleGrid() {
  const cols = 7, rows = 6;
  const items: { x: number; y: number; rot: number; pathIdx: number; scale: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const seed = r * cols + c;
      items.push({
        x: (c / cols) * 100 + (100 / cols / 2) + (((seed * 37 + 13) % 20) - 10) * 0.3,
        y: (r / rows) * 100 + (100 / rows / 2) + (((seed * 53 + 7) % 20) - 10) * 0.3,
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

/* Override CSS variables for Design 2 palette */
.demo-d2 :root,
.demo-d2 {
  --bg: #1c1917;
  --bg-card: #231f1c;
  --bg-hover: #2a2521;
  --text: #e8ddd0;
  --text-muted: #9b8e7e;
  --accent: #d4817a;
  --accent-pink: #c4a882;
  --accent-green: #7eb08a;
  --accent-yellow: #c4a882;
  --border: #362f2a;
  --radius: 8px;
}

.demo-d2 {
  background: #1c1917;
  color: #e8ddd0;
  font-family: 'Kalam', cursive;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Paper grain overlay */
.demo-d2::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}

/* Doodle wallpaper */
.demo-d2-wallpaper {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  will-change: transform;
}

.demo-d2-wallpaper svg {
  position: absolute;
  pointer-events: auto;
  cursor: default;
  opacity: 0.035;
  color: #9b8e7e;
  transition: opacity 0.5s ease, color 0.5s ease;
}

.demo-d2-wallpaper svg:hover {
  opacity: 0.22;
  color: #d4817a;
}

/* Content layer */
.demo-d2-content {
  position: relative;
  z-index: 1;
}

/* Nav */
.demo-d2-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 48px;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(28, 25, 23, 0.92);
  backdrop-filter: blur(14px);
  border-bottom: 1.5px solid #362f2a;
}

.demo-d2-logo {
  font-family: 'Caveat', cursive;
  font-size: 34px;
  font-weight: 700;
  color: #e8ddd0;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-d2-logo-heart {
  display: inline-block;
  animation: demo-heartbeat 1.5s ease-in-out infinite;
}

@keyframes demo-heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.15); }
  28% { transform: scale(1); }
  42% { transform: scale(1.08); }
  56% { transform: scale(1); }
}

.demo-d2-back {
  font-family: 'Caveat', cursive;
  font-size: 20px;
  color: #9b8e7e;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.3s;
}

.demo-d2-back:hover { color: #d4817a; }

/* Header */
.demo-d2-header {
  text-align: center;
  padding: 60px 48px 24px;
}

.demo-d2-header h1 {
  font-family: 'Caveat', cursive;
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 700;
  color: #e8ddd0;
  line-height: 1.15;
  margin: 0 0 8px;
}

.demo-d2-header h1 span {
  color: #d4817a;
}

.demo-d2-header p {
  color: #9b8e7e;
  font-size: 17px;
  margin: 0;
}

/* Banner */
.demo-d2-banner {
  max-width: 700px;
  margin: 0 auto 32px;
  padding: 14px 24px;
  background: rgba(212, 129, 122, 0.08);
  border: 1.5px dashed rgba(212, 129, 122, 0.25);
  border-radius: 6px;
  text-align: center;
  font-family: 'Kalam', cursive;
  font-size: 15px;
  color: #d4817a;
}

/* Results container */
.demo-d2-results {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
}

/* ---- Section group headings ---- */
.demo-d2-section-group {
  margin-top: 48px;
}

.demo-d2-section-group:first-child {
  margin-top: 0;
}

.demo-d2-section-heading {
  text-align: center;
  margin-bottom: 24px;
}

.demo-d2-section-heading h2 {
  font-family: 'Caveat', cursive;
  font-size: 36px;
  font-weight: 700;
  color: #e8ddd0;
  margin: 0 0 4px;
}

.demo-d2-section-heading p {
  font-family: 'Kalam', cursive;
  font-size: 15px;
  color: #9b8e7e;
  margin: 0;
}

/* Scribble section divider */
.demo-d2-divider {
  text-align: center;
  padding: 12px 0 0;
  opacity: 0.08;
  color: #9b8e7e;
  transition: opacity 0.5s;
}

.demo-d2-divider:hover {
  opacity: 0.2;
}

/* ---- Override app card styles ---- */
.demo-d2 .result-card {
  background: #231f1c;
  border-color: #362f2a;
  color: #e8ddd0;
  margin-bottom: 1.25rem;
}

/* Fix stats grid: force 3 columns for even rows (6 items = 3x2, 3 items = 3x1) */
.demo-d2 .stats-grid {
  grid-template-columns: repeat(3, 1fr);
}

/* When exactly 4 items, use 2 columns for a clean 2x2 */
.demo-d2 .stats-grid:has(> :nth-child(4):last-child) {
  grid-template-columns: repeat(2, 1fr);
}

/* When exactly 2 items, use 2 columns */
.demo-d2 .stats-grid:has(> :nth-child(2):last-child) {
  grid-template-columns: repeat(2, 1fr);
}

/* Participant hero cards: always 2 columns */
.demo-d2 .participant-hero-grid {
  grid-template-columns: repeat(2, 1fr);
}

/* H2H bars: consistent spacing */
.demo-d2 .h2h-grid {
  gap: 0.75rem;
}

.demo-d2 .result-card-title {
  color: #e8ddd0;
  font-family: 'Caveat', cursive;
  font-size: 1.5rem;
}

.demo-d2 .stat-item,
.demo-d2 .participant-hero,
.demo-d2 .h2h-row,
.demo-d2 .keyword-item,
.demo-d2 .milestone-item,
.demo-d2 .word-cloud,
.demo-d2 .emoji-item,
.demo-d2 .anniversary-item {
  background: #2a2521;
}

.demo-d2 .stat-value,
.demo-d2 .hero-value {
  color: #d4817a;
}

.demo-d2 .participant-hero:nth-child(2) .hero-value {
  color: #c4a882;
}

.demo-d2 .participant-hero {
  border-left-color: #d4817a;
}

.demo-d2 .participant-hero:nth-child(2) {
  border-left-color: #c4a882;
}

.demo-d2 .stat-label,
.demo-d2 .hero-label,
.demo-d2 .keyword-breakdown,
.demo-d2 .milestone-date,
.demo-d2 .word-count,
.demo-d2 .word-rank,
.demo-d2 .emoji-count,
.demo-d2 .anniversary-date,
.demo-d2 .heatmap-day,
.demo-d2 .heatmap-table th {
  color: #9b8e7e;
}

.demo-d2 .subsection-title {
  color: #e8ddd0;
  font-family: 'Caveat', cursive;
  font-size: 1.25rem;
}

.demo-d2 .subsection-title-small {
  color: #9b8e7e;
}

.demo-d2 .keyword-text {
  color: #d4817a;
}

.demo-d2 .keyword-count {
  color: #c4a882;
}

.demo-d2 .word-cloud-word {
  color: #d4817a;
}

.demo-d2 .word-cloud-word:hover {
  color: #c4a882;
}

.demo-d2 .unique-word {
  background: #2a2521;
  color: #c4a882;
}

.demo-d2 .milestone-item.highlight {
  border-left-color: #d4817a;
}

.demo-d2 .h2h-bar-segment.left {
  background: #d4817a;
}

.demo-d2 .h2h-bar-segment.right {
  background: #c4a882;
}

.demo-d2 .participants-table th {
  color: #9b8e7e;
}

.demo-d2 .participants-table td {
  border-bottom-color: #362f2a;
}

.demo-d2 .heatmap-cell {
  border-color: #1c1917;
}

/* Recharts legend text */
.demo-d2 .recharts-legend-item-text {
  color: #9b8e7e !important;
}

/* SVG card icons inherit color */
.demo-d2 .result-card-icon svg {
  color: #d4817a;
}

/* Footer */
.demo-d2-footer {
  text-align: center;
  padding: 36px 48px;
  border-top: 1.5px solid #362f2a;
  color: #9b8e7e;
  font-size: 15px;
}

.demo-d2-footer a {
  color: #d4817a;
  text-decoration: none;
}

/* ---- Share / Export toolbar ---- */
.demo-d2-share-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  margin: 0 auto 32px;
  max-width: 600px;
}

.demo-d2-share-label {
  font-family: 'Caveat', cursive;
  font-size: 20px;
  font-weight: 600;
  color: #e8ddd0;
  margin-right: 8px;
}

.demo-d2-share-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Kalam', cursive;
  font-size: 14px;
  color: #e8ddd0;
  background: #231f1c;
  border: 1.5px solid #362f2a;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s, transform 0.15s;
  user-select: none;
}

.demo-d2-share-btn:hover {
  border-color: #d4817a;
  background: rgba(212, 129, 122, 0.08);
  transform: translateY(-1px);
}

.demo-d2-share-btn:active {
  transform: translateY(0);
}

.demo-d2-share-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.demo-d2-share-btn svg {
  flex-shrink: 0;
}

/* Table alt-row styling */
.demo-d2 .participants-table tbody tr:nth-child(even) td {
  background: rgba(42, 37, 33, 0.5);
}

/* CTA at bottom */
.demo-d2-cta {
  text-align: center;
  padding: 48px 24px 32px;
}

.demo-d2-cta p {
  font-family: 'Caveat', cursive;
  font-size: 28px;
  font-weight: 700;
  color: #e8ddd0;
  margin: 0 0 16px;
}

.demo-d2-cta-btn {
  font-family: 'Caveat', cursive;
  font-size: 22px;
  font-weight: 600;
  background: #d4817a;
  color: #1c1917;
  border: 2px solid #e8ddd0;
  border-radius: 4px;
  padding: 10px 28px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  display: inline-block;
}

.demo-d2-cta-btn:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 #e8ddd0;
}

/* Reveal */
.demo-d2-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.demo-d2-reveal.demo-d2-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .demo-d2-nav { padding: 16px 20px; }
  .demo-d2-header { padding: 40px 20px 20px; }
  .demo-d2-results { padding: 0 1rem 3rem; }
  .demo-d2-wallpaper svg { pointer-events: none; }
  .demo-d2-section-heading h2 { font-size: 28px; }
}
`;

const r = dummyAnalysisResult;
const c = dummyChatSummary;

/* Section config for organized layout */
const sections = [
  {
    title: 'The Overview',
    subtitle: 'Your chat at a glance',
    cards: (
      <>
        <BasicStatsCard data={r.basicStats} />
      </>
    ),
  },
  {
    title: 'Fun Facts',
    subtitle: 'Who laughs more? Who texts first?',
    cards: (
      <>
        <FunStatsCard data={r.funStats} participants={c.participants} />
      </>
    ),
  },
  {
    title: 'Timeline',
    subtitle: 'When do you talk the most?',
    cards: (
      <>
        <TimelineCard data={r.timeline} participants={c.participants} />
      </>
    ),
  },
  {
    title: 'Love & Affection',
    subtitle: 'The sweet stuff',
    cards: (
      <>
        <LoveAnalysisCard data={r.loveAnalysis} participants={c.participants} />
        <EmojiAnalysisCard data={r.emojiAnalysis} />
      </>
    ),
  },
  {
    title: 'Memories',
    subtitle: 'Milestones and media',
    cards: (
      <>
        <MilestonesCard data={r.milestones} />
        <MediaStatsCard data={r.mediaStats} participants={c.participants} />
      </>
    ),
  },
  {
    title: 'Your Words',
    subtitle: 'What you say the most',
    cards: (
      <>
        <WordCloudCard data={r.wordCloud} participants={c.participants} />
      </>
    ),
  },
];

/* Scribble divider variants */
function SectionDivider({ variant }: { variant: number }) {
  const shared: React.SVGProps<SVGSVGElement> = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeWidth: 1.8 };
  switch (variant % 4) {
    case 0:
      return <svg {...shared} width="200" height="28" viewBox="0 0 200 28"><path d="M10 14 H70" strokeDasharray="4 4"/><path d="M88 14 C88 8 100 4 100 12 C100 4 112 8 112 14 C112 20 100 26 100 26 C100 26 88 20 88 14Z"/><path d="M130 14 H190" strokeDasharray="4 4"/></svg>;
    case 1:
      return <svg {...shared} width="220" height="24" viewBox="0 0 220 24"><path d="M10 12 L40 12 L50 4 L60 20 L70 4 L80 20 L90 4 L100 20 L110 12 L210 12"/></svg>;
    case 2:
      return <svg {...shared} width="160" height="16" viewBox="0 0 160 16">{[0,1,2,3,4,5,6,7,8,9,10].map(i => <circle key={i} cx={10 + i * 14} cy="8" r="2.5" fill="currentColor" opacity={0.6}/>)}</svg>;
    default:
      return <svg {...shared} width="240" height="16" viewBox="0 0 240 16"><path d="M0 8 Q15 2 30 8 T60 8 T90 8 T120 8 T150 8 T180 8 T210 8 T240 8"/></svg>;
  }
}

async function exportAsImage(el: HTMLElement) {
  const canvas = await html2canvas(el, {
    backgroundColor: '#1c1917',
    scale: 2,
    useCORS: true,
    logging: false,
  });
  const link = document.createElement('a');
  link.download = 'pulse-analysis.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

async function exportAsPDF(el: HTMLElement) {
  const canvas = await html2canvas(el, {
    backgroundColor: '#1c1917',
    scale: 2,
    useCORS: true,
    logging: false,
  });
  const imgData = canvas.toDataURL('image/png');
  const imgW = canvas.width;
  const imgH = canvas.height;
  // A4 landscape-ish: use the image aspect ratio
  const pdfW = 210; // mm (A4 width)
  const pdfH = (imgH * pdfW) / imgW;
  const pdf = new jsPDF({ orientation: pdfH > 297 ? 'portrait' : 'portrait', unit: 'mm', format: [pdfW, Math.min(pdfH, 10000)] });
  pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
  pdf.save('pulse-analysis.pdf');
}

function exportAsHTML(el: HTMLElement) {
  // Gather all stylesheets
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(s => s.outerHTML)
    .join('\n');
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pulse Analysis</title>${styles}</head>
<body style="margin:0;background:#1c1917">${el.outerHTML}</body>
</html>`;
  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  link.download = 'pulse-analysis.html';
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function DemoPage() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const wallpaperRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

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
    document.body.offsetHeight;
    setStylesReady(true);

    observerRef.current = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('demo-d2-visible'); }); },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.demo-d2-reveal').forEach((el) => observerRef.current?.observe(el));

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.getElementById(STYLE_ID)?.remove();
      observerRef.current?.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="demo-d2" style={{ opacity: stylesReady ? 1 : 0, transition: 'opacity 0.15s ease' }}>
      {/* Doodle wallpaper with parallax */}
      <div className="demo-d2-wallpaper" ref={wallpaperRef}>
        {doodleGrid.map((d, i) => (
          <svg
            key={i}
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

      {/* Content */}
      <div className="demo-d2-content">
        {/* Nav */}
        <nav className="demo-d2-nav">
          <Link to="/pulse" className="demo-d2-logo">
            <span className="demo-d2-logo-heart">
              <svg width="26" height="26" viewBox="0 0 40 40" fill="none" stroke="#d4817a" strokeWidth="3" strokeLinecap="round"><path d="M20 34 C8 24 2 18 2 12 A8 8 0 0 1 20 10 A8 8 0 0 1 38 12 C38 18 32 24 20 34Z"/></svg>
            </span>
            pulse
          </Link>
          <Link to="/pulse" className="demo-d2-back">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3 L6 9 L12 15"/></svg>
            back to home
          </Link>
        </nav>

        {/* Header */}
        <div className="demo-d2-header demo-d2-reveal">
          <h1>
            {c.participants[0]} & {c.participants[1]}'s <span>Story</span>
          </h1>
          <p>
            {c.totalMessages.toLocaleString()} messages · {new Date(c.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} to {new Date(c.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Banner */}
        <div className="demo-d2-banner demo-d2-reveal">
          This is a sample analysis with dummy data. Upload your own chat to see your real story.
        </div>

        {/* Share / Export bar */}
        <div className="demo-d2-share-bar demo-d2-reveal">
          <span className="demo-d2-share-label">Share:</span>
          <button className="demo-d2-share-btn" onClick={() => resultsRef.current && exportAsImage(resultsRef.current)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15 L16 10 L5 21"/></svg>
            PNG
          </button>
          <button className="demo-d2-share-btn" onClick={() => resultsRef.current && exportAsPDF(resultsRef.current)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2 H6 A2 2 0 0 0 4 4 V20 A2 2 0 0 0 6 22 H18 A2 2 0 0 0 20 20 V8 Z"/><path d="M14 2 V8 H20"/><path d="M10 13 H14 M10 17 H14"/></svg>
            PDF
          </button>
          <button className="demo-d2-share-btn" onClick={() => resultsRef.current && exportAsHTML(resultsRef.current)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 18 L22 12 L16 6 M8 6 L2 12 L8 18"/></svg>
            HTML
          </button>
        </div>

        {/* Results: organized in sections */}
        <div className="demo-d2-results" ref={resultsRef}>
          {sections.map((section, idx) => (
            <div key={idx} className="demo-d2-section-group">
              {/* Divider between sections (skip first) */}
              {idx > 0 && (
                <div className="demo-d2-divider">
                  <SectionDivider variant={idx} />
                </div>
              )}

              {/* Section heading */}
              <div className="demo-d2-section-heading demo-d2-reveal">
                <h2>{section.title}</h2>
                <p>{section.subtitle}</p>
              </div>

              {/* Cards */}
              <div className="demo-d2-reveal">
                {section.cards}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="demo-d2-cta demo-d2-reveal">
          <p>Want to see your own story?</p>
          <Link to="/pulse/app" className="demo-d2-cta-btn">upload your chat</Link>
        </div>

        {/* Footer */}
        <footer className="demo-d2-footer">
          <p>made with care by <a href="https://pookie.sh">pookie.sh</a> · pulse · {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}
