# Pookie / Pulse CV Prep

## 1. What The System Is

`pookie.sh` is a privacy-first browser application for couples. The main live product in this repo is `Pulse`, a WhatsApp chat analysis tool that lets users upload a `.txt` or `.zip` chat export and get a structured visual breakdown of their relationship and messaging patterns.

The system is fully client-side:

- React 19 + TypeScript frontend
- Vite 7 build setup
- React Router multi-page SPA routing
- Web Worker for heavy chat parsing and analytics
- Recharts for data visualization
- `html2canvas` + `jsPDF` + HTML export for shareable reports
- Vercel deployment with SPA rewrite config

There is no backend in this project. User chat data stays on-device and is processed entirely in the browser.

## 2. How The System Works

High-level flow:

1. The user opens the landing page or Pulse marketing page.
2. They upload a WhatsApp export as `.txt` or `.zip`.
3. The upload layer reads the file locally. If it is a zip, the app extracts the best matching chat `.txt` file using `JSZip`.
4. The raw chat text is sent to a Web Worker.
5. The worker parses the WhatsApp export into structured messages.
6. The worker runs multiple analyzers over the parsed chat.
7. The UI renders cards and charts for the results.
8. The user can rename participants for presentation and export the final report as PNG, PDF, or standalone HTML.

Architecture summary:

- `src/main.tsx`: App entrypoint and route wiring
- `src/Hub.tsx`: Main pookie.sh hub page
- `src/marketing/Design2.tsx`: Pulse landing/marketing page
- `src/App.tsx`: Main analyzer application
- `src/components/FileUpload.tsx`: Upload and zip extraction flow
- `src/workers/useAnalyzer.ts`: Worker lifecycle, retries, and progress state
- `src/workers/analyzerWorker.ts`: Parsing + analytics pipeline
- `src/parser/whatsappParser.ts`: High-performance WhatsApp parser
- `src/analyzers/*`: Domain-specific metrics and insight generation
- `src/components/*Card.tsx`: Result visualization layer

## 3. Technical Depth You Can Claim

This project is stronger than a simple frontend demo. The core engineering value is:

- Built a full client-side analytics pipeline with no server dependency
- Moved CPU-heavy parsing and analysis off the main thread using a Web Worker
- Designed the parser for large WhatsApp exports, including files with 800k+ lines
- Implemented optimized parsing techniques such as fast-path checks, minimized regex use, epoch timestamp storage, cached `Date` reuse, and reduced allocations
- Added progress reporting and retry handling around worker startup/errors
- Supported both plain text and zipped WhatsApp exports
- Structured the analysis layer into modular analyzers instead of one monolithic pass
- Produced exportable reports in multiple formats directly in the browser

## 4. What The Product Analyzes

The app computes:

- Basic messaging stats per participant
- Response times and conversation initiations
- Morning-first-text patterns
- Daily/monthly/hourly activity trends
- Activity heatmaps and peak messaging periods
- Love and affection keyword usage
- Pet names and romantic language trends over time
- Emoji frequency and participant-specific emoji behavior
- Media sharing frequency
- Call counts and call durations
- Milestones such as first message, longest gap, anniversaries, and busiest day
- Word frequency and unique vocabulary
- Fun behavioral stats like laughter, good morning/night habits, late-night texting, questions, apologies, all-caps usage, deleted messages, double texting, and link-sharing patterns by platform

## 5. CV Bullet Points

Use 3 to 5 of these depending on space:

- Built `Pulse`, a privacy-first WhatsApp chat analytics web app using React, TypeScript, Vite, and Web Workers, with all processing performed locally in the browser.
- Engineered a high-performance parser for WhatsApp exports optimized for large datasets (up to 800k+ lines), reducing UI blocking by moving parsing and analysis off the main thread.
- Designed a modular analytics pipeline that generates relationship and communication insights including response-time metrics, activity heatmaps, sentiment/affection trends, emoji behavior, milestones, and vocabulary analysis.
- Implemented local file ingestion for both `.txt` and `.zip` WhatsApp exports, including in-browser extraction and preprocessing with `JSZip`.
- Built a shareable reporting experience with interactive charts and client-side export to PNG, PDF, and standalone HTML.
- Created a multi-route product experience spanning marketing pages, demo flows, and the core analytics application, deployed as a SPA on Vercel.

## 6. Short CV Project Description

Use this for a project section:

**Pulse - Privacy-First WhatsApp Chat Analysis Tool**  
Built a client-side analytics web app that parses WhatsApp exports and generates visual insights into messaging behavior, affection patterns, activity trends, milestones, and media usage. Implemented a high-performance parsing and analysis pipeline in a Web Worker to handle large chat histories without blocking the UI. Stack: React, TypeScript, Vite, React Router, Recharts, JSZip, html2canvas, jsPDF, Vercel.

## 7. 30-Second Script

"One of my projects is Pulse, a privacy-first WhatsApp chat analysis tool inside my pookie.sh app. Users upload a WhatsApp export as a text file or zip, and everything is processed locally in the browser with no backend. I built the frontend in React and TypeScript, then moved the heavy parsing and analytics into a Web Worker so large chat files would not freeze the UI. The app extracts structured message data, runs several analytics modules like response times, timeline trends, emoji and affection analysis, then renders the results as charts and downloadable reports."

## 8. 60-90 Second Interview Script

"I built a project called Pulse under my pookie.sh product. It is a privacy-first web app for analyzing WhatsApp chat exports between couples. The key design decision was to keep everything client-side, so there is no backend and no user chat data leaves the device.

From a technical perspective, the system has three main parts. First, the upload layer accepts either raw text exports or zip files and extracts the relevant chat file in-browser. Second, the parsing and analytics pipeline runs inside a Web Worker. I did that because large WhatsApp exports can be extremely heavy, and I wanted to avoid blocking the main UI thread. The parser is optimized for large files using fast-path checks, reduced regex usage, epoch timestamps, and lower-allocation logic. Third, the presentation layer renders the insights through reusable React components and chart visualizations, and users can export the results as PNG, PDF, or standalone HTML.

The app analyzes things like messaging volume, response times, activity heatmaps, affection keywords, emojis, calls, milestones, media usage, and vocabulary trends. So overall, this project let me work across product design, performance engineering, browser-based data processing, and frontend UX."

## 9. If Someone Asks "What Was Hard About It?"

Use this answer:

"The hardest part was balancing performance, privacy, and UX. WhatsApp exports can get very large, so if parsing runs on the main thread the app becomes unresponsive. I solved that by moving the heavy work into a Web Worker and making the parser more allocation-conscious. Another challenge was supporting messy real-world export formats, including text and zip files, multilingual strings, system messages, deleted messages, and call entries. I also had to make the final analysis feel polished and shareable, so I added chart-based result views and browser-side exports to image, PDF, and HTML."

## 10. If Someone Asks "What Was Your Role?"

Use this answer:

"This was a solo project. I handled product design, system architecture, frontend implementation, parsing and analytics logic, performance optimization, report export, and deployment."

## 11. Keywords For ATS / LinkedIn

React, TypeScript, Vite, JavaScript, Web Workers, Client-Side Processing, Data Visualization, Recharts, File Parsing, Performance Optimization, Browser APIs, JSZip, html2canvas, jsPDF, SPA, React Router, Frontend Architecture, Privacy-First Design, Vercel
