# DocuMind AI — Verified Document Intelligence & Voice Assistant

DocuMind AI is a full-stack document intelligence platform built with **React 19**, **Vite**, **Node.js/Express**, **Tailwind CSS**, and **Google Gemini AI**. It enables users to upload PDF, DOCX, and TXT documents, query them with uncompromising grounded retrieval, view highlighted citations with exact page numbers, detect cross-document contradictions, and interact via a real-time **Voice Assistant** (speech-to-text + spoken answers).

---

## ⚡ Quick Start for VS Code

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher (Node `v20.x` or `v22.x` recommended).
- **npm**: `v9.0.0` or higher.
- **VS Code**: [Download VS Code](https://code.visualstudio.com/).

### 2. Open Project in VS Code
Open the project directory in VS Code:
```bash
code .
```
Open the integrated terminal in VS Code using `Ctrl + ~` (or `Cmd + ~` on macOS).

### 3. Install Dependencies
Run:
```bash
npm install
```

### 4. Configure Environment Variables
Copy `.env.example` to create your local `.env` file:

**macOS / Linux / Git Bash:**
```bash
cp .env.example .env
```

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

Open `.env` in VS Code and paste your Gemini API key:
```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
PORT=3000
APP_URL="http://localhost:3000"
```
> 💡 *Don't have a key yet? Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).*  
> *Note: Even without an API key, DocuMind AI operates in a deterministic local semantic fallback mode with demo documents.*

### 5. Start the Development Server
Run:
```bash
npm run dev
```

The Express backend and Vite frontend will start unified on a single port:
```
======================================================
🚀 DocuMind AI Full-Stack Server Running
   > Local URL:   http://localhost:3000
   > Network:     http://127.0.0.1:3000
   ✨ Gemini API: Connected and active
======================================================
```

Click `http://localhost:3000` (or `Ctrl + Click` in the VS Code terminal) to open the application in your browser.

---

## 🛠️ Available NPM Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts full-stack development server with Hot Module Reloading & API routes (`server.ts` via `tsx`). |
| `npm run build` | Compiles client assets into the `dist/` directory for production. |
| `npm start` | Runs the production server (`node server.ts`). |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`). |
| `npm run clean` | Cross-platform cleanup of build outputs (`dist/`). |

---

## 🌟 Key Application Features

1. **Voice-Based Document Assistant:**
   - Ask questions aloud via microphone with animated audio visualizer.
   - Listen to grounded answers read out naturally via speech synthesis.
   - Interactive document references displayed on screen with exact page citations and confidence matches.

2. **Trust Mode & Page Citations:**
   - Every answer links to exact page badges (`[Page 1]`, `[Page 2]`).
   - Click any citation to inspect the source document with highlighted passages.

3. **Multilingual Explanation Mode:**
   - Ask and receive explanations in Indian languages (Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada, etc.).

4. **Version Comparison & Conflict Detector:**
   - Upload two versions of a document to highlight added clauses, missing sections, and conflicting statements.

5. **Smart Study Mode:**
   - Generates concise notes, interactive MCQs with instant scoring, revision flashcards, and exam questions grounded in your files.

6. **Action & Deadline Extractor:**
   - Parses complex PDF and TXT documents into an actionable, tracked checklist with deadlines and required forms.

---

## 💻 Recommended VS Code Extensions

For the best developer experience in VS Code, install:
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier - Code formatter** (`esbenp.prettier-vscode`)

---

## ❓ Troubleshooting

- **Port 3000 already in use:**  
  Change `PORT=3001` in your `.env` file and rerun `npm run dev`.
- **Microphone access denied:**  
  Ensure browser microphone permissions are enabled for `http://localhost:3000`. You can also type queries directly in the voice assistant.
- **Node version mismatch:**  
  Verify your Node version with `node -v`. If you have multiple versions, use `nvm use 20`.
