# VIBA — ABHA redefined....!

VIBA is a local, full-stack demonstration of a patient-controlled digital health journey. Its tagline is “ABHA redefined....!” It uses fictional records and a Node.js mock API; it does not connect to healthcare services or external data sources.

## Run locally

Requirements: Node.js 20 or newer. There are no package dependencies to install.

```powershell
node server/index.js
```

Open `http://localhost:4173` in a browser. The demo state lives in memory and resets when the server restarts. To use another port, set `PORT` before starting the server.

On Windows, double-click `START_VIBA.bat` in the portable bundle. It finds an available local port, waits for the mock API to answer, and opens the browser automatically.

Run the scripted service and acceptance tests:

```powershell
node --test test/healthverse.test.js
```

The Demo Scenarios page also runs the same acceptance cases through the mock API and displays each executed result.

## What is implemented

- A responsive dark navy and teal dashboard theme matching the supplied reference, while preserving the existing care workflows.
- A fixed desktop navigation sidebar that stays visible while the content scrolls; on smaller screens it remains a slide-in menu.
- Eleven navigable views: overview, records, timeline, conflicts, consent, caregiver access, emergency access, audit, visit preparation, demo scenarios, and settings.
- A custom WebGL health model built from lit 3D mesh parts, including sculpted chest, arm, abdominal, thigh, and calf contours. Record hotspots open their synthetic records; dragging rotates the model and provider selection highlights connected records. A keyboard-operable 2D fallback is available in Settings and activates automatically when WebGL is unavailable.
- A health overview with randomized, explicitly fictional blood pressure, heart rate, CBC, glucose, and blood group samples, plus a shuffle control. These display values stay separate from source reports and are never saved into the synthetic record library. The verified lipid report remains source-linked below them.
- An offline scripted VIBA Assist chat panel with quick prompts and conversation replies. It uses no AI service and warns that responses may be inaccurate.
- Mock API services for record search and editing, correction lineage, conflict detection, consent grants and revocation, recipient scope checks, caregiver permissions, simulated emergency access, notifications, audit, reset, and recovery scenarios.
- Editable fictional profile details, active-share expiry countdowns, and one-click consent revocation with a confirmation step.
- Synthetic edge cases including conflicting lab dates, near duplicates, uncertain OCR, missing metadata, provider mismatch, superseded records, stale data, timeouts, and conflicting edits.
- English and Telugu key navigation, consent guidance, emergency warnings, and primary actions; reduced-motion and responsive layouts.
- A hash-linked append-only in-memory audit ledger, factual visit-summary export/print, and downloadable synthetic data.

## Boundaries and limitations

- All people, providers, records, and events are fictional. The “patient” profile is seeded demo data.
- This is a browser prototype with an in-memory backend, not a production healthcare system. State is lost when the Node server restarts; authentication, durable storage, encryption at rest, and real provider delivery are not implemented.
- The anatomy view is a stylized WebGL model, not a clinically accurate body model. The 2D fallback keeps record hotspots available without WebGL.
- The audit hash chain demonstrates tamper detection only. It is not a protected production audit service.
- The prototype does not diagnose, recommend treatment, or turn uncertain prescription OCR into a confirmed instruction.
- Random vitals and scripted chat replies are fictional interface samples, not report values or medical guidance.

## Mock API

The API is served on the same local origin under `/api/`. Useful routes include `/api/bootstrap`, `/api/dashboard`, `/api/records`, `/api/conflicts`, `/api/timeline`, `/api/grants`, `/api/caregivers/grants`, `/api/emergency/access`, `/api/audit`, and `/api/demo-tests`.
