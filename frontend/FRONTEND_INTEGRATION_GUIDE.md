# Sathack / OFFDOCK Frontend Integration Guide

This guide is written for engineers and LLMs working on connecting the Next.js frontend with the Python FastAPI / OFFDOCK backend (`orchestrator/main.py`).

---

## 1. Overview & Architecture

* **Framework:** Next.js 14 App Router (React 18, TypeScript, Tailwind CSS, shadcn/ui).
* **Location:** `/frontend` directory inside `jeevanshbhatia650-rgb/sathack`.
* **Live Deployment Tunnel (ngrok):** `https://unstaffed-retract-nylon.ngrok-free.dev/sathack`
* **Local Development:** `http://localhost:3000/sathack`
* **Design Philosophy:**
  * Strict adherence to **`pbakaus/impeccable`** (`distill`, `craft-floor`) and `/design-taste-frontend`.
  * **Color Palette:**
    * **Cream:** `#F3EEE3` (Text primary, secondary gauges, badge labels)
    * **Ink Black:** `#111111` (Canvas background, terminal viewports, card surfaces)
    * **Burnt Orange:** `#D9541E` (Active CTAs, live radar pulse, build triggers, artifact return)
  * **Zero AI Slop:** No gradient text, no card-in-card nesting, no eyebrows/kickers, 16–24px border radii, high-contrast typography.

---

## 2. Frontend File Structure & Component Mapping

```
frontend/
├── app/
│   ├── sathack/page.tsx          # Main Hero Landing Page & Orchestrator view
│   ├── orchestrator/page.tsx     # Alias route
│   ├── globals.css               # Tailwind CSS custom variables & dark theme tokens
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Root landing page with top Orchestrator announcement
├── components/
│   ├── orchestrator/
│   │   └── OrchestratorAgentApp.tsx  # Core orchestrator workspace:
│   │                                 # - Repo Ingestion bar
│   │                                 # - Concentric Circular Arcs (SVG)
│   │                                 # - Radial Speedometer Sector Gauge (SVG)
│   │                                 # - Vertical Capsule Equalizers (SVG)
│   │                                 # - Monospace Dockerfile CLI Terminal HUD
│   │                                 # - One-Click Download Artifact button
│   │                                 # - AI Assistant conversational dock
│   ├── ui/
│   │   ├── saa-s-template.tsx        # High-performance atomic UI primitives (Buttons, Nav, Hero)
│   │   └── demo.tsx                  # Demo wrapper
│   └── Navbar.tsx                    # Shared navigation bar
├── lib/
│   └── utils.ts                      # clsx & twMerge class utility
├── package.json                      # Dependencies: lucide-react, framer-motion, tailwindcss
├── tailwind.config.js                # Tailwind config
└── tsconfig.json                     # Path aliases: @/*
```

---

## 3. How to Connect Frontend to FastAPI Backend (`orchestrator/main.py`)

The FastAPI backend exposes the following endpoints:

| Endpoint | Method / Protocol | Purpose | Frontend Component Hook |
| :--- | :--- | :--- | :--- |
| `/healthz` | `GET` | Health status check (`{"status": "ok"}`) | Server 1 ping indicator |
| `/v1/jobs` | `POST` (JSON) | Submit repository for orchestration | "Start Orchestration" button in `OrchestratorAgentApp.tsx` |
| `/v1/jobs/{job_id}/stream` | `GET` (SSE) | Stream live Dockerfile build logs | Terminal HUD monospace stream |
| `/ws/cluster` | `WebSocket` | Real-time worker & GPU telemetry | Concentric Arcs, Speedometer, Equalizers |
| `/v1/nodes/pair` | `POST` | Pair Docker worker nodes | Dual-Server configuration drawer |

### Step-by-Step Backend Connection Code

#### 1. Configure Environment Variables
In `frontend/.env.local`:
```bash
NEXT_PUBLIC_ORCHESTRATOR_API_URL=http://localhost:8000
NEXT_PUBLIC_ORCHESTRATOR_WS_URL=ws://localhost:8000/ws/cluster
NEXT_PUBLIC_ADMIN_KEY=your_admin_dashboard_key_here
```

#### 2. Submit a Build Job (`POST /v1/jobs`)
```typescript
// Replace simulated handleTriggerBuild in OrchestratorAgentApp.tsx
async function submitBuildJob(repoUrl: string, branch: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL}/v1/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_KEY}`,
    },
    body: JSON.stringify({
      repo: repoUrl,
      branch: branch,
      targets: ['dockerfile'],
    }),
  });
  const data = await response.json();
  return data.job_id; // e.g. "a1b2c3d4e5f6"
}
```

#### 3. Connect Server-Sent Events (SSE) for Real-Time Logs
```typescript
function streamBuildLogs(jobId: string, onLine: (line: string) => void) {
  const eventSource = new EventSource(
    `${process.env.NEXT_PUBLIC_ORCHESTRATOR_API_URL}/v1/jobs/${jobId}/stream`,
    { withCredentials: true }
  );

  eventSource.onmessage = (event) => {
    if (event.data === ': ping') return;
    try {
      const parsed = JSON.parse(event.data);
      onLine(parsed.message || parsed.raw);
    } catch {
      onLine(event.data);
    }
  };

  eventSource.onerror = () => {
    eventSource.close();
  };
}
```

#### 4. Connect WebSocket Telemetry to Update Infographic Gauges
```typescript
function connectTelemetryWebSocket(
  onTelemetry: (data: { fps: number; bitrate: number; latency: number }) => void
) {
  const ws = new WebSocket(process.env.NEXT_PUBLIC_ORCHESTRATOR_WS_URL!);

  ws.onopen = () => {
    // Authenticate
    ws.send(JSON.stringify({ token: process.env.NEXT_PUBLIC_ADMIN_KEY }));
  };

  ws.onmessage = (evt) => {
    const frame = JSON.parse(evt.data);
    if (frame.type === 'TELEMETRY') {
      onTelemetry({
        fps: frame.fps ?? 60.0,
        bitrate: frame.bitrate ?? 14.8,
        latency: frame.rtt ?? 14,
      });
    }
  };
}
```

---

## 4. How to Run Locally

1. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/sathack`.

3. **Production Build:**
   ```bash
   npm run build
   npm run start
   ```

---

## 5. Notes for Future LLMs / Engineers

* **UI Consistency:** The color palette (`#F3EEE3` Cream, `#111111` Ink Black, `#D9541E` Burnt Orange) must be respected on all new components.
* **SVG Infographics:** In `components/orchestrator/OrchestratorAgentApp.tsx`, the `ConcentricArcs`, `SpeedometerGauge`, and `VerticalCapsuleBars` accept pure number props (`value`, `dockerPct`, `pixelatePct`), making them directly bindable to the `/ws/cluster` telemetry payload without layout shift.
* **Download Artifact:** The artifact download button can be pointed to the FastAPI static file endpoint or an S3/R2 presigned URL when `status === "COMPLETED"`.
