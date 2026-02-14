# pookie

**[pookie.sh](https://pookie.sh)** — fun, privacy-first tools made to use with your pookie. Everything runs in your browser; your data never leaves your device.

## Tools

- **[Pulse](/pulse)** — WhatsApp chat analysis for couples. Drop your chat export and get stats on who texts first, love keywords, emoji habits, fun facts, and more. Export as PNG, PDF, or HTML.

More tools (Vibes, Timeline, etc.) coming soon.

## Tech

- **Stack:** React 19, TypeScript, Vite 7, React Router, Recharts
- **Processing:** All analysis runs in a Web Worker; no server, no stored data
- **Export:** html2canvas + jsPDF for PNG/PDF; standalone HTML export

## Run locally

```bash
git clone https://github.com/noxire-dev/pookie.git
cd pookie
npm install
npm run dev
```

Open [http://localhost:4000](http://localhost:4000). Routes:

- `/` — hub (pookie.sh landing)
- `/pulse` — Pulse marketing
- `/pulse/app` — upload & analyze
- `/pulse/demo` — demo analysis with sample data

## Build

```bash
npm run build
npm run preview   # serve dist/
```

## License

MIT © [Noxire](https://github.com/noxire-dev)
