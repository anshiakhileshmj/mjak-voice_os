## MJAK Voice OS — Quick Start (4 Commands)

Follow these four commands exactly. That’s all you need.

1) Install the CLI globally

```bash
npm install -g @mjak/voice_os
```

2) Install dependencies (React + Python)

```bash
voice_os setup
```

3) Configure your Google API key

```bash
voice_os api
```

What happens:
- Opens `https://aistudio.google.com/app/apikey`
- Prompts you in the terminal to paste the key
- Saves it to `os/.env` where the package is installed

4) Start Voice OS (frontend first, then Python backend)

```bash
voice_os
```

This will:
- 🟢 Start the frontend dev server (http://voice-os.vercel.app)
- 🐍 Start the Python automation backend (in `os/`)
- 🌐 Open your default browser automatically

## Details

### During setup
- Verifies `os/` structure and `.env`
- Does not start any servers

### During API configuration
- Opens the Google AI Studio page
- Accepts pasted API key in your terminal
- Writes `GOOGLE_API_KEY='<your_key>'` to `os/.env`

### During start
- Starts frontend (Vite) first
- Starts Python backend after frontend is up
- Frontend: http://voice-os.vercel.app

## Manual setup (optional)

If needed, create `os/.env` manually:

```env
GOOGLE_API_KEY='your_actual_api_key_here'
```

Get a key at `https://aistudio.google.com/app/apikey` and paste into the file above.

## Troubleshooting

- "Command not found: voice-os-ai": ensure the package is installed globally; try reopening your terminal.
- Browser didn’t open: open `http://voice-os.vercel.app` manually.
- API key not detected: confirm it’s in `os/.env` as `GOOGLE_API_KEY='<key>'`.
- Windows paste: right‑click to paste in the terminal if Ctrl+V doesn’t work.

## Security
- Your API key is stored locally in `os/.env` only.
- You can regenerate the key anytime from Google AI Studio.