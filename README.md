# SoapScan AI — Smart Soap Usage & Monthly Consumption Tracker

A complete, production-ready Full-Stack Web Application featuring **3D WebGL Digital Twins**, real-time scale tare math, and **local multimodal AI** via Ollama (`gemma4:latest`).

---

## 🏗️ Project Architecture

Strict decoupled workspace structure:

```text
SoapScan AI — Smart Soap Usage Tracker/
├── package.json                  # Root workspace orchestrator ("name": "soapscan-ai-workspace")
├── README.md                     # Architecture & setup instructions
├── backend/                      # Standalone Node.js + Express + TypeScript API (Port 3001)
│   ├── package.json              # "name": "soapscan-backend"
│   ├── tsconfig.json
│   ├── data/
│   │   └── db.json               # Persistent JSON database (auto-seeded on first run)
│   ├── supabase/
│   │   └── migrations/
│   │       └── 001_initial_schema.sql  # Production PostgreSQL migration
│   └── src/
│       ├── index.ts              # Express server entry point (Port 3001)
│       ├── types.ts              # Shared domain models & interfaces
│       ├── routes/
│       │   ├── aiRoutes.ts       # Local Ollama gemma4:latest status, vision scan, and dynamic insights
│       │   └── inventoryRoutes.ts# CRUD for inventory, usage logs, members, and sample data reset
│       └── services/
│           ├── ollamaService.ts  # Connects to http://localhost:11434 (gemma4:latest)
│           └── dbService.ts      # Thread-safe persistent JSON database
└── frontend/                     # Standalone React + Vite + Tailwind + Three.js App (Port 5173)
    ├── package.json              # "name": "soapscan-frontend"
    ├── vite.config.ts            # Port 5173 with /api proxy -> http://localhost:3001
    ├── tsconfig.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx              # React DOM entry point
        ├── App.tsx               # Main state coordinator & 3D ambient field
        ├── types/
        │   └── soap.ts           # Frontend TypeScript type declarations
        ├── lib/
        │   ├── consumptionEngine.ts # Tare scale math, manual entry, and pump estimates
        │   ├── analyticsEngine.ts   # Burn rate forecasting, smart alerts, and chart transforms
        │   ├── api.ts               # Strongly-typed fetch client for backend endpoints
        │   └── __tests__/
        │       └── consumptionEngine.test.ts # Vitest suite (16 tests)
        └── components/
            ├── three/
            │   ├── SoapDigitalTwin3D.tsx    # Procedural 3D Soap Bar & Liquid Dispenser
            │   ├── AmbientBubbleField3D.tsx # Volumetric floating iridescent soap bubbles
            │   └── HolographicScanner3D.tsx # 3D wireframe camera HUD targeting overlay
            └── ui/
                └── TiltCard3D.tsx           # Interactive 3D mouse-tracking perspective tilt card
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js:** v18+ (tested on v24)
- **Local AI Engine:** Ollama running at `http://localhost:11434` with model `gemma4:latest`
  ```bash
  ollama run gemma4:latest
  ```

### 2. Launching Both Servers
From the root workspace directory, run:
```bash
npm run dev
```
This automatically starts:
- **Backend Server:** `http://localhost:3001`
- **Frontend App:** `http://localhost:5173` (with `/api` proxy forwarding to 3001)

### 3. Running Unit Tests
```bash
npm test
# Or directly inside frontend:
npm --prefix frontend test
```

### 4. Building for Production
```bash
npm run build
```

---

## 🧼 Features

- **3D WebGL Digital Twins:** Procedural 3D mesh that dynamically depletes height and volume according to real remaining soap grams or dispenser milliliters.
- **Volumetric Iridescent Bubbles:** Gentle ambient floating soap bubble physics in radiant teal and metallic gold lighting.
- **3D Holographic Camera HUD:** Futuristic rotating concentric reticle overlay for real-time camera packaging capture.
- **3D Perspective Tilt Cards:** Mouse-tracking interactive specular glare cards for all dashboard KPIs and active soaps.
- **Local Gemma 4 AI Vision:** Packaging OCR and barcode inspection running 100% on-device on `localhost:11434`.
- **Scientific Consumption Math:** Net tare weight calculation with anti-duplication (< 15s) and negative consumption guards.
- **Explainable Insights:** Data-backed consumption recommendations citing exact household grams, burn rate, and projected restock dates.
- **Full Ledger & Supabase Ready:** Complete immutable audit logs with CSV export and ready-to-run PostgreSQL migration (`001_initial_schema.sql`).
